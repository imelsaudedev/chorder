import { useMoveUnitDown, useMoveUnitUp } from '@/hooks/moveUpDown';
import { getInternalId2Unit, updateUnitTypeIndices } from '@/models/song-arrangement';
import { SongUnit, SongUnitType } from '@/models/song-unit';
import { useCallback, useMemo } from 'react';

export type ArrangementFormFields = {
  lastUnitId: number;

  units: SongUnit[];
  onUpdateUnit: (internalId: number, set: SongUnitSetField) => void;
  onAddExistingUnit: (internalId: number) => void;
  onCreateUnit: () => void;

  songUnitMap: (SongUnit & { id: string })[];
  mapLength: number;
  onMoveUnitUp: (index: number) => void;
  onMoveUnitDown: (index: number) => void;
  onRemoveUnit: (index: number) => void;
};

export default function useArrangementFormFields(
  units: SongUnit[],
  appendSongUnit: (unit: SongUnit) => void,
  removeSongUnit: (index: number) => void,
  updateSongUnit: (index: number, unit: SongUnit) => void,
  songMap: { id: string; internalId: number }[],
  appendSongMapElement: (element: { internalId: number }) => void,
  removeSongMapElement: (index: number) => void,
  swapSongMapElements: (indexA: number, indexB: number) => void,
  lastUnitId: number,
  setLastUnitId: (newLastUnitId: number) => void
): ArrangementFormFields {
  const internalId2Unit = useMemo(() => getInternalId2Unit(units as SongUnit[]), [units]);
  const internalId2UnitIndex = useMemo(() => new Map(units.map((u, i) => [u.internalId, i])), [units]);

  return {
    lastUnitId,

    units,
    onUpdateUnit: useUpdateUnit(units, updateSongUnit),
    onAddExistingUnit: useAddExistingUnit(units, appendSongMapElement, appendSongUnit, lastUnitId, setLastUnitId),
    onCreateUnit: useCreateUnit(units, appendSongMapElement, appendSongUnit, lastUnitId, setLastUnitId),

    songUnitMap: useMemo(
      () => songMap.map((f) => ({ ...internalId2Unit.get(f.internalId)!, id: f.id })),
      [internalId2Unit, songMap]
    ),
    mapLength: songMap.length,
    onMoveUnitUp: useMoveUnitUp(swapSongMapElements),
    onMoveUnitDown: useMoveUnitDown(swapSongMapElements, songMap.length - 1),
    onRemoveUnit: useRemoveUnit(songMap, removeSongUnit, removeSongMapElement, internalId2UnitIndex),
  };
}

export type SongUnitSetField =
  | {
      field: 'content';
      value: string;
    }
  | {
      field: 'type';
      value: SongUnitType;
    }
  | {
      field: 'internalId';
      value: number;
    };

type SongMapFormUnit = {
  internalId: number;
};

function updateUnitTypeIndicesInForm(units: SongUnit[], updateSongUnit: (index: number, unit: SongUnit) => void) {
  updateUnitTypeIndices(units);
  units.forEach((unit, index) => updateSongUnit(index, unit));
}

function useUpdateUnit(units: SongUnit[], updateSongUnit: (index: number, unit: SongUnit) => void) {
  return useCallback(
    (internalId: number, set: SongUnitSetField) => {
      const newUnits = units.map((unit) => {
        if (unit.internalId === internalId) {
          return { ...unit, [set.field]: set.value };
        }
        return { ...unit };
      });
      updateUnitTypeIndicesInForm(newUnits, updateSongUnit);
    },
    [units, updateSongUnit]
  );
}

function useCreateUnit(
  units: SongUnit[],
  appendSongMapElement: (element: { internalId: number }) => void,
  appendSongUnit: (unit: SongUnit) => void,
  lastUnitId: number,
  setLastUnitId: (newLastUnitId: number) => void
) {
  return useCallback(() => {
    const newLastId = lastUnitId + 1;
    appendSongUnit({
      internalId: newLastId,
      type: 'BLOCK',
      content: '',
      typeIdx: units.filter((u) => u.type === 'BLOCK').length + 1,
    });
    setLastUnitId(newLastId);
    appendSongMapElement({ internalId: newLastId });
  }, [appendSongMapElement, appendSongUnit, lastUnitId, setLastUnitId, units]);
}

function useAddExistingUnit(
  units: SongUnit[],
  appendSongMapElement: (element: { internalId: number }) => void,
  appendSongUnit: (unit: SongUnit) => void,
  lastUnitId: number,
  setLastUnitId: (newLastUnitId: number) => void
) {
  return useCallback(
    (internalId: number) => {
      const originalUnit = units.find((u) => u.internalId === internalId);
      const newLastId = lastUnitId + 1;
      const newBlockType = originalUnit?.type || 'BLOCK';
      appendSongUnit({
        internalId: newLastId,
        type: newBlockType,
        content: originalUnit?.content || '',
        typeIdx: units.filter((u) => u.type === newBlockType).length + 1,
      });
      setLastUnitId(newLastId);
      appendSongMapElement({ internalId: newLastId });
    },
    [appendSongMapElement, appendSongUnit, lastUnitId, setLastUnitId, units]
  );
}

function useRemoveUnit(
  songMap: SongMapFormUnit[],
  removeSongUnit: (index: number) => void,
  removeSongMapElement: (index: number) => void,
  internalId2UnitIndex: Map<number, number>
) {
  return useCallback(
    (index: number) => {
      const internalId = songMap[index].internalId;
      if (songMap.filter((el) => el.internalId === internalId).length === 1) {
        const unitIndex = internalId2UnitIndex.get(internalId);
        if (unitIndex) removeSongUnit(unitIndex);
      }
      removeSongMapElement(index);
    },
    [internalId2UnitIndex, removeSongMapElement, removeSongUnit, songMap]
  );
}
