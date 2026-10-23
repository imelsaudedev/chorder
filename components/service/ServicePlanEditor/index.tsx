"use client";

import { ServiceSaveError } from "@/app/api/api-client";
import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import FormFooter from "@/components/common/FormFooter";
import ServicePlanDrawer, { ServicePlanConfig } from "@/components/service/ServicePlanDrawer";
import { Button } from "@/components/ui/button";
import { ClientService } from "@/prisma/models";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DrawerState, findUnitByClientId, usePlanEditor } from "./hooks/usePlanEditor";
import ServiceItemDrawer from "./ServiceItemDrawer";
import ServiceItemPanel from "./ServiceItemPanel";
import SongFlow from "./SongFlow";
import { UnitFormHandle } from "./ServiceItemForms";
import ServicePlanHeader from "./ServicePlanHeader";
import ServiceTimeline from "./ServiceTimeline";

// Rolagem mínima restante (px) para o cabeçalho poder encolher sem oscilar.
const COMPACT_HEADER_MIN_OVERFLOW = 110;

type ServicePlanEditorProps = {
  service: ClientService;
  onSaved?: (service: ClientService) => void;
};

export default function ServicePlanEditor({ service, onSaved }: ServicePlanEditorProps) {
  const t = useTranslations("Messages");
  const router = useRouter();
  const viewUrl = `/services/${service.slug}`;

  const editor = usePlanEditor(service);
  const [metaDrawerOpen, setMetaDrawerOpen] = useState(false);
  // Filtros por tag do seletor de músicas: duram enquanto o editor está aberto,
  // para adicionar várias músicas seguidas do mesmo tipo sem refazer o filtro.
  const [songTagIds, setSongTagIds] = useState<number[]>([]);

  // Painel de edição sempre visível só faz sentido com espaço de sobra pra
  // duas colunas — mais largo que o limite que ResponsiveModal usa (640px)
  // pra decidir "isso é celular ou não".
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const sections = editor.service.plan?.sections ?? [];
  const editingUnit =
    editor.drawer.type === "edit-unit" ? findUnitByClientId(sections, editor.drawer.clientId) : null;

  // No desktop, tanto os formulários quanto o fluxo de música abrem no painel
  // ao lado da timeline; no celular tudo continua no drawer.
  const isAddingSong = editor.drawer.type === "add-song";
  const showDockedPanel = isDesktop && (!!editingUnit || isAddingSong);
  const isNewUnit = editor.drawer.type === "edit-unit" && !!editor.drawer.isNew;

  // Diferente do drawer (modal, cobre a tela — só existe um jeito real de
  // "sair" dele), o painel fixo deixa a timeline clicável o tempo todo, então
  // dá pra trocar de item sem passar por um fechamento explícito. Antes de
  // abrir qualquer coisa diferente do que já está aberto no painel, checa se
  // o item atual é novo e ainda está em branco — se for, descarta.
  // O cabeçalho encolhe quando a lista é rolada. Histerese (encolhe depois de 40px,
  // só volta perto do topo) evita pisca-pisca no limite, e só encolhe se ainda
  // sobrar rolagem depois de a lista ganhar a altura que o cabeçalho libera.
  const [compactHeader, setCompactHeader] = useState(false);
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const top = el.scrollTop;
    const overflow = el.scrollHeight - el.clientHeight;
    setCompactHeader((compact) =>
      compact ? top > 8 : top > 40 && overflow > COMPACT_HEADER_MIN_OVERFLOW
    );
  }

  const panelRef = useRef<UnitFormHandle>(null);
  function openDrawer(next: DrawerState) {
    const currentClientId = editor.drawer.type === "edit-unit" ? editor.drawer.clientId : null;
    const nextClientId = next.type === "edit-unit" ? next.clientId : null;
    if (currentClientId && currentClientId !== nextClientId) {
      panelRef.current?.discardIfBlank();
    }
    editor.setDrawer(next);
  }

  async function handleSave() {
    try {
      const saved = await editor.save();
      if (onSaved) onSaved(saved);
    } catch (err) {
      if (err instanceof ServiceSaveError && err.status === 409) {
        toast.error("Este culto foi atualizado por outra pessoa enquanto você editava.", {
          action: {
            label: "Recarregar",
            onClick: () => window.location.reload(),
          },
        });
        return;
      }
      toast.error("Não foi possível salvar o culto. Tente novamente.");
    }
  }

  function handleMetaSave(config: ServicePlanConfig) {
    editor.updateServiceMeta({
      title: config.title,
      worshipLeader: config.worshipLeader,
      preacher: config.preacher,
      date: config.date,
    });
    if (config.templateSections) {
      editor.loadTemplate(config.templateSections);
    }
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Header — read-only, click to edit */}
      <ServicePlanHeader
        service={editor.service}
        onEdit={() => setMetaDrawerOpen(true)}
        compact={compactHeader}
      />

      {/* Timeline (rola) + painel de edição ao lado, quando visível. O painel fica
          fora da área que rola: a altura dele é a da própria faixa entre o
          cabeçalho e o rodapé, então nunca passa por baixo do rodapé. */}
      <div className="flex min-h-0 flex-1">
        <div
          className="min-w-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8"
          onScroll={handleScroll}
        >
          <ServiceTimeline
            service={editor.service}
            activeClientId={editingUnit?.unit.clientId}
            onAddSection={editor.addSection}
            onUpdateSection={editor.updateSection}
            onRemoveSection={editor.removeSection}
            onMoveSection={editor.moveSection}
            onAddUnit={editor.addUnit}
            onUpdateUnit={editor.updateUnit}
            onRemoveUnit={editor.removeUnit}
            onMoveUnit={editor.moveUnit}
            onOpenDrawer={openDrawer}
          />
        </div>

        {showDockedPanel && (
          <aside className="flex shrink-0 py-4 pr-4 sm:pr-6 lg:pr-8">
            {editor.drawer.type === "add-song" && (
              <SongFlow
                key={`add-${editor.drawer.sectionIndex}`}
                tagIds={songTagIds}
                onTagIdsChange={setSongTagIds}
                onAdd={(unit) => {
                  if (editor.drawer.type === "add-song") editor.addUnit(editor.drawer.sectionIndex, unit);
                }}
                onUpdate={() => {}}
                onClose={() => openDrawer({ type: "closed" })}
              />
            )}

            {editingUnit && editingUnit.unit.type === "SONG" && (
              <SongFlow
                key={editingUnit.unit.clientId}
                tagIds={songTagIds}
                onTagIdsChange={setSongTagIds}
                unit={editingUnit.unit}
                onAdd={() => {}}
                onUpdate={(changes) => editor.updateUnit(editingUnit.sectionIndex, editingUnit.unitIndex, changes)}
                onClose={() => openDrawer({ type: "closed" })}
              />
            )}

            {editingUnit && editingUnit.unit.type !== "SONG" && (
              <ServiceItemPanel
                ref={panelRef}
                key={editingUnit.unit.clientId}
                unit={editingUnit.unit}
                isNew={isNewUnit}
                onUpdate={(changes) => editor.updateUnit(editingUnit.sectionIndex, editingUnit.unitIndex, changes)}
                onDiscard={() => editor.removeUnit(editingUnit.sectionIndex, editingUnit.unitIndex)}
                onClose={() => openDrawer({ type: "closed" })}
              />
            )}
          </aside>
        )}
      </div>

      <FormFooter
        disabled={!editor.isDirty || !(editor.service.plan?.sections?.length)}
        loading={editor.isSaving}
        label={t("saveService")}
        onSave={handleSave}
        status={
          editor.isSaving ? (
            "Salvando…"
          ) : editor.isDirty ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-secondary" />
              Não salvo
            </span>
          ) : (
            "Tudo salvo"
          )
        }
        cancelButton={
          editor.isDirty ? (
            <ConfirmDiscardDialog onDiscard={() => router.push(viewUrl)}>
              <Button type="button" variant="outline">{t("cancel")}</Button>
            </ConfirmDiscardDialog>
          ) : (
            <Button type="button" variant="outline" onClick={() => router.push(viewUrl)}>
              {t("cancel")}
            </Button>
          )
        }
      />

      {/* Item drawer — usado sempre no mobile; no desktop, só pra Música e
          pra "adicionar seção" (o painel cobre os outros tipos) */}
      <ServiceItemDrawer
        drawerState={showDockedPanel ? { type: "closed" } : editor.drawer}
        songTagIds={songTagIds}
        onSongTagIdsChange={setSongTagIds}
        sections={sections}
        onClose={() => openDrawer({ type: "closed" })}
        onAddUnit={editor.addUnit}
        onUpdateUnit={editor.updateUnit}
        onRemoveUnit={editor.removeUnit}
      />

      {/* Meta drawer */}
      <ServicePlanDrawer
        open={metaDrawerOpen}
        onOpenChange={setMetaDrawerOpen}
        isNew={false}
        defaultValues={{
          title: editor.service.title ?? "",
          worshipLeader: editor.service.worshipLeader,
          preacher: editor.service.preacher,
          date: new Date(editor.service.date),
        }}
        onSave={handleMetaSave}
      />
    </div>
  );
}
