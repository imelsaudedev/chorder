import {
  $Enums,
  Song,
  SongUnit,
  SongUnitType,
  SongArrangement,
  Service,
  ServiceUnit,
} from "@/generated/prisma";

export type { Song, SongUnit, SongUnitType, SongArrangement, ServiceUnit };

export const SongUnitTypes = $Enums["SongUnitType"];
export const ServiceUnitTypes = $Enums["ServiceUnitType"];

export type ClientSong = Omit<Song, "id" | "legacyId"> & { id?: number };
export type ClientArrangement = Omit<
  SongArrangement,
  "id" | "legacyId" | "songId"
> & {
  id?: number;
  songId?: number;
};
export type ClientSongUnit = Omit<SongUnit, "id" | "arrangementId"> & {
  id?: number;
  arrangementId?: number;
};

export type SongArrangementWithSong = SongArrangement & {
  song: ClientSong;
};
export type SongArrangementWithUnits = SongArrangement & {
  units: SongUnit[];
};
export type SongArrangementWithSongAndUnits = SongArrangementWithSong &
  SongArrangementWithUnits;

export type SongWithArrangements = Song & {
  arrangements: SongArrangementWithUnits[];
};

export type ServiceSongUnit = Omit<ServiceUnit, "id" | "serviceId"> & {
  type: "SONG";
  arrangement: SongArrangementWithSongAndUnits;
  semitoneTranspose: number;
};
export type FullServiceUnit = ServiceSongUnit;
export type ClientService = Omit<Service, "id">;
export type ServiceWithUnits = ClientService & {
  units: FullServiceUnit[];
};
