export type Unit = {
  id?: number | null;
  songVersionId?: number | null;
  title?: string | null;
  content: string;
  type: UnitType;
  // ID within the song
  localId: number;
  // This is for the form
  preview?: boolean;
  typeIdx?: number;
};

export type UnitType =
  | "INTRO"
  | "ENDING"
  | "VERSE"
  | "PRECHORUS"
  | "CHORUS"
  | "BRIDGE"
  | "INTERLUDE"
  | "SOLO"
  | "NEUTRAL";
