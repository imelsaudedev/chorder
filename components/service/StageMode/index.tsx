"use client";

import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import SongMap from "@/components/song/SongMap";
import { readStorage, useLocalStorageState, writeStorage } from "@/hooks/useLocalStorageState";
import { ClientServiceUnit } from "@/prisma/models";
import { X } from "lucide-react";
import { SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import StageModeControls, {
  FONT_MAX,
  FONT_MIN,
  FOOTER_HEIGHT_PX,
  FOOTER_ID,
  StageLayoutMode,
  TOP_BAR_HEIGHT_PX,
  TOP_BAR_ID,
} from "./StageModeControls";
import StageOverview, { DEFAULT_OVERVIEW_SETTINGS, OverviewFit, OverviewSettings } from "./StageOverview";
import { songDisplayTitle } from "@/components/service/ServicePlanEditor/unitSummary";
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
// Layout do Palco: "scroll" (rolagem, 1 coluna) ou "overview" (visão geral: a música inteira numa tela).
const LAYOUT_KEY = "modo-palco:layout";

function arrangementKey(unit: ClientServiceUnit) {
  const arrangement = unit.arrangement;
  return arrangement?.id ?? arrangement?.originalArrangementId ?? "sem-arranjo";
}

function scrollSpeedKey(unit: ClientServiceUnit) {
  return `modo-palco:${arrangementKey(unit)}:scrollSpeed`;
}

// Ajustes da visão geral (colunas, fonte, densidade) também são por arranjo, no aparelho.
function overviewKey(unit: ClientServiceUnit) {
  return `modo-palco:${arrangementKey(unit)}:overview`;
}

/** Tela da visão geral: uma música, ou os itens do roteiro seguidos (juntos numa tela só). */
type Screen = { kind: "song"; songIndex: number } | { kind: "items"; units: ClientServiceUnit[] };

function buildScreens(flow: StageFlowEntry[]): Screen[] {
  const screens: Screen[] = [];
  flow.forEach((entry) => {
    if (entry.kind === "song") {
      screens.push({ kind: "song", songIndex: entry.songIndex });
      return;
    }
    const last = screens[screens.length - 1];
    if (last?.kind === "items") last.units.push(entry.unit);
    else screens.push({ kind: "items", units: [entry.unit] });
  });
  return screens;
}

function screenOfSong(screens: Screen[], songIndex: number): number {
  const index = screens.findIndex((screen) => screen.kind === "song" && screen.songIndex === songIndex);
  return index >= 0 ? index : 0;
}

/** Música "mais próxima" de uma tela (a anterior; se não houver, a seguinte). */
function nearestSongOfScreen(screens: Screen[], position: number): number {
  for (let i = position; i >= 0; i--) {
    const screen = screens[i];
    if (screen?.kind === "song") return screen.songIndex;
  }
  for (let i = position; i < screens.length; i++) {
    const screen = screens[i];
    if (screen?.kind === "song") return screen.songIndex;
  }
  return 0;
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
 * Modo Palco: as músicas do culto com interface limpa, em dois layouts —
 * rolagem (uma única rolagem contínua, 1 coluna, com rolagem automática) ou
 * visão geral (cada música inteira numa tela, em colunas, com fonte e
 * densidade encaixadas automaticamente). Tom e velocidade valem para a música
 * que está na tela; a fonte da rolagem é a mesma para todas. Ocupa a tela
 * toda do aparelho (Fullscreen API) quando o navegador permite.
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
  // Item do roteiro que está no topo da tela (rolagem, com "Exibir roteiro" ligado).
  const [currentItem, setCurrentItem] = useState<ClientServiceUnit | null>(null);
  // Rolagem automática sempre começa desligada ao entrar, por segurança
  // (nunca liga sozinha).
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  // Tom é só da sessão, elevado pelo ServiceView para sobreviver à troca
  // entre o modo normal e o Modo Palco; fonte e velocidade vêm do aparelho.
  // Sempre do tamanho das músicas: se o ServiceView mandar menos tons (ex.:
  // calculou antes do culto terminar de carregar), o que falta vale 0.
  const [transposes, setTransposes] = useState(() => units.map((_, i) => initialTransposes[i] ?? 0));
  const [fontSize, setFontSize] = useLocalStorageState(
    FONT_SIZE_KEY,
    Math.min(FONT_MAX, Math.max(FONT_MIN, initialFontSize))
  );
  const [showRoteiro, setShowRoteiro] = useLocalStorageState(SHOW_ROTEIRO_KEY, false);
  const [layoutMode, setLayoutMode] = useLocalStorageState<StageLayoutMode>(LAYOUT_KEY, "scroll");
  const isOverview = layoutMode === "overview";
  const [scrollSpeeds, setScrollSpeeds] = useState(() =>
    units.map((unit) => readStorage(scrollSpeedKey(unit), DEFAULT_SCROLL_SPEED_MULTIPLIER))
  );
  const [overviewSettings, setOverviewSettings] = useState<OverviewSettings[]>(() =>
    units.map((unit) => ({ ...DEFAULT_OVERVIEW_SETTINGS, ...readStorage<Partial<OverviewSettings>>(overviewKey(unit), {}) }))
  );
  const [overviewFit, setOverviewFit] = useState<OverviewFit | null>(null);

  // Fluxo visível: com o roteiro desligado, só as músicas (comportamento de sempre).
  const fullFlow: StageFlowEntry[] = flow ?? units.map((_, songIndex) => ({ kind: "song", songIndex }));
  const visibleFlow = showRoteiro ? fullFlow : fullFlow.filter((entry) => entry.kind === "song");
  const flowRef = useRef(visibleFlow);
  flowRef.current = visibleFlow;

  // Visão geral: telas (músicas e grupos de itens seguidos) e a tela atual.
  const screens = buildScreens(visibleFlow);
  const [screenIndex, setScreenIndex] = useState(() => screenOfSong(screens, initialIndex));
  const safeScreenIndex = Math.min(screenIndex, Math.max(0, screens.length - 1));
  const screen: Screen | undefined = screens[safeScreenIndex];
  const overviewSongIndex = screen
    ? screen.kind === "song"
      ? screen.songIndex
      : nearestSongOfScreen(screens, safeScreenIndex)
    : 0;

  // Música "ativa": a que tom, velocidade e ajustes valem. Na rolagem é a do topo da tela; na visão geral, a da tela.
  const activeIndex = isOverview ? overviewSongIndex : currentIndex;
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const overviewSongRef = useRef(overviewSongIndex);
  if (isOverview) overviewSongRef.current = overviewSongIndex;

  function goScreen(delta: number) {
    setScreenIndex((index) => Math.min(screens.length - 1, Math.max(0, Math.min(index, screens.length - 1) + delta)));
  }

  // Alturas do cabeçalho e do rodapé: medidas, porque no tablet/desktop (e na visão geral) o cabeçalho é uma linha só.
  const [topBarHeight, setTopBarHeight] = useState(TOP_BAR_HEIGHT_PX);
  const topBarHeightRef = useRef(topBarHeight);
  topBarHeightRef.current = topBarHeight;
  const [footerHeight, setFooterHeight] = useState(FOOTER_HEIGHT_PX);
  useEffect(() => {
    const top = document.getElementById(TOP_BAR_ID);
    const footer = document.getElementById(FOOTER_ID);
    if (!top || !footer) return;
    const update = () => {
      setTopBarHeight(top.offsetHeight);
      setFooterHeight(footer.offsetHeight);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(top);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Início (scrollTop) de cada entrada visível — músicas e itens —, em ordem. (Rolagem.)
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
    isEnabled: isScrollEnabled && !isOverview,
    speedPxPerSecond: multiplierToPxPerSecond(scrollSpeeds[activeIndex]),
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
  useStageModeBack(() => onExit(activeIndexRef.current, transposes));
  const exitRef = useRef(() => {});
  exitRef.current = () => requestStageModeExit(() => onExit(activeIndexRef.current, transposes));

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

  // Ligar/desligar o roteiro muda o conteúdo: volta pra música atual.
  const isFirstRoteiroRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRoteiroRender.current) {
      isFirstRoteiroRender.current = false;
      return;
    }
    if (isOverview) setScreenIndex(screenOfSong(screens, activeIndexRef.current));
    else scrollToSong(currentIndexRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoteiro]);

  // Trocar de layout mantém a música: rolagem → visão geral abre na tela dela; visão geral → rolagem rola até ela.
  const previousLayout = useRef(layoutMode);
  useLayoutEffect(() => {
    if (previousLayout.current === layoutMode) return;
    previousLayout.current = layoutMode;
    setIsScrollEnabled(false);
    if (layoutMode === "overview") setScreenIndex(screenOfSong(screens, currentIndexRef.current));
    else scrollToSong(overviewSongRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode]);

  // O "atual" na rolagem é o que está no topo da tela e muda conforme rola: uma
  // música (com tom, velocidade e mapa dela) ou um item do roteiro. Com um item
  // no topo, os controles seguem valendo pra música mais próxima.
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
  }, [layoutMode]);

  // Visão geral: setas e PageUp/PageDown (e pedal Bluetooth, que manda essas teclas) trocam de tela.
  useEffect(() => {
    if (!isOverview) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [role="dialog"], [data-radix-popper-content-wrapper]')) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goScreen(1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goScreen(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverview, screens.length]);

  // Esconde NavBar/ServiceHeader (fora da árvore do ServiceView) via classe
  // global.
  useEffect(() => {
    document.documentElement.classList.add("stage-mode-active");
    return () => document.documentElement.classList.remove("stage-mode-active");
  }, []);

  function setCurrentTranspose(action: SetStateAction<number>) {
    setTransposes((prev) =>
      prev.map((value, i) => (i === activeIndex ? (typeof action === "function" ? action(value) : action) : value))
    );
  }

  function changeCurrentScrollSpeed(direction: 1 | -1) {
    const speed = stepScrollSpeed(scrollSpeeds[activeIndex], direction);
    writeStorage(scrollSpeedKey(units[activeIndex]), speed);
    setScrollSpeeds((prev) => prev.map((value, i) => (i === activeIndex ? speed : value)));
  }

  const activeSettings = overviewSettings[activeIndex] ?? DEFAULT_OVERVIEW_SETTINGS;
  function changeOverviewSettings(patch: Partial<OverviewSettings>) {
    const next = { ...activeSettings, ...patch };
    writeStorage(overviewKey(units[activeIndex]), next);
    setOverviewSettings((prev) => prev.map((value, i) => (i === activeIndex ? next : value)));
  }

  const currentArrangement = units[activeIndex]?.arrangement;

  // Itens do roteiro na tela: na rolagem, o do topo; na visão geral, os da tela (seguidos ficam juntos).
  const activeItems: ClientServiceUnit[] | null =
    isOverview ? (screen?.kind === "items" ? screen.units : null) : currentItem ? [currentItem] : null;

  // Cabeçalho: música (posição, título e mapa) ou item(ns) do roteiro (tipo · título
  // e, na segunda linha, responsável · duração — a altura nunca muda).
  let indexLabel: string | null = `${activeIndex + 1}/${units.length}`;
  let title = units[activeIndex] ? songDisplayTitle(units[activeIndex]) : "";
  let headerMap: React.ReactNode =
    currentArrangement?.units && currentArrangement.units.length > 0 ? (
      <SongMap fit units={currentArrangement.units} />
    ) : null;
  if (activeItems && activeItems.length > 0) {
    indexLabel = null;
    if (activeItems.length === 1) {
      const type = roteiroTypeLabel(activeItems[0]);
      const itemTitle = roteiroTitle(activeItems[0]);
      title = itemTitle === type ? type : `${type} · ${itemTitle}`;
      headerMap = (
        <span className="truncate text-sm font-semibold text-muted-foreground">
          {roteiroMeta(activeItems[0]) || " "}
        </span>
      );
    } else {
      title = activeItems.map(roteiroTypeLabel).join(" · ");
      const totalMinutes = activeItems.reduce((sum, unit) => sum + (unit.durationMin ?? 0), 0);
      headerMap = (
        <span className="truncate text-sm font-semibold text-muted-foreground">
          {totalMinutes ? `${totalMinutes} min` : " "}
        </span>
      );
    }
  }

  return (
    // Visual claro por enquanto — o tratamento escuro fica pra quando o
    // design system tratar dark mode em todas as telas, não só aqui.
    <div className="fixed inset-0 h-dvh bg-background flex flex-col">
      {isOverview ? (
        screen && (
          <StageOverview
            key={screen.kind === "song" ? `song-${screen.songIndex}` : `items-${screen.units.map((u) => u.clientId).join(",")}`}
            screenKey={screen.kind === "song" ? `song-${screen.songIndex}` : `items-${screen.units.map((u) => u.clientId).join(",")}`}
            arrangement={screen.kind === "song" ? units[screen.songIndex]?.arrangement : null}
            items={screen.kind === "items" ? screen.units : undefined}
            transpose={screen.kind === "song" ? (transposes[screen.songIndex] ?? 0) : 0}
            settings={screen.kind === "song" ? (overviewSettings[screen.songIndex] ?? DEFAULT_OVERVIEW_SETTINGS) : DEFAULT_OVERVIEW_SETTINGS}
            maxFontSize={fontSize}
            topInset={topBarHeight}
            bottomInset={footerHeight}
            onFit={setOverviewFit}
            onSwipe={goScreen}
          />
        )
      ) : (
        // no-scrollbar: no desktop a barra de rolagem ocupava largura da área dos blocos, mas não
        // do cabeçalho e do rodapé fixos (que vão até a borda da janela) — a margem direita dos
        // blocos ficava maior. Sem a barra visível (a rolagem por roda/toque segue igual), as três
        // margens coincidem.
        <div ref={contentRef} className="relative flex-1 overflow-y-auto no-scrollbar">
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
                    <StageRoteiroItem
                      unit={entry.unit}
                      fontSize={fontSize}
                      // Vão maior entre uma música e um conjunto de itens (só na rolagem).
                      spaceBefore={visibleFlow[position - 1]?.kind === "song"}
                      spaceAfter={visibleFlow[position + 1]?.kind === "song"}
                    />
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
                      {entry.songIndex + 1} · {songDisplayTitle(unit)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <SongConfigProvider transpose={transposes[entry.songIndex] ?? 0} columns={1} fontSize={fontSize}>
                    <ArrangementView arrangement={arrangement} collapsible />
                  </SongConfigProvider>
                </section>
              );
            })}
          </div>
        </div>
      )}

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
          SongConfigProvider ancestral — o da música ativa. */}
      <SongConfigProvider transpose={transposes[activeIndex] ?? 0} columns={1} fontSize={fontSize}>
        <StageModeControls
          indexLabel={indexLabel}
          title={title}
          map={headerMap}
          layoutMode={layoutMode}
          onLayoutModeChange={setLayoutMode}
          overview={
            isOverview
              ? {
                  editable: screen?.kind === "song",
                  settings: activeSettings,
                  fit: overviewFit,
                  onChange: changeOverviewSettings,
                  position: `${safeScreenIndex + 1}/${screens.length}`,
                  canPrev: safeScreenIndex > 0,
                  canNext: safeScreenIndex < screens.length - 1,
                  onPrev: () => goScreen(-1),
                  onNext: () => goScreen(1),
                }
              : undefined
          }
          originalKey={currentArrangement?.key ?? ""}
          transpose={transposes[activeIndex] ?? 0}
          setTranspose={setCurrentTranspose}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          showRoteiro={showRoteiro}
          onShowRoteiroChange={setShowRoteiro}
          isScrollEnabled={isScrollEnabled}
          scrollSpeedMultiplier={scrollSpeeds[activeIndex]}
          onTogglePlayback={() => setIsScrollEnabled((enabled) => !enabled)}
          onSlower={() => changeCurrentScrollSpeed(-1)}
          onFaster={() => changeCurrentScrollSpeed(1)}
          onExit={() => requestStageModeExit(() => onExit(activeIndex, transposes))}
        />
      </SongConfigProvider>
    </div>
  );
}
