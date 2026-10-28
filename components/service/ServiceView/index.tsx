"use client";

import StageMode from "@/components/service/StageMode";
import { useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import { Button } from "@/components/ui/button";
import { useMediaBarOpen } from "@/hooks/useMediaBarOpen";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { Mic2 } from "lucide-react";
import { pushStageModeEntry } from "@/components/service/StageMode/useStageModeHistory";
import { useEffect, useRef, useState } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};

type SongEntry = {
  /** Posição entre as músicas do culto inteiro (0, 1, 2...). */
  songIndex: number;
  unit: ClientServiceUnit;
};

type SectionBlock = {
  id: string;
  /** Nulo quando o culto não tem plano (lista simples, sem cabeçalho de seção). */
  label: string | null;
  entries: SongEntry[];
};

export default function ServiceView({ service }: ServiceViewProps) {
  const { density, fontSize } = useServiceConfig();
  const { isOpen: isAudioOpen, close: closeAudio } = useAudioPlayer();
  const { close: closeYoutube } = useYoutubePlayer();
  const isMediaOpen = useMediaBarOpen();
  const [isStageMode, setIsStageMode] = useState(false);
  // Música em que o Modo Palco abre e, ao sair, onde a tela normal volta.
  const [stageIndex, setStageIndex] = useState(0);
  // Elevado acima do modo normal e do Modo Palco: trocar de um pro outro não
  // pode resetar um tom que já foi ajustado na sessão (bug: "tom volta ao
  // original ao entrar no Modo Palco").
  const [transposes, setTransposes] = useState(() =>
    (service?.units ?? [])
      .filter((u): u is ClientServiceUnit => u?.type === "SONG")
      .map((u) => u.semitoneTranspose ?? 0)
  );
  // Indexado pela posição entre as músicas.
  const songRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shouldRestoreScroll = useRef(false);

  useEffect(() => {
    if (isStageMode || !shouldRestoreScroll.current) return;
    shouldRestoreScroll.current = false;
    songRefs.current[stageIndex]?.scrollIntoView({ block: "start" });
  }, [isStageMode, stageIndex]);

  if (!service) return null;
  if (!service.units) throw new Error("Service units are not available");

  const songUnits = service.units.filter((u): u is ClientServiceUnit => u?.type === "SONG");
  const gapClass = density === "compact" ? "gap-4" : "gap-10";

  // Agrupa as músicas pelas seções do culto. As músicas do plano casam com
  // songUnits pela posição (ambas seguem a mesma ordem), pois o JSON do plano
  // pode ter arrangementIds desatualizados/nulos após o primeiro save. Músicas
  // ainda sem arranjo não entram (nem avançam a posição) e seções sem música
  // não aparecem.
  const blocks: SectionBlock[] = [];
  const sections = service.plan?.sections ?? [];
  if (sections.length === 0) {
    const entries = songUnits.map((unit, songIndex) => ({ songIndex, unit }));
    blocks.push({ id: "all", label: null, entries });
  } else {
    let songCursor = 0;
    sections.forEach((section) => {
      const entries: SongEntry[] = [];
      (section.units ?? []).forEach((planUnit) => {
        if (planUnit.type !== "SONG") return;
        if (!planUnit.arrangement?.song) return;
        const flat = songUnits[songCursor];
        if (!flat) return;
        entries.push({ songIndex: songCursor, unit: flat });
        songCursor += 1;
      });
      if (entries.length > 0) {
        blocks.push({ id: section.id, label: section.label, entries });
      }
    });
  }
  const hasSongs = blocks.some((block) => block.entries.length > 0);

  function enterStageMode() {
    // Primeira música cujo fim ainda está na tela.
    const visibleIndex = songRefs.current.findIndex((el) => el && el.getBoundingClientRect().bottom > 0);
    setStageIndex(Math.max(0, visibleIndex));
    pushStageModeEntry();
    // Entrar no Palco fecha qualquer mídia tocando (decisão: mídia e Modo
    // Palco não convivem — evita sobreposição e referência tocando fora de contexto).
    closeAudio();
    closeYoutube();
    setIsStageMode(true);
  }

  if (isStageMode) {
    return (
      <StageMode
        units={songUnits}
        initialIndex={stageIndex}
        initialFontSize={fontSize}
        initialTransposes={transposes}
        onExit={(index, exitTransposes) => {
          setStageIndex(index);
          setTransposes(exitTransposes);
          shouldRestoreScroll.current = true;
          setIsStageMode(false);
        }}
      />
    );
  }

  if (!hasSongs) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhuma música definida para este culto ainda.
      </p>
    );
  }

  return (
    <>
      <div
        className={`flex flex-col gap-14 ${isMediaOpen ? "pb-24" : ""}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {blocks.map((block) => (
          <section key={block.id}>
            {block.label !== null && (
              <h2 className="mb-4 flex min-h-8 items-center border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {block.label || "Seção"}
              </h2>
            )}
            <div className={`flex flex-col ${gapClass}`}>
              {block.entries.map((entry) => (
                <div
                  key={entry.songIndex}
                  ref={(el) => {
                    songRefs.current[entry.songIndex] = el;
                  }}
                >
                  <ServiceSongUnitView
                    unit={entry.unit}
                    transpose={transposes[entry.songIndex] ?? 0}
                    onTransposeChange={(value) =>
                      setTransposes((prev) =>
                        prev.map((v, i) => (i === entry.songIndex ? value : v))
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Sobe acima da barra de mídia (vídeo ou áudio — as duas usam a mesma
          barra full-width no rodapé, ver MediaPlayerBar) em vez de disputar o
          mesmo espaço (M2). */}
      <div
        className={`fixed right-4 md:right-8 z-50 transition-[bottom] ${
          isMediaOpen ? "bottom-24 md:bottom-28" : "bottom-4 md:bottom-8"
        }`}
      >
        <Button
          variant="secondary"
          aria-label="Entrar no Modo Palco"
          onClick={enterStageMode}
          className="shadow-md rounded-full gap-1.5"
        >
          <Mic2 size={18} />
          Palco
        </Button>
      </div>
    </>
  );
}
