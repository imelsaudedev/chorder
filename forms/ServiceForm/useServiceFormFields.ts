import { useMoveUnitDown, useMoveUnitUp } from '@/hooks/moveUpDown';
import { UnitSchema } from './schema';

export type ServiceFormFields = {
  units: ({ id: string } & UnitSchema)[];
  unitsLength: number;
  onUpdateUnit: (index: number, unit: UnitSchema) => void;
  onCreateUnit: (unit: UnitSchema) => void;
  onMoveUnitUp: (index: number) => void;
  onMoveUnitDown: (index: number) => void;
  onRemoveUnit: (index: number) => void;
};

export default function useServiceFormFields(
  units: ({ id: string } & UnitSchema)[],
  appendUnit: (unit: UnitSchema) => void,
  removeUnit: (index: number) => void,
  updateUnit: (index: number, unit: UnitSchema) => void,
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
