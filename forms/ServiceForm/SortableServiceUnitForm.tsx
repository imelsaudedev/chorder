import SortingButtons from '@/components/SortingButtons';
import { useCallback } from 'react';
import { SongUnitSchema, UnitSchema } from './schema';
import SongUnitForm from './SongUnitForm';
import { ServiceUnitsHook } from './useServiceUnits';

type SortableServiceUnitFormProps = {
  index: number;
  unitsHook: ServiceUnitsHook;
  unit: UnitSchema;
};

export default function SortableServiceUnitForm({ index, unitsHook, unit }: SortableServiceUnitFormProps) {
  const { unitsLength, onMoveUnitDown, onMoveUnitUp, onRemoveUnit } = unitsHook;
  const handleRemoveUnit = useCallback(() => {
    onRemoveUnit(index);
  }, [index, onRemoveUnit]);

  return (
    <div className="flex">
      <SortingButtons moveUnitUp={onMoveUnitUp} moveUnitDown={onMoveUnitDown} listSize={unitsLength} index={index} />
      {unit.type === 'SONG' && <SongUnitForm unit={unit as SongUnitSchema} onRemoveUnit={handleRemoveUnit} />}
    </div>
  );
}
