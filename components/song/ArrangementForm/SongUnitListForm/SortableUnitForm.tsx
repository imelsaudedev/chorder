import SortingButtons from "@/components/common/SortingButtons";
import { ClientSongUnit } from "@/prisma/models";
import { useCallback } from "react";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import UnitForm from "./UnitForm";

type SortableUnitFormProps = {
  index: number;
  unit: ClientSongUnit;
};

export default function SortableUnitForm({
  index,
  unit,
}: SortableUnitFormProps) {
  const { units, update, swap, remove } = useArrangementUnitsFieldArray();
  const handleMoveUnitUp = useCallback(() => {
    index > 0 && swap(index, index - 1);
  }, [index, swap]);
  const handleMoveUnitDown = useCallback(() => {
    index < units.length - 1 && swap(index, index + 1);
  }, [index, units.length, swap]);
  const handleRemoveUnit = useCallback(() => {
    remove(index);
  }, [index, remove]);
  const handleChangeUnit = useCallback(
    (unit: ClientSongUnit) => {
      update(index, unit);
    },
    [index, update]
  );

  return (
    <div className="flex">
      <SortingButtons
        moveUnitUp={handleMoveUnitUp}
        moveUnitDown={handleMoveUnitDown}
        listSize={units.length}
        index={index}
      />
      <UnitForm
        unit={unit}
        removeUnit={handleRemoveUnit}
        onChangeUnit={handleChangeUnit}
        className="grow"
      />
    </div>
  );
}
