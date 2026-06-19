"use client";

import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import FormFooter from "@/components/common/FormFooter";
import ServiceItemDrawer from "@/components/service/ServicePlanEditor/ServiceItemDrawer";
import ServiceTimeline from "@/components/service/ServicePlanEditor/ServiceTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientService, ClientServiceSection } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTemplateEditor } from "./useTemplateEditor";

type TemplateEditorProps = {
  id?: number;
  name: string;
  defaultStartTime: string;
  sections: ClientServiceSection[];
};

export default function TemplateEditor({ id, name, defaultStartTime, sections }: TemplateEditorProps) {
  const router = useRouter();
  const editor = useTemplateEditor({ id, name, defaultStartTime, sections });

  const fakeService = useMemo((): ClientService => {
    const date = new Date();
    if (editor.defaultStartTime) {
      const [h, m] = editor.defaultStartTime.split(":").map(Number);
      date.setHours(h || 0, m || 0, 0, 0);
    }
    return {
      slug: "template-editor",
      title: editor.name,
      date,
      worshipLeader: null,
      preacher: null,
      isArchived: false,
      isDeleted: false,
      plan: {
        startTime: editor.defaultStartTime || null,
        sections: editor.sections,
      },
    } as ClientService;
  }, [editor.name, editor.defaultStartTime, editor.sections]);

  async function handleSave() {
    const result = await editor.save() as unknown as { id?: number } | undefined;
    if (!id && result?.id) {
      router.replace(`/admin/templates/${result.id}`);
    }
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-white">
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <Label htmlFor="template-name" className="text-xs text-zinc-500 mb-1 block">
              Nome do template
            </Label>
            <Input
              id="template-name"
              value={editor.name}
              onChange={(e) => editor.setName(e.target.value)}
              placeholder="Ex: Culto Dominical"
              className="text-base font-medium"
            />
          </div>
          <div className="shrink-0">
            <Label htmlFor="template-start-time" className="text-xs text-zinc-500 mb-1 block">
              Horário padrão
            </Label>
            <Input
              id="template-start-time"
              type="time"
              value={editor.defaultStartTime}
              onChange={(e) => editor.setDefaultStartTime(e.target.value)}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
        <ServiceTimeline
          service={fakeService}
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
        disabled={!editor.isDirty || !editor.name.trim()}
        loading={editor.isSaving}
        label={id ? "Salvar template" : "Criar template"}
        onSave={handleSave}
        cancelButton={
          editor.isDirty ? (
            <ConfirmDiscardDialog onDiscard={() => router.push("/admin/templates")}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </ConfirmDiscardDialog>
          ) : (
            <Button type="button" variant="outline" onClick={() => router.push("/admin/templates")}>
              Cancelar
            </Button>
          )
        }
      />

      <ServiceItemDrawer
        drawerState={editor.drawer}
        sections={editor.sections}
        onClose={() => editor.setDrawer({ type: "closed" })}
        onAddUnit={editor.addUnit}
        onUpdateUnit={editor.updateUnit}
        onLoadTemplate={() => {}}
      />
    </div>
  );
}
