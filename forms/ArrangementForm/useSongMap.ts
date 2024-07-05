import { useCallback, useMemo } from 'react';
import { ArrangementFormSchema, SongMapElementSchema } from './schema';
import { UseFieldArrayRemove, UseFieldArrayReturn } from 'react-hook-form';
import { SongUnit } from '@/models/song-unit';

export type SongMapHook = {
  songUnitMap: SongUnit[];
  mapLength: number;
  onMoveUnitUp: (index: number) => void;
  onMoveUnitDown: (index: number) => void;
  onRemoveUnit: (index: number) => void;
};

export default function useSongMap(
  internalId2Unit: Map<number, SongUnit>,
  songMapFieldArray: UseFieldArrayReturn<ArrangementFormSchema, 'songMap'>,
  onDeleteUnit: (internalId: number) => void
): SongMapHook {
  const { fields: songMapFields, remove: deleteFromSongMap, swap: swapSongMapElements } = songMapFieldArray;
  const songUnitMap = useMemo(
    () => songMapFields.map((f) => internalId2Unit.get(f.internalId)!),
    [internalId2Unit, songMapFields]
  );

  const onMoveUnitUp = useMoveUnitUp(swapSongMapElements);
  const onMoveUnitDown = useMoveUnitDown(swapSongMapElements, songMapFields.length - 1);
  const onRemoveUnit = useRemoveUnit(songMapFields, deleteFromSongMap, onDeleteUnit);

  return {
    songUnitMap,
    mapLength: songMapFields.length,
    onMoveUnitUp,
    onMoveUnitDown,
    onRemoveUnit,
  };
}

type SwapFunction = (index1: number, index2: number) => void;

function useRemoveUnit(
  songMapFields: SongMapElementSchema[],
  deleteFromSongMap: UseFieldArrayRemove,
  deleteUnit: (internalId: number) => void
) {
  return useCallback(
    (index: number) => {
      const internalId = songMapFields[index].internalId;
      if (songMapFields.filter((f) => f.internalId === internalId).length === 1) {
        deleteUnit(internalId);
      }
      deleteFromSongMap(index);
    },
    [deleteFromSongMap, deleteUnit, songMapFields]
  );
}

function useMoveUnitDown(swapSongMapElements: SwapFunction, maxIndex: number) {
  return useCallback(
    (index: number) => {
      if (index === maxIndex) return;
      swapSongMapElements(index, index + 1);
    },
    [maxIndex, swapSongMapElements]
  );
}

function useMoveUnitUp(swapSongMapElements: SwapFunction) {
  return useCallback(
    (index: number) => {
      if (index === 0) return;
      swapSongMapElements(index, index - 1);
    },
    [swapSongMapElements]
  );
}
