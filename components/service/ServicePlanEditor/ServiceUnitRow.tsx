"use client";

import { ClientServiceUnit } from "@/prisma/models";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { forwardRef, useState } from "react";
import { UnitTiming, formatTime } from "./hooks/useServiceTimeline";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";

type ServiceUnitRowProps = {
  unit: ClientServiceUnit;
  timing?: UnitTiming;
  isDragging?: boolean;
  isActive?: boolean;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onRemove: () => void;
  onEditDetails: () => void;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
};

type FalaMeta = { speaker?: string | null; description?: string | null };
type LeituraMeta = { version?: string | null; text?: string | null };
type SermaoMeta = { preacher?: string | null; reference?: string | null; description?: string | null };
type AvisosMeta = { items?: { id: string; text: string }[] };

const ServiceUnitRow = forwardRef<HTMLDivElement, ServiceUnitRowProps>(
  function ServiceUnitRow(
    { unit, timing, isDragging, isActive, onUpdate, onRemove, onEditDetails, dragHandleRef },
    ref
  ) {
    const [descExpanded, setDescExpanded] = useState(false);

    const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
    const Icon = config?.icon;

    const songTitle = unit.type === "SONG" ? (unit.arrangement?.song?.title ?? null) : null;
    const displayLabel =
      unit.type === "SONG"
        ? songTitle
        : unit.label ?? config?.label ?? unit.type;

    const falaMeta =
      unit.type === "FALA" || unit.type === "ORACAO"
        ? (unit.metadata as FalaMeta | null)
        : null;
    const falaSpeaker = falaMeta?.speaker ?? null;
    const falaDescription = falaMeta?.description ?? null;

    const leituraMeta =
      unit.type === "LEITURA" ? (unit.metadata as LeituraMeta | null) : null;
    const leituraVersion = leituraMeta?.version ?? null;
    const leituraText = leituraMeta?.text ?? null;

    const sermaoMeta =
      unit.type === "SERMAO" ? (unit.metadata as SermaoMeta | null) : null;
    const sermaoPreacher = sermaoMeta?.preacher ?? null;
    const sermaoDescription = sermaoMeta?.description ?? null;

    const avisosItems =
      unit.type === "AVISOS" ? (unit.metadata as AvisosMeta | null)?.items ?? [] : [];

    return (
      <div
        ref={ref}
        className={`group rounded-md transition-colors ${
          isDragging ? "opacity-40" : ""
        } ${isActive ? "bg-emerald-50 hover:bg-emerald-50" : "hover:bg-zinc-50"}`}
      >
        {/* Main row — items-center alinha tudo com a linha do título */}
        <div className="flex items-center gap-2 px-1 py-1">
          {/* 1. Drag handle */}
          <div
            ref={dragHandleRef}
            className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-400 shrink-0 touch-none"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* 2. Type icon as bullet */}
          <div className={`shrink-0 ${config?.color ?? "text-zinc-400"}`}>
            {Icon && <Icon className="w-4 h-4" />}
          </div>

          {/* 3. Label + sub inline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <button
                type="button"
                onClick={onEditDetails}
                className="text-sm text-left hover:underline decoration-dashed underline-offset-2 leading-tight truncate min-w-0"
              >
                {unit.type === "SONG" ? (
                  songTitle
                    ? <>{songTitle}{unit.arrangement?.name && <span className="text-zinc-400"> · {unit.arrangement.name}</span>}</>
                    : <span className="text-zinc-400">Adicione uma música</span>
                ) : unit.type === "FALA" ? (
                  falaSpeaker
                    ? <>{displayLabel}<span className="text-zinc-400"> · {falaSpeaker}</span></>
                    : <span className="text-zinc-400">Adicione uma fala</span>
                ) : unit.type === "ORACAO" ? (
                  falaSpeaker
                    ? <>{displayLabel}<span className="text-zinc-400"> · {falaSpeaker}</span></>
                    : <span className="text-zinc-400">Adicione uma oração</span>
                ) : unit.type === "LEITURA" ? (
                  leituraVersion
                    ? <>{displayLabel}<span className="text-zinc-400"> · {leituraVersion}</span></>
                    : <span className="text-zinc-400">Adicione uma leitura</span>
                ) : unit.type === "SERMAO" ? (
                  sermaoPreacher
                    ? <>{displayLabel}<span className="text-zinc-400"> · {sermaoPreacher}</span></>
                    : <span className="text-zinc-400">Adicione um sermão</span>
                ) : unit.type === "AVISOS" ? (
                  avisosItems.length > 0
                    ? <>Avisos<span className="text-zinc-400"> · {avisosItems.length} {avisosItems.length === 1 ? "item" : "itens"}</span></>
                    : <span className="text-zinc-400">Adicione avisos</span>
                ) : displayLabel}
              </button>
              {(falaDescription || leituraText || sermaoDescription || avisosItems.length > 0) && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors"
                  aria-label={descExpanded ? "Ocultar descrição" : "Ver descrição"}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${descExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {/* 4. Duration + time right-aligned — desktop apenas */}
          {(unit.durationMin || timing) && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs text-zinc-400">
              {unit.durationMin && <span>{unit.durationMin} min</span>}
              {timing && (
                <>
                  {unit.durationMin && <span>·</span>}
                  <span>{formatTime(timing.startTime)}</span>
                </>
              )}
            </div>
          )}

          {/* Remove — sempre visível em mobile, hover em desktop */}
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-zinc-300 hover:text-red-400 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Remover"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile: duração + horário — linha separada com spacers para alinhar com o label */}
        {(unit.durationMin || timing) && (
          <div className="flex gap-2 px-1 pb-1 sm:hidden">
            <div className="w-4 shrink-0" />
            <div className="w-4 shrink-0" />
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              {unit.durationMin && <span>{unit.durationMin} min</span>}
              {timing && (
                <>
                  {unit.durationMin && <span>·</span>}
                  <span>{formatTime(timing.startTime)}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Descrição expandida — linha separada com spacers para alinhar com o label */}
        {descExpanded && (unit.type === "FALA" || unit.type === "ORACAO") && falaDescription && (
          <div className="flex gap-2 px-1 pb-1">
            <div className="w-4 shrink-0" />
            <div className="w-4 shrink-0" />
            <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {falaDescription}
            </p>
          </div>
        )}
        {descExpanded && unit.type === "LEITURA" && leituraText && (
          <div className="flex gap-2 px-1 pb-1">
            <div className="w-4 shrink-0" />
            <div className="w-4 shrink-0" />
            <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {leituraText}
            </p>
          </div>
        )}
        {descExpanded && unit.type === "SERMAO" && sermaoDescription && (
          <div className="flex gap-2 px-1 pb-1">
            <div className="w-4 shrink-0" />
            <div className="w-4 shrink-0" />
            <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {sermaoDescription}
            </p>
          </div>
        )}
        {descExpanded && unit.type === "AVISOS" && avisosItems.length > 0 && (
          <div className="flex gap-2 px-1 pb-1">
            <div className="w-4 shrink-0" />
            <div className="w-4 shrink-0" />
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
              {avisosItems.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

export default ServiceUnitRow;


