import { useMoveUnitDown, useMoveUnitUp } from "@/hooks/moveUpDown";
import { ServiceUnitSchema } from "@/schemas/service-unit";

export type ServiceFormFields = {
  units: ({ id: string } & ServiceUnitSchema)[];
  unitsLength: number;
  onUpdateUnit: (index: number, unit: ServiceUnitSchema) => void;
  onCreateUnit: (unit: ServiceUnitSchema) => void;
  onMoveUnitUp: (index: number) => void;
  onMoveUnitDown: (index: number) => void;
  onRemoveUnit: (index: number) => void;
};

export default function useServiceFormFields(
  units: ({ id: string } & ServiceUnitSchema)[],
  appendUnit: (unit: ServiceUnitSchema) => void,
  removeUnit: (index: number) => void,
  updateUnit: (index: number, unit: ServiceUnitSchema) => void,
  swapUnits: (indexA: number, indexB: number) => void
): ServiceFormFields {
  return {
    units,
    unitsLength: units.length,
    onUpdateUnit: updateUnit,
    onCreateUnit: appendUnit,
    onMoveUnitUp: useMoveUnitUp(swapUnits),
    onMoveUnitDown: useMoveUnitDown(swapUnits, units.length - 1),
    onRemoveUnit: removeUnit,
  };
}
