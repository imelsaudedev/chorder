import Main from '@/components/Main';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Service } from '@/models/service';
import { Dispatch, SetStateAction, useCallback } from 'react';
import InfoForm from './InfoForm';
import ServiceUnitListForm from './ServiceUnitListForm';
import { PostServiceAction } from '@/app/services/[service]/actions';
import { useServiceForm } from './useServiceForm';
import { Form, useFieldArray, useFormState } from 'react-hook-form';
import { ServiceFormSchema, UnitSchema } from './schema';
import { Separator } from '@/components/ui/separator';
import useServiceUnits from './useServiceUnits';

type SongFormProps = {
  service: Service;
  postService: PostServiceAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ServiceForm({ service, postService, setWriteMode }: SongFormProps) {
  const form = useServiceForm(service);
  const { isDirty, isValid } = useFormState({ control: form.control });
  const unitsFieldArray = useFieldArray({ control: form.control, name: 'units' });

  const unitsHook = useServiceUnits(unitsFieldArray);

  async function onSubmit({ title, worshipLeader, date, units }: ServiceFormSchema) {
    service.title = title;
    service.worshipLeader = worshipLeader || null;
    service.date = date;
    // TODO SET UNITS
    await postService(service);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4">
        <SaveButtonSet canCancel={!service.isNew} setWriteMode={setWriteMode} enabled={isDirty && isValid} />
        <InfoForm form={form} />
        <Separator />
        <ServiceUnitListForm unitsFields={unitsFieldArray.fields} unitsHook={unitsHook} />
      </form>
    </Form>
  );
}
