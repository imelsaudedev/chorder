import AddUnitForm from './AddUnitForm';
import SortableUnitForm from './SortableUnitForm';
import { ArrangementFormFields } from './useArrangementFormFields';

type ArrangementFormProps = {
  arrangementFormFields: ArrangementFormFields;
};

export default function SongUnitListForm({ arrangementFormFields }: ArrangementFormProps) {
  const { songUnitMap } = arrangementFormFields;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 space-y-2">
      {songUnitMap.map((field, index) => (
        <SortableUnitForm key={field.id} unit={field} index={index} arrangementFormFields={arrangementFormFields} />
      ))}
      <div className="pl-10">
        <AddUnitForm arrangementFormFields={arrangementFormFields} />
      </div>
    </section>
  );
}
