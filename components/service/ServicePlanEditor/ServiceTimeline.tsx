"use client";

import { ClientService, ClientServiceSection, ClientServiceUnit } from "@/prisma/models";
import { Plus } from "lucide-react";
import { DrawerState } from "./hooks/usePlanEditor";
import { useServiceTimeline } from "./hooks/useServiceTimeline";
import ServiceSectionBlock from "./ServiceSectionBlock";

type ServiceTimelineProps = {
  service: ClientService;
  onAddSection: (section: Omit<ClientServiceSection, "order">) => void;
  onUpdateSection: (sectionIndex: number, changes: Partial<ClientServiceSection>) => void;
  onRemoveSection: (sectionIndex: number) => void;
  onUpdateUnit: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (sectionIndex: number, unitIndex: number) => void;
  onMoveUnit: (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => void;
  onOpenDrawer: (state: DrawerState) => void;
};

const DEFAULT_SECTION_TYPES = [
  { type: "LOUVOR" as const, label: "Louvor" },
  { type: "AVISOS" as const, label: "Avisos" },
  { type: "MENSAGEM" as const, label: "Mensagem" },
  { type: "ESPECIAL" as const, label: "Especial" },
  { type: "ENCERRAMENTO" as const, label: "Encerramento" },
  { type: "PRE_CULTO" as const, label: "Pré-culto" },
  { type: "ORACAO_COMUNITARIA" as const, label: "Oração Comunitária" },
] as const;

export default function ServiceTimeline({
  service,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onUpdateUnit,
  onRemoveUnit,
  onMoveUnit,
  onOpenDrawer,
}: ServiceTimelineProps) {
  const sections = service.sections ?? [];
  const timings = useServiceTimeline(service);

  return (
    <div className="py-4">
      {sections.length === 0 && (
        <div className="text-center py-12 text-zinc-400 text-sm">
          Nenhuma seção ainda.{" "}
          <button
            type="button"
            onClick={() =>
              onOpenDrawer({ type: "add-unit", sectionIndex: -1 })
            }
            className="underline hover:text-emerald-600"
          >
            Usar template
          </button>{" "}
          ou adicione uma seção abaixo.
        </div>
      )}

      {sections.map((section, sectionIndex) => (
        <ServiceSectionBlock
          key={section.id ?? `new-section-${sectionIndex}`}
          section={section}
          sectionIndex={sectionIndex}
          timing={timings[sectionIndex]}
          onUpdateSection={(changes) => onUpdateSection(sectionIndex, changes)}
          onRemoveSection={() => onRemoveSection(sectionIndex)}
          onUpdateUnit={(unitIndex, changes) =>
            onUpdateUnit(sectionIndex, unitIndex, changes)
          }
          onRemoveUnit={(unitIndex) => onRemoveUnit(sectionIndex, unitIndex)}
          onMoveUnit={onMoveUnit}
          onOpenDrawer={onOpenDrawer}
        />
      ))}

      {/* Add section */}
      <AddSectionMenu
        onAdd={(type, label) => onAddSection({ type, label, units: [] })}
      />
    </div>
  );
}

function AddSectionMenu({
  onAdd,
}: {
  onAdd: (type: ClientServiceSection["type"], label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 px-1">
      {DEFAULT_SECTION_TYPES.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAdd(type, label)}
          className="flex items-center gap-1 text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-md px-2.5 py-1 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
