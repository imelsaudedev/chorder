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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatTime, SectionTiming } from "./hooks/useServiceTimeline";
import { DrawerState } from "./hooks/usePlanEditor";
import ServiceUnitRow from "./ServiceUnitRow";

type ServiceSectionBlockProps = {
  section: ClientServiceSection;
  sectionIndex: number;
  timing?: SectionTiming;
  onUpdateSection: (changes: Partial<ClientServiceSection>) => void;
  onRemoveSection: () => void;
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

export default function ServiceSectionBlock({
  section,
  sectionIndex,
  timing,
  onUpdateSection,
  onRemoveSection,
  onUpdateUnit,
  onRemoveUnit,
  onMoveUnit,
  onOpenDrawer,
}: ServiceSectionBlockProps) {
  const units = section.units ?? [];

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <input
          type="text"
          value={section.label}
          onChange={(e) => onUpdateSection({ label: e.target.value })}
          className="flex-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-transparent outline-none placeholder:text-zinc-300"
          placeholder="Nome da seção"
        />
        {timing && (
          <span className="text-xs font-mono text-zinc-400">
            {formatTime(timing.startTime)}
          </span>
        )}
        <button
          type="button"
          onClick={onRemoveSection}
          className="text-zinc-300 hover:text-red-400 transition-colors"
          aria-label="Remover seção"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

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

      {/* Add unit */}
      <button
        type="button"
        onClick={() => onOpenDrawer({ type: "add-unit", sectionIndex })}
        className="flex items-center gap-1.5 mt-2 ml-8 text-xs text-zinc-400 hover:text-emerald-600 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar item
      </button>
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
