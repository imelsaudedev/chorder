import { getLyrics } from '@/chopro/music';
import { createUnit, SongUnit, SongUnitType, unitsAreEqual } from './song-unit';

export type SongArrangement = {
  key: string;
  units: SongUnit[];
  songMap: number[];
  isDefault: boolean;
  isDeleted: boolean;
  lastUnitId: number;
  semitoneTranspose: number;
};

export type SongArrangementWith<T> = Omit<SongArrangement, keyof T> & T;

export type OptionalKey = {
  key?: string;
};

export type RequiredIsNew = {
  isNew: boolean;
};

/**
 * Extracts the units that are in this arrangement but not in the other arrangement.
 *
 * If a unit exists in both arrangements, but has different content or type, it will be included in the diff as a new unit.
 */
export function extractDiff(
  baseArrangement: SongArrangement,
  otherArrangement: SongArrangement
): [SongUnit[], number[], number] {
  const diff: SongUnit[] = [];
  let songMap: number[] = baseArrangement.songMap;
  let lastUnitId = baseArrangement.lastUnitId;
  baseArrangement.units.forEach((thisUnit) => {
    const otherUnit = otherArrangement.units.find((unit) => unit.internalId === thisUnit.internalId);
    const unitExistsInOther = !!otherUnit;
    if (unitExistsInOther && !unitsAreEqual(thisUnit, otherUnit)) {
      lastUnitId++;
      const newUnit = createUnit({ internalId: lastUnitId });
      baseArrangement.units.push(newUnit);
      newUnit.content = thisUnit.content;
      newUnit.type = thisUnit.type;
      // Replace the unit in the map with the new unit
      songMap = songMap.map((unitId) => (unitId === thisUnit.internalId ? newUnit.internalId : unitId));
      diff.push(newUnit);
    } else if (!unitExistsInOther) {
      diff.push(thisUnit);
    }
  });
  return [diff, songMap, lastUnitId];
}

export function updateUnitTypeIndices(newUnits: SongUnit[]) {
  const countByType = new Map<SongUnitType, number>();
  newUnits.forEach((unit) => {
    countByType.set(unit.type, (countByType.get(unit.type) || 0) + 1);
    unit.typeIdx = countByType.get(unit.type);
  });
}

export function getArrangementLyrics<T extends Pick<SongArrangement, 'units'>>(arrangement: T) {
  return arrangement.units.map((unit) => getLyrics(unit.content)).join('\n');
}

export function getInternalId2Unit(units: SongUnit[]) {
  return new Map(units.map((u) => [u.internalId, u]));
}

export function getSongUnitMap<T extends Pick<SongArrangement, 'units' | 'songMap'>>(arrangement: T) {
  const internalId2Unit = getInternalId2Unit(arrangement.units);
  return arrangement.songMap.map((internalId) => internalId2Unit.get(internalId)!);
}
