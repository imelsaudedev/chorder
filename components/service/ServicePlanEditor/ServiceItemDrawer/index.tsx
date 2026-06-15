"use client";

import { useFetchTemplates } from "@/app/api/api-client";
import SongPicker from "@/components/song/SongPicker";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ClientServiceSection, ClientServiceTemplate, ClientServiceUnit } from "@/prisma/models";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DrawerState } from "../hooks/usePlanEditor";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "../unitConfig";

type ServiceItemDrawerProps = {
  drawerState: DrawerState;
  sections: ClientServiceSection[];
  onClose: () => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onLoadTemplate: (sections: ClientServiceSection[], startTime?: string) => void;
};

type DrawerView =
  | { screen: "menu" }
  | { screen: "template" }
  | { screen: "song-picker"; sectionIndex: number }
  | { screen: "unit-form"; sectionIndex: number; unitType: ServiceUnitTypeValue };

export default function ServiceItemDrawer({
  drawerState,
  sections,
  onClose,
  onAddUnit,
  onUpdateUnit,
  onLoadTemplate,
}: ServiceItemDrawerProps) {
  const isOpen = drawerState.type !== "closed";
  const sectionIndex =
    drawerState.type === "add-unit" || drawerState.type === "edit-unit"
      ? drawerState.sectionIndex
      : 0;

  const [view, setView] = useState<DrawerView>({ screen: "menu" });

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose();
      setView({ screen: "menu" });
    }
  }

  function handleSelectType(type: ServiceUnitTypeValue) {
    if (type === "SONG") {
      setView({ screen: "song-picker", sectionIndex });
    } else {
      setView({ screen: "unit-form", sectionIndex, unitType: type });
    }
  }

  function handleSongSelected(song: import("@/prisma/models").ClientSong) {
    const si = view.screen === "song-picker" ? view.sectionIndex : sectionIndex;
    onAddUnit(si, {
      type: "SONG",
      arrangementId: null,
      semitoneTranspose: 0,
      sectionId: null,
      durationMin: 5,
      label: null,
      metadata: null,
      arrangement: {
        id: undefined,
        songId: song.id,
        originalArrangementId: null,
        key: song.arrangements?.[0]?.key ?? "C",
        name: null,
        isDefault: false,
        isDeleted: false,
        isServiceArrangement: true,
        youtubeUrl: null,
        audios: [],
        song,
        units: song.arrangements?.[0]?.units,
      },
    });
    onClose();
    setView({ screen: "menu" });
  }

  function handleSimpleUnitAdd(
    type: ServiceUnitTypeValue,
    label: string,
    durationMin: number | null
  ) {
    const si =
      view.screen === "unit-form" ? view.sectionIndex : sectionIndex;
    onAddUnit(si, {
      type,
      arrangementId: null,
      semitoneTranspose: null,
      sectionId: null,
      durationMin,
      label: label || null,
      metadata: null,
    });
    onClose();
    setView({ screen: "menu" });
  }

  const drawerTitle =
    view.screen === "template"
      ? "Usar template"
      : view.screen === "song-picker"
      ? "Adicionar música"
      : view.screen === "unit-form"
      ? `Adicionar ${UNIT_CONFIG[view.unitType]?.label ?? view.unitType}`
      : sections.length === 0
      ? "Montar liturgia"
      : "Adicionar item";

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85dvh]">
        <DrawerHeader className="flex items-center gap-2">
          {view.screen !== "menu" && (
            <button
              type="button"
              onClick={() => setView({ screen: "menu" })}
              className="text-zinc-400 hover:text-zinc-700"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <DrawerTitle>{drawerTitle}</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6">
          {view.screen === "menu" && (
            <MenuScreen
              isEmpty={sections.length === 0}
              sectionIndex={sectionIndex}
              onSelectType={handleSelectType}
              onShowTemplate={() => setView({ screen: "template" })}
            />
          )}
          {view.screen === "template" && (
            <TemplateScreen
              onLoad={(sections, startTime) => {
                onLoadTemplate(sections, startTime);
                onClose();
                setView({ screen: "menu" });
              }}
            />
          )}
          {view.screen === "song-picker" && (
            <SongPicker onSelected={handleSongSelected} />
          )}
          {view.screen === "unit-form" && (
            <SimpleUnitForm
              unitType={view.unitType}
              onAdd={handleSimpleUnitAdd}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- Menu screen ---

function MenuScreen({
  isEmpty,
  onSelectType,
  onShowTemplate,
}: {
  isEmpty: boolean;
  sectionIndex: number;
  onSelectType: (type: ServiceUnitTypeValue) => void;
  onShowTemplate: () => void;
}) {
  const types = Object.entries(UNIT_CONFIG) as [ServiceUnitTypeValue, (typeof UNIT_CONFIG)[ServiceUnitTypeValue]][];

  return (
    <div className="flex flex-col gap-3">
      {isEmpty && (
        <button
          type="button"
          onClick={onShowTemplate}
          className="w-full py-3 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
        >
          Usar template
        </button>
      )}
      <div className="grid grid-cols-2 gap-2">
        {types.map(([type, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectType(type)}
              className="flex items-center gap-2 px-3 py-3 rounded-lg border border-zinc-200 hover:border-emerald-300 hover:bg-zinc-50 transition-colors text-left"
            >
              <Icon className={`w-4 h-4 shrink-0 ${config.color}`} />
              <span className="text-sm">{config.label}</span>
            </button>
          );
        })}
      </div>
      {!isEmpty && (
        <button
          type="button"
          onClick={onShowTemplate}
          className="text-xs text-zinc-400 underline text-center mt-1"
        >
          Usar template (substitui a liturgia atual)
        </button>
      )}
    </div>
  );
}

// --- Template screen ---

type TemplateItems = {
  defaultStartTime?: string;
  sections: Omit<ClientServiceSection, "id" | "serviceId">[];
};

function TemplateScreen({
  onLoad,
}: {
  onLoad: (sections: ClientServiceSection[], startTime?: string) => void;
}) {
  const { templates, isLoading } = useFetchTemplates();
  const [startTime, setStartTime] = useState("10:15");

  if (isLoading) {
    return <p className="text-sm text-zinc-400 py-4 text-center">Carregando...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-600 shrink-0">Hora de início</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
        />
      </div>

      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          startTime={startTime}
          onSetStartTime={setStartTime}
          onLoad={onLoad}
        />
      ))}

      {templates.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-4">
          Nenhum template cadastrado.
        </p>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  startTime,
  onSetStartTime,
  onLoad,
}: {
  template: ClientServiceTemplate;
  startTime: string;
  onSetStartTime: (t: string) => void;
  onLoad: (sections: ClientServiceSection[], startTime?: string) => void;
}) {
  const items = template.items as TemplateItems | null;
  const sections = items?.sections ?? [];
  const defaultTime = items?.defaultStartTime;

  function handleLoad() {
    const mapped: ClientServiceSection[] = sections.map((s, i) => ({
      ...s,
      id: undefined,
      serviceId: undefined,
      order: i + 1,
      units: (s.units ?? []).map((u, j) => ({
        ...u,
        id: undefined,
        serviceId: undefined,
        arrangementId: null,
        semitoneTranspose: null,
        sectionId: null,
        order: j + 1,
      })),
    }));
    onLoad(mapped, startTime);
  }

  return (
    <div className="border border-zinc-200 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{template.name}</p>
          <p className="text-xs text-zinc-400">
            {sections.length} seções ·{" "}
            {sections.reduce((s, sec) => s + (sec.units?.length ?? 0), 0)} itens
          </p>
        </div>
        {defaultTime && (
          <button
            type="button"
            onClick={() => onSetStartTime(defaultTime)}
            className="text-xs text-zinc-400 underline"
          >
            {defaultTime}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleLoad}
        className="w-full py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        Usar este template
      </button>
    </div>
  );
}

// --- Simple unit form ---

function SimpleUnitForm({
  unitType,
  onAdd,
}: {
  unitType: ServiceUnitTypeValue;
  onAdd: (type: ServiceUnitTypeValue, label: string, durationMin: number | null) => void;
}) {
  const config = UNIT_CONFIG[unitType];
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState<string>("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={config?.label ?? unitType}
          autoFocus
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500">Duração (min)</label>
        <input
          type="number"
          min={0}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="—"
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
        />
      </div>
      <button
        type="button"
        onClick={() =>
          onAdd(unitType, label, duration ? parseInt(duration) : null)
        }
        className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        Adicionar
      </button>
    </div>
  );
}
