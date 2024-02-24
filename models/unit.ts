export type Unit = {
  id?: number | null;
  songArrangementId?: number | null;
  title?: string | null;
  content: string;
  type: UnitType;
  localUID?: string;
  // ID within the song
  // localId: number;
  // This is for the form
  preview?: boolean;
  typeIdx?: number;
};

export type UnitType =
  | "SONG_INTRO"
  | "SONG_ENDING"
  | "SONG_VERSE"
  | "SONG_PRECHORUS"
  | "SONG_CHORUS"
  | "SONG_BRIDGE"
  | "SONG_INTERLUDE"
  | "SONG_SOLO"
  | "SONG_BLOCK";
