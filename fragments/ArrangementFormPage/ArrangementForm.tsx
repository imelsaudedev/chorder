import SortingButtons from '@/components/SortingButtons';
import UnitForm from '../UnitForm';
import AddUnitForm from './AddUnitForm';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { SongArrangement } from '@/models/song-arrangement';
import { SongUnit } from '@/models/song-unit';

type ArrangementFormProps = {
  arrangement: SongArrangement;
};

export default function ArrangementForm({ arrangement }: ArrangementFormProps) {
  const [songUnitMap, setSongUnitMap] = useState(arrangement.songUnitMap);
  const moveUnitUp = useMoveUnitUpCallback(arrangement, setSongUnitMap);
  const moveUnitDown = useMoveUnitDownCallback(arrangement, setSongUnitMap);
  const buildUpdateUnitHandler = useBuildUpdateUnitHandlerCallback(arrangement, setSongUnitMap);
  const buildRemoveUnitHandler = useBuildRemoveUnitHandlerCallback(arrangement, setSongUnitMap);
  const createUnit = useCreateUnitCallback(arrangement, setSongUnitMap);
  const addUnit = useAddUnitCallback(arrangement, setSongUnitMap);

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
        <AddUnitForm units={arrangement.units} onCreateUnit={createUnit} onAddExistingUnit={addUnit} />
      </div>
    </section>
  );
}

function useBuildRemoveUnitHandlerCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>
) {
  return useCallback(
    (index: number) => () => {
      arrangement.removeUnitAtMapIndex(index);
      setSongUnitMap([...arrangement.songUnitMap]);
    },
    [arrangement, setSongUnitMap]
  );
}

function useBuildUpdateUnitHandlerCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>
) {
  return useCallback(
    (index: number) => (unit: SongUnit) => {
      arrangement.updateUnitAtMapIndex(index, unit);
      setSongUnitMap([...arrangement.songUnitMap]);
    },
    [arrangement, setSongUnitMap]
  );
}

function useMoveUnitDownCallback(arrangement: SongArrangement, setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>) {
  return useCallback(
    (index: number) => {
      arrangement.moveUnitDown(index);
      setSongUnitMap([...arrangement.songUnitMap]);
    },
    [arrangement, setSongUnitMap]
  );
}

function useMoveUnitUpCallback(arrangement: SongArrangement, setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>) {
  return useCallback(
    (index: number) => {
      arrangement.moveUnitUp(index);
      setSongUnitMap([...arrangement.songUnitMap]);
    },
    [arrangement, setSongUnitMap]
  );
}

function useCreateUnitCallback(arrangement: SongArrangement, setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>) {
  return useCallback(() => {
    arrangement.createUnit(true);
    setSongUnitMap([...arrangement.songUnitMap]);
  }, [arrangement, setSongUnitMap]);
}

function useAddUnitCallback(arrangement: SongArrangement, setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>) {
  return useCallback(
    (unit: SongUnit) => {
      arrangement.addUnitToMap(unit);
      setSongUnitMap([...arrangement.songUnitMap]);
    },
    [arrangement, setSongUnitMap]
  );
}
