import { useCreateOrUpdateArrangement } from "#api-client";
import PageHeader from "@/components/common/PageHeader";
import SaveButtonSet from "@/components/common/SaveButtonSet";
import { Form } from "@/components/ui/form";
import { ClientArrangement } from "@/prisma/models";
import { ArrangementSchema } from "@/schemas/arrangement";
import { autoScrollWindowForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import ArrangementInfoForm from "./ArrangementInfoForm";
import SongInfoForm from "./SongInfoForm";
import SongUnitListForm from "./SongUnitListForm";
import { initForm } from "./useArrangementForm";

type ArrangementFormProps = {
  arrangement: ClientArrangement | null;
  onSaved?: (arrangement: ClientArrangement) => void;
};

export default function ArrangementForm({
  arrangement: origArrangement,
  onSaved,
}: ArrangementFormProps) {
  const t = useTranslations("Messages");
  const form = useForm<ArrangementSchema>(initForm(origArrangement));
  const arrangement: ClientArrangement = form.getValues();
  const { isDirty, isValid } = form.formState;

  const searchParams = useSearchParams().toString();
  const pathname = usePathname().replace("/edit", "");
  const cancelUrl = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  const { createOrUpdateArrangement } = useCreateOrUpdateArrangement(
    arrangement.id
  );

  async function onSubmit(arrangement: ArrangementSchema) {
    const newOrUpdatedArrangement = await createOrUpdateArrangement(
      arrangement
    );
    if (onSaved) {
      onSaved(newOrUpdatedArrangement);
    }
  }

  useEffect(() => {
    return autoScrollWindowForElements();
  }, []);

  const isNew = !arrangement.id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title={isNew ? t("newSong") : t("editSong")}
          actions={
            <SaveButtonSet
              cancelUrl={isNew ? undefined : cancelUrl}
              enabled={isDirty && isValid}
            />
          }
          variant="edit"
        />
        <SongInfoForm />
        <ArrangementInfoForm
          arrangementId={arrangement.id}
          songSlug={arrangement.song?.slug}
          isDefault={arrangement.isDefault ?? true}
        />
        <SongUnitListForm />
      </form>
    </Form>
  );
}
