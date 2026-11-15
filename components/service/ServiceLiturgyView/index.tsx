"use client";

import {
  formatTime,
  useServiceTimeline,
} from "@/components/service/ServicePlanEditor/hooks/useServiceTimeline";
import UnitRowContent, { PlanEndRow } from "@/components/service/ServicePlanEditor/UnitRowContent";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientService } from "@/prisma/models";


function LiturgySkeletonSection({ rows }: { rows: number[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-3 w-24" />
        <div className="flex-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="h-px bg-border mb-1" />
      {rows.map((w, i) => (
        <div key={i} className="flex items-center gap-2 py-2">
          <Skeleton className="h-8 w-12 shrink-0" />
          <Skeleton className="size-7 shrink-0" />
          <Skeleton className="h-3.5" style={{ width: `${w}%` }} />
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

  const sections = service?.plan?.sections ?? [];
  const hasUnits = sections.some((section) => (section.units ?? []).length > 0);

  if (!hasUnits) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        A liturgia deste culto ainda não tem itens.
      </p>
    );
  }

  const finalTiming = timings[timings.length - 1];

  return (
    <div className="flex flex-col">
      {sections.map((section, si) => {
        const timing = timings[si];
        const totalMin = timing
          ? Math.round(
              (timing.endTime.getTime() - timing.startTime.getTime()) / 60000
            )
          : null;

        const units = section.units ?? [];
        if (units.length === 0) return null;

        return (
          <section key={section.id} aria-label={section.label || "Seção"} className="mb-6">
            {/* Cabeçalho da seção: nome e total lado a lado, divisória embaixo */}
            <div className="mb-1.5 flex min-h-8 flex-wrap items-center gap-x-2.5 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground break-words">
                {section.label || "Seção"}
              </h2>
              {(totalMin !== null || timing) && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {[
                    timing ? formatTime(timing.startTime) : null,
                    totalMin !== null ? `${totalMin} min` : null,
                  ].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>

            {/* Itens — os vazios aparecem com a chamada para preencher, não são escondidos */}
            <ul>
              {units.map((unit, unitIndex) => (
                <li key={unit.clientId} className="flex">
                  <UnitRowContent
                    unit={unit}
                    startTime={timing?.units[unitIndex]?.startTime}
                    isFirst={unitIndex === 0}
                    isLast={unitIndex === units.length - 1}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {finalTiming && <PlanEndRow time={finalTiming.endTime} />}
    </div>
  );
}
