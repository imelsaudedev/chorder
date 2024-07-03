import SortingButtons from '@/components/SortingButtons';
import UnitForm from '../UnitForm';
import AddUnitForm from './AddUnitForm';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { SongArrangement } from '@/models/song-arrangement';
import { SongUnit } from '@/models/song-unit';

type ArrangementFormProps = {
  arrangement: SongArrangement;
  updateSong: () => void;
};

export default function ArrangementForm({ arrangement, updateSong }: ArrangementFormProps) {
  const [songUnitMap, setSongUnitMap] = useState(arrangement.songUnitMap);
  const moveUnitUp = useMoveUnitUpCallback(arrangement, setSongUnitMap, updateSong);
  const moveUnitDown = useMoveUnitDownCallback(arrangement, setSongUnitMap, updateSong);
  const buildUpdateUnitHandler = useBuildUpdateUnitHandlerCallback(arrangement, setSongUnitMap, updateSong);
  const buildRemoveUnitHandler = useBuildRemoveUnitHandlerCallback(arrangement, setSongUnitMap, updateSong);
  const createUnit = useCreateUnitCallback(arrangement, setSongUnitMap, updateSong);
  const addUnit = useAddUnitCallback(arrangement, setSongUnitMap, updateSong);

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
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>,
  updateSong: () => void
) {
  return useCallback(
    (index: number) => () => {
      arrangement.removeUnitAtMapIndex(index);
      setSongUnitMap([...arrangement.songUnitMap]);
      updateSong();
    },
    [arrangement, setSongUnitMap, updateSong]
  );
}

function useBuildUpdateUnitHandlerCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>,
  updateSong: () => void
) {
  return useCallback(
    (index: number) => (unit: SongUnit) => {
      arrangement.updateUnitAtMapIndex(index, unit);
      setSongUnitMap([...arrangement.songUnitMap]);
      updateSong();
    },
    [arrangement, setSongUnitMap, updateSong]
  );
}

function useMoveUnitDownCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>,
  updateSong: () => void
) {
  return useCallback(
    (index: number) => {
      arrangement.moveUnitDown(index);
      setSongUnitMap([...arrangement.songUnitMap]);
      updateSong();
    },
    [arrangement, setSongUnitMap, updateSong]
  );
}

function useMoveUnitUpCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>,
  updateSong: () => void
) {
  return useCallback(
    (index: number) => {
      arrangement.moveUnitUp(index);
      setSongUnitMap([...arrangement.songUnitMap]);
      updateSong();
    },
    [arrangement, setSongUnitMap, updateSong]
  );
}

function useCreateUnitCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>,
  updateSong: () => void
) {
  return useCallback(() => {
    arrangement.createUnit(true);
    setSongUnitMap([...arrangement.songUnitMap]);
    updateSong();
  }, [arrangement, setSongUnitMap, updateSong]);
}

function useAddUnitCallback(
  arrangement: SongArrangement,
  setSongUnitMap: Dispatch<SetStateAction<SongUnit[]>>,
  updateSong: () => void
) {
  return useCallback(
    (unit: SongUnit) => {
      arrangement.addUnitToMap(unit);
      setSongUnitMap([...arrangement.songUnitMap]);
      updateSong();
    },
    [arrangement, setSongUnitMap, updateSong]
  );
}
