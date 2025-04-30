import {
  $Enums,
  Song,
  SongUnit,
  SongUnitType,
  SongArrangement,
} from "@/generated/prisma";

export type { Song, SongUnit, SongUnitType, SongArrangement };

export const SongUnitTypes = $Enums["SongUnitType"];

export type ClientSong = Omit<Song, "id" | "legacyId">;
export type ClientArrangement = Omit<
  SongArrangement,
  "id" | "legacyId" | "songId"
>;
export type ClientSongUnit = Omit<SongUnit, "id" | "arrangementId">;

export type SongArrangementWithSong = SongArrangement & {
  song: ClientSong;
};
export type SongArrangementWithUnits = SongArrangement & {
  units: SongUnit[];
};

export type SongWithArrangements = Song & {
  arrangements: SongArrangementWithUnits[];
};
