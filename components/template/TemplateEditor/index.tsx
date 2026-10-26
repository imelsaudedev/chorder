"use client";

import ConfirmDiscardDialog from "@/components/common/ConfirmDiscardDialog";
import FormFooter from "@/components/common/FormFooter";
import {
  DrawerState,
  findUnitByClientId,
} from "@/components/service/ServicePlanEditor/hooks/usePlanEditor";
import { PlanModeProvider } from "@/components/service/ServicePlanEditor/planMode";
import ServiceItemDrawer from "@/components/service/ServicePlanEditor/ServiceItemDrawer";
import { UnitFormHandle } from "@/components/service/ServicePlanEditor/ServiceItemForms";
import ServiceItemPanel from "@/components/service/ServicePlanEditor/ServiceItemPanel";
import ServiceTimeline from "@/components/service/ServicePlanEditor/ServiceTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ClientService, ClientServiceSection } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
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

  // Mesmo critério do editor de culto: no desktop os formulários abrem num painel ao
  // lado da timeline; no celular, no drawer.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const editingUnit =
    editor.drawer.type === "edit-unit"
      ? findUnitByClientId(editor.sections, editor.drawer.clientId)
      : null;
  const showDockedPanel = isDesktop && !!editingUnit;
  const isNewUnit = editor.drawer.type === "edit-unit" && !!editor.drawer.isNew;

  // Com o painel fixo a timeline continua clicável, então trocar de item não passa por um
  // fechamento explícito: antes de abrir outro, descarta o item novo que ficou em branco.
  const panelRef = useRef<UnitFormHandle>(null);
  function openDrawer(next: DrawerState) {
    const currentClientId = editor.drawer.type === "edit-unit" ? editor.drawer.clientId : null;
    const nextClientId = next.type === "edit-unit" ? next.clientId : null;
    if (currentClientId && currentClientId !== nextClientId) {
      panelRef.current?.discardIfBlank();
    }
    editor.setDrawer(next);
  }

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
    try {
      await editor.save();
      router.push("/admin/templates");
    } catch {
      toast.error("Não foi possível salvar o modelo. Tente novamente.");
    }
  }

  return (
    <PlanModeProvider value="template">
      <div className="flex flex-col h-dvh">
        {/* Cabeçalho tingido: indica que a tela é de edição, como no editor de culto */}
        <div className="shrink-0 bg-muted/50 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="template-name" className="mb-1 block text-xs text-foreground/80">
                Nome do modelo
              </Label>
              <Input
                id="template-name"
                value={editor.name}
                onChange={(e) => editor.setName(e.target.value)}
                placeholder="Ex: Culto Dominical"
                className="h-11 bg-background text-base font-medium"
              />
            </div>
            <div className="shrink-0">
              <Label htmlFor="template-start-time" className="mb-1 block text-xs text-foreground/80">
                Horário padrão
              </Label>
              <Input
                id="template-start-time"
                type="time"
                value={editor.defaultStartTime}
                onChange={(e) => editor.setDefaultStartTime(e.target.value)}
                className="h-11 w-32 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Timeline (rola) + painel de edição ao lado, quando visível */}
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
            <ServiceTimeline
              service={fakeService}
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

          {showDockedPanel && editingUnit && (
            <aside className="flex shrink-0 py-4 pr-4 sm:pr-6 lg:pr-8">
              <ServiceItemPanel
                ref={panelRef}
                key={editingUnit.unit.clientId}
                unit={editingUnit.unit}
                isNew={isNewUnit}
                onUpdate={(changes) =>
                  editor.updateUnit(editingUnit.sectionIndex, editingUnit.unitIndex, changes)
                }
                onDiscard={() => editor.removeUnit(editingUnit.sectionIndex, editingUnit.unitIndex)}
                onClose={() => openDrawer({ type: "closed" })}
              />
            </aside>
          )}
        </div>

        <FormFooter
          disabled={!editor.isDirty || !editor.name.trim()}
          loading={editor.isSaving}
          label={id ? "Salvar modelo" : "Criar modelo"}
          onSave={handleSave}
          status={editor.isDirty ? "Não salvo" : "Tudo salvo"}
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
          drawerState={showDockedPanel ? { type: "closed" } : editor.drawer}
          sections={editor.sections}
          onClose={() => openDrawer({ type: "closed" })}
          onAddUnit={editor.addUnit}
          onUpdateUnit={editor.updateUnit}
          onRemoveUnit={editor.removeUnit}
        />
      </div>
    </PlanModeProvider>
  );
}
