"use client";

import { useCreateOrUpdateArrangement } from "#api-client";
import { defaultArrangementValues } from "@/components/song/ArrangementForm/useArrangementForm";
import BlockEditorFormBridge from "@/components/song/ArrangementForm/BlockEditorFormBridge";
import { Form } from "@/components/ui/form";
import { ClientArrangement, ClientServiceUnit } from "@/prisma/models";
import { ArrangementSchema, arrangementSchema } from "@/schemas/arrangement";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";

export type EditFormHandle = {
  submit: (scope: "service" | "both") => void;
};

type ServiceSongUnitEditFormProps = {
  unit: ClientServiceUnit;
  submitRef: MutableRefObject<EditFormHandle | null>;
  onSavingChange: (saving: boolean) => void;
  // D11: sobe pro EditOrSaveCancelGroup decidir se o X confirma antes de
  // descartar — antes não existia (o X sempre cancelava direto).
  onDirtyChange: (dirty: boolean) => void;
  onSaved: () => void;
};

export default function ServiceSongUnitEditForm({
  unit,
  submitRef,
  onSavingChange,
  onDirtyChange,
  onSaved,
}: ServiceSongUnitEditFormProps) {
  const t = useTranslations("ServiceView");

  const arrangement = unit.arrangement!;

  const form = useForm<ArrangementSchema>({
    resolver: zodResolver(arrangementSchema),
    defaultValues: {
      ...defaultArrangementValues(arrangement),
      units: arrangement.units ?? [],
    },
  });

  const { mutate } = useSWRConfig();
  const [saveError, setSaveError] = useState<string | null>(null);

  // Este formulário só edita cifra — vídeo e áudio são salvos à parte, na
  // hora, por ServiceMediaReferences. Sem preserveMedia, um save daqui feito
  // logo após inserir um vídeo sobrescreveria o vídeo de volta pra vazio
  // (o valor que este formulário carrega pode estar desatualizado).
  const { createOrUpdateArrangement: saveToService, isMutating: savingService } =
    useCreateOrUpdateArrangement(arrangement.id, { preserveMedia: true });
  const { createOrUpdateArrangement: saveToOriginal, isMutating: savingOriginal } =
    useCreateOrUpdateArrangement(arrangement.originalArrangementId ?? null, { preserveMedia: true });

  const isSaving = savingService || savingOriginal;

  const onSavingChangeRef = useRef(onSavingChange);
  onSavingChangeRef.current = onSavingChange;

  useEffect(() => {
    onSavingChangeRef.current(isSaving);
  }, [isSaving]);

  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChangeRef.current(isDirty);
  }, [isDirty]);

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
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      onSaved();
    } catch {
      setSaveError(t("saveError"));
    }
  }

  useEffect(() => {
    submitRef.current = {
      submit: (scope: "service" | "both") => form.handleSubmit((data) => performSave(data, scope))(),
    };
  });

  return (
    <Form {...form}>
      <BlockEditorFormBridge className="" />
      {saveError && (
        <p className="text-sm text-red-500 text-right py-2 px-2">{saveError}</p>
      )}
    </Form>
  );
}
