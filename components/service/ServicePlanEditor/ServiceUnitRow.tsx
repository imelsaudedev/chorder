"use client";

import { ClientServiceUnit } from "@/prisma/models";
import { GripVertical, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { UnitTiming } from "./hooks/useServiceTimeline";
import { usePlanMode } from "./planMode";
import { summarizeUnit } from "./unitSummary";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import UnitRowContent from "./UnitRowContent";

type ServiceUnitRowProps = {
  unit: ClientServiceUnit;
  timing?: UnitTiming;
  isDragging?: boolean;
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onRemove: () => void;
  onEditDetails: () => void;
  onKeyboardMove?: (direction: -1 | 1) => void;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
};

const ServiceUnitRow = forwardRef<HTMLDivElement, ServiceUnitRowProps>(
  function ServiceUnitRow(
    {
      unit,
      timing,
      isDragging,
      isActive,
      isFirst,
      isLast,
      onRemove,
      onEditDetails,
      onKeyboardMove,
      dragHandleRef,
    },
    ref
  ) {
    const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
    const mode = usePlanMode();
    const summary = summarizeUnit(unit, config?.label ?? unit.type, mode);
    const itemName = summary.title ?? summary.placeholder;

    function handleHandleKeyDown(e: React.KeyboardEvent) {
      if (!onKeyboardMove) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        onKeyboardMove(e.key === "ArrowUp" ? -1 : 1);
      }
    }

    return (
      <div
        ref={ref}
        className={`group flex items-stretch rounded-lg transition-colors ${
          isDragging ? "opacity-40" : ""
        } ${isActive ? "bg-ring/10 ring-2 ring-inset ring-ring" : "hover:bg-muted/30"}`}
      >
        {/* Alça de reordenar — arrastar com o mouse/toque ou usar as setas do teclado */}
        <div
          ref={dragHandleRef}
          role="button"
          tabIndex={0}
          data-unit-handle={unit.clientId}
          aria-label={`Reordenar ${itemName}. Use as setas para cima e para baixo para mover o item.`}
          onKeyDown={handleHandleKeyDown}
          className="grid h-12 w-10 shrink-0 cursor-grab place-items-center self-start rounded-lg text-muted-foreground touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Corpo: clicar abre a edição */}
        <button
          type="button"
          onClick={onEditDetails}
          className="cursor-pointer flex min-w-0 flex-1 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <UnitRowContent
            unit={unit}
            startTime={timing?.startTime}
            isFirst={isFirst}
            isLast={isLast}
            clampDescription
          />
        </button>

        {/* Remover — sempre visível no toque; no desktop aparece ao passar o mouse ou focar */}
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer grid h-12 w-11 shrink-0 place-items-center self-start rounded-lg text-muted-foreground transition-opacity hover:text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          aria-label={`Remover ${itemName}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

export default ServiceUnitRow;
