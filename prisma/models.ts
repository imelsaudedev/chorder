import {
  ArrangementAudio,
  Prisma,
  Service,
  ServiceSection,
  ServiceSectionType,
  ServiceTemplate,
  ServiceUnit,
  Song,
  SongArrangement,
  SongUnit,
  SongUnitType,
  Tag,
  TagGroup,
} from "@prisma/client";

export type { ArrangementAudio, ServiceSection, ServiceSectionType, ServiceTemplate, ServiceUnit, Song, SongArrangement, SongUnit, SongUnitType, Tag, TagGroup };

export type ClientArrangementAudio = Omit<Pick<ArrangementAudio, "id" | "url" | "label" | "order">, "id"> & { id?: number };

export type ClientTag = Pick<Tag, "id" | "name"> & {
  group: Pick<TagGroup, "id" | "name" | "color">;
};

export type ClientTagGroup = Pick<TagGroup, "id" | "name" | "color"> & {
  tags: (Pick<Tag, "id" | "name"> & { songCount?: number })[];
};

export const SERVICE_UNIT_TYPES = [
  "SONG",
  "PRELUDIO",
  "ABERTURA",
  "LEITURA",
  "ORACAO",
  "AVISOS",
  "SERMAO",
  "ESPECIAL",
  "ENCERRAMENTO",
] as const;

export const SERVICE_SECTION_TYPES = [
  "PRE_CULTO",
  "LOUVOR",
  "AVISOS",
  "ORACAO_COMUNITARIA",
  "MENSAGEM",
  "ESPECIAL",
  "ENCERRAMENTO",
] as const;

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
  lastUsedAt?: Date | null;
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
export type ClientServiceUnit = Omit<
  ServiceUnit,
  "id" | "serviceId" | "sectionId" | "durationMin" | "label" | "metadata"
> & {
  id?: number;
  arrangement?: ClientArrangement | null;
  serviceId?: number;
  sectionId?: number | null;
  durationMin?: number | null;
  label?: string | null;
  metadata?: Prisma.JsonValue;
};

export type ClientServiceSection = Omit<ServiceSection, "id" | "serviceId"> & {
  id?: number;
  serviceId?: number;
  units?: ClientServiceUnit[];
};

export type ClientServiceTemplate = Omit<ServiceTemplate, "id"> & {
  id?: number;
};

export type ServiceRef = Pick<Service, "slug" | "title" | "date">;

export type ClientService = Omit<
  Service,
  "id" | "legacyId" | "preacher" | "sermonTheme" | "sermonReference"
> & {
  id?: number;
  units?: ClientServiceUnit[];
  sections?: ClientServiceSection[];
  prevService?: ServiceRef | null;
  nextService?: ServiceRef | null;
  preacher?: string | null;
  sermonTheme?: string | null;
  sermonReference?: string | null;
};

export type RecentServiceEntry = {
  slug: string;
  title: string | null;
  date: Date;
  worshipLeader: string | null;
  songs: string[];
};

export type SongStat = {
  slug: string;
  title: string;
  count: number;
};

export type LeaderStat = {
  name: string;
  totalServices: number;
  topSongs: SongStat[];
};

export type StatsData = {
  totalSongs: number;
  topSongs: SongStat[];
  byLeader: LeaderStat[];
};
