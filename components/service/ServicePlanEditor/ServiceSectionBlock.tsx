"use client";

import { ClientServiceSection, ClientServiceUnit } from "@/prisma/models";
import {
  attachClosestEdge,
  Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime, SectionTiming } from "./hooks/useServiceTimeline";

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
import { DrawerState } from "./hooks/usePlanEditor";
import ServiceUnitRow from "./ServiceUnitRow";

type ServiceSectionBlockProps = {
  section: ClientServiceSection;
  sectionIndex: number;
  timing?: SectionTiming;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
  onUpdateSection: (changes: Partial<ClientServiceSection>) => void;
  onRemoveSection: () => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (unitIndex: number) => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
  onOpenDrawer: (state: DrawerState) => void;
};

type DragData = {
  type: "service-unit";
  sectionIndex: number;
  unitIndex: number;
};

function isDragData(data: Record<string, unknown>): data is DragData {
  return data.type === "service-unit";
}

const COMPLEX_TYPES: ServiceUnitTypeValue[] = ["SONG", "FALA", "ORACAO", "LEITURA", "SERMAO"];

export default function ServiceSectionBlock({
  section,
  sectionIndex,
  timing,
  dragHandleRef,
  onUpdateSection,
  onRemoveSection,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onMoveUnit,
  onOpenDrawer,
}: ServiceSectionBlockProps) {
  const units = section.units ?? [];

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1 px-1 py-1">
        {/* Drag handle da seção */}
        <div
          ref={dragHandleRef}
          className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-400 shrink-0 touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Label */}
        <input
          type="text"
          value={section.label}
          onChange={(e) => onUpdateSection({ label: e.target.value })}
          className="flex-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-transparent outline-none placeholder:text-zinc-300"
          placeholder="Nome da seção"
        />

        {/* Duration + time — desktop apenas */}
        {timing && (
          <span className="hidden sm:inline text-xs text-zinc-400  shrink-0">
            {[
              formatDuration(Math.round((timing.endTime.getTime() - timing.startTime.getTime()) / 60000)),
              formatTime(timing.startTime),
            ].join(" · ")}
          </span>
        )}

        <button
          type="button"
          onClick={onRemoveSection}
          disabled={units.length > 0}
          title={units.length > 0 ? "Remova os itens antes de deletar a seção" : undefined}
          className="text-zinc-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-300"
          aria-label="Remover seção"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile: duration + time abaixo do label, alinhado com ele */}
      {timing && (
        <div className="flex gap-2 px-1 mb-1 sm:hidden">
          <div className="w-4 shrink-0" />
          <span className="text-xs text-zinc-400 ">
            {[
              formatDuration(Math.round((timing.endTime.getTime() - timing.startTime.getTime()) / 60000)),
              formatTime(timing.startTime),
            ].join(" · ")}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-zinc-200 mb-2" />

      {/* Units */}
      <div className="flex flex-col">
        {units.map((unit, unitIndex) => (
          <SortableUnitRow
            key={unit.id ?? `new-${sectionIndex}-${unitIndex}`}
            unit={unit}
            sectionIndex={sectionIndex}
            unitIndex={unitIndex}
            timing={timing?.units[unitIndex]}
            onUpdate={(changes) => onUpdateUnit(unitIndex, changes)}
            onRemove={() => onRemoveUnit(unitIndex)}
            onEditDetails={() =>
              onOpenDrawer({ type: "edit-unit", sectionIndex, unitIndex })
            }
            onMoveUnit={onMoveUnit}
          />
        ))}
      </div>

      {/* Add unit — dropdown alinhado com o ícone dos itens */}
      <div className="flex items-center gap-2 mt-2 px-1">
        <div className="w-4 shrink-0" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-zinc-500 border border-zinc-200 rounded-md px-2.5 py-1 hover:border-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar item
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {(Object.entries(UNIT_CONFIG) as [ServiceUnitTypeValue, typeof UNIT_CONFIG[ServiceUnitTypeValue]][]).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    if (COMPLEX_TYPES.includes(type)) {
                      onOpenDrawer({ type: "add-unit", sectionIndex, unitType: type });
                    } else {
                      onAddUnit(sectionIndex, {
                        type,
                        arrangementId: null,
                        semitoneTranspose: null,
                        durationMin: null,
                        label: null,
                        metadata: null,
                      });
                    }
                  }}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  {config.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// --- Sortable unit row with DnD ---

type SortableUnitRowProps = {
  unit: ClientServiceUnit;
  sectionIndex: number;
  unitIndex: number;
  timing?: SectionTiming["units"][number];
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onRemove: () => void;
  onEditDetails: () => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
};

function SortableUnitRow({
  unit,
  sectionIndex,
  unitIndex,
  timing,
  onUpdate,
  onRemove,
  onEditDetails,
  onMoveUnit,
}: SortableUnitRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    const handle = dragHandleRef.current;
    if (!el || !handle) return;

    return draggable({
      element: el,
      dragHandle: handle,
      getInitialData: () =>
        ({ type: "service-unit", sectionIndex, unitIndex } satisfies DragData),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [sectionIndex, unitIndex]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isDragData(source.data as Record<string, unknown>),
      getData: ({ input, element }) =>
        attachClosestEdge(
          { type: "service-unit", sectionIndex, unitIndex } satisfies DragData,
          { input, element, allowedEdges: ["top", "bottom"] }
        ),
      onDrag: ({ self }) => {
        setClosestEdge(extractClosestEdge(self.data));
      },
      onDragLeave: () => setClosestEdge(null),
      onDrop: ({ self, source }) => {
        setClosestEdge(null);
        const drag = source.data as DragData;
        if (!isDragData(drag)) return;

        const edge = extractClosestEdge(self.data);
        const destIndex = edge === "bottom" ? unitIndex + 1 : unitIndex;
        const adjustedDest =
          drag.sectionIndex === sectionIndex && drag.unitIndex < unitIndex
            ? destIndex - 1
            : destIndex;

        if (drag.sectionIndex === sectionIndex && drag.unitIndex === adjustedDest) return;
        onMoveUnit(drag.sectionIndex, drag.unitIndex, sectionIndex, adjustedDest);
      },
    });
  }, [sectionIndex, unitIndex, onMoveUnit]);

  return (
    <div className="relative">
      <ServiceUnitRow
        ref={rowRef}
        unit={unit}
        timing={timing}
        isDragging={isDragging}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onEditDetails={onEditDetails}
        dragHandleRef={dragHandleRef}
      />
      {closestEdge && <DropIndicator edge={closestEdge} gap="0px" />}
    </div>
  );
}
