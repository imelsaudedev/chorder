"use client";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ClientServiceSection, ClientServiceUnit } from "@/prisma/models";
import { useRef } from "react";
import { DrawerState, findUnitByClientId } from "../hooks/usePlanEditor";
import ServiceItemPanel from "../ServiceItemPanel";
import { UnitFormHandle } from "../ServiceItemForms";
import SongFlow from "../SongFlow";

type ServiceItemDrawerProps = {
  drawerState: DrawerState;
  sections: ClientServiceSection[];
  onClose: () => void;
  onAddUnit: (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => void;
  onUpdateUnit: (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => void;
  onRemoveUnit: (sectionIndex: number, unitIndex: number) => void;
  /** Filtros por tag do seletor de músicas (opcional; sem isso valem só enquanto o seletor estiver aberto). */
  songTagIds?: number[];
  onSongTagIdsChange?: (tagIds: number[]) => void;
};

// Editor de item em drawer: usado no celular e no editor de template. No
// desktop do editor de culto o mesmo conteúdo aparece no painel lateral
// (ver ServicePlanEditor). Música abre em tela cheia; os outros tipos, num
// drawer à direita.
export default function ServiceItemDrawer({
  drawerState,
  sections,
  onClose,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  songTagIds,
  onSongTagIdsChange,
}: ServiceItemDrawerProps) {
  const formRef = useRef<UnitFormHandle>(null);

  const found =
    drawerState.type === "edit-unit" ? findUnitByClientId(sections, drawerState.clientId) : null;
  const isAddSong = drawerState.type === "add-song";
  const isSong = isAddSong || found?.unit.type === "SONG";
  const isOpen = isAddSong || !!found;
  const isNew = drawerState.type === "edit-unit" && !!drawerState.isNew;

  function handleOpenChange(open: boolean) {
    if (open) return;
    // Fechar de verdade (X, escape, clicar fora, arrastar pra baixo) é o
    // único ponto real de "desistir" no drawer — a timeline fica coberta
    // enquanto ele está aberto, então não tem como trocar de item sem
    // passar por aqui primeiro.
    formRef.current?.discardIfBlank();
    onClose();
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleOpenChange}
      direction={isSong ? "bottom" : "right"}
    >
      <DrawerContent
        className={
          isSong
            ? "data-[vaul-drawer-direction=bottom]:h-dvh data-[vaul-drawer-direction=bottom]:max-h-dvh data-[vaul-drawer-direction=bottom]:rounded-none"
            : "flex flex-col"
        }
      >
        {isAddSong && drawerState.type === "add-song" && (
          <SongFlow
            key={`add-${drawerState.sectionIndex}`}
            variant="drawer"
            tagIds={songTagIds}
            onTagIdsChange={onSongTagIdsChange}
            onAdd={(unit) => onAddUnit(drawerState.sectionIndex, unit)}
            onUpdate={() => {}}
            onClose={onClose}
          />
        )}
        {found && found.unit.type === "SONG" && (
          <SongFlow
            key={found.unit.clientId}
            variant="drawer"
            tagIds={songTagIds}
            onTagIdsChange={onSongTagIdsChange}
            unit={found.unit}
            onAdd={() => {}}
            onUpdate={(changes) => onUpdateUnit(found.sectionIndex, found.unitIndex, changes)}
            onClose={onClose}
          />
        )}
        {found && found.unit.type !== "SONG" && (
          <ServiceItemPanel
            ref={formRef}
            key={found.unit.clientId}
            variant="drawer"
            unit={found.unit}
            isNew={isNew}
            onUpdate={(changes) => onUpdateUnit(found.sectionIndex, found.unitIndex, changes)}
            onDiscard={() => onRemoveUnit(found.sectionIndex, found.unitIndex)}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
