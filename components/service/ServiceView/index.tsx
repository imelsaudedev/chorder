"use client";

import StageMode from "@/components/service/StageMode";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { Button } from "@/components/ui/button";
import { Mic2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};
export default function ServiceView({ service }: ServiceViewProps) {
  const { density, fontSize } = useServiceConfig();
  const [isStageMode, setIsStageMode] = useState(false);
  // Música em que o Modo Palco abre e, ao sair, onde a tela normal volta.
  const [stageIndex, setStageIndex] = useState(0);
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
  const sectionClass = density === "compact" ? "flex flex-col mx-auto gap-4" : "flex flex-col mx-auto gap-10";

  function enterStageMode() {
    // Primeira música cujo fim ainda está na tela.
    const visibleIndex = songRefs.current.findIndex((el) => el && el.getBoundingClientRect().bottom > 0);
    setStageIndex(Math.max(0, visibleIndex));
    setIsStageMode(true);
  }

  if (isStageMode) {
    return (
      <StageMode
        units={songUnits}
        initialIndex={stageIndex}
        initialFontSize={fontSize}
        onExit={(index) => {
          setStageIndex(index);
          shouldRestoreScroll.current = true;
          setIsStageMode(false);
        }}
      />
    );
  }

  return (
    <>
      <section className={sectionClass} style={{ fontSize: `${fontSize}px` }}>
        {songUnits.map((unit, index) => (
          <div
            key={index}
            ref={(el) => {
              songRefs.current[index] = el;
            }}
          >
            <ServiceSongUnitView unit={unit} />
          </div>
        ))}
      </section>

      {songUnits.length > 0 && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
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
      )}
    </>
  );
}
