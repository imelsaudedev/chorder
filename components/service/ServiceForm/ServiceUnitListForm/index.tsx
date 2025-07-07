import { useServiceUnitsFieldArray } from "../useServiceForm";
import AddUnitForm from "./AddUnitForm";
import SortableServiceUnitForm from "./SortableServiceUnitForm";

export default function ServiceUnitListForm() {
  const { units } = useServiceUnitsFieldArray();

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-2 sm:space-y-4">
      {units.map((unit, index) => (
        <SortableServiceUnitForm
          key={`${unit.id}--${index}`}
          unit={unit}
          index={index}
        />
      ))}
      <div className="pl-10">
        <AddUnitForm />
      </div>
    </section>
  );
}
