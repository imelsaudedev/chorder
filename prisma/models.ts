import {
  $Enums,
  Service,
  ServiceUnit,
  Song,
  SongArrangement,
  SongUnit,
  SongUnitType,
} from "@/generated/prisma";

export type { ServiceUnit, Song, SongArrangement, SongUnit, SongUnitType };

export const SongUnitTypes = $Enums["SongUnitType"];
export const ServiceUnitTypes = $Enums["ServiceUnitType"];

export type ClientSong = Omit<Song, "id" | "legacyId"> & {
  id?: number;
  arrangements?: ClientArrangement[];
};
export type ClientArrangement = Omit<
  SongArrangement,
  "id" | "legacyId" | "songId"
> & {
  id?: number;
  songId?: number;
  song?: ClientSong;
  units?: ClientSongUnit[];
};
export type ClientSongUnit = Omit<SongUnit, "id" | "arrangementId"> & {
  id?: number;
  arrangementId?: number;
};
export type ClientServiceUnit = Omit<ServiceUnit, "id" | "serviceId"> & {
  id?: number;
  arrangement?: ClientArrangement | null;
  serviceId?: number;
};
export type ClientService = Omit<Service, "id" | "legacyId"> & {
  id?: number;
  units?: ClientServiceUnit[];
};
