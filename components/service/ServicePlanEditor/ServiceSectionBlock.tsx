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
import { Input } from "@/components/ui/input";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime, SectionTiming } from "./hooks/useServiceTimeline";
import { DrawerState } from "./hooks/usePlanEditor";
import SectionDialog from "./SectionDialog";
import ServiceUnitRow from "./ServiceUnitRow";
import { isUnitPending, summarizeUnit } from "./unitSummary";

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export type AdjacentSections = {
  prev?: { label: string; unitCount: number };
  next?: { label: string };
};

type ServiceSectionBlockProps = {
  section: ClientServiceSection;
  sectionIndex: number;
  timing?: SectionTiming;
  adjacent: AdjacentSections;
  dragHandleRef?: React.RefObject<HTMLDivElement>;
  activeClientId?: string;
  onSectionHandleKeyDown?: (e: React.KeyboardEvent) => void;
  onAnnounce: (message: string) => void;
  onUpdateSection: (changes: Partial<ClientServiceSection>) => void;
  onRemoveSection: () => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (unitIndex: number) => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
  onOpenDrawer: (state: DrawerState) => void;
};

// Unidade em branco pra qualquer tipo que não seja música — o item já entra
// na timeline vazio (esqueleto) e abre pra edição na sequência, unificando
// os fluxos de adicionar e editar.
function buildBlankUnit(type: ServiceUnitTypeValue): Omit<ClientServiceUnit, "order"> {
  return {
    clientId: crypto.randomUUID(),
    type,
    arrangementId: null,
    semitoneTranspose: null,
    durationMin: null,
    label: null,
    metadata: null,
  };
}

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
  adjacent,
  dragHandleRef,
  activeClientId,
  onSectionHandleKeyDown,
  onAnnounce,
  onUpdateSection,
  onRemoveSection,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onMoveUnit,
  onOpenDrawer,
}: ServiceSectionBlockProps) {
  const units = section.units ?? [];
  const [editOpen, setEditOpen] = useState(false);
  const pendingCount = units.filter(isUnitPending).length;
  const totalLabel = timing
    ? [
        formatTime(timing.startTime),
        formatDuration(Math.round((timing.endTime.getTime() - timing.startTime.getTime()) / 60000)),
      ].join(" · ")
    : null;

  return (
    <div className="mb-6">
      {/* Cabeçalho da seção: nome editável e total lado a lado, divisória embaixo */}
      <div className="mb-1.5 flex min-h-12 items-center border-b border-border">
        {/* Alça da seção */}
        <div
          ref={dragHandleRef}
          role="button"
          tabIndex={0}
          data-section-handle={section.id}
          aria-label={`Reordenar a seção ${section.label || "sem nome"}. Use as setas para cima e para baixo para mover a seção.`}
          onKeyDown={onSectionHandleKeyDown}
          className="grid h-12 w-10 shrink-0 cursor-grab place-items-center rounded-lg text-muted-foreground touch-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5">
          {/* Nome da seção (edição rápida) */}
          <Input
            type="text"
            value={section.label}
            onChange={(e) => onUpdateSection({ label: e.target.value })}
            aria-label="Nome da seção"
            className="h-11 w-auto min-w-24 max-w-full border-transparent bg-transparent px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground shadow-none [field-sizing:content] hover:border-input placeholder:text-muted-foreground"
            placeholder="Nome da seção"
          />
          {(totalLabel || pendingCount > 0) && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {totalLabel}
              {pendingCount > 0 && (
                <span className="ml-2 font-semibold text-foreground">
                  {pendingCount} {pendingCount === 1 ? "pendente" : "pendentes"}
                </span>
              )}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="cursor-pointer flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label={`Editar seção ${section.label || "sem nome"}`}
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRemoveSection}
          disabled={units.length > 0}
          className="cursor-pointer flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label={
            units.length > 0
              ? "Remover seção (remova os itens antes)"
              : `Remover seção ${section.label || "sem nome"}`
          }
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Units */}
      <div className="flex flex-col">
        {units.map((unit, unitIndex) => (
          <SortableUnitRow
            key={unit.clientId}
            unit={unit}
            sectionIndex={sectionIndex}
            unitIndex={unitIndex}
            unitCount={units.length}
            adjacent={adjacent}
            timing={timing?.units[unitIndex]}
            isActive={unit.clientId === activeClientId}
            onUpdate={(changes) => onUpdateUnit(unitIndex, changes)}
            onRemove={() => onRemoveUnit(unitIndex)}
            onEditDetails={() =>
              onOpenDrawer({ type: "edit-unit", clientId: unit.clientId })
            }
            onMoveUnit={onMoveUnit}
            onAnnounce={onAnnounce}
          />
        ))}
      </div>

      {/* Adicionar item */}
      <div className="mt-2 pl-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="cursor-pointer flex h-11 items-center gap-1.5 rounded-md border border-input px-3 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {(Object.entries(UNIT_CONFIG) as [ServiceUnitTypeValue, typeof UNIT_CONFIG[ServiceUnitTypeValue]][]).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={type}
                  className="min-h-11 cursor-pointer"
                  onClick={() => {
                    if (type === "SONG") {
                      onOpenDrawer({ type: "add-song", sectionIndex });
                      return;
                    }
                    const unit = buildBlankUnit(type);
                    onAddUnit(sectionIndex, unit);
                    onOpenDrawer({ type: "edit-unit", clientId: unit.clientId, isNew: true });
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

      <SectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        section={section}
        onSubmit={({ label, type }) => onUpdateSection({ label, type })}
      />
    </div>
  );
}

// --- Sortable unit row with DnD ---

type SortableUnitRowProps = {
  unit: ClientServiceUnit;
  sectionIndex: number;
  unitIndex: number;
  unitCount: number;
  adjacent: AdjacentSections;
  timing?: SectionTiming["units"][number];
  isActive?: boolean;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onRemove: () => void;
  onEditDetails: () => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
  onAnnounce: (message: string) => void;
};

function SortableUnitRow({
  unit,
  sectionIndex,
  unitIndex,
  unitCount,
  adjacent,
  timing,
  isActive,
  onUpdate,
  onRemove,
  onEditDetails,
  onMoveUnit,
  onAnnounce,
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

  // Reordenar pelo teclado: dentro da seção, e passando para a seção vizinha nas pontas.
  function handleKeyboardMove(direction: -1 | 1) {
    const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
    const summary = summarizeUnit(unit, config?.label ?? unit.type);
    const name = summary.title ?? summary.placeholder;

    if (direction === -1) {
      if (unitIndex > 0) {
        onMoveUnit(sectionIndex, unitIndex, sectionIndex, unitIndex - 1);
        onAnnounce(`${name}: posição ${unitIndex} de ${unitCount}.`);
      } else if (adjacent.prev) {
        onMoveUnit(sectionIndex, unitIndex, sectionIndex - 1, adjacent.prev.unitCount);
        onAnnounce(`${name} movido para a seção ${adjacent.prev.label || "sem nome"}.`);
      } else {
        return;
      }
    } else {
      if (unitIndex < unitCount - 1) {
        onMoveUnit(sectionIndex, unitIndex, sectionIndex, unitIndex + 1);
        onAnnounce(`${name}: posição ${unitIndex + 2} de ${unitCount}.`);
      } else if (adjacent.next) {
        onMoveUnit(sectionIndex, unitIndex, sectionIndex + 1, 0);
        onAnnounce(`${name} movido para a seção ${adjacent.next.label || "sem nome"}.`);
      } else {
        return;
      }
    }

    // A linha pode ser remontada ao trocar de seção; devolve o foco para a alça.
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-unit-handle="${unit.clientId}"]`)
        ?.focus();
    });
  }

  return (
    <div className="relative">
      <ServiceUnitRow
        ref={rowRef}
        unit={unit}
        timing={timing}
        isDragging={isDragging}
        isActive={isActive}
        isFirst={unitIndex === 0}
        isLast={unitIndex === unitCount - 1}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onEditDetails={onEditDetails}
        onKeyboardMove={handleKeyboardMove}
        dragHandleRef={dragHandleRef}
      />
      {closestEdge && <DropIndicator edge={closestEdge} gap="0px" />}
    </div>
  );
}
