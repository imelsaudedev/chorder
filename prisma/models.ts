import {
  ArrangementAudio,
  Service,
  ServiceUnit,
  Song,
  SongArrangement,
  SongUnit,
  SongUnitType,
  Tag,
  TagGroup,
} from "@prisma/client";

export type { ArrangementAudio, ServiceUnit, Song, SongArrangement, SongUnit, SongUnitType, Tag, TagGroup };

export type ClientArrangementAudio = Omit<Pick<ArrangementAudio, "id" | "url" | "label" | "order">, "id"> & { id?: number };

export type ClientTag = Pick<Tag, "id" | "name"> & {
  group: Pick<TagGroup, "id" | "name" | "color">;
};

export type ClientTagGroup = Pick<TagGroup, "id" | "name" | "color"> & {
  tags: (Pick<Tag, "id" | "name"> & { songCount?: number })[];
};

export const SERVICE_UNIT_TYPES = ["SONG"];
export const SONG_UNIT_TYPES = [
  "BLOCK",
  "INTRO",
  "VERSE",
  "PRECHORUS",
  "CHORUS",
  "BRIDGE",
  "INTERLUDE",
  "SOLO",
  "ENDING",
  "TEXT",
] as const;

export type ClientSong = Omit<Song, "id" | "legacyId"> & {
  id?: number;
  arrangements?: ClientArrangement[];
  tags?: ClientTag[];
};
export type ClientArrangement = Omit<
  SongArrangement,
  "id" | "songId"
> & {
  id?: number;
  songId?: number;
  song?: ClientSong;
  units?: ClientSongUnit[];
  audios: ClientArrangementAudio[];
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
