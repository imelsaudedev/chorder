"use client";

import {
  formatTime,
  useServiceTimeline,
} from "@/components/service/ServicePlanEditor/hooks/useServiceTimeline";
import {
  UNIT_CONFIG,
  ServiceUnitTypeValue,
} from "@/components/service/ServicePlanEditor/unitConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientService } from "@/prisma/models";

type FalaMeta = { speaker?: string | null };
type LeituraMeta = { version?: string | null };
type SermaoMeta = { preacher?: string | null };

function isIncomplete(unit: { type: string; arrangement?: { song?: unknown } | null; metadata?: unknown }): boolean {
  if (unit.type === "SONG") return !unit.arrangement?.song;
  if (unit.type === "FALA" || unit.type === "ORACAO") return !(unit.metadata as FalaMeta | null)?.speaker;
  if (unit.type === "LEITURA") return !(unit.metadata as LeituraMeta | null)?.version;
  if (unit.type === "SERMAO") return !(unit.metadata as SermaoMeta | null)?.preacher;
  return false;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function LiturgySkeletonSection({ rows }: { rows: number[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-3 w-24" />
        <div className="flex-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="h-px bg-zinc-200 mb-1" />
      {rows.map((w, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5">
          <Skeleton className="w-4 h-4 shrink-0 rounded-sm" />
          <Skeleton className={`h-3.5`} style={{ width: `${w}%` }} />
          <Skeleton className="h-3 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function ServiceLiturgyView({
  service,
}: {
  service: ClientService | null | undefined;
}) {
  const timings = useServiceTimeline(
    service && service !== null
      ? service
      : ({ plan: null, date: new Date() } as ClientService)
  );

  if (service === undefined) {
    return (
      <div className="flex flex-col gap-8">
        <LiturgySkeletonSection rows={[55, 70, 45, 65]} />
        <LiturgySkeletonSection rows={[60, 50]} />
      </div>
    );
  }

  if (!service?.plan) return null;

  const sections = service.plan.sections;

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section, si) => {
        const timing = timings[si];
        const totalMin = timing
          ? Math.round(
              (timing.endTime.getTime() - timing.startTime.getTime()) / 60000
            )
          : null;

        const allUnits = section.units ?? [];
        const visibleUnits = allUnits
          .map((u, originalIndex) => ({ unit: u, originalIndex }))
          .filter(({ unit: u }) => !isIncomplete(u));
        if (visibleUnits.length === 0) return null;

        return (
          <div key={si}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {section.label || "Seção"}
              </span>
              {(totalMin !== null || timing) && (
                <span className="text-xs text-zinc-400 shrink-0">
                  {[
                    totalMin !== null ? formatDuration(totalMin) : null,
                    timing ? formatTime(timing.startTime) : null,
                  ].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
            <div className="h-px bg-zinc-200 mb-1" />

            {/* Unit rows — apenas itens preenchidos */}
            {visibleUnits.map(({ unit, originalIndex }) => {
              const unitTiming = timing?.units[originalIndex];
              const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
              const Icon = config?.icon;

              const songTitle = unit.type === "SONG" ? (unit.arrangement?.song?.title ?? null) : null;
              const label =
                unit.type === "SONG"
                  ? songTitle
                  : unit.label ?? config?.label ?? unit.type;

              const falaSpeaker =
                (unit.type === "FALA" || unit.type === "ORACAO")
                  ? ((unit.metadata as FalaMeta | null)?.speaker ?? null)
                  : null;

              const leituraVersion =
                unit.type === "LEITURA"
                  ? ((unit.metadata as LeituraMeta | null)?.version ?? null)
                  : null;

              const sermaoPreacher =
                unit.type === "SERMAO"
                  ? ((unit.metadata as SermaoMeta | null)?.preacher ?? null)
                  : null;

              const timeMeta = [
                unit.durationMin ? formatDuration(unit.durationMin) : null,
                unitTiming ? formatTime(unitTiming.startTime) : null,
              ].filter(Boolean).join(" · ");

              return (
                <div key={originalIndex} className="flex items-center gap-2 py-1.5 rounded-md hover:bg-zinc-50 transition-colors">
                  {/* Icon as bullet */}
                  <div className={`shrink-0 ${config?.color ?? "text-zinc-400"}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                  </div>

                  {/* Title + sub inline */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight truncate">
                      {unit.type === "SONG" ? (
                        songTitle
                          ? <>{songTitle}{unit.arrangement?.name && <span className="text-zinc-400"> · {unit.arrangement.name}</span>}</>
                          : <span className="text-zinc-400">Adicione uma música</span>
                      ) : unit.type === "FALA" ? (
                        falaSpeaker
                          ? <>{label}<span className="text-zinc-400"> · {falaSpeaker}</span></>
                          : <span className="text-zinc-400">Adicione uma fala</span>
                      ) : unit.type === "ORACAO" ? (
                        falaSpeaker
                          ? <>{label}<span className="text-zinc-400"> · {falaSpeaker}</span></>
                          : <span className="text-zinc-400">Adicione uma oração</span>
                      ) : unit.type === "LEITURA" ? (
                        leituraVersion
                          ? <>{label}<span className="text-zinc-400"> · {leituraVersion}</span></>
                          : <span className="text-zinc-400">Adicione uma leitura</span>
                      ) : unit.type === "SERMAO" ? (
                        sermaoPreacher
                          ? <>{label}<span className="text-zinc-400"> · {sermaoPreacher}</span></>
                          : <span className="text-zinc-400">Adicione um sermão</span>
                      ) : label}
                    </p>
                  </div>

                  {/* Time + duration right-aligned */}
                  {timeMeta && (
                    <span className="text-xs text-zinc-400 shrink-0">{timeMeta}</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
