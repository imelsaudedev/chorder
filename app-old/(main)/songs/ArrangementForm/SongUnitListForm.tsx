import AddUnitForm from "./AddUnitForm";
import SortableUnitForm from "./SortableUnitForm";
import { useArrangementUnitsFieldArray } from "./useArrangementForm";

export default function SongUnitListForm() {
  const { units } = useArrangementUnitsFieldArray();

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 space-y-2">
      {units?.map((field, index) => (
        <SortableUnitForm key={index} unit={field} index={index} />
      ))}
      <div className="pl-10">
        <AddUnitForm />
      </div>
    </section>
  );
}
