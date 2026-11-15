import {
  ArrangementAudio,
  Prisma,
  Service,
  ServiceTemplate,
  Song,
  SongArrangement,
  SongUnit,
  SongUnitType,
  Tag,
  TagGroup,
} from "@prisma/client";

export type { ArrangementAudio, ServiceTemplate, Song, SongArrangement, SongUnit, SongUnitType, Tag, TagGroup };

export type ClientArrangementAudio = Omit<Pick<ArrangementAudio, "id" | "url" | "label" | "order">, "id"> & { id?: number };

export type ClientTag = Pick<Tag, "id" | "name"> & {
  group: Pick<TagGroup, "id" | "name" | "color">;
};

export type ClientTagGroup = Pick<TagGroup, "id" | "name" | "color"> & {
  tags: (Pick<Tag, "id" | "name"> & { songCount?: number })[];
};

export const SERVICE_UNIT_TYPES = [
  "SONG",
  "FALA",
  "LEITURA",
  "ORACAO",
  "AVISOS",
  "SERMAO",
] as const;

export const SERVICE_SECTION_TYPES = [
  "PRE_CULTO",
  "CULTO",
  "POS_CULTO",
  "ESPECIAL",
] as const;

export type ServiceSectionType = typeof SERVICE_SECTION_TYPES[number];

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

export type ClientSong = Omit<Song, "id" | "legacyId" | "holyricsId"> & {
  id?: number;
  holyricsId?: string | null;
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
export type ClientServiceUnit = {
  id?: number;
  // Id estável gerado no client, não muda mesmo quando arrangementId muda
  // (ex: ao trocar a música de um item). Usado pra diffar o plano no save
  // e como key de reconciliação no editor.
  clientId: string;
  type: (typeof SERVICE_UNIT_TYPES)[number];
  arrangementId: number | null;
  semitoneTranspose: number | null;
  order: number;
  arrangement?: ClientArrangement | null;
  serviceId?: number;
  durationMin?: number | null;
  label?: string | null;
  metadata?: Prisma.JsonValue;
};

export type ClientServiceSection = {
  id: string;
  type: ServiceSectionType;
  label: string;
  order: number;
  units: ClientServiceUnit[];
};

export type ClientServiceTemplate = Omit<ServiceTemplate, "id"> & {
  id?: number;
};

export type ServiceRef = Pick<Service, "slug" | "title" | "date">;

export type ServicePlan = {
  startTime?: string | null;
  sections: ClientServiceSection[];
};

export type ClientService = Omit<
  Service,
  "id" | "legacyId" | "preacher" | "sermonTheme" | "sermonReference" | "plan" | "updatedAt"
> & {
  id?: number;
  units?: ClientServiceUnit[];
  plan?: ServicePlan | null;
  prevService?: ServiceRef | null;
  nextService?: ServiceRef | null;
  preacher?: string | null;
  sermonTheme?: string | null;
  sermonReference?: string | null;
  // Presente em cultos já salvos — o client manda de volta o valor que carregou
  // pra detectar se alguém mais salvou o mesmo culto nesse meio tempo (ver
  // syncPlanArrangements/createOrUpdateService em prisma/data.ts).
  updatedAt?: Date;
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
