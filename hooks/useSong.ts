import { Song, SongArrangement } from '@/models/song';
import { SongUnit, SongUnitType } from '@/models/song-unit';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import useUpdatableState from './useUpdatableState';
import useMoveUpDownCallbacks from './useMoveUpDownCallbacks';

export type SongHook = {
  song: Song;
  arrangementIndex: number;
  isNewArrangement: boolean;
  title: string;
  setTitle: (newValue: string) => void;
  artist: string | null;
  setArtist: (newValue: string | null) => void;
  songKey: string | undefined;
  setSongKey: (newValue: string | undefined) => void;
  units: SongUnit[];
  songMap: number[];
  songUnitMap: SongUnit[];
  createUnit: () => void;
  addUnit: (unit: SongUnit) => void;
  moveUnitUp: (unitIndex: number) => void;
  moveUnitDown: (unitIndex: number) => void;
  buildRemoveUnitHandler: (unitIndex: number) => () => void;
  buildUpdateUnitHandler: (unitIndex: number) => (unit: SongUnit) => void;
};

export default function useSong(song: Song, arrangementIndex: number): SongHook {
  const { arrangement, isNewArrangement } = useArrangement(song, arrangementIndex);
  const [title, setTitle] = useUpdatableState<string>(song.title);
  const [artist, setArtist] = useUpdatableState<string | null>(song.artist);
  const [key, setKey] = useUpdatableState<string | undefined>(arrangement.rawKey);
  const { lastUnitId, nextUnitId } = useUnitId(arrangement.lastUnitId);
  const {
    units,
    songMap,
    songUnitMap,
    createUnit,
    addUnit,
    moveUnitUp,
    moveUnitDown,
    buildRemoveUnitHandler,
    buildUpdateUnitHandler,
  } = useUnits(arrangement.units, arrangement.songMap, nextUnitId);

  const builtSong = useMemoSong(
    arrangementIndex,
    title,
    artist,
    song.slug,
    key,
    units,
    songMap,
    lastUnitId,
    song.arrangements
  );

  return {
    song: builtSong,
    arrangementIndex,
    isNewArrangement,
    title,
    setTitle,
    artist,
    setArtist,
    songKey: key,
    setSongKey: setKey,
    units,
    songMap,
    songUnitMap,
    createUnit,
    addUnit,
    moveUnitUp,
    moveUnitDown,
    buildRemoveUnitHandler,
    buildUpdateUnitHandler,
  };
}

function useMemoSong(
  arrangementIndex: number,
  title: string,
  artist: string | null,
  slug: string | undefined,
  key: string | undefined,
  units: SongUnit[],
  songMap: number[],
  lastUnitId: number,
  arrangements: SongArrangement[]
) {
  return useMemo(
    () => buildSong(arrangementIndex, title, artist, slug, key, units, songMap, lastUnitId, arrangements),
    [arrangementIndex, title, artist, slug, key, units, songMap, lastUnitId, arrangements]
  );
}

function buildSong(
  arrangementIndex: number,
  title: string,
  artist: string | null,
  slug: string | undefined,
  key: string | undefined,
  units: SongUnit[],
  songMap: number[],
  lastUnitId: number,
  arrangements: SongArrangement[]
) {
  const newArrangements = [...arrangements];
  const newArrangement = new SongArrangement({
    key,
    units,
    songMap,
    lastUnitId,
  });
  if (arrangementIndex < 0 || arrangementIndex >= newArrangements.length) {
    if (newArrangements.length === 0) {
      newArrangement.isDefault = true;
    }
    newArrangements.push(newArrangement);
  } else {
    newArrangement.isDefault = newArrangements[arrangementIndex].isDefault;
    newArrangements[arrangementIndex] = newArrangement;
  }
  return new Song({
    title,
    artist,
    arrangements: newArrangements,
    slug,
  });
}

function useArrangement(song: Song, arrangementIndex: number) {
  return useMemo(() => {
    let arrangement = song.getArrangementOrDefault(arrangementIndex);
    let isNewArrangement = false;
    if (!arrangement) {
      arrangement = new SongArrangement({});
      isNewArrangement = true;
    }

    return { arrangement, isNewArrangement };
  }, [song, arrangementIndex]);
}

function useUnitId(lastUnitId: number) {
  const [currentUnitId, setCurrentUnitId] = useState(lastUnitId || 0);
  const nextUnitId = useCallback(() => {
    const newUnitId = currentUnitId + 1;
    setCurrentUnitId(newUnitId);
    return newUnitId;
  }, [currentUnitId]);
  return { lastUnitId: currentUnitId, nextUnitId };
}

function useUnits(units: SongUnit[], songMap: number[], nextUnitId: () => number) {
  const [internalUnits, setInternalUnits] = useUpdatableState(units);
  const [internalSongMap, setInternalSongMap] = useUpdatableState(songMap);
  const songUnitMap = useMemo(
    () =>
      internalSongMap
        .map((unitId) => internalUnits.find((unit) => unit.internalId === unitId))
        .filter((unit) => !!unit) as SongUnit[],
    [internalUnits, internalSongMap]
  );

  useEffect(() => {
    updateInternalUnits(internalUnits, setInternalUnits);
  }, [internalUnits, setInternalUnits]);

  const { createUnit, addUnit, moveUnitUp, moveUnitDown, buildRemoveUnitHandler, buildUpdateUnitHandler } =
    useUnitCallbacks(nextUnitId, internalUnits, setInternalUnits, internalSongMap, setInternalSongMap, songUnitMap);

  return {
    units: internalUnits,
    songMap: internalSongMap,
    songUnitMap,
    createUnit,
    addUnit,
    moveUnitUp,
    moveUnitDown,
    buildRemoveUnitHandler,
    buildUpdateUnitHandler,
  };
}

function updateInternalUnits(internalUnits: SongUnit[], setInternalUnits: (units: SongUnit[]) => void) {
  const unitTypeCount = new Map<SongUnitType, number>();
  const newTypeCounts: number[] = [];
  let changed = false;
  for (let unit of internalUnits) {
    const count = (unitTypeCount.get(unit.type) || 0) + 1;
    unitTypeCount.set(unit.type, count);
    newTypeCounts.push(count);
    if (unit.typeIdx !== count) {
      changed = true;
    }
  }
  if (changed) {
    const newUnits = internalUnits.map((unit, index) => {
      return new SongUnit({ ...unit.serialize(), typeIdx: newTypeCounts[index] });
    });
    setInternalUnits(newUnits);
  }
}

function useUnitCallbacks(
  nextUnitId: () => number,
  internalUnits: SongUnit[],
  setInternalUnits: (newValue: SongUnit[]) => void,
  internalSongMap: number[],
  setInternalSongMap: (newValue: number[]) => void,
  songUnitMap: SongUnit[]
) {
  const createUnit = useCallback(() => {
    const newUnit = new SongUnit({ internalId: nextUnitId() });
    setInternalUnits([...internalUnits, newUnit]);
    setInternalSongMap([...internalSongMap, newUnit.internalId]);
  }, [internalSongMap, internalUnits, nextUnitId, setInternalSongMap, setInternalUnits]);

  const addUnit = useCallback(
    (unit: SongUnit) => {
      if (!internalUnits.find((otherUnit) => otherUnit.internalId === unit.internalId))
        throw new Error(`Unit ${unit.internalId} not found`);
      setInternalSongMap([...internalSongMap, unit.internalId]);
    },
    [internalSongMap, internalUnits, setInternalSongMap]
  );

  const [moveUnitUp, moveUnitDown] = useMoveUpDownCallbacks(internalSongMap, setInternalSongMap);

  const buildRemoveUnitHandler = useCallback(
    (unitIndex: number) => {
      return () => {
        const newSongMap = [...internalSongMap];
        const unitId = newSongMap[unitIndex];
        newSongMap.splice(unitIndex, 1);
        setInternalSongMap(newSongMap);
        if (!newSongMap.includes(unitId)) {
          const newUnits = [...internalUnits].filter((unit) => unit.internalId !== unitId);
          setInternalUnits(newUnits);
        }
      };
    },
    [internalSongMap, internalUnits, setInternalSongMap, setInternalUnits]
  );

  const buildUpdateUnitHandler = useCallback(
    (unitIndex: number) => {
      return (unit: SongUnit) => {
        const newUnits = [...internalUnits];
        const targetUnitId = songUnitMap[unitIndex].internalId;
        let targetUnitIndex = internalUnits.findIndex((unit) => unit.internalId === targetUnitId);
        if (targetUnitIndex < 0) throw new Error(`Unit ${targetUnitId} not found`);
        newUnits[targetUnitIndex] = unit;
        setInternalUnits(newUnits);
      };
    },
    [internalUnits, setInternalUnits, songUnitMap]
  );

  return {
    createUnit,
    addUnit,
    moveUnitUp,
    moveUnitDown,
    buildRemoveUnitHandler,
    buildUpdateUnitHandler,
  };
}
