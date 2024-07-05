import { getChords, getKeyFromChords, transposeChord } from '@/chopro/music';
import { SongUnit, SongUnitType, unitsAreEqual } from './song-unit';
import { SerializedSongUnit } from './service-unit';

export class SongArrangement {
  private _key: string | undefined;
  private _units: SongUnit[];
  private _songMap: number[];
  isDefault: boolean;
  isDeleted: boolean;
  lastUnitId: number;
  isNew: boolean;
  semitoneTranspose: number;

  constructor({
    key,
    units,
    songMap,
    isDefault,
    isDeleted,
    lastUnitId,
    isNew,
    semitoneTranspose,
  }: {
    key?: string;
    units?: SongUnit[];
    songMap?: number[];
    isDefault?: boolean;
    isDeleted?: boolean;
    lastUnitId?: number;
    isNew?: boolean;
    semitoneTranspose?: number;
  }) {
    this._key = key || '';
    this._units = units || [];
    this._songMap = songMap || [];
    this.isDefault = isDefault || false;
    this.isDeleted = isDeleted || false;
    this.lastUnitId = lastUnitId || 0;
    this.isNew = !!isNew;
    this.semitoneTranspose = semitoneTranspose || 0;
  }

  copy() {
    return SongArrangement.deserialize(this.serialize());
  }

  serialize(): SerializedSongArrangement {
    return {
      key: this.key,
      units: this.units,
      songMap: this.songMap,
      isDefault: this.isDefault,
      isDeleted: this.isDeleted,
      lastUnitId: this.lastUnitId,
      semitoneTranspose: this.semitoneTranspose,
    };
  }

  static deserialize(serialized: SerializedSongArrangement): SongArrangement {
    return new SongArrangement(serialized);
  }

  forceSetUnits(units: SongUnit[]) {
    this._units = units;
  }

  forceSetSongMap(songMap: number[]) {
    this._songMap = songMap;
  }

  set key(newKey: string) {
    this._key = newKey;
  }

  get key() {
    if (!this._key) {
      const allChords = this.units.map((unit) => getChords(unit.content)).flat();
      this._key = getKeyFromChords(allChords) || '';
    }
    return this._key;
  }

  get rawKey() {
    return this._key;
  }

  get transpositionKeys(): [string, number][] {
    const key = this.key;
    if (!key) return [];

    return Array.from(Array(12).keys()).map((i) => {
      const semitones = i - 5;
      return [transposeChord(key, key, semitones), semitones];
    });
  }

  get units() {
    updateUnitTypeIndices(this._units);
    return [...this._units];
  }

  get songMap() {
    return [...this._songMap];
  }

  get songUnitMap() {
    return this.songMap
      .map((songUnitId) => this.units.find((unit) => unit.internalId === songUnitId))
      .filter(Boolean) as SongUnit[];
  }

  get isValid() {
    return this.units.length > 0;
  }

  get lyrics() {
    // TODO FIX THIS
    return this.units.map((unit) => unit.content).join('\n');
  }

  createUnit(addToMap: boolean) {
    const newUnit: SongUnit = {
      internalId: this.lastUnitId + 1,
      content: '',
      type: 'BLOCK',
    };
    this._units.push(newUnit);
    this.lastUnitId = newUnit.internalId;

    if (addToMap) {
      this._songMap.push(newUnit.internalId);
    }
    return newUnit;
  }

  addUnitToMap(unit: SongUnit) {
    if (this._units.find((otherUnit) => otherUnit.internalId === unit.internalId)) {
      this._songMap.push(unit.internalId);
    } else {
      throw new Error(`Unit ${unit.internalId} not found`);
    }
  }

  swapUnits(indexA: number, indexB: number) {
    if (indexA < 0 || indexA >= this._units.length || indexB < 0 || indexB >= this._units.length) {
      throw new Error('Index out of bounds');
    }
    const temp = this._units[indexA];
    this._units[indexA] = this._units[indexB];
    this._units[indexB] = temp;
  }

  moveUnitUp(index: number) {
    this.swapUnits(index, index - 1);
  }

  moveUnitDown(index: number) {
    this.swapUnits(index, index + 1);
  }

  updateUnitAtMapIndex(index: number, unit: SongUnit) {
    if (index < 0 || index >= this._songMap.length) {
      throw new Error('Index out of bounds');
    }
    const unitId = this._songMap[index];
    const unitIndex = this._units.findIndex((unit) => unit.internalId === unitId);
    this._units[unitIndex] = unit;
  }

  removeUnitAtMapIndex(index: number) {
    if (index < 0 || index >= this._songMap.length) {
      throw new Error('Index out of bounds');
    }
    const unitId = this._songMap[index];
    this._songMap.splice(index, 1);
    if (!this._songMap.includes(unitId)) {
      this._units = this._units.filter((unit) => unit.internalId !== unitId);
    }
  }

  /**
   * Extracts the units that are in this arrangement but not in the other arrangement.
   *
   * If a unit exists in both arrangements, but has different content or type, it will be included in the diff as a new unit.
   */
  extractDiff(otherArrangement: SongArrangement) {
    const diff: SongUnit[] = [];
    this.units.forEach((thisUnit) => {
      const otherUnit = otherArrangement.units.find((unit) => unit.internalId === thisUnit.internalId);
      const unitExistsInOther = !!otherUnit;
      if (unitExistsInOther && !unitsAreEqual(thisUnit, otherUnit)) {
        const newUnit = this.createUnit(false);
        newUnit.content = thisUnit.content;
        newUnit.type = thisUnit.type;
        // Replace the unit in the map with the new unit
        this._songMap = this._songMap.map((unitId) => (unitId === thisUnit.internalId ? newUnit.internalId : unitId));
        diff.push(newUnit);
      } else if (!unitExistsInOther) {
        diff.push(thisUnit);
      }
    });
    return diff;
  }
}

export type SerializedSongArrangement = {
  key: string;
  units: SerializedSongUnit[];
  songMap: number[];
  isDefault: boolean;
  isDeleted: boolean;
  lastUnitId: number;
  semitoneTranspose: number;
};

function updateUnitTypeIndices(newUnits: SongUnit[]) {
  const countByType = new Map<SongUnitType, number>();
  newUnits.forEach((unit) => {
    countByType.set(unit.type, (countByType.get(unit.type) || 0) + 1);
    unit.typeIdx = countByType.get(unit.type);
  });
}
