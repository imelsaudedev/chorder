import { SongArrangement } from '@/models/song-arrangement';
import AddUnitForm from './AddUnitForm';
import SortableUnitForm from './SortableUnitForm';
import { SongMapHook } from './useSongMap';
import { UnitListHook } from './useUnitList';

type UnitListFormSongMapElement = {
  id: string;
  internalId: number;
};

type ArrangementFormProps = {
  arrangement: SongArrangement;
  songMapFields: UnitListFormSongMapElement[];
  unitListHook: UnitListHook;
  songMapHook: SongMapHook;
};

export default function UnitListForm({ arrangement, songMapFields, unitListHook, songMapHook }: ArrangementFormProps) {
  const { onUpdateUnit, onAddExistingUnit, onCreateUnit } = unitListHook;
  const { songUnitMap } = songMapHook;

  return (
    <section className="max-w-lg mx-auto">
      {songMapFields.map((field, index) => (
        <SortableUnitForm
          key={field.id}
          internalId={field.internalId}
          unit={songUnitMap[index]}
          index={index}
          updateUnit={onUpdateUnit}
          songMapHook={songMapHook}
        />
      ))}
      <div className="pl-10">
        <AddUnitForm units={arrangement.units} onCreateUnit={onCreateUnit} onAddExistingUnit={onAddExistingUnit} />
      </div>
    </section>
  );
}
