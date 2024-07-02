import SortingButtons from '@/components/SortingButtons';
import { SongHook } from '@/hooks/useSong';
import UnitForm from '../UnitForm';
import AddUnitForm from './AddUnitForm';

type ArrangementFormProps = {
  songData: SongHook;
};

export default function ArrangementForm({ songData }: ArrangementFormProps) {
  const {
    songUnitMap,
    moveUnitUp,
    moveUnitDown,
    buildUpdateUnitHandler,
    buildRemoveUnitHandler,
    units,
    createUnit,
    addUnit,
  } = songData;

  return (
    <section className="max-w-lg mx-auto">
      {songUnitMap.map((unit, index) => {
        if (unit) {
          return (
            <div key={index} className="flex">
              <SortingButtons
                moveUnitUp={moveUnitUp}
                moveUnitDown={moveUnitDown}
                listSize={songUnitMap.length}
                index={index}
              />
              <UnitForm
                index={index}
                unit={unit}
                setUnit={buildUpdateUnitHandler(index)}
                removeUnit={buildRemoveUnitHandler(index)}
                className="flex-grow"
              />
            </div>
          );
        }
        return 'ERROR';
      })}
      <div className="pl-10">
        <AddUnitForm units={units} onCreateUnit={createUnit} onAddExistingUnit={addUnit} />
      </div>
    </section>
  );
}
