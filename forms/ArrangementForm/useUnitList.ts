import { updateUnitTypeIndices } from '@/models/song-arrangement';
import { SongUnit, SongUnitType } from '@/models/song-unit';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

export type UnitListHook = {
  units: SongUnit[];
  internalId2Unit: Map<number, SongUnit>;
  lastUnitId: number;
  isDirty: boolean;
  onUpdateUnit: (internalId: number, set: UnitSetField) => void;
  onDeleteUnit: (internalId: number) => void;
  onAddExistingUnit: (internalId: number) => void;
  onCreateUnit: () => void;
};

export default function useUnitList(
  initialUnits: SongUnit[],
  initialLastUnitId: number,
  appendToSongMap: (internalId: number) => void
): UnitListHook {
  const [units, setUnits] = useState(initialUnits);
  const internalId2Unit = useMemo(() => new Map(units.map((u) => [u.internalId, u])), [units]);
  const [lastUnitId, setLastUnitId] = useState(initialLastUnitId);
  const [isDirty, setIsDirty] = useState(false);
  const setToDirty = useCallback(() => setIsDirty(true), []);

  const onUpdateUnit = useUpdateUnit(setUnits, setToDirty);
  const onDeleteUnit = useDeleteUnit(setUnits, setToDirty);
  const onCreateUnit = useCreateUnit(appendToSongMap, setUnits, lastUnitId, setLastUnitId, setToDirty);
  const onAddExistingUnit = useAddExistingUnit(appendToSongMap);

  return {
    units,
    internalId2Unit,
    lastUnitId,
    isDirty,
    onUpdateUnit,
    onDeleteUnit,
    onAddExistingUnit,
    onCreateUnit,
  };
}

export type UnitSetField =
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

function useUpdateUnit(setUnits: Dispatch<SetStateAction<SongUnit[]>>, setToDirty: () => void) {
  return useCallback(
    (internalId: number, set: UnitSetField) => {
      setUnits((units) => {
        const unitIndex = units.findIndex((u) => u.internalId === internalId);
        if (unitIndex === -1) return units;

        const newUnits = [...units];
        const updatedUnit = { ...units[unitIndex], [set.field]: set.value };
        newUnits[unitIndex] = updatedUnit;

        updateUnitTypeIndices(newUnits);

        return newUnits;
      });
      setToDirty();
    },
    [setUnits, setToDirty]
  );
}

function useDeleteUnit(setUnits: Dispatch<SetStateAction<SongUnit[]>>, setToDirty: () => void) {
  return useCallback(
    (internalId: number) => {
      setUnits((units) => units.filter((u) => u.internalId !== internalId));
      setToDirty();
    },
    [setUnits, setToDirty]
  );
}

function useCreateUnit(
  appendToSongMap: (internalId: number) => void,
  setUnits: Dispatch<SetStateAction<SongUnit[]>>,
  lastUnitId: number,
  setLastUnitId: Dispatch<SetStateAction<number>>,
  setToDirty: () => void
) {
  return useCallback(() => {
    const unit: SongUnit = {
      internalId: lastUnitId + 1,
      type: 'BLOCK',
      content: '',
      typeIdx: 1,
    };
    setLastUnitId(unit.internalId);
    setUnits((units) => {
      const newUnits = [...units, unit];
      updateUnitTypeIndices(newUnits);
      return newUnits;
    });
    setToDirty();
    appendToSongMap(unit.internalId);
  }, [appendToSongMap, lastUnitId, setLastUnitId, setUnits, setToDirty]);
}

function useAddExistingUnit(appendToSongMap: (internalId: number) => void) {
  return useCallback(
    (internalId: number) => {
      appendToSongMap(internalId);
    },
    [appendToSongMap]
  );
}
