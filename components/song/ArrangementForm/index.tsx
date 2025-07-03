import { useCreateOrUpdateArrangement } from "#api-client";
import PageHeader from "@/components/common/PageHeader";
import SaveButtonSet from "@/components/common/SaveButtonSet";
import { Form } from "@/components/ui/form";
import { ClientArrangement } from "@/prisma/models";
import { ArrangementSchema } from "@/schemas/arrangement";
import { usePathname, useSearchParams } from "next/navigation";
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
  const form = useForm<ArrangementSchema>(initForm(origArrangement));
  const arrangement: ClientArrangement = form.getValues();
  const { isDirty, isValid } = form.formState;
  console.log("ArrangementForm", { arrangement, isDirty, isValid });

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
  const isNew = !arrangement.id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PageHeader
          title={isNew ? "Nova música" : "Editar música"}
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
