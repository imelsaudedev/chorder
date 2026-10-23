"use client";

import { ClientServiceUnit } from "@/prisma/models";
import { Flag } from "lucide-react";
import { formatTime } from "./hooks/useServiceTimeline";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import { usePlanMode } from "./planMode";
import { summarizeUnit } from "./unitSummary";

// Miolo visual de uma linha da liturgia (horário | ícone na linha do tempo |
// texto), compartilhado entre a edição (ServiceUnitRow) e a leitura
// (ServiceLiturgyView) para os dois não divergirem.
//
// Usa <span> para poder ficar dentro de um <button>.

const TITLE_FONT = "font-display text-base leading-[22px] font-semibold tracking-tight";

type UnitRowContentProps = {
  unit: ClientServiceUnit;
  startTime?: Date;
  isFirst?: boolean;
  isLast?: boolean;
  /** Na edição a descrição é limitada a 3 linhas; na leitura aparece inteira. */
  clampDescription?: boolean;
};

export default function UnitRowContent({
  unit,
  startTime,
  isFirst = false,
  isLast = false,
  clampDescription = false,
}: UnitRowContentProps) {
  const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
  const Icon = config?.icon;
  const mode = usePlanMode();
  const summary = summarizeUnit(unit, config?.label ?? unit.type, mode);
  const isPending = summary.pending;
  const hasTitle = summary.title !== null;
  const description =
    summary.detail ?? (summary.bullets.length > 0 ? summary.bullets.map((b) => `• ${b}`).join("\n") : null);

  return (
    <span className="flex min-h-14 min-w-0 flex-1 items-stretch text-left">
      {/* Horário e duração */}
      <span className="flex w-12 shrink-0 flex-col py-2.5">
        <span className={`${TITLE_FONT} tabular-nums whitespace-nowrap text-muted-foreground`}>
          {startTime ? formatTime(startTime) : " "}
        </span>
        <span className="min-h-5 whitespace-nowrap text-sm leading-5 text-muted-foreground tabular-nums">
          {unit.durationMin ? formatDuration(unit.durationMin) : ""}
        </span>
      </span>

      {/* Ícone na linha do tempo. O fio é desenhado em dois trechos (acima e abaixo
          do ícone), então o ícone não precisa de fundo — e não "pisca" sobre os
          fundos de hover e de seleção da linha. */}
      <span className="flex w-10 shrink-0 flex-col items-center" aria-hidden={!isPending}>
        <span
          aria-hidden="true"
          className={`h-[7px] w-px shrink-0 ${isFirst ? "" : "bg-muted-foreground/40"}`}
        />
        <span
          className={`relative grid size-7 shrink-0 place-items-center ${config?.color ?? "text-muted-foreground"}`}
        >
          {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
          {isPending && (
            <span
              role="img"
              aria-label="Pendente"
              className="absolute right-0 top-0 size-2.5 translate-x-0.5 -translate-y-0.5 rounded-full bg-foreground"
            />
          )}
        </span>
        <span
          aria-hidden="true"
          className={`w-px flex-1 ${isLast ? "" : "bg-muted-foreground/40"}`}
        />
      </span>

      {/* Texto */}
      <span className="flex min-w-0 flex-1 flex-col py-2.5 pb-3 pr-2">
        <span
          className={`${TITLE_FONT} break-words ${
            hasTitle ? "text-foreground" : "font-normal text-muted-foreground"
          }`}
        >
          {hasTitle ? summary.title : summary.placeholder}
        </span>
        {(summary.subtitle || summary.hint) && (
          <span className="break-words text-sm leading-5 text-muted-foreground">
            {summary.subtitle ?? summary.hint}
          </span>
        )}
        {description && (
          <span
            className={`mt-1.5 block whitespace-pre-wrap break-words text-sm leading-5 text-foreground ${
              clampDescription ? "line-clamp-3" : ""
            }`}
          >
            {description}
          </span>
        )}
      </span>
    </span>
  );
}

// Linha final: horário calculado de término.
export function PlanEndRow({ time, withGrip = false }: { time: Date; withGrip?: boolean }) {
  return (
    <div className="flex min-h-14 items-stretch border-t border-border">
      {withGrip && <span className="w-10 shrink-0" aria-hidden="true" />}
      <span className="flex min-h-14 min-w-0 flex-1 items-stretch text-left">
        <span className="flex w-12 shrink-0 flex-col py-2.5">
          <span className={`${TITLE_FONT} tabular-nums whitespace-nowrap text-muted-foreground`}>
            {formatTime(time)}
          </span>
        </span>
        <span className="relative flex w-10 shrink-0 justify-center pt-[7px]" aria-hidden="true">
          <span className="grid size-7 place-items-center bg-background text-muted-foreground">
            <Flag className="w-5 h-5" />
          </span>
        </span>
        <span className={`${TITLE_FONT} flex-1 py-2.5 font-normal text-muted-foreground`}>
          Término previsto
        </span>
      </span>
    </div>
  );
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
