import SortingButtons from "@/components/common/SortingButtons";
import { useSwapAndUpdateOrder } from "@/hooks/useSwapAndUpdateOrder";
import { ClientSongUnit } from "@/prisma/models";
import { useCallback } from "react";
import { useArrangementUnitsFieldArray } from "../useArrangementForm";
import UnitForm from "./UnitForm";

type SortableUnitFormProps = {
  index: number;
  unit: ClientSongUnit;
  fieldPrefix?: string;
};

export default function SortableUnitForm({
  index,
  unit,
  fieldPrefix = "",
}: SortableUnitFormProps) {
  const { units, update, swap, remove, setValue, insert } =
    useArrangementUnitsFieldArray(fieldPrefix);
  const swapAndUpdateOrder = useSwapAndUpdateOrder(units, setValue, swap);
  const handleMoveUnitUp = useCallback(() => {
    index > 0 && swapAndUpdateOrder(index, index - 1);
  }, [index, swapAndUpdateOrder]);
  const handleMoveUnitDown = useCallback(() => {
    index < units.length - 1 && swapAndUpdateOrder(index, index + 1);
  }, [index, units.length, swapAndUpdateOrder]);
  const handleRemoveUnit = useCallback(() => {
    for (let i = index + 1; i < units.length; i++) {
      setValue(i, "order", units[i].order - 1);
    }
    remove(index);
  }, [index, remove, setValue, units]);
  const handleChangeUnit = useCallback(
    (unit: ClientSongUnit) => {
      update(index, unit);
    },
    [index, update]
  );
  const handleDuplicateUnit = useCallback(() => {
    const newUnit = { ...unit, order: unit.order + 1 };
    for (let i = index + 1; i < units.length; i++) {
      setValue(i, "order", units[i].order + 1);
    }
    insert(index + 1, newUnit);
  }, [index, insert, setValue, unit, units]);

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
        duplicateUnit={handleDuplicateUnit}
        onChangeUnit={handleChangeUnit}
        className="grow"
      />
    </div>
  );
}
