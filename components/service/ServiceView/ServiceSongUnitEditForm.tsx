"use client";

import { useCreateOrUpdateArrangement } from "#api-client";
import { defaultArrangementValues } from "@/components/song/ArrangementForm/useArrangementForm";
import SongUnitListForm from "@/components/song/ArrangementForm/SongUnitListForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ClientArrangement, ClientServiceUnit } from "@/prisma/models";
import { ArrangementSchema, arrangementSchema } from "@/schemas/arrangement";
import { zodResolver } from "@hookform/resolvers/zod";
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
    await saveToService(buildServicePayload(data));
    if (scope === "both") {
      await saveToOriginal(buildOriginalPayload(data));
    }
    setScopeDialogOpen(false);
    onSaved();
  }

  return (
    <>
      <Form {...form}>
        <div className="pt-4 pb-2">
          <SongUnitListForm fieldPrefix="" sectionClassName="" />
          <div className="flex gap-2 pt-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
              {t("saveChanges")}
            </Button>
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
