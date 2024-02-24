import prisma from "@/lib/prisma";

export type Unit = {
  id?: number | null;
  songArrangementId?: number | null;
  title?: string | null;
  content: string;
  type: UnitType;
  localUID?: string | null;
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

export async function pruneUnits() {
  return prisma.dBUnit.deleteMany({
    where: {
      arrangements: {
        none: {},
      },
    },
  });
}
