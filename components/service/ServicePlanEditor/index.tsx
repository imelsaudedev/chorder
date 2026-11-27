"use client";

import { ServiceSaveError } from "@/app/api/api-client";
import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import FormFooter from "@/components/common/FormFooter";
import ServicePlanDrawer, { ServicePlanConfig } from "@/components/service/ServicePlanDrawer";
import { Button } from "@/components/ui/button";
import { friendlySaveError } from "@/lib/friendly-save-error";
import { serviceProfile } from "@/lib/service-profile";
import { ClientService, ServiceStatus } from "@/prisma/models";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DrawerState, findUnitByClientId, usePlanEditor } from "./hooks/usePlanEditor";
import DraftRecoveryDialog from "./DraftRecoveryDialog";
import { usePlanDraft } from "./hooks/usePlanDraft";
import ServiceItemDrawer from "./ServiceItemDrawer";
import { ServiceProfileProvider } from "./ServiceProfileContext";
import ServiceItemPanel from "./ServiceItemPanel";
import SongFlow from "./SongFlow";
import { listPendingUnits } from "./unitSummary";
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
  const tService = useTranslations("Service");
  const router = useRouter();
  const viewUrl = service.slug ? `/services/${service.slug}` : "/services";

  const editor = usePlanEditor(service);
  const draft = usePlanDraft(service, editor.service, editor.isDirty);
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

  const pendingUnits = listPendingUnits(sections);
  // Rola até o primeiro item incompleto e abre o editor dele (menos Música, que
  // se resolve escolhendo a música no próprio item).
  function goToFirstPending() {
    const first = pendingUnits[0];
    if (!first) return;
    document
      .querySelector(`[data-unit-id="${first.clientId}"]`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (first.type !== "SONG") openDrawer({ type: "edit-unit", clientId: first.clientId });
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

  const profile = serviceProfile(editor.service.scope);
  const isPersonal = editor.service.scope === "PERSONAL";
  const isNewOrDraft = !isPersonal && (!editor.service.id || editor.service.status === "DRAFT");
  const canPublishDraft = !editor.service.id || editor.service.canPublish !== false;
  const hasSections = (editor.service.plan?.sections?.length ?? 0) > 0;

  async function handleSave(targetStatus?: ServiceStatus) {
    try {
      const saved = await editor.save(targetStatus ? { status: targetStatus } : undefined);
      draft.clear();
      if (targetStatus === "DRAFT") {
        toast.success(tService("draftSavedToast"));
      } else if (targetStatus === "PUBLISHED" && editor.service.status === "DRAFT") {
        toast.success(tService("draftPublishedToast"));
      } else if (profile.toastOnSave) {
        toast.success(tService("savedToast"));
      }
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
      const friendly =
        err instanceof ServiceSaveError && err.status === 400
          ? friendlySaveError(err.message, editor.service)
          : null;
      toast.error("Não foi possível salvar o culto.", {
        description: friendly ?? "Tente novamente em instantes.",
      });
    }
  }

  function handleMetaSave(config: ServicePlanConfig) {
    editor.updateServiceMeta({
      title: config.title,
      worshipLeader: config.worshipLeader,
      leaders: config.leaders,
      // quem já estava salvo mantém a foto; quem acabou de ser escolhido a ganha ao salvar
      leaderPeople: config.leaders.map((l) => ({
        userId: l.userId,
        name: l.name,
        image: editor.service.leaderPeople?.find((p) => p.userId && p.userId === l.userId)?.image ?? null,
      })),
      preacher: config.preacher,
      preacherId: config.preacherId,
      date: config.date,
    });
    if (config.templateSections) {
      editor.loadTemplate(config.templateSections);
    }
  }

  return (
    <ServiceProfileProvider value={profile}>
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
                key={`add-${editor.drawer.sectionIndex}-${editor.drawer.index ?? "fim"}`}
                tagIds={songTagIds}
                onTagIdsChange={setSongTagIds}
                onAdd={(unit) => {
                  if (editor.drawer.type === "add-song") {
                    editor.addUnit(editor.drawer.sectionIndex, unit, editor.drawer.index);
                  }
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
        disabled={
          !hasSections ||
          (isNewOrDraft && canPublishDraft
            ? !editor.service.id && !editor.isDirty
            : !editor.isDirty)
        }
        loading={editor.isSaving}
        label={
          isNewOrDraft
            ? canPublishDraft
              ? tService("publishService")
              : tService("saveDraft")
            : t("saveService")
        }
        onSave={() =>
          handleSave(
            isNewOrDraft
              ? canPublishDraft
                ? "PUBLISHED"
                : "DRAFT"
              : undefined
          )
        }
        secondaryAction={
          isNewOrDraft && canPublishDraft ? (
            <Button
              type="button"
              variant="outline"
              disabled={editor.isSaving || !hasSections || (!editor.isDirty && !!editor.service.id)}
              onClick={() => handleSave("DRAFT")}
            >
              {tService("saveDraft")}
            </Button>
          ) : undefined
        }
        status={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            {editor.isSaving ? (
              "Salvando…"
            ) : editor.isDirty ? (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2 rounded-full bg-secondary" />
                Não salvo · rascunho neste aparelho
              </span>
            ) : (
              "Tudo salvo"
            )}
            {pendingUnits.length > 0 && (
              <button
                type="button"
                onClick={goToFirstPending}
                className="cursor-pointer rounded-sm font-medium text-warning-text underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {pendingUnits.length} {pendingUnits.length === 1 ? "item pendente" : "itens pendentes"}
              </button>
            )}
          </span>
        }
        cancelButton={
          editor.isDirty ? (
            <ConfirmDiscardDialog
              onDiscard={() => {
                draft.clear();
                router.push(viewUrl);
              }}
            >
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

      <DraftRecoveryDialog
        draft={draft.pending}
        conflict={draft.conflict}
        onDiscard={draft.clear}
        onRestore={() => {
          if (draft.pending) {
            // Mantém identidade e updatedAt do servidor atual: assim, ao salvar,
            // o rascunho vira a versão vigente em vez de dar conflito.
            editor.restore({
              ...draft.pending.service,
              id: service.id,
              slug: service.slug,
              updatedAt: service.updatedAt,
            });
          }
          draft.dismiss();
        }}
      />

      {/* Meta drawer */}
      <ServicePlanDrawer
        open={metaDrawerOpen}
        onOpenChange={setMetaDrawerOpen}
        isNew={false}
        isPersonal={isPersonal}
        defaultValues={{
          title: editor.service.title ?? "",
          worshipLeader: editor.service.worshipLeader,
          leaders: editor.service.leaders,
          preacher: editor.service.preacher,
          preacherId: editor.service.preacherId,
          date: new Date(editor.service.date),
        }}
        onSave={handleMetaSave}
      />
    </div>
    </ServiceProfileProvider>
  );
}
