export class SongUnit {
  typeIdx: number;
  private _content: string;
  private _type: SongUnitType;
  private _internalId: number;
  private _locked: boolean;

  constructor({
    content,
    type,
    internalId,
    typeIdx,
    locked,
  }: {
    content?: string;
    type?: SongUnitType;
    internalId: number;
    typeIdx?: number;
    locked?: boolean;
  }) {
    this._content = content || '';
    this._type = type || 'BLOCK';
    this._internalId = internalId;
    this._locked = !!locked;
    this.typeIdx = typeIdx || 0;
  }

  serialize(): SerializedSongUnit {
    return {
      content: this.content,
      type: this.type,
      internalId: this.internalId,
    };
  }

  static deserialize(serialized: SerializedSongUnit): SongUnit {
    return new SongUnit(serialized);
  }

  get content() {
    return this._content;
  }

  set content(newContent: string) {
    if (this._locked) throw new Error('Cannot modify locked song unit');
    this._content = newContent;
  }

  get type() {
    return this._type;
  }

  set type(newType: SongUnitType) {
    if (this._locked) throw new Error('Cannot modify locked song unit');
    this._type = newType;
  }

  get internalId() {
    return this._internalId;
  }

  set internalId(newInternalId: number) {
    if (this._locked) throw new Error('Cannot modify locked song unit');
    this._internalId = newInternalId;
  }

  lock() {
    this._locked = true;
  }

  unlock() {
    this._locked = false;
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
