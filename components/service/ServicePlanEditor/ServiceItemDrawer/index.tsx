"use client";

import ArrangementPicker from "@/components/song/ArrangementPicker";
import SongPicker from "@/components/song/SongPicker";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ClientArrangement,
  ClientServiceSection,
  ClientServiceUnit,
  ClientSong,
} from "@/prisma/models";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
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
  | { screen: "song-picker"; sectionIndex: number; unitIndex?: number }
  | { screen: "arrangement-picker"; sectionIndex: number; unitIndex?: number; song: ClientSong }
  | { screen: "unit-form"; sectionIndex: number; unitType: ServiceUnitTypeValue }
  | { screen: "fala-form"; sectionIndex: number; unitIndex?: number; unitType: "FALA" | "ORACAO" }
  | { screen: "leitura-form"; sectionIndex: number; unitIndex?: number }
  | { screen: "sermao-form"; sectionIndex: number; unitIndex?: number };

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

  // Route edit-unit to the appropriate form
  useEffect(() => {
    if (drawerState.type === "edit-unit") {
      const unit = sections[drawerState.sectionIndex]?.units?.[drawerState.unitIndex];
      if (unit?.type === "SONG") {
        setView({ screen: "song-picker", sectionIndex: drawerState.sectionIndex, unitIndex: drawerState.unitIndex });
        return;
      }
      if (unit?.type === "FALA" || unit?.type === "ORACAO") {
        setView({ screen: "fala-form", sectionIndex: drawerState.sectionIndex, unitIndex: drawerState.unitIndex, unitType: unit.type });
        return;
      }
      if (unit?.type === "LEITURA") {
        setView({ screen: "leitura-form", sectionIndex: drawerState.sectionIndex, unitIndex: drawerState.unitIndex });
        return;
      }
      if (unit?.type === "SERMAO") {
        setView({ screen: "sermao-form", sectionIndex: drawerState.sectionIndex, unitIndex: drawerState.unitIndex });
        return;
      }
    }
    if (drawerState.type === "add-unit" && drawerState.unitType) {
      const { sectionIndex: si, unitType } = drawerState;
      if (unitType === "SONG") { setView({ screen: "song-picker", sectionIndex: si }); return; }
      if (unitType === "FALA" || unitType === "ORACAO") { setView({ screen: "fala-form", sectionIndex: si, unitType }); return; }
      if (unitType === "LEITURA") { setView({ screen: "leitura-form", sectionIndex: si }); return; }
      if (unitType === "SERMAO") { setView({ screen: "sermao-form", sectionIndex: si }); return; }
    }
    if (drawerState.type !== "closed") {
      setView({ screen: "menu" });
    }
  }, [drawerState]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose();
      setView({ screen: "menu" });
    }
  }

  function handleSelectType(type: ServiceUnitTypeValue) {
    if (type === "SONG") {
      setView({ screen: "song-picker", sectionIndex });
    } else if (type === "FALA" || type === "ORACAO") {
      setView({ screen: "fala-form", sectionIndex, unitType: type });
    } else if (type === "LEITURA") {
      setView({ screen: "leitura-form", sectionIndex });
    } else {
      setView({ screen: "unit-form", sectionIndex, unitType: type });
    }
  }

  // Commit a song unit (add or update), using a resolved source arrangement
  function commitSongUnit(
    si: number,
    ui: number | undefined,
    song: ClientSong,
    source: ClientArrangement | null
  ) {
    const arrangement = {
      id: undefined,
      songId: song.id,
      originalArrangementId: source?.id ?? null,
      key: source?.key ?? "C",
      name: source?.name ?? null,
      isDefault: false,
      isDeleted: false,
      isServiceArrangement: true,
      youtubeUrl: source?.youtubeUrl ?? null,
      audios: source?.audios ?? [],
      song,
      units: source?.units,
    };

    if (ui !== undefined) {
      onUpdateUnit(si, ui, { arrangementId: null, semitoneTranspose: 0, arrangement });
    } else {
      onAddUnit(si, {
        type: "SONG",
        arrangementId: null,
        semitoneTranspose: 0,

        durationMin: 5,
        label: null,
        metadata: null,
        arrangement,
      });
    }
    onClose();
    setView({ screen: "menu" });
  }

  function handleSongSelected(song: ClientSong) {
    const si = view.screen === "song-picker" ? view.sectionIndex : sectionIndex;
    const ui = view.screen === "song-picker" ? view.unitIndex : undefined;

    const arrangements = song.arrangements ?? [];

    // Multiple arrangements → let the user pick
    if (arrangements.length > 1) {
      setView({ screen: "arrangement-picker", sectionIndex: si, unitIndex: ui, song });
      return;
    }

    // Single or zero: prefer default, fall back to first
    const source =
      arrangements.find((a) => a.isDefault) ?? arrangements[0] ?? null;
    commitSongUnit(si, ui, song, source);
  }

  function handleArrangementSelected(arrangement: ClientArrangement) {
    if (view.screen !== "arrangement-picker") return;
    const song = arrangement.song ?? view.song;
    commitSongUnit(view.sectionIndex, view.unitIndex, song, arrangement);
  }

  function handleSimpleUnitAdd(
    type: ServiceUnitTypeValue,
    label: string,
    durationMin: number | null
  ) {
    const si = view.screen === "unit-form" ? view.sectionIndex : sectionIndex;
    onAddUnit(si, {
      type,
      arrangementId: null,
      semitoneTranspose: null,
      durationMin,
      label: label || null,
      metadata: null,
    });
    onClose();
    setView({ screen: "menu" });
  }

  function handleFalaDone() {
    onClose();
    setView({ screen: "menu" });
  }

  function handleLeituraDone() {
    onClose();
    setView({ screen: "menu" });
  }

  function handleSermaoDone() {
    onClose();
    setView({ screen: "menu" });
  }

  function handleBack() {
    // arrangement-picker → back to song-picker (not menu)
    if (view.screen === "arrangement-picker") {
      setView({
        screen: "song-picker",
        sectionIndex: view.sectionIndex,
        unitIndex: view.unitIndex,
      });
      return;
    }
    setView({ screen: "menu" });
  }

  const currentFalaUnit =
    view.screen === "fala-form" && view.unitIndex !== undefined
      ? sections[view.sectionIndex]?.units?.[view.unitIndex]
      : undefined;

  const currentLeituraUnit =
    view.screen === "leitura-form" && view.unitIndex !== undefined
      ? sections[view.sectionIndex]?.units?.[view.unitIndex]
      : undefined;

  const currentSermaoUnit =
    view.screen === "sermao-form" && view.unitIndex !== undefined
      ? sections[view.sectionIndex]?.units?.[view.unitIndex]
      : undefined;

  const isEditing =
    (view.screen === "song-picker" || view.screen === "arrangement-picker") &&
    view.unitIndex !== undefined;

  const isSongView =
    view.screen === "song-picker" || view.screen === "arrangement-picker";

  const drawerTitle =
    view.screen === "song-picker"
      ? isEditing ? "Trocar música" : "Adicionar música"
      : view.screen === "arrangement-picker"
      ? "Escolher arranjo"
      : view.screen === "leitura-form"
      ? view.unitIndex !== undefined ? "Editar leitura" : "Adicionar leitura"
      : view.screen === "sermao-form"
      ? view.unitIndex !== undefined ? "Editar sermão" : "Adicionar sermão"
      : view.screen === "fala-form"
      ? `${view.unitIndex !== undefined ? "Editar" : "Adicionar"} ${UNIT_CONFIG[view.unitType]?.label.toLowerCase()}`
      : view.screen === "unit-form"
      ? `Adicionar ${UNIT_CONFIG[view.unitType]?.label ?? view.unitType}`
      : sections.length === 0
      ? "Montar liturgia"
      : "Adicionar item";

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction={isSongView ? "bottom" : "right"}
    >
      <DrawerContent className={isSongView ? "max-h-[85dvh]" : "overflow-y-auto"}>
        <DrawerHeader className="flex items-center gap-2">
          {view.screen !== "menu" && (
            <button
              type="button"
              onClick={handleBack}
              className="text-zinc-400 hover:text-zinc-700"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <DrawerTitle>{drawerTitle}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6">
          {view.screen === "menu" && (
            <MenuScreen
              onSelectType={handleSelectType}
            />
          )}
          {view.screen === "song-picker" && (
            <SongPicker onSelected={handleSongSelected} />
          )}
          {view.screen === "arrangement-picker" && (
            <ArrangementPickerScreen
              song={view.song}
              isEditing={isEditing}
              onConfirm={handleArrangementSelected}
            />
          )}
          {view.screen === "unit-form" && (
            <SimpleUnitForm
              unitType={view.unitType}
              onAdd={handleSimpleUnitAdd}
            />
          )}
          {view.screen === "leitura-form" && (
            <LeituraUnitForm
              sectionIndex={view.sectionIndex}
              unitIndex={view.unitIndex}
              existingUnit={currentLeituraUnit}
              onAdd={onAddUnit}
              onUpdate={onUpdateUnit}
              onDone={handleLeituraDone}
            />
          )}
          {view.screen === "fala-form" && (
            <FalaUnitForm
              sectionIndex={view.sectionIndex}
              unitIndex={view.unitIndex}
              unitType={view.unitType}
              existingUnit={currentFalaUnit}
              onAdd={onAddUnit}
              onUpdate={onUpdateUnit}
              onDone={handleFalaDone}
            />
          )}
          {view.screen === "sermao-form" && (
            <SermaoUnitForm
              sectionIndex={view.sectionIndex}
              unitIndex={view.unitIndex}
              existingUnit={currentSermaoUnit}
              onAdd={onAddUnit}
              onUpdate={onUpdateUnit}
              onDone={handleSermaoDone}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- Menu screen ---

function MenuScreen({
  onSelectType,
}: {
  onSelectType: (type: ServiceUnitTypeValue) => void;
}) {
  const types = Object.entries(UNIT_CONFIG) as [ServiceUnitTypeValue, (typeof UNIT_CONFIG)[ServiceUnitTypeValue]][];

  return (
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
  );
}

// --- Arrangement picker screen ---

function ArrangementPickerScreen({
  song,
  isEditing,
  onConfirm,
}: {
  song: ClientSong;
  isEditing: boolean;
  onConfirm: (arrangement: ClientArrangement) => void;
}) {
  const [selected, setSelected] = useState<ClientArrangement | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <ArrangementPicker songSlug={song.slug} onSelected={setSelected} />
      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        className="w-full py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40"
      >
        {isEditing ? "Trocar para este arranjo" : "Usar este arranjo"}
      </button>
    </div>
  );
}

// --- Fala unit form ---

function FalaUnitForm({
  sectionIndex,
  unitIndex,
  unitType,
  existingUnit,
  onAdd,
  onUpdate,
  onDone,
}: {
  sectionIndex: number;
  unitIndex?: number;
  unitType: "FALA" | "ORACAO";
  existingUnit?: ClientServiceUnit;
  onAdd: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdate: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onDone: () => void;
}) {
  const existingMeta = existingUnit?.metadata as {
    speaker?: string | null;
    description?: string | null;
  } | null;

  const [label, setLabel] = useState(existingUnit?.label ?? "");
  const [speaker, setSpeaker] = useState(existingMeta?.speaker ?? "");
  const [description, setDescription] = useState(existingMeta?.description ?? "");
  const [duration, setDuration] = useState(
    existingUnit?.durationMin != null ? String(existingUnit.durationMin) : ""
  );

  function handleSave() {
    const durationMin = duration ? parseFloat(duration) : null;
    const metadata = {
      speaker: speaker.trim() || null,
      description: description.trim() || null,
    };

    if (unitIndex !== undefined) {
      onUpdate(sectionIndex, unitIndex, {
        label: label.trim() || null,
        metadata,
        durationMin,
      });
    } else {
      onAdd(sectionIndex, {
        type: unitType,
        arrangementId: null,
        semitoneTranspose: null,

        label: label.trim() || null,
        metadata,
        durationMin,
      });
    }
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Título</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Boas-vindas, Apresentação dos visitantes..."
          autoFocus
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Quem faz</label>
        <input
          type="text"
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="Ex: Dirigente, Pastor João..."
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Roteiro, orientações ou observações para este momento..."
          rows={4}
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="—"
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        {unitIndex !== undefined ? "Salvar" : "Adicionar"}
      </button>
    </div>
  );
}

// --- Leitura unit form ---

function LeituraUnitForm({
  sectionIndex,
  unitIndex,
  existingUnit,
  onAdd,
  onUpdate,
  onDone,
}: {
  sectionIndex: number;
  unitIndex?: number;
  existingUnit?: ClientServiceUnit;
  onAdd: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdate: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onDone: () => void;
}) {
  const existingMeta = existingUnit?.metadata as {
    version?: string | null;
    text?: string | null;
  } | null;

  const [label, setLabel] = useState(existingUnit?.label ?? "");
  const [version, setVersion] = useState(existingMeta?.version ?? "");
  const [text, setText] = useState(existingMeta?.text ?? "");
  const [duration, setDuration] = useState(
    existingUnit?.durationMin != null ? String(existingUnit.durationMin) : ""
  );

  function handleSave() {
    const durationMin = duration ? parseFloat(duration) : null;
    const metadata = {
      version: version.trim() || null,
      text: text.trim() || null,
    };

    if (unitIndex !== undefined) {
      onUpdate(sectionIndex, unitIndex, {
        label: label.trim() || null,
        metadata,
        durationMin,
      });
    } else {
      onAdd(sectionIndex, {
        type: "LEITURA",
        arrangementId: null,
        semitoneTranspose: null,

        label: label.trim() || null,
        metadata,
        durationMin,
      });
    }
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Referência</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: João 3:16, Salmo 23..."
          autoFocus
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Versão</label>
        <input
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="Ex: NVI, ARA, NTLH..."
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Texto</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole o texto da passagem aqui..."
          rows={6}
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="—"
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        {unitIndex !== undefined ? "Salvar" : "Adicionar"}
      </button>
    </div>
  );
}

// --- Sermao unit form ---

function SermaoUnitForm({
  sectionIndex,
  unitIndex,
  existingUnit,
  onAdd,
  onUpdate,
  onDone,
}: {
  sectionIndex: number;
  unitIndex?: number;
  existingUnit?: ClientServiceUnit;
  onAdd: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdate: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onDone: () => void;
}) {
  const existingMeta = existingUnit?.metadata as {
    preacher?: string | null;
    reference?: string | null;
    description?: string | null;
  } | null;

  const [label, setLabel] = useState(existingUnit?.label ?? "");
  const [preacher, setPreacher] = useState(existingMeta?.preacher ?? "");
  const [reference, setReference] = useState(existingMeta?.reference ?? "");
  const [description, setDescription] = useState(existingMeta?.description ?? "");
  const [duration, setDuration] = useState(
    existingUnit?.durationMin != null ? String(existingUnit.durationMin) : ""
  );

  function handleSave() {
    const durationMin = duration ? parseFloat(duration) : null;
    const metadata = {
      preacher: preacher.trim() || null,
      reference: reference.trim() || null,
      description: description.trim() || null,
    };

    if (unitIndex !== undefined) {
      onUpdate(sectionIndex, unitIndex, { label: label.trim() || null, metadata, durationMin });
    } else {
      onAdd(sectionIndex, {
        type: "SERMAO",
        arrangementId: null,
        semitoneTranspose: null,
        label: label.trim() || null,
        metadata,
        durationMin,
      });
    }
    onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Tema</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: A graça que transforma..."
          autoFocus
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Pregador</label>
        <input
          type="text"
          value={preacher}
          onChange={(e) => setPreacher(e.target.value)}
          placeholder="Ex: Pastor João..."
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Referência bíblica</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ex: João 3:16, Rm 8:28..."
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Notas</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Observações ou roteiro..."
          rows={4}
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="—"
          className="border border-zinc-300 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400 w-24"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        {unitIndex !== undefined ? "Salvar" : "Adicionar"}
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
        <label className="text-xs font-medium text-zinc-500">Label</label>
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
        <label className="text-xs font-medium text-zinc-500">Duração (min)</label>
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
