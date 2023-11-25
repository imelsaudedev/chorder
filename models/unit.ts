export type Unit = {
  title?: string;
  content: string;
  type: UnitType;
  // ID within the song
  localId: number;
  // These are for history navigation
  prevUnit?: Unit;
  nextUnit?: Unit;
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
