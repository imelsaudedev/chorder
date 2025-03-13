import AddUnitForm from './AddUnitForm';
import SortableServiceUnitForm from './SortableServiceUnitForm';
import { ServiceFormFields } from './useServiceFormFields';

type ServiceFormProps = {
  serviceFormFields: ServiceFormFields;
};

export default function ServiceUnitListForm({ serviceFormFields }: ServiceFormProps) {
  const { units } = serviceFormFields;

  return (
    <section className="w-full mx-auto space-y-2">
      {units.map((field, index) => (
        <SortableServiceUnitForm key={field.id} unit={field} index={index} serviceFormFields={serviceFormFields} />
      ))}
      <div className="pl-10">
        <AddUnitForm serviceFormFields={serviceFormFields} />
      </div>
    </section>
  );
}
