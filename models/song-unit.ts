export type SongUnit = {
  content: string;
  type: SongUnitType;
  internalId: number;
  typeIdx?: number;
};

export type SongUnitType =
  | 'INTRO'
  | 'ENDING'
  | 'VERSE'
  | 'PRECHORUS'
  | 'CHORUS'
  | 'BRIDGE'
  | 'INTERLUDE'
  | 'SOLO'
  | 'BLOCK';

export function unitsAreEqual(unitA: SongUnit, unitB: SongUnit) {
  return unitA.content === unitB.content && unitA.type === unitB.type && unitA.internalId === unitB.internalId;
}
