export class SongUnit {
  content: string;
  type: SongUnitType;
  internalId: number;
  preview: boolean;
  typeIdx: number;

  constructor({ content, type, internalId, preview, typeIdx }: { content?: string, type?: SongUnitType, internalId: number, preview?: boolean, typeIdx?: number }) {
    this.content = content || "";
    this.type = type || "BLOCK";
    this.internalId = internalId;
    this.preview = !!preview;
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
}

export type SerializedSongUnit = {
  content: string;
  type: SongUnitType;
  internalId: number;
};

export type SongUnitType =
  | "INTRO"
  | "ENDING"
  | "VERSE"
  | "PRECHORUS"
  | "CHORUS"
  | "BRIDGE"
  | "INTERLUDE"
  | "SOLO"
  | "BLOCK";
