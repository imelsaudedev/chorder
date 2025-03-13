export type SongUnit = {
  content: string;
  type: SongUnitType;
  internalId: number;
  typeIdx?: number;
};

export type SongUnitWith<T> = Omit<SongUnit, keyof T> & T;

export type RequiredTypeIdx = {
  typeIdx: number;
};

export const SONG_UNIT_TYPES = [
  'BLOCK',
  'INTRO',
  'VERSE',
  'PRECHORUS',
  'CHORUS',
  'BRIDGE',
  'INTERLUDE',
  'SOLO',
  'ENDING',
] as const;
export type SongUnitType = (typeof SONG_UNIT_TYPES)[number];

export function createUnit({ internalId = -1 }: { internalId?: number }): SongUnit {
  return {
    content: '',
    type: 'BLOCK',
    internalId: internalId,
  };
}

export function unitsAreEqual(unitA: SongUnit, unitB: SongUnit) {
  return unitA.content === unitB.content && unitA.type === unitB.type && unitA.internalId === unitB.internalId;
}
