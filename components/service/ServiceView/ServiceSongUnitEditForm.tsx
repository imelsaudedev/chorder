"use client";

import { useCreateOrUpdateArrangement } from "#api-client";
import { defaultArrangementValues } from "@/components/song/ArrangementForm/useArrangementForm";
import SongUnitListForm from "@/components/song/ArrangementForm/SongUnitListForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ClientArrangement, ClientServiceUnit } from "@/prisma/models";
import { ArrangementSchema, arrangementSchema } from "@/schemas/arrangement";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import SaveScopeDialog from "./SaveScopeDialog";

type ServiceSongUnitEditFormProps = {
  unit: ClientServiceUnit;
  onSaved: () => void;
  onCancel: () => void;
};

export default function ServiceSongUnitEditForm({
  unit,
  onSaved,
  onCancel,
}: ServiceSongUnitEditFormProps) {
  const t = useTranslations("ServiceView");
  const tMessages = useTranslations("Messages");

  const arrangement = unit.arrangement!;

  const form = useForm<ArrangementSchema>({
    resolver: zodResolver(arrangementSchema),
    defaultValues: {
      ...defaultArrangementValues(arrangement),
      units: arrangement.units ?? [],
    },
  });

  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [pendingData, setPendingData] = useState<ArrangementSchema | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { createOrUpdateArrangement: saveToService, isMutating: savingService } =
    useCreateOrUpdateArrangement(arrangement.id);
  const { createOrUpdateArrangement: saveToOriginal, isMutating: savingOriginal } =
    useCreateOrUpdateArrangement(arrangement.originalArrangementId ?? null);

  const isSaving = savingService || savingOriginal;

  function buildServicePayload(data: ArrangementSchema): ClientArrangement {
    return {
      ...defaultArrangementValues(arrangement),
      ...data,
      id: arrangement.id,
      isServiceArrangement: true,
      song: arrangement.song,
    } as ClientArrangement;
  }

  function buildOriginalPayload(data: ArrangementSchema): ClientArrangement {
    return {
      ...defaultArrangementValues(arrangement),
      ...data,
      id: arrangement.originalArrangementId!,
      isServiceArrangement: false,
      originalArrangementId: null,
      song: arrangement.song,
    } as ClientArrangement;
  }

  function handleSave(data: ArrangementSchema) {
    if (arrangement.originalArrangementId) {
      setPendingData(data);
      setScopeDialogOpen(true);
    } else {
      performSave(data, "service");
    }
  }

  async function performSave(data: ArrangementSchema, scope: "service" | "both") {
    setSaveError(null);
    try {
      if (scope === "both") {
        await Promise.all([
          saveToService(buildServicePayload(data)),
          saveToOriginal(buildOriginalPayload(data)),
        ]);
      } else {
        await saveToService(buildServicePayload(data));
      }
      setScopeDialogOpen(false);
      onSaved();
    } catch {
      setSaveError(t("saveError"));
    }
  }

  return (
    <>
      <Form {...form}>
        <div className="pt-4 pb-2">
          <SongUnitListForm fieldPrefix="" sectionClassName="" />
          <div className="flex flex-col gap-2 pt-4">
            {saveError && (
              <p className="text-sm text-red-500 text-right">{saveError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                data-testid="edit-form-cancel"
              >
                {tMessages("cancel")}
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                onClick={form.handleSubmit(handleSave)}
                data-testid="edit-form-save"
              >
                {isSaving && <Loader2 size={14} className="mr-2 animate-spin" />}
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      </Form>

      {pendingData && (
        <SaveScopeDialog
          open={scopeDialogOpen}
          onOpenChange={setScopeDialogOpen}
          songTitle={arrangement.song?.title ?? ""}
          isSaving={isSaving}
          onSaveServiceOnly={() => performSave(pendingData, "service")}
          onSaveWithOriginal={() => performSave(pendingData, "both")}
        />
      )}
    </>
  );
}
