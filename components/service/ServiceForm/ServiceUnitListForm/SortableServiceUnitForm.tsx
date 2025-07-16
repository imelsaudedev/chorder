import SortingButtons from "@/components/common/SortingButtons";
import { useSwapAndUpdateOrder } from "@/hooks/useSwapAndUpdateOrder";
import { ClientServiceUnit } from "@/prisma/models";
import { ServiceUnitSchema } from "@/schemas/service-unit";
import { useCallback } from "react";
import { useServiceUnitsFieldArray } from "../useServiceForm";
import ServiceSongUnitForm from "./ServiceSongUnitForm";

type SortableServiceUnitFormProps = {
  index: number;
  unit: ClientServiceUnit;
};

export default function SortableServiceUnitForm({
  index,
  unit,
}: SortableServiceUnitFormProps) {
  const { units, update, swap, remove, setValue } = useServiceUnitsFieldArray();
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
    (unit: ServiceUnitSchema) => {
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
      {unit.type === "SONG" && (
        <ServiceSongUnitForm
          index={index}
          unit={unit}
          removeUnit={handleRemoveUnit}
          onChangeUnit={handleChangeUnit}
        />
      )}
    </div>
  );
}
