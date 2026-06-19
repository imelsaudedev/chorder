"use client";

import FullScreenToggle from "@/components/common/FullScreenToggle";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import {
  UNIT_CONFIG,
  ServiceUnitTypeValue,
} from "@/components/service/ServicePlanEditor/unitConfig";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { Fragment, useEffect, useState } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};

export default function ServiceView({ service }: ServiceViewProps) {
  const { density, fontSize, setFontSize } = useServiceConfig();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const handleFSChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  useEffect(() => {
    if (!isFullScreen) return;
    const handleKey = (e: KeyboardEvent) => {
      const total = songUnits.length;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIndex((i) => Math.min(i + 1, total - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen]);

  if (!service) return null;
  if (!service.units) throw new Error("Service units are not available");

  const songUnits = service.units.filter(
    (u): u is ClientServiceUnit => u?.type === "SONG"
  );
  const total = songUnits.length;
  const currentTitle =
    (
      songUnits[currentIndex]?.arrangement as
        | { song?: { title?: string } }
        | undefined
    )?.song?.title ?? "";
  const sectionClass =
    density === "compact"
      ? "flex flex-col mx-auto gap-4"
      : "flex flex-col mx-auto gap-10";

  const handleToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Build merged list of plan items for "show all" mode.
  // SONG items are matched to flat units by position (both lists share the same order),
  // since the plan JSON may have stale/null arrangementIds after first save.
  const planUnits = service.plan?.sections.flatMap((s) => s.units) ?? [];
  let songCursor = 0;
  const mergedPlanItems = planUnits.map((unit) => {
    if (unit.type === "SONG") {
      const flatUnit = songUnits[songCursor++] ?? null;
      return { unit, flatUnit };
    }
    return { unit, flatUnit: null };
  });

  return (
    <>
      {isFullScreen ? (
        <div
          className="h-dvh overflow-y-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8"
          style={{ fontSize: `${fontSize}px` }}
        >
          {songUnits[currentIndex] && (
            <ServiceSongUnitView unit={songUnits[currentIndex]} />
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 mb-6">
            <Label
              htmlFor="show-all-toggle"
              className="text-sm text-zinc-500 cursor-pointer"
            >
              Todos os itens
            </Label>
            <Switch
              id="show-all-toggle"
              checked={showAll}
              onCheckedChange={setShowAll}
            />
          </div>

          <section className={sectionClass} style={{ fontSize: `${fontSize}px` }}>
            {showAll
              ? mergedPlanItems.map(({ unit, flatUnit }, index) =>
                  unit.type === "SONG" ? (
                    flatUnit ? (
                      <ServiceSongUnitView key={index} unit={flatUnit} />
                    ) : null
                  ) : (
                    <NonSongDivider key={index} unit={unit} />
                  )
                )
              : service.units.map((unit, index) => (
                  <Fragment key={index}>
                    {unit?.type === "SONG" && (
                      <ServiceSongUnitView unit={unit as ClientServiceUnit} />
                    )}
                  </Fragment>
                ))}
          </section>
        </>
      )}

      <FullScreenToggle
        isFullScreen={isFullScreen}
        currentIndex={currentIndex}
        total={total}
        currentTitle={currentTitle}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
        onNext={() => setCurrentIndex((i) => Math.min(i + 1, total - 1))}
        onToggle={handleToggle}
      />
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
