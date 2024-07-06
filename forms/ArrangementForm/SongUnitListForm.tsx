import AddUnitForm from './AddUnitForm';
import SortableUnitForm from './SortableUnitForm';
import { ArrangementFormFields } from './useArrangementFormFields';

type ArrangementFormProps = {
  arrangementFormFields: ArrangementFormFields;
};

export default function SongUnitListForm({ arrangementFormFields }: ArrangementFormProps) {
  const { songUnitMap } = arrangementFormFields;

  return (
    <section className="max-w-lg mx-auto">
      {songUnitMap.map((field, index) => (
        <SortableUnitForm key={field.id} unit={field} index={index} arrangementFormFields={arrangementFormFields} />
      ))}
      <div className="pl-10">
        <AddUnitForm arrangementFormFields={arrangementFormFields} />
      </div>
    </section>
  );
}
