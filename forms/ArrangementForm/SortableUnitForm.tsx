import SortingButtons from '@/components/SortingButtons';
import UnitForm from '@/fragments/UnitForm';
import { SongUnit } from '@/models/song-unit';
import { useCallback } from 'react';
import { SongMapHook } from './useSongMap';
import { UnitSetField } from './useUnitList';

type SortableUnitFormProps = {
  index: number;
  internalId: number;
  unit: SongUnit;
  songMapHook: SongMapHook;
  updateUnit: (internalId: number, set: UnitSetField) => void;
};

export default function SortableUnitForm({ index, internalId, unit, songMapHook, updateUnit }: SortableUnitFormProps) {
  const { mapLength, onMoveUnitDown, onMoveUnitUp, onRemoveUnit } = songMapHook;
  const handleChangeUnit = useCallback(
    (set: UnitSetField) => {
      updateUnit(internalId, set);
    },
    [internalId, updateUnit]
  );
  const handleRemoveUnit = useCallback(() => {
    onRemoveUnit(index);
  }, [index, onRemoveUnit]);

  return (
    <div className="flex">
      <SortingButtons moveUnitUp={onMoveUnitUp} moveUnitDown={onMoveUnitDown} listSize={mapLength} index={index} />
      <UnitForm unit={unit} removeUnit={handleRemoveUnit} onChangeUnit={handleChangeUnit} className="flex-grow" />
    </div>
  );
}
