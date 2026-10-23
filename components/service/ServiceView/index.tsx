"use client";

import StageMode from "@/components/service/StageMode";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import {
  UNIT_CONFIG,
  ServiceUnitTypeValue,
} from "@/components/service/ServicePlanEditor/unitConfig";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { Mic2 } from "lucide-react";
import { pushStageModeEntry } from "@/components/service/StageMode/useStageModeHistory";
import { useEffect, useRef, useState } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};
export default function ServiceView({ service }: ServiceViewProps) {
  const { density, fontSize } = useServiceConfig();
  const [isStageMode, setIsStageMode] = useState(false);
  const [showAll, setShowAll] = useState(false);
  // Música em que o Modo Palco abre e, ao sair, onde a tela normal volta.
  const [stageIndex, setStageIndex] = useState(0);
  // Indexado pela posição entre as músicas (não pela lista completa com itens de liturgia).
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

  // Lista de itens do plano para o modo "Todos os itens".
  // As músicas do plano casam com songUnits pela posição (ambas seguem a mesma ordem),
  // pois o JSON do plano pode ter arrangementIds desatualizados/nulos após o primeiro save.
  const planUnits = service.plan?.sections.flatMap((s) => s.units) ?? [];
  let songCursor = 0;
  const mergedPlanItems = planUnits.map((unit) => {
    if (unit.type === "SONG") {
      const songIndex = songCursor++;
      return { unit, flatUnit: songUnits[songIndex] ?? null, songIndex };
    }
    return { unit, flatUnit: null, songIndex: -1 };
  });

  function enterStageMode() {
    // Primeira música cujo fim ainda está na tela.
    const visibleIndex = songRefs.current.findIndex((el) => el && el.getBoundingClientRect().bottom > 0);
    setStageIndex(Math.max(0, visibleIndex));
    pushStageModeEntry();
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

  const setSongRef = (index: number) => (el: HTMLDivElement | null) => {
    songRefs.current[index] = el;
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-6">
        <Label htmlFor="show-all-toggle" className="text-sm text-zinc-500 cursor-pointer">
          Todos os itens
        </Label>
        <Switch id="show-all-toggle" checked={showAll} onCheckedChange={setShowAll} />
      </div>

      <section className={sectionClass} style={{ fontSize: `${fontSize}px` }}>
        {showAll
          ? mergedPlanItems.map(({ unit, flatUnit, songIndex }, index) =>
              unit.type === "SONG" ? (
                flatUnit ? (
                  <div key={index} ref={setSongRef(songIndex)}>
                    <ServiceSongUnitView unit={flatUnit} />
                  </div>
                ) : null
              ) : (
                <NonSongDivider key={index} unit={unit} />
              )
            )
          : songUnits.map((unit, index) => (
              <div key={index} ref={setSongRef(index)}>
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

type FalaMeta = { speaker?: string | null };

function NonSongDivider({ unit }: { unit: ClientServiceUnit }) {
  const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
  const Icon = config?.icon;
  const label = unit.label ?? config?.label ?? unit.type;
  const speaker =
    (unit.type === "FALA" || unit.type === "ORACAO")
      ? (unit.metadata as FalaMeta | null)?.speaker ?? null
      : null;

  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-zinc-100" />
      <div
        className={`flex items-center gap-1.5 text-sm shrink-0 ${
          config?.color ?? "text-zinc-400"
        }`}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" />}
        <span className="text-zinc-500">
          {label}
          {speaker ? ` · ${speaker}` : ""}
        </span>
      </div>
      <div className="h-px flex-1 bg-zinc-100" />
    </div>
  );
}
