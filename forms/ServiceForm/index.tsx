import { postService } from '@/app/services/[service]/actions';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { OptionalSlug, RequiredIsNew, ServiceWith } from '@/models/service';
import { ServiceSongUnit } from '@/models/service-unit';
import { Dispatch, SetStateAction } from 'react';
import { FormProvider, useFieldArray, useFormState } from 'react-hook-form';
import InfoForm from './InfoForm';
import { ServiceFormSchema, SongUnitSchema, UnitSchema } from './schema';
import ServiceUnitListForm from './ServiceUnitListForm';
import { useServiceForm } from './useServiceForm';
import useServiceFormFields from './useServiceFormFields';

type SongFormProps = {
  service: ServiceWith<OptionalSlug & RequiredIsNew>;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ServiceForm({ service, setWriteMode }: SongFormProps) {
  const form = useServiceForm(service);
  const { isDirty, isValid } = useFormState({ control: form.control });
  const {
    fields: units,
    append: appendUnit,
    remove: removeUnit,
    update: updateUnit,
    swap: swapUnits,
  } = useFieldArray({ control: form.control, name: 'units' });

  const serviceFormFields = useServiceFormFields(units, appendUnit, removeUnit, updateUnit, swapUnits);

  async function onSubmit({ slug, title, worshipLeader, date, units }: ServiceFormSchema) {
    await postService({
      slug,
      title,
      worshipLeader,
      date,
      units,
    });
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4">
          <SaveButtonSet canCancel={!service.isNew} setWriteMode={setWriteMode} enabled={isDirty && isValid} />
          <InfoForm form={form} />
          <Separator />
          <ServiceUnitListForm serviceFormFields={serviceFormFields} />
        </form>
      </Form>
    </FormProvider>
  );
}
