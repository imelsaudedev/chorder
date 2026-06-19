"use client";

import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import FormFooter from "@/components/common/FormFooter";
import ServicePlanDrawer, { ServicePlanConfig } from "@/components/service/ServicePlanDrawer";
import { Button } from "@/components/ui/button";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { usePlanEditor } from "./hooks/usePlanEditor";
import ServiceItemDrawer from "./ServiceItemDrawer";
import ServicePlanHeader from "./ServicePlanHeader";
import ServiceTimeline from "./ServiceTimeline";

function isIncomplete(unit: ClientServiceUnit): boolean {
  if (unit.type === "SONG") return !unit.arrangement?.song;
  if (unit.type === "FALA" || unit.type === "ORACAO") return !(unit.metadata as { speaker?: string | null } | null)?.speaker;
  if (unit.type === "LEITURA") return !(unit.metadata as { version?: string | null } | null)?.version;
  if (unit.type === "SERMAO") return !(unit.metadata as { preacher?: string | null } | null)?.preacher;
  return false;
}

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

  async function handleSave() {
    const sections = editor.service.plan?.sections ?? [];
    const incomplete = sections.flatMap(s => s.units ?? []).filter(isIncomplete);
    if (incomplete.length > 0) {
      toast.warning(
        `${incomplete.length} ${incomplete.length === 1 ? "item precisa" : "itens precisam"} ser preenchido ou removido antes de salvar.`
      );
      return;
    }
    const saved = await editor.save();
    if (onSaved) onSaved(saved);
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
      />

      {/* Timeline (scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        <ServiceTimeline
          service={editor.service}
          onAddSection={editor.addSection}
          onUpdateSection={editor.updateSection}
          onRemoveSection={editor.removeSection}
          onMoveSection={editor.moveSection}
          onAddUnit={editor.addUnit}
          onUpdateUnit={editor.updateUnit}
          onRemoveUnit={editor.removeUnit}
          onMoveUnit={editor.moveUnit}
          onOpenDrawer={editor.setDrawer}
        />
      </div>

      <FormFooter
        disabled={!editor.isDirty || !(editor.service.plan?.sections?.length)}
        loading={editor.isSaving}
        label={t("saveService")}
        onSave={handleSave}
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

      {/* Item drawer */}
      <ServiceItemDrawer
        drawerState={editor.drawer}
        sections={editor.service.plan?.sections ?? []}
        onClose={() => editor.setDrawer({ type: "closed" })}
        onAddUnit={editor.addUnit}
        onUpdateUnit={editor.updateUnit}
        onLoadTemplate={editor.loadTemplate}
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
