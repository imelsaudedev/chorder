import EditHeader from "@/components-old/EditHeader";
import SaveButtonSet from "@/components-old/SaveButtonSet";
import { ServiceWithUnits } from "@/prisma/models";
import { Form } from "@/components-old/ui/form";
import { FormProvider, useFieldArray, useFormState } from "react-hook-form";
import { saveServiceAction } from "./actions";
import InfoForm from "./InfoForm";
import { ServiceFormSchema } from "./schema";
import ServiceUnitListForm from "./ServiceUnitListForm";
import { useServiceForm } from "./useServiceForm";
import useServiceFormFields from "./useServiceFormFields";

type SongFormProps = {
  service: ServiceWithUnits;
  onSaved?: (service: ServiceWithUnits) => void;
};

export default function ServiceForm({ service, onSaved }: SongFormProps) {
  const form = useServiceForm(service);
  const { isDirty, isValid } = useFormState({ control: form.control });
  const {
    fields: units,
    append: appendUnit,
    remove: removeUnit,
    update: updateUnit,
    swap: swapUnits,
  } = useFieldArray({ control: form.control, name: "units" });

  const serviceFormFields = useServiceFormFields(
    units,
    appendUnit,
    removeUnit,
    updateUnit,
    swapUnits
  );

  async function onSubmit({
    slug,
    title,
    worshipLeader,
    date,
    units,
  }: ServiceFormSchema) {
    const service = await saveServiceAction(
      slug,
      title,
      worshipLeader ?? null,
      date,
      units
    );
    if (onSaved) {
      onSaved(service as unknown as ServiceWithUnits);
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <EditHeader
            title={"Editar liturgia"}
            actions={
              <SaveButtonSet canCancel={true} enabled={isDirty && isValid} />
            }
          />
          <InfoForm form={form} />
          <ServiceUnitListForm serviceFormFields={serviceFormFields} />
        </form>
      </Form>
    </FormProvider>
  );
}
