import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import AddUnitForm from "./AddUnitForm";
import SortableUnitForm from "./SortableUnitForm";

type SongUnitListFormProps = {
  fieldPrefix?: string;
};
export default function SongUnitListForm({
  fieldPrefix = "",
}: SongUnitListFormProps) {
  const { units } = useArrangementUnitsFieldArray(fieldPrefix);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 space-y-2">
      {units?.map((unit, index) => (
        <SortableUnitForm
          key={index}
          unit={unit}
          index={index}
          fieldPrefix={fieldPrefix}
        />
      ))}
      <div className="pl-10">
        <AddUnitForm fieldPrefix={fieldPrefix} />
      </div>
    </section>
  );
}
