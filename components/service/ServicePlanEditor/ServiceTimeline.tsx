"use client";

import { ClientService, ClientServiceSection, ClientServiceUnit } from "@/prisma/models";
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
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DrawerState } from "./hooks/usePlanEditor";
import { useServiceTimeline } from "./hooks/useServiceTimeline";
import ServiceSectionBlock from "./ServiceSectionBlock";

type ServiceTimelineProps = {
  service: ClientService;
  onAddSection: (section: Omit<ClientServiceSection, "order">) => void;
  onUpdateSection: (sectionIndex: number, changes: Partial<ClientServiceSection>) => void;
  onRemoveSection: (sectionIndex: number) => void;
  onMoveSection: (from: number, to: number) => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (sectionIndex: number, unitIndex: number) => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
  onOpenDrawer: (state: DrawerState) => void;
};


type SectionDragData = {
  type: "service-section";
  sectionIndex: number;
};

function isSectionDragData(data: Record<string, unknown>): data is SectionDragData {
  return data.type === "service-section";
}

export default function ServiceTimeline({
  service,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onMoveUnit,
  onOpenDrawer,
}: ServiceTimelineProps) {
  const sections = service.plan?.sections ?? [];
  const timings = useServiceTimeline(service);

  return (
    <div className="py-4">
      {sections.length === 0 && (
        <div className="text-center py-12 text-zinc-400 text-sm">
          Nenhuma seção. Adicione um bloco abaixo.
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <SortableSectionBlock
          key={`section-${sectionIndex}`}
          section={section}
          sectionIndex={sectionIndex}
          timing={timings[sectionIndex]}
          onUpdateSection={(changes) => onUpdateSection(sectionIndex, changes)}
          onRemoveSection={() => onRemoveSection(sectionIndex)}
          onAddUnit={onAddUnit}
          onUpdateUnit={(unitIndex, changes) => onUpdateUnit(sectionIndex, unitIndex, changes)}
          onRemoveUnit={(unitIndex) => onRemoveUnit(sectionIndex, unitIndex)}
          onMoveUnit={onMoveUnit}
          onMoveSection={onMoveSection}
          onOpenDrawer={onOpenDrawer}
        />
      ))}

      <AddSectionMenu
        onAdd={(type, label) => onAddSection({ type, label, units: [] })}
      />
    </div>
  );
}

// --- Sortable section wrapper ---

type SortableSectionBlockProps = {
  section: ClientServiceSection;
  sectionIndex: number;
  timing?: ReturnType<typeof useServiceTimeline>[number];
  onUpdateSection: (changes: Partial<ClientServiceSection>) => void;
  onRemoveSection: () => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (unitIndex: number) => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
  onMoveSection: (from: number, to: number) => void;
  onOpenDrawer: (state: DrawerState) => void;
};

function SortableSectionBlock({
  section,
  sectionIndex,
  timing,
  onUpdateSection,
  onRemoveSection,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onMoveUnit,
  onMoveSection,
  onOpenDrawer,
}: SortableSectionBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const el = blockRef.current;
    const handle = dragHandleRef.current;
    if (!el || !handle) return;

    return draggable({
      element: el,
      dragHandle: handle,
      getInitialData: () =>
        ({ type: "service-section", sectionIndex } satisfies SectionDragData),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [sectionIndex]);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => isSectionDragData(source.data as Record<string, unknown>),
      getData: ({ input, element }) =>
        attachClosestEdge(
          { type: "service-section", sectionIndex } satisfies SectionDragData,
          { input, element, allowedEdges: ["top", "bottom"] }
        ),
      onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
      onDragLeave: () => setClosestEdge(null),
      onDrop: ({ self, source }) => {
        setClosestEdge(null);
        const drag = source.data as SectionDragData;
        if (!isSectionDragData(drag)) return;

        const edge = extractClosestEdge(self.data);
        let dest = edge === "bottom" ? sectionIndex + 1 : sectionIndex;
        if (drag.sectionIndex < sectionIndex) dest -= 1;
        if (drag.sectionIndex === dest) return;
        onMoveSection(drag.sectionIndex, dest);
      },
    });
  }, [sectionIndex, onMoveSection]);

  const handleMoveSection = useCallback(
    (from: number, to: number) => onMoveSection(from, to),
    [onMoveSection]
  );

  return (
    <div ref={blockRef} className={`relative ${isDragging ? "opacity-40" : ""}`}>
      <ServiceSectionBlock
        section={section}
        sectionIndex={sectionIndex}
        timing={timing}
        dragHandleRef={dragHandleRef}
        onUpdateSection={onUpdateSection}
        onRemoveSection={onRemoveSection}
        onAddUnit={onAddUnit}
        onUpdateUnit={onUpdateUnit}
        onRemoveUnit={onRemoveUnit}
        onMoveUnit={onMoveUnit}
        onOpenDrawer={onOpenDrawer}
      />
      {closestEdge && <DropIndicator edge={closestEdge} gap="0px" />}
    </div>
  );
}

function AddSectionMenu({
  onAdd,
}: {
  onAdd: (type: ClientServiceSection["type"], label: string) => void;
}) {
  return (
    <div className="mt-4 px-1">
      <button
        type="button"
        onClick={() => onAdd("ESPECIAL", "")}
        className="w-full flex items-center gap-1 text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-md px-2.5 py-2 hover:border-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <Plus className="w-3 h-3" />
        Adicionar seção
      </button>
    </div>
  );
}
