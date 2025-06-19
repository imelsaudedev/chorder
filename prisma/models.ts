import {
  $Enums,
  Song,
  SongUnit,
  SongUnitType,
  SongArrangement,
  Service,
  ServiceUnit,
  ServiceUnitType,
} from "@/generated/prisma";

export type { Song, SongUnit, SongUnitType, SongArrangement, ServiceUnit };

export const SongUnitTypes = $Enums["SongUnitType"];
export const ServiceUnitTypes = $Enums["ServiceUnitType"];

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

export type ClientService = Omit<Service, "id">;
export type ServiceWithUnits = ClientService & {
  units: ServiceUnit[];
};
export type ServiceSongUnit = ServiceUnit & {
  type: "SONG";
  arrangementId: number;
};
