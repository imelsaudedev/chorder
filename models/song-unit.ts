import { getLyrics } from '@/chopro/music';

export class SongUnit {
  content: string;
  type: SongUnitType;
  typeIdx: number;
  internalId: number;

  constructor({
    content,
    type,
    internalId,
    typeIdx,
  }: {
    content?: string;
    type?: SongUnitType;
    internalId: number;
    typeIdx?: number;
  }) {
    this.content = content || '';
    this.type = type || 'BLOCK';
    this.internalId = internalId;
    this.typeIdx = typeIdx || 0;
  }

  serialize(): SerializedSongUnit {
    return {
      content: this.content,
      type: this.type,
      internalId: this.internalId,
    };
  }

  equals(other: SongUnit) {
    return this.content === other.content && this.type === other.type && this.internalId === other.internalId;
  }

  static deserialize(serialized: SerializedSongUnit): SongUnit {
    return new SongUnit(serialized);
  }

  get lyrics() {
    return getLyrics(this.content) || '';
  }

  get isValid() {
    return this.content.trim().length > 0;
  }
}

export type SerializedSongUnit = {
  content: string;
  type: SongUnitType;
  internalId: number;
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
