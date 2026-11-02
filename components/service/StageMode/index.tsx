"use client";

import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import SongMap from "@/components/song/SongMap";
import { readStorage, useLocalStorageState, writeStorage } from "@/hooks/useLocalStorageState";
import { ClientServiceUnit } from "@/prisma/models";
import { X } from "lucide-react";
import { SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import StageModeControls, { FONT_MAX, FONT_MIN, TOP_BAR_HEIGHT_PX, TOP_BAR_ID } from "./StageModeControls";
import StageRoteiroItem, { roteiroMeta, roteiroTitle, roteiroTypeLabel } from "./StageRoteiroItem";
import {
  DEFAULT_SCROLL_SPEED_MULTIPLIER,
  findSongIndex,
  multiplierToPxPerSecond,
  nextStopPosition,
  stepScrollSpeed,
  useAutoScroll,
} from "./useAutoScroll";
import { requestStageModeExit, useStageModeBack } from "./useStageModeHistory";
import { useWakeLock } from "./useWakeLock";

/** Ordem do culto no Palco: músicas (índice entre as músicas) e, quando "Exibir roteiro" está ligado, os demais itens. */
export type StageFlowEntry =
  | { kind: "song"; songIndex: number }
  | { kind: "item"; unit: ClientServiceUnit };

type StageModeProps = {
  /** Só as músicas — tom e velocidade são indexados por elas. */
  units: ClientServiceUnit[];
  /** Ordem completa do culto (músicas + itens do roteiro). Sem ela, o Palco mostra só as músicas. */
  flow?: StageFlowEntry[];
  /** Música em que o Modo Palco abre (a que estava visível na tela normal). */
  initialIndex: number;
  /** Fonte que o usuário já usa na tela normal — ponto de partida do Modo
   * Palco, antes de qualquer ajuste próprio salvo. */
  initialFontSize: number;
  /** Tom por música, elevado pelo ServiceView — ponto de partida do Modo
   * Palco, e devolvido em onExit para a tela normal continuar dali. */
  initialTransposes: number[];
  /** Recebe a música em que o músico estava e o tom de cada uma, pra tela
   * normal voltar no mesmo ponto. */
  onExit: (currentIndex: number, transposes: number[]) => void;
};

// Velocidade é lembrada por música (arranjo) no aparelho — ver §6.5 da spec.
// A fonte é única pro Modo Palco inteiro: depende do aparelho e da distância
// até a tela, e assim a letra não muda de tamanho de uma música pra outra.
const FONT_SIZE_KEY = "modo-palco:fontSize";
// "Exibir roteiro" também é do aparelho; desligado por padrão.
const SHOW_ROTEIRO_KEY = "modo-palco:showRoteiro";

function scrollSpeedKey(unit: ClientServiceUnit) {
  const arrangement = unit.arrangement;
  const arrangementKey = arrangement?.id ?? arrangement?.originalArrangementId ?? "sem-arranjo";
  return `modo-palco:${arrangementKey}:scrollSpeed`;
}

/** Música "mais próxima" de uma posição do fluxo (a anterior; se não houver, a seguinte). */
function nearestSongIndex(flow: StageFlowEntry[], position: number): number {
  for (let i = position; i >= 0; i--) {
    const entry = flow[i];
    if (entry?.kind === "song") return entry.songIndex;
  }
  for (let i = position; i < flow.length; i++) {
    const entry = flow[i];
    if (entry?.kind === "song") return entry.songIndex;
  }
  return 0;
}

/**
 * Modo Palco: todas as músicas do culto numa única rolagem contínua (como a
 * tela normal, que é o que os músicos já conhecem), com interface limpa.
 * Tom e velocidade valem para a música que está no topo da tela; a fonte é
 * a mesma para todas. Ocupa a tela toda do aparelho (Fullscreen API) quando
 * o navegador permite.
 */
export default function StageMode({
  units,
  flow,
  initialIndex,
  initialFontSize,
  initialTransposes,
  onExit,
}: StageModeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<(HTMLElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  // Item do roteiro que está no topo da tela (quando "Exibir roteiro" está ligado).
  const [currentItem, setCurrentItem] = useState<ClientServiceUnit | null>(null);
  // Rolagem automática sempre começa desligada ao entrar, por segurança
  // (nunca liga sozinha).
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  // Tom é só da sessão, elevado pelo ServiceView para sobreviver à troca
  // entre o modo normal e o Modo Palco; fonte e velocidade vêm do aparelho.
  // Sempre do tamanho das músicas: se o ServiceView mandar menos tons (ex.:
  // calculou antes do culto terminar de carregar), o que falta vale 0 — um tom
  // `undefined` chegando no seletor de tom derrubava a tela ao abrir Configurações.
  const [transposes, setTransposes] = useState(() => units.map((_, i) => initialTransposes[i] ?? 0));
  const [fontSize, setFontSize] = useLocalStorageState(
    FONT_SIZE_KEY,
    Math.min(FONT_MAX, Math.max(FONT_MIN, initialFontSize))
  );
  const [showRoteiro, setShowRoteiro] = useLocalStorageState(SHOW_ROTEIRO_KEY, false);
  const [scrollSpeeds, setScrollSpeeds] = useState(() =>
    units.map((unit) => readStorage(scrollSpeedKey(unit), DEFAULT_SCROLL_SPEED_MULTIPLIER))
  );

  // Fluxo visível: com o roteiro desligado, só as músicas (comportamento de sempre).
  const fullFlow: StageFlowEntry[] = flow ?? units.map((_, songIndex) => ({ kind: "song", songIndex }));
  const visibleFlow = showRoteiro ? fullFlow : fullFlow.filter((entry) => entry.kind === "song");
  const flowRef = useRef(visibleFlow);
  flowRef.current = visibleFlow;

  // Altura do cabeçalho: medida, porque no tablet/desktop ele é uma linha só.
  const [topBarHeight, setTopBarHeight] = useState(TOP_BAR_HEIGHT_PX);
  const topBarHeightRef = useRef(topBarHeight);
  topBarHeightRef.current = topBarHeight;
  useEffect(() => {
    const el = document.getElementById(TOP_BAR_ID);
    if (!el) return;
    const update = () => setTopBarHeight(el.offsetHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Início (scrollTop) de cada entrada visível — músicas e itens —, em ordem.
  function getStarts(): number[] {
    return flowRef.current.map((_, i) => (entryRefs.current[i]?.offsetTop ?? 0) - topBarHeightRef.current);
  }

  function scrollToSong(songIndex: number) {
    const container = contentRef.current;
    if (!container) return;
    const position = flowRef.current.findIndex((entry) => entry.kind === "song" && entry.songIndex === songIndex);
    container.scrollTop = getStarts()[position] ?? 0;
    setCurrentIndex(songIndex);
    setCurrentItem(null);
  }

  useAutoScroll({
    containerRef: contentRef,
    isEnabled: isScrollEnabled,
    speedPxPerSecond: multiplierToPxPerSecond(scrollSpeeds[currentIndex]),
    // Para no início da próxima música ou, com o roteiro ligado, do próximo
    // item: entre músicas costuma haver fala, oração ou transição, e o item
    // precisa ser lido sem a rolagem passando por cima.
    getStopPosition: (scrollTop) => nextStopPosition(getStarts(), scrollTop, Number.POSITIVE_INFINITY),
    onReachEnd: () => setIsScrollEnabled(false),
  });

  // Tela sempre ligada; se o aparelho não suporta, só avisa (discreto).
  const { isUnavailable: isWakeLockUnavailable } = useWakeLock();
  const [isWakeLockNoticeDismissed, setIsWakeLockNoticeDismissed] = useState(false);

  // Botão voltar do aparelho e botão de sair seguem o mesmo caminho: o
  // histórico volta uma entrada e o popstate fecha o modo.
  useStageModeBack(() => onExit(currentIndexRef.current, transposes));
  const exitRef = useRef(() => {});
  exitRef.current = () => requestStageModeExit(() => onExit(currentIndexRef.current, transposes));

  // Tela cheia de verdade: o navegador some enquanto o Palco está aberto. Só
  // onde a Fullscreen API existe (iPhone/Safari não tem — aí segue sem). Sair
  // da tela cheia por fora (Esc, gesto do sistema) fecha o Palco junto.
  useEffect(() => {
    const root = document.documentElement;
    let entered = false;
    if (typeof root.requestFullscreen === "function") {
      root
        .requestFullscreen()
        .then(() => {
          entered = true;
        })
        .catch(() => {});
    }
    const onChange = () => {
      if (!document.fullscreenElement && entered) {
        entered = false;
        exitRef.current();
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      entered = false;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  // Abre na música que estava visível na tela normal.
  useLayoutEffect(() => {
    scrollToSong(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ligar/desligar o roteiro muda a altura do conteúdo: volta pra música atual.
  const isFirstRoteiroRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRoteiroRender.current) {
      isFirstRoteiroRender.current = false;
      return;
    }
    scrollToSong(currentIndexRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoteiro]);

  // O "atual" é o que está no topo da tela e muda conforme rola: uma música
  // (com tom, velocidade e mapa dela) ou um item do roteiro. Com um item no
  // topo, os controles seguem valendo pra música mais próxima.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const onScroll = () => {
      const current = flowRef.current;
      const position = findSongIndex(getStarts(), container.scrollTop);
      const entry = current[position];
      if (!entry) return;
      if (entry.kind === "song") {
        setCurrentIndex(entry.songIndex);
        setCurrentItem(null);
      } else {
        setCurrentIndex(nearestSongIndex(current, position));
        setCurrentItem(entry.unit);
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esconde NavBar/ServiceHeader (fora da árvore do ServiceView) via classe
  // global.
  useEffect(() => {
    document.documentElement.classList.add("stage-mode-active");
    return () => document.documentElement.classList.remove("stage-mode-active");
  }, []);

  function setCurrentTranspose(action: SetStateAction<number>) {
    setTransposes((prev) =>
      prev.map((value, i) => (i === currentIndex ? (typeof action === "function" ? action(value) : action) : value))
    );
  }

  function changeCurrentScrollSpeed(direction: 1 | -1) {
    const speed = stepScrollSpeed(scrollSpeeds[currentIndex], direction);
    writeStorage(scrollSpeedKey(units[currentIndex]), speed);
    setScrollSpeeds((prev) => prev.map((value, i) => (i === currentIndex ? speed : value)));
  }

  const currentArrangement = units[currentIndex]?.arrangement;

  // Cabeçalho: música (posição, título e mapa) ou item do roteiro (tipo · título
  // e, na segunda linha, responsável · duração — a altura nunca muda).
  let indexLabel: string | null = `${currentIndex + 1}/${units.length}`;
  let title = currentArrangement?.song?.title ?? "";
  let headerMap: React.ReactNode =
    currentArrangement?.units && currentArrangement.units.length > 0 ? (
      <SongMap fit units={currentArrangement.units} className="lg:justify-end" />
    ) : null;
  if (currentItem) {
    const type = roteiroTypeLabel(currentItem);
    const itemTitle = roteiroTitle(currentItem);
    indexLabel = null;
    title = itemTitle === type ? type : `${type} · ${itemTitle}`;
    headerMap = (
      <span className="truncate text-sm font-semibold text-muted-foreground">{roteiroMeta(currentItem) || " "}</span>
    );
  }

  return (
    // Visual claro por enquanto — o tratamento escuro fica pra quando o
    // design system tratar dark mode em todas as telas, não só aqui.
    <div className="fixed inset-0 h-dvh bg-background flex flex-col">
      <div ref={contentRef} className="relative flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 pb-28" style={{ paddingTop: topBarHeight }}>
          {visibleFlow.map((entry, position) => {
            if (entry.kind === "item") {
              return (
                <section
                  key={`item-${entry.unit.clientId}`}
                  ref={(el) => {
                    entryRefs.current[position] = el;
                  }}
                >
                  <StageRoteiroItem unit={entry.unit} fontSize={fontSize} />
                </section>
              );
            }
            const unit = units[entry.songIndex];
            const arrangement = unit?.arrangement;
            if (!arrangement) return null;
            return (
              <section
                key={unit.id ?? `song-${entry.songIndex}`}
                ref={(el) => {
                  entryRefs.current[position] = el;
                }}
              >
                {/* Divisor entre músicas — é onde a rolagem automática pausa. */}
                <div className="flex items-center gap-3 py-4 text-muted-foreground select-none">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium truncate">
                    {entry.songIndex + 1} · {arrangement.song?.title ?? ""}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <SongConfigProvider transpose={transposes[entry.songIndex] ?? 0} columns={1} fontSize={fontSize}>
                  <ArrangementView arrangement={arrangement} />
                </SongConfigProvider>
              </section>
            );
          })}
        </div>
      </div>

      {isWakeLockUnavailable && !isWakeLockNoticeDismissed && (
        <button
          type="button"
          onClick={() => setIsWakeLockNoticeDismissed(true)}
          style={{ top: topBarHeight + 8 }}
          className="fixed left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-sm"
        >
          A tela pode apagar neste aparelho
          <X size={12} />
        </button>
      )}

      {/* StageModeControls renderiza KeyButtonSet, que precisa de um
          SongConfigProvider ancestral — o da música atual. */}
      <SongConfigProvider transpose={transposes[currentIndex] ?? 0} columns={1} fontSize={fontSize}>
        <StageModeControls
          indexLabel={indexLabel}
          title={title}
          map={headerMap}
          originalKey={currentArrangement?.key ?? ""}
          transpose={transposes[currentIndex] ?? 0}
          setTranspose={setCurrentTranspose}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          showRoteiro={showRoteiro}
          onShowRoteiroChange={setShowRoteiro}
          isScrollEnabled={isScrollEnabled}
          scrollSpeedMultiplier={scrollSpeeds[currentIndex]}
          onTogglePlayback={() => setIsScrollEnabled((enabled) => !enabled)}
          onSlower={() => changeCurrentScrollSpeed(-1)}
          onFaster={() => changeCurrentScrollSpeed(1)}
          onExit={() => requestStageModeExit(() => onExit(currentIndex, transposes))}
        />
      </SongConfigProvider>
    </div>
  );
}
