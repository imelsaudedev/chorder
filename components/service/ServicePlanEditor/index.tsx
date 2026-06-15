"use client";

import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import ServicePlanDrawer, { ServicePlanConfig } from "@/components/service/ServicePlanDrawer";
import { Button } from "@/components/ui/button";
import { ClientService } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePlanEditor } from "./hooks/usePlanEditor";
import ServiceItemDrawer from "./ServiceItemDrawer";
import ServicePlanHeader from "./ServicePlanHeader";
import ServiceTimeline from "./ServiceTimeline";

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
          onUpdateUnit={editor.updateUnit}
          onRemoveUnit={editor.removeUnit}
          onMoveUnit={editor.moveUnit}
          onOpenDrawer={editor.setDrawer}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 px-4 sm:px-6 py-3 flex items-center justify-end gap-3 bg-white">
        {editor.isDirty ? (
          <ConfirmDiscardDialog onDiscard={() => router.push(viewUrl)}>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </ConfirmDiscardDialog>
        ) : (
          <Button type="button" variant="outline" onClick={() => router.push(viewUrl)}>
            {t("cancel")}
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSave}
          disabled={!editor.isDirty || editor.isSaving}
        >
          {editor.isSaving ? "Salvando..." : t("saveService")}
        </Button>
      </div>

      {/* Item drawer */}
      <ServiceItemDrawer
        drawerState={editor.drawer}
        sections={editor.service.sections ?? []}
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
