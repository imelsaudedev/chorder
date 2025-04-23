import EditHeader from '@/components/EditHeader';
import { postService } from '@/app/(main)/services/[service]/actions';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { OptionalSlug, RequiredIsNew, ServiceWith } from '@/models/service';
import { FormProvider, useFieldArray, useFormState } from 'react-hook-form';
import InfoForm from './InfoForm';
import { ServiceFormSchema } from './schema';
import ServiceUnitListForm from './ServiceUnitListForm';
import { useServiceForm } from './useServiceForm';
import useServiceFormFields from './useServiceFormFields';

type SongFormProps = {
  service: ServiceWith<OptionalSlug & RequiredIsNew>;
};

export default function ServiceForm({ service }: SongFormProps) {
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <EditHeader
            title={service.isNew ? 'Nova liturgia' : 'Editar liturgia'}
            actions={<SaveButtonSet canCancel={!service.isNew} enabled={isDirty && isValid} />}
          />
          <InfoForm form={form} />
          <ServiceUnitListForm serviceFormFields={serviceFormFields} />
        </form>
      </Form>
    </FormProvider>
  );
}
