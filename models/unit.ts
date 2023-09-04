export type Unit = {
  title?: string;
  content: string;
  type: UnitType;
  // ID within the song
  localId?: string;
  // These are for history navigation
  prevUnit?: Unit;
  nextUnit?: Unit;
};

export type UnitType =
  | "intro"
  | "ending"
  | "verse"
  | "prechorus"
  | "chorus"
  | "bridge"
  | "interlude"
  | "solo"
  | "neutral";
