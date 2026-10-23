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
import { formatTime, useServiceTimeline } from "./hooks/useServiceTimeline";
import SectionDialog from "./SectionDialog";
import { PlanEndRow } from "./UnitRowContent";
import ServiceSectionBlock, { AdjacentSections } from "./ServiceSectionBlock";

type ServiceTimelineProps = {
  service: ClientService;
  activeClientId?: string;
  onAddSection: (section: Omit<ClientServiceSection, "order" | "id">) => void;
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
  activeClientId,
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
  const finalTiming = timings[timings.length - 1];
  // Mensagem para leitores de tela ao reordenar pelo teclado.
  const [announcement, setAnnouncement] = useState("");

  return (
    <div className="py-4">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhuma seção. Adicione um bloco abaixo.
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <SortableSectionBlock
          key={section.id}
          section={section}
          sectionIndex={sectionIndex}
          sectionCount={sections.length}
          adjacent={{
            prev: sections[sectionIndex - 1]
              ? {
                  label: sections[sectionIndex - 1].label,
                  unitCount: sections[sectionIndex - 1].units?.length ?? 0,
                }
              : undefined,
            next: sections[sectionIndex + 1]
              ? { label: sections[sectionIndex + 1].label }
              : undefined,
          }}
          onAnnounce={setAnnouncement}
          timing={timings[sectionIndex]}
          activeClientId={activeClientId}
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

      {finalTiming && <PlanEndRow time={finalTiming.endTime} withGrip />}

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
  sectionCount: number;
  adjacent: AdjacentSections;
  onAnnounce: (message: string) => void;
  timing?: ReturnType<typeof useServiceTimeline>[number];
  activeClientId?: string;
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
  sectionCount,
  adjacent,
  onAnnounce,
  timing,
  activeClientId,
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

  // Reordenar a seção pelo teclado (setas na alça).
  const handleHandleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const to = e.key === "ArrowUp" ? sectionIndex - 1 : sectionIndex + 1;
      if (to < 0 || to >= sectionCount) return;
      onMoveSection(sectionIndex, to);
      onAnnounce(`Seção ${section.label || "sem nome"}: posição ${to + 1} de ${sectionCount}.`);
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[data-section-handle="${section.id}"]`)
          ?.focus();
      });
    },
    [sectionIndex, sectionCount, section.id, section.label, onMoveSection, onAnnounce]
  );

  return (
    <div ref={blockRef} className={`relative ${isDragging ? "opacity-40" : ""}`}>
      <ServiceSectionBlock
        section={section}
        sectionIndex={sectionIndex}
        timing={timing}
        adjacent={adjacent}
        onAnnounce={onAnnounce}
        onSectionHandleKeyDown={handleHandleKeyDown}
        dragHandleRef={dragHandleRef}
        activeClientId={activeClientId}
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
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer flex h-12 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-input text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
      >
        <Plus className="w-4 h-4" />
        Adicionar seção
      </button>
      <SectionDialog
        open={open}
        onOpenChange={setOpen}
        section={null}
        onSubmit={({ label, type }) => onAdd(type, label)}
      />
    </div>
  );
}
