import SortingButtons from "@/app-old/lib/components/SortingButtons";
import ServiceSongUnitEditor from "@/app-old/lib/components/ServiceSongUnitEditor";
import { useCallback } from "react";
import { UnitSchema } from "./schema";
import { ServiceFormFields } from "./useServiceFormFields";

type SortableServiceUnitFormProps = {
  index: number;
  unit: UnitSchema;
  serviceFormFields: ServiceFormFields;
};

export default function SortableServiceUnitForm({
  index,
  unit,
  serviceFormFields,
}: SortableServiceUnitFormProps) {
  const { unitsLength, onMoveUnitDown, onMoveUnitUp, onRemoveUnit } =
    serviceFormFields;

  const handleRemoveUnit = useCallback(() => {
    onRemoveUnit(index);
  }, [index, onRemoveUnit]);

  return (
    <div className="flex">
      <SortingButtons
        moveUnitUp={onMoveUnitUp}
        moveUnitDown={onMoveUnitDown}
        listSize={unitsLength}
        index={index}
      />
      {unit.type === "SONG" && (
        <ServiceSongUnitEditor index={index} onRemoveUnit={handleRemoveUnit} />
      )}
    </div>
  );
}
