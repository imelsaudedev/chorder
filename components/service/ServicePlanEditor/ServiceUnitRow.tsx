"use client";

import { ClientServiceUnit } from "@/prisma/models";
import { GripVertical, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import { UnitTiming, formatTime } from "./hooks/useServiceTimeline";

type ServiceUnitRowProps = {
  unit: ClientServiceUnit;
  timing?: UnitTiming;
  isDragging?: boolean;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onRemove: () => void;
  onEditDetails: () => void;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
};

const ServiceUnitRow = forwardRef<HTMLDivElement, ServiceUnitRowProps>(
  function ServiceUnitRow(
    { unit, timing, isDragging, onUpdate, onRemove, onEditDetails, dragHandleRef },
    ref
  ) {
    const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
    const Icon = config?.icon;

    const displayLabel =
      unit.type === "SONG"
        ? unit.arrangement?.song?.title ?? "Música (sem seleção)"
        : unit.label ?? config?.label ?? unit.type;

    return (
      <div
        ref={ref}
        className={`group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-50 transition-colors ${
          isDragging ? "opacity-40" : ""
        }`}
      >
        {/* Drag handle */}
        <div
          ref={dragHandleRef}
          className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-400 shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Type icon */}
        <div className={`shrink-0 ${config?.color ?? "text-zinc-400"}`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>

        {/* Time */}
        {timing && (
          <span className="text-xs text-zinc-400 font-mono w-10 shrink-0">
            {formatTime(timing.startTime)}
          </span>
        )}

        {/* Label — inline edit para tipos simples, botão para complexos */}
        <div className="flex-1 min-w-0">
          {config?.isComplex ? (
            <button
              type="button"
              onClick={onEditDetails}
              className="text-sm text-left w-full truncate hover:underline decoration-dashed underline-offset-2"
            >
              {displayLabel}
            </button>
          ) : (
            <InlineLabel
              value={unit.label ?? ""}
              placeholder={config?.label ?? unit.type}
              onChange={(v) => onUpdate({ label: v || null })}
            />
          )}
        </div>

        {/* Duration */}
        <InlineDuration
          value={unit.durationMin ?? null}
          onChange={(v) => onUpdate({ durationMin: v })}
        />

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

export default ServiceUnitRow;

// --- Inline editors ---

function InlineLabel({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm bg-transparent outline-none placeholder:text-zinc-400 cursor-text"
    />
  );
}

function InlineDuration({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <input
        type="number"
        min={0}
        max={999}
        value={value ?? ""}
        onChange={(e) => {
          const n = parseInt(e.target.value);
          onChange(isNaN(n) ? null : n);
        }}
        placeholder="—"
        className="w-10 text-xs text-right bg-transparent outline-none text-zinc-500 placeholder:text-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-xs text-zinc-400">min</span>
    </div>
  );
}
