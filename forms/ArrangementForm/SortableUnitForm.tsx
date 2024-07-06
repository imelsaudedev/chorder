import SortingButtons from '@/components/SortingButtons';
import UnitForm from '@/fragments/UnitForm';
import { SongUnit } from '@/models/song-unit';
import { useCallback } from 'react';
import { ArrangementFormFields, SongUnitSetField } from './useArrangementFormFields';

type SortableUnitFormProps = {
  index: number;
  unit: SongUnit;
  arrangementFormFields: ArrangementFormFields;
};

export default function SortableUnitForm({ index, unit, arrangementFormFields }: SortableUnitFormProps) {
  const { mapLength, onMoveUnitDown, onMoveUnitUp, onRemoveUnit, onUpdateUnit } = arrangementFormFields;
  const handleChangeUnit = useCallback(
    (set: SongUnitSetField) => {
      onUpdateUnit(unit.internalId, set);
    },
    [unit.internalId, onUpdateUnit]
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
