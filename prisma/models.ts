import {
  Song,
  SongUnit,
  SongUnitType,
  SongArrangement,
} from "@/generated/prisma";

export type { Song, SongUnit, SongUnitType, SongArrangement };

export type ClientSong = Omit<Song, "id" | "legacyId">;

export type SongArrangementWithUnits = SongArrangement & {
  units: SongUnit[];
};

export type SongWithArrangements = Song & {
  arrangements: SongArrangementWithUnits[];
};
