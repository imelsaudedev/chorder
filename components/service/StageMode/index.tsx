"use client";

import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementView from "@/components/song/ArrangementView";
import { readStorage, useLocalStorageState, writeStorage } from "@/hooks/useLocalStorageState";
import { ClientServiceUnit } from "@/prisma/models";
import { SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import StageModeControls, { FONT_MAX, FONT_MIN, TOP_BAR_HEIGHT_PX } from "./StageModeControls";
import {
  DEFAULT_SCROLL_SPEED_MULTIPLIER,
  findSongIndex,
  multiplierToPxPerSecond,
  nextStopPosition,
  stepScrollSpeed,
  useAutoScroll,
} from "./useAutoScroll";
import { requestStageModeExit, useStageModeBack } from "./useStageModeHistory";

type StageModeProps = {
  units: ClientServiceUnit[];
  /** Música em que o Modo Palco abre (a que estava visível na tela normal). */
  initialIndex: number;
  /** Fonte que o usuário já usa na tela normal — ponto de partida do Modo
   * Palco, antes de qualquer ajuste próprio salvo. */
  initialFontSize: number;
  /** Recebe a música em que o músico estava, pra tela normal voltar nela. */
  onExit: (currentIndex: number) => void;
};

// Velocidade é lembrada por música (arranjo) no aparelho — ver §6.5 da spec.
// A fonte é única pro Modo Palco inteiro: depende do aparelho e da distância
// até a tela, e assim a letra não muda de tamanho de uma música pra outra.
const FONT_SIZE_KEY = "modo-palco:fontSize";

function scrollSpeedKey(unit: ClientServiceUnit) {
  const arrangement = unit.arrangement;
  const arrangementKey = arrangement?.id ?? arrangement?.originalArrangementId ?? "sem-arranjo";
  return `modo-palco:${arrangementKey}:scrollSpeed`;
}

/**
 * Modo Palco: todas as músicas do culto numa única rolagem contínua (como a
 * tela normal, que é o que os músicos já conhecem), com interface limpa.
 * Tom e velocidade valem para a música que está no topo da tela; a fonte é
 * a mesma para todas.
 */
export default function StageMode({ units, initialIndex, initialFontSize, onExit }: StageModeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  // Rolagem automática sempre começa desligada ao entrar, por segurança
  // (nunca liga sozinha).
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  // Tom é só da sessão (parte do tom salvo no culto); fonte e velocidade
  // vêm do aparelho.
  const [transposes, setTransposes] = useState(() => units.map((unit) => unit.semitoneTranspose ?? 0));
  const [fontSize, setFontSize] = useLocalStorageState(
    FONT_SIZE_KEY,
    Math.min(FONT_MAX, Math.max(FONT_MIN, initialFontSize))
  );
  const [scrollSpeeds, setScrollSpeeds] = useState(() =>
    units.map((unit) => readStorage(scrollSpeedKey(unit), DEFAULT_SCROLL_SPEED_MULTIPLIER))
  );

  function getSongStarts(): number[] {
    return sectionRefs.current.map((section) => (section?.offsetTop ?? 0) - TOP_BAR_HEIGHT_PX);
  }

  function scrollToSong(index: number) {
    const container = contentRef.current;
    if (!container) return;
    container.scrollTop = getSongStarts()[index] ?? 0;
    setCurrentIndex(index);
  }

  useAutoScroll({
    containerRef: contentRef,
    isEnabled: isScrollEnabled,
    speedPxPerSecond: multiplierToPxPerSecond(scrollSpeeds[currentIndex]),
    // Para no início da próxima música: entre músicas costuma haver fala,
    // oração ou transição.
    getStopPosition: (scrollTop) =>
      nextStopPosition(getSongStarts(), scrollTop, Number.POSITIVE_INFINITY),
    onReachEnd: () => setIsScrollEnabled(false),
  });

  // Botão voltar do aparelho e botão de sair seguem o mesmo caminho: o
  // histórico volta uma entrada e o popstate fecha o modo.
  useStageModeBack(() => onExit(currentIndexRef.current));

  // Abre na música que estava visível na tela normal.
  useLayoutEffect(() => {
    scrollToSong(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A música "atual" é a que está no topo da tela, e muda conforme rola.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const onScroll = () => setCurrentIndex(findSongIndex(getSongStarts(), container.scrollTop));
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
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

  return (
    // Visual claro por enquanto — o tratamento escuro fica pra quando o
    // design system tratar dark mode em todas as telas, não só aqui.
    <div className="fixed inset-0 h-dvh bg-background flex flex-col">
      <div ref={contentRef} className="relative flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 pt-14 pb-28">
          {units.map((unit, index) => {
            const arrangement = unit.arrangement;
            if (!arrangement) return null;
            return (
              <section
                key={unit.id ?? index}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
              >
                {/* Divisor entre músicas — é onde a rolagem automática pausa. */}
                <div className="flex items-center gap-3 py-4 text-muted-foreground select-none">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium truncate">
                    {index + 1} · {arrangement.song?.title ?? ""}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <SongConfigProvider transpose={transposes[index]} columns={1} fontSize={fontSize}>
                  <ArrangementView arrangement={arrangement} />
                </SongConfigProvider>
              </section>
            );
          })}
        </div>
      </div>

      {/* StageModeControls renderiza KeyButtonSet, que precisa de um
          SongConfigProvider ancestral — o da música atual. */}
      <SongConfigProvider
        transpose={transposes[currentIndex]}
        columns={1}
        fontSize={fontSize}
      >
        <StageModeControls
          songTitles={units.map((unit) => unit.arrangement?.song?.title ?? "")}
          currentIndex={currentIndex}
          onSelectSong={(index) => {
            setIsScrollEnabled(false);
            scrollToSong(index);
          }}
          originalKey={currentArrangement?.key ?? ""}
          transpose={transposes[currentIndex]}
          setTranspose={setCurrentTranspose}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isScrollEnabled={isScrollEnabled}
          scrollSpeedMultiplier={scrollSpeeds[currentIndex]}
          onTogglePlayback={() => setIsScrollEnabled((enabled) => !enabled)}
          onSlower={() => changeCurrentScrollSpeed(-1)}
          onFaster={() => changeCurrentScrollSpeed(1)}
          onExit={() => requestStageModeExit(() => onExit(currentIndex))}
        />
      </SongConfigProvider>
    </div>
  );
}
