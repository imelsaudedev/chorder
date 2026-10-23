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
import { useEffect, useRef, useState } from "react";
import { DrawerState, findUnitByClientId } from "../hooks/usePlanEditor";
import { UNIT_CONFIG } from "../unitConfig";
import {
  AvisosUnitForm,
  FalaUnitForm,
  LeituraUnitForm,
  SermaoUnitForm,
  UnitFormHandle,
} from "../ServiceItemForms";

type ServiceItemDrawerProps = {
  drawerState: DrawerState;
  sections: ClientServiceSection[];
  onClose: () => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (sectionIndex: number, unitIndex: number) => void;
};

type DrawerView =
  | { screen: "closed" }
  | { screen: "song-picker"; sectionIndex: number; unitIndex?: number }
  | { screen: "arrangement-picker"; sectionIndex: number; unitIndex?: number; song: ClientSong }
  | { screen: "fala-form"; sectionIndex: number; unitIndex: number; unitType: "FALA" | "ORACAO" }
  | { screen: "leitura-form"; sectionIndex: number; unitIndex: number }
  | { screen: "sermao-form"; sectionIndex: number; unitIndex: number }
  | { screen: "avisos-form"; sectionIndex: number; unitIndex: number };

export default function ServiceItemDrawer({
  drawerState,
  sections,
  onClose,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
}: ServiceItemDrawerProps) {
  const isOpen = drawerState.type !== "closed";
  const isNew = drawerState.type === "edit-unit" && !!drawerState.isNew;

  const [view, setView] = useState<DrawerView>({ screen: "closed" });
  const formRef = useRef<UnitFormHandle>(null);

  // Roteia pro formulário certo com base no que o drawerState pede
  useEffect(() => {
    if (drawerState.type === "add-song") {
      setView({ screen: "song-picker", sectionIndex: drawerState.sectionIndex });
      return;
    }
    if (drawerState.type === "edit-unit") {
      const found = findUnitByClientId(sections, drawerState.clientId);
      if (!found) {
        setView({ screen: "closed" });
        return;
      }
      const { sectionIndex, unitIndex, unit } = found;
      if (unit.type === "SONG") {
        setView({ screen: "song-picker", sectionIndex, unitIndex });
        return;
      }
      if (unit.type === "FALA" || unit.type === "ORACAO") {
        setView({ screen: "fala-form", sectionIndex, unitIndex, unitType: unit.type });
        return;
      }
      if (unit.type === "LEITURA") {
        setView({ screen: "leitura-form", sectionIndex, unitIndex });
        return;
      }
      if (unit.type === "SERMAO") {
        setView({ screen: "sermao-form", sectionIndex, unitIndex });
        return;
      }
      if (unit.type === "AVISOS") {
        setView({ screen: "avisos-form", sectionIndex, unitIndex });
        return;
      }
    }
    setView({ screen: "closed" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerState]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      // Fechar de verdade (X, escape, clicar fora, arrastar pra baixo) é o
      // único ponto real de "desistir" no drawer — a timeline fica coberta
      // enquanto ele está aberto, então não tem como trocar de item sem
      // passar por aqui primeiro.
      formRef.current?.discardIfBlank();
      onClose();
      setView({ screen: "closed" });
    }
  }

  function handleDone() {
    onClose();
    setView({ screen: "closed" });
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
        clientId: crypto.randomUUID(),
        type: "SONG",
        arrangementId: null,
        semitoneTranspose: 0,
        durationMin: 5,
        label: null,
        metadata: null,
        arrangement,
      });
    }
    handleDone();
  }

  function handleSongSelected(song: ClientSong) {
    if (view.screen !== "song-picker") return;
    const { sectionIndex: si, unitIndex: ui } = view;

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

  function handleBack() {
    // arrangement-picker → back to song-picker (not fecha)
    if (view.screen === "arrangement-picker") {
      setView({
        screen: "song-picker",
        sectionIndex: view.sectionIndex,
        unitIndex: view.unitIndex,
      });
      return;
    }
  }

  const currentUnit =
    (view.screen === "fala-form" ||
      view.screen === "leitura-form" ||
      view.screen === "sermao-form" ||
      view.screen === "avisos-form")
      ? sections[view.sectionIndex]?.units?.[view.unitIndex]
      : undefined;

  const isEditingSong =
    (view.screen === "song-picker" || view.screen === "arrangement-picker") &&
    view.unitIndex !== undefined;

  const isSongView =
    view.screen === "song-picker" || view.screen === "arrangement-picker";

  const showBack = view.screen === "arrangement-picker";

  const drawerTitle =
    view.screen === "song-picker"
      ? isEditingSong ? "Trocar música" : "Adicionar música"
      : view.screen === "arrangement-picker"
      ? "Escolher arranjo"
      : view.screen === "leitura-form"
      ? "Leitura"
      : view.screen === "sermao-form"
      ? "Sermão"
      : view.screen === "avisos-form"
      ? "Avisos"
      : view.screen === "fala-form"
      ? UNIT_CONFIG[view.unitType]?.label
      : "";

  function handleDiscard() {
    if (
      view.screen === "fala-form" ||
      view.screen === "leitura-form" ||
      view.screen === "sermao-form" ||
      view.screen === "avisos-form"
    ) {
      onRemoveUnit(view.sectionIndex, view.unitIndex);
    }
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction={isSongView ? "bottom" : "right"}
    >
      <DrawerContent className={isSongView ? "max-h-[85dvh]" : "overflow-y-auto"}>
        <DrawerHeader className="flex items-center gap-2">
          {showBack && (
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
          {view.screen === "song-picker" && (
            <SongPicker onSelected={handleSongSelected} />
          )}
          {view.screen === "arrangement-picker" && (
            <ArrangementPickerScreen
              song={view.song}
              isEditing={isEditingSong}
              onConfirm={handleArrangementSelected}
            />
          )}
          {view.screen === "leitura-form" && currentUnit && (
            <LeituraUnitForm
              ref={formRef}
              unit={currentUnit}
              isNew={isNew}
              onUpdate={(changes) => onUpdateUnit(view.sectionIndex, view.unitIndex, changes)}
              onDiscard={handleDiscard}
              onDone={handleDone}
            />
          )}
          {view.screen === "fala-form" && currentUnit && (
            <FalaUnitForm
              ref={formRef}
              unit={currentUnit}
              unitType={view.unitType}
              isNew={isNew}
              onUpdate={(changes) => onUpdateUnit(view.sectionIndex, view.unitIndex, changes)}
              onDiscard={handleDiscard}
              onDone={handleDone}
            />
          )}
          {view.screen === "sermao-form" && currentUnit && (
            <SermaoUnitForm
              ref={formRef}
              unit={currentUnit}
              isNew={isNew}
              onUpdate={(changes) => onUpdateUnit(view.sectionIndex, view.unitIndex, changes)}
              onDiscard={handleDiscard}
              onDone={handleDone}
            />
          )}
          {view.screen === "avisos-form" && currentUnit && (
            <AvisosUnitForm
              ref={formRef}
              unit={currentUnit}
              isNew={isNew}
              onUpdate={(changes) => onUpdateUnit(view.sectionIndex, view.unitIndex, changes)}
              onDiscard={handleDiscard}
              onDone={handleDone}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
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
