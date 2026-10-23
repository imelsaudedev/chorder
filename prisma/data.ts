import { Prisma } from "@prisma/client";
import { getLyrics } from "@/chopro/music";
import prisma from "./client";
import {
  ClientArrangement,
  ClientService,
  ClientServiceTemplate,
  ClientServiceUnit,
  ClientSong,
  ClientTagGroup,
  LeaderStat,
  RecentServiceEntry,
  ServicePlan,
  SongStat,
  StatsData,
} from "./models";

export function retrieveSongSlugs() {
  return prisma.song
    .findMany({
      where: {
        isDeleted: false,
      },
      select: {
        slug: true,
      },
    })
    .then((songs) => songs.map((song) => song.slug));
}

export async function slugForSong(title: string) {
  const slugs = await retrieveSongSlugs();
  if (containsOnlyDigits(title)) title = `${title}-song`;
  return slugFor(title, slugs);
}

export async function retrieveServiceSlugs() {
  return prisma.service
    .findMany({
      where: {
        isDeleted: false,
      },
      select: {
        slug: true,
      },
    })
    .then((services) => services.map((service) => service.slug));
}

export async function slugForService() {
  const slugs = await retrieveServiceSlugs();
  while (true) {
    const slug = Math.random().toString(36).split(".")[1].substring(0, 6);
    if (!slugs.includes(slug)) {
      return slug;
    }
  }
}

export async function slugFor(original: string, slugs: string[]) {
  let slug = original
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]/g, "-");
  let idx = 1;
  let newSlug = slug;
  while (slugs.includes(newSlug)) {
    newSlug = `${slug}-${idx}`;
    idx++;
  }
  slugs.push(newSlug);
  return newSlug;
}

async function buildTagFilter(tagIds: number[]) {
  if (tagIds.length === 0) return {};
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
    select: { id: true, tagGroupId: true },
  });
  const byGroup = new Map<number, number[]>();
  for (const tag of tags) {
    const group = byGroup.get(tag.tagGroupId) ?? [];
    group.push(tag.id);
    byGroup.set(tag.tagGroupId, group);
  }
  return {
    AND: Array.from(byGroup.values()).map((ids) => ({
      tags: { some: { id: { in: ids } } },
    })),
  };
}

export async function retrieveSongs({
  query = "",
  limitLines,
  forceIncludeFirstLine = true,
  excludedSongSlugs = [],
  tagIds = [],
  withUsageStats = false,
}: {
  query?: string;
  limitLines?: number;
  forceIncludeFirstLine?: boolean;
  excludedSongSlugs?: string[];
  tagIds?: number[];
  withUsageStats?: boolean;
}): Promise<ClientSong[]> {
  // OR dentro do mesmo grupo, AND entre grupos diferentes
  const tagFilter: { AND: { tags: { some: { id: { in: number[] } } } }[] } | object =
    tagIds.length > 0
      ? await buildTagFilter(tagIds)
      : {};

  let songs: ClientSong[] = await prisma.song.findMany({
    where: {
      isDeleted: false,
      slug: {
        notIn: excludedSongSlugs,
      },
      ...tagFilter,
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          artist: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          lyrics: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      lyrics: true,
      artist: true,
      isDeleted: true,
      holyricsId: true,
      arrangements: {
        where: { isServiceArrangement: false, isDeleted: false },
        select: {
          id: true,
          name: true,
          key: true,
          isDefault: true,
          isDeleted: true,
          isServiceArrangement: true,
          originalArrangementId: true,
          youtubeUrl: true,
          audios: { select: { id: true, url: true, label: true, order: true }, orderBy: { order: "asc" } },
        },
        orderBy: [{ isDefault: "desc" }],
      },
      tags: {
        select: {
          id: true,
          name: true,
          group: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });
  if (limitLines) {
    songs = songs.map((song) =>
      limitLyrics(song, limitLines, forceIncludeFirstLine, query)
    );
  }

  if (withUsageStats) {
    const songIds = songs.map((s) => s.id).filter((id): id is number => id !== undefined);
    if (songIds.length > 0) {
      const serviceArrangements = await prisma.songArrangement.findMany({
        where: {
          songId: { in: songIds },
          isServiceArrangement: true,
          isDeleted: false,
          serviceUnit: { service: { isDeleted: false } },
        },
        select: {
          songId: true,
          serviceUnit: { select: { service: { select: { date: true } } } },
        },
      });
      const lastUsedMap = new Map<number, Date>();
      for (const sa of serviceArrangements) {
        const date = sa.serviceUnit?.service?.date;
        if (!date) continue;
        const existing = lastUsedMap.get(sa.songId);
        if (!existing || date > existing) lastUsedMap.set(sa.songId, date);
      }
      songs = songs.map((song) => ({
        ...song,
        lastUsedAt: (song.id !== undefined ? lastUsedMap.get(song.id) : undefined) ?? null,
      }));
    }
  }

  return songs;
}

export async function archiveSong(slug: string) {
  return prisma.song.update({
    where: { slug },
    data: { isDeleted: true },
  });
}

export async function updateSongInfo(
  slug: string,
  data: { title?: string; artist?: string | null; tagIds?: number[]; holyricsId?: string | null }
): Promise<void> {
  const { tagIds, ...rest } = data;
  await prisma.song.update({
    where: { slug },
    data: {
      ...rest,
      ...(tagIds !== undefined && {
        tags: { set: tagIds.map((id) => ({ id })) },
      }),
    },
  });
}

export async function retrieveSong(
  slugOrId: string | number,
  {
    includeArrangements = false,
    includeServiceArrangements = false,
    includeUnits = false,
  }: {
    includeArrangements?: boolean;
    includeServiceArrangements?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientSong | null> {
  const where: { isDeleted: boolean; slug?: string; id?: number } = {
    isDeleted: false,
    ...selectSlugOrId(slugOrId),
  };
  return prisma.song.findFirst({
    where,
    include: {
      tags: {
        select: {
          id: true,
          name: true,
          group: { select: { id: true, name: true, color: true } },
        },
      },
      arrangements: includeArrangements
        ? {
            where: {
              isDeleted: false,
              isServiceArrangement: includeServiceArrangements
                ? undefined
                : false,
            },
            include: {
              units: includeUnits
                ? {
                    orderBy: { order: "asc" },
                  }
                : false,
              audios: { orderBy: { order: "asc" } },
            },
          }
        : false,
    },
  }) as unknown as Promise<ClientSong | null>;
}

export async function retrieveSongArrangements(
  songSlugOrId: string | number,
  {
    includeSong = false,
    includeServiceArrangements = false,
    includeUnits = false,
  }: {
    includeSong?: boolean;
    includeServiceArrangements?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientArrangement[]> {
  return prisma.songArrangement.findMany({
    where: {
      song: selectSlugOrId(songSlugOrId),
      isDeleted: false,
      isServiceArrangement: includeServiceArrangements ? undefined : false,
    },
    include: {
      song: includeSong,
      units: includeUnits ? { orderBy: { order: "asc" } } : false,
      audios: { orderBy: { order: "asc" } },
    },
  });
}

export async function retrieveArrangement(
  arrangementId?: number | null,
  {
    songSlugOrId,
    includeUnits,
    includeSong,
  }: {
    songSlugOrId?: string | number;
    includeUnits?: boolean;
    includeSong?: boolean;
  } = {}
): Promise<ClientArrangement | null> {
  if (!arrangementId && !songSlugOrId) {
    throw new Error(
      "Song slug or id is required to retrieve default arrangement"
    );
  }
  if (!arrangementId) {
    return prisma.songArrangement.findFirst({
      where: {
        song: {
          ...selectSlugOrId(songSlugOrId!),
          isDeleted: false,
        },
        isDefault: true,
        isDeleted: false,
      },
      include: {
        units: includeUnits ? { orderBy: { order: "asc" } } : false,
        audios: { orderBy: { order: "asc" } },
        song: includeSong
          ? {
              include: {
                tags: {
                  select: {
                    id: true,
                    name: true,
                    group: { select: { id: true, name: true, color: true } },
                  },
                },
                arrangements: {
                  where: { isDeleted: false, isServiceArrangement: false },
                },
              },
            }
          : false,
      },
    });
  }

  const where: {
    id: number;
    isDeleted: boolean;
    song?: { id?: number; slug?: string; isDeleted: boolean };
  } = {
    id: arrangementId,
    isDeleted: false,
  };
  if (songSlugOrId) {
    where["song"] = {
      ...selectSlugOrId(songSlugOrId),
      isDeleted: false,
    };
  }

  return prisma.songArrangement.findFirst({
    where,
    include: {
      units: includeUnits ? { orderBy: { order: "asc" } } : false,
      audios: { orderBy: { order: "asc" } },
      song: includeSong
        ? {
            include: {
              tags: {
                select: {
                  id: true,
                  name: true,
                  group: { select: { id: true, name: true, color: true } },
                },
              },
              arrangements: {
                where: { isDeleted: false, isServiceArrangement: false },
              },
            },
          }
        : false,
    },
  });
}

export async function createArrangementWithSong(
  arrangement: ClientArrangement,
  {
    includeSong = false,
    includeUnits = false,
  }: {
    includeSong?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientArrangement> {
  if (!arrangement.song) {
    throw new Error("Arrangement must have a song to create an arrangement");
  }
  const songSlug = await slugForSong(arrangement.song.title);
  if (!arrangement.units || arrangement.units.length === 0) {
    throw new Error("Arrangement must have at least one unit");
  }
  const lyrics = arrangement.units
    .map((unit) => getLyrics(unit.content))
    .join("\n");
  const title = arrangement.song.title;
  const artist =
    arrangement.song.artist && arrangement.song.artist.trim().length
      ? arrangement.song.artist
      : null;

  const createdArrangement = await prisma.songArrangement.create({
    data: {
      name: arrangement.name,
      key: arrangement.key,
      isDefault: arrangement.isDefault,
      youtubeUrl: arrangement.youtubeUrl ?? null,
      song: {
        connectOrCreate: {
          where: { slug: songSlug },
          create: {
            slug: songSlug,
            title,
            artist,
            lyrics,
          },
        },
      },
      units: {
        createMany: {
          data: arrangement.units,
        },
      },
      audios: arrangement.audios?.length
        ? { createMany: { data: arrangement.audios.map(({ id, ...a }) => a) } }
        : undefined,
    },
    include: {
      song: true,
      units: includeUnits ? { orderBy: { order: "asc" } } : false,
      audios: { orderBy: { order: "asc" } },
    },
  });
  if (createdArrangement.song.isDeleted) {
    // Restore the song if it was previously deleted
    await prisma.song.update({
      where: { id: createdArrangement.song.id },
      data: {
        isDeleted: false,
        slug: songSlug,
        title,
        artist,
        lyrics,
      },
    });
    await makeArrangementDefault(createdArrangement.id);
  }
  if (!includeSong) {
    const { song, ...rest } = createdArrangement;
    return rest;
  }
  return createdArrangement;
}

export async function updateArrangement(
  arrangement: ClientArrangement,
  {
    includeSong = false,
    includeUnits = false,
  }: {
    includeSong?: boolean;
    includeUnits?: boolean;
  } = {}
): Promise<ClientArrangement> {
  if (!arrangement.id) {
    throw new Error("Arrangement ID is required to update an arrangement");
  }
  const baseArrangement = await retrieveArrangement(arrangement.id, {
    includeSong,
    includeUnits,
  });
  if (!baseArrangement) {
    throw new Error("Arrangement not found");
  }
  const arrangementData: {
    id: number;
    name?: string | null;
    key?: string;
    youtubeUrl?: string | null;
    units?: any;
  } = {
    id: arrangement.id,
    name: arrangement.name,
    key: arrangement.key,
    youtubeUrl: arrangement.youtubeUrl || null,
  };

  const song = arrangement.song ?? baseArrangement.song!;
  const songData: {
    title: string;
    artist: string | null;
    lyrics?: string;
  } = {
    title: song.title,
    artist: song.artist,
  };
  if (arrangement.isDefault && arrangement.units) {
    songData.lyrics = arrangement.units
      .map((unit) => getLyrics(unit.content))
      .join("\n");
  }

  if (arrangement.units) {
    arrangementData["units"] = {
      deleteMany: {},
      createMany: {
        data: arrangement.units,
      },
    };
  }
  await prisma.song.update({
    where: { slug: song.slug },
    data: songData,
  });
  if (arrangement.audios !== undefined) {
    const keptIds = arrangement.audios.filter((a) => a.id).map((a) => a.id!);
    await prisma.arrangementAudio.deleteMany({
      where: {
        arrangementId: arrangement.id,
        ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}),
      },
    });
    for (const audio of arrangement.audios) {
      if (audio.id) {
        await prisma.arrangementAudio.update({
          where: { id: audio.id },
          data: { label: audio.label, order: audio.order },
        });
      } else {
        await prisma.arrangementAudio.create({
          data: { arrangementId: arrangement.id!, url: audio.url, label: audio.label, order: audio.order },
        });
      }
    }
  }
  return prisma.songArrangement.update({
    where: { id: arrangement.id },
    data: arrangementData,
    include: {
      song: includeSong
        ? { include: { arrangements: { where: { isDeleted: false } } } }
        : false,
      units: includeUnits ? { orderBy: { order: "asc" } } : false,
      audios: { orderBy: { order: "asc" } },
    },
  });
}

export async function makeArrangementDefault(
  arrangementId: number
): Promise<void> {
  const arrangement = await prisma.songArrangement.findUnique({
    where: { id: arrangementId },
    include: {
      song: {
        include: {
          arrangements: {
            where: { isDefault: true },
          },
        },
      },
    },
  });
  if (!arrangement) throw new Error("Arrangement not found");
  if (!arrangement.song) throw new Error("Song not found");

  const updates = [
    prisma.songArrangement.update({
      where: { id: arrangementId },
      data: { isDefault: true },
    }),
  ];
  if (arrangement.song.arrangements.length !== 0) {
    const defaultArrangement = arrangement.song.arrangements.find(
      (arr) => arr.isDefault
    );
    if (defaultArrangement) {
      updates.push(
        prisma.songArrangement.update({
          where: { id: defaultArrangement.id },
          data: { isDefault: false },
        })
      );
    }
  }

  await prisma.$transaction(updates);
}

export async function moveArrangement(
  arrangementId: number,
  songSlugOrId: string | number
): Promise<void> {
  const [song, arrangement] = await Promise.all([
    retrieveSong(songSlugOrId, {
      includeArrangements: true,
    }),
    retrieveArrangement(arrangementId, {
      includeSong: true,
    }),
  ]);

  if (!song) throw new Error("Destination song not found");
  if (!arrangement) throw new Error("Arrangement not found");
  if (!arrangement.song) throw new Error("Original song not found");
  const originalSongId = arrangement.song.id!;
  const wasDefault = arrangement.isDefault;

  const isDefault = song.arrangements!.length === 0;
  await prisma.songArrangement.update({
    where: { id: arrangementId },
    data: { isDefault, songId: song.id },
  });

  if (wasDefault) {
    await updateDefaultArrangement(originalSongId);
  }
}

async function updateDefaultArrangement(songId: number): Promise<void> {
  const originalSong = await retrieveSong(songId, {
    includeArrangements: true,
    includeServiceArrangements: true,
  });
  if (!originalSong || !originalSong.arrangements) {
    return;
  }
  const notDeletedArrangements = originalSong.arrangements.filter(
    (arr) => !arr.isDeleted && !arr.isServiceArrangement
  );

  if (notDeletedArrangements.length > 0) {
    await prisma.songArrangement.update({
      where: { id: notDeletedArrangements[0].id },
      data: { isDefault: true },
    });
  } else {
    await prisma.song.update({
      where: { id: songId },
      data: { isDeleted: true },
    });
  }
}

export async function deleteDefaultArrangement(
  songSlugOrId: string | number
): Promise<boolean> {
  const song = await retrieveSong(songSlugOrId, {
    includeArrangements: true,
  });
  if (!song?.arrangements?.length) {
    console.error(
      `No arrangements found for song ${songSlugOrId}. Cannot delete default arrangement`
    );
    return false;
  }
  const defaultArrangement = song.arrangements.find(
    (arr) => arr.isDefault && !arr.isDeleted
  );
  if (defaultArrangement) {
    await prisma.songArrangement.update({
      where: {
        id: defaultArrangement.id,
        isDefault: true,
        isDeleted: false,
      },
      data: { isDeleted: true },
      include: {
        song: true,
      },
    });
  } else {
    console.error(
      `No default arrangement found for song ${songSlugOrId}. Cannot delete default arrangement`
    );
    return false;
  }
  await updateDefaultArrangement(song.id!);
  return true;
}

export async function deleteArrangement(
  arrangementId: number
): Promise<boolean> {
  const arrangement = await prisma.songArrangement.update({
    where: { id: arrangementId },
    data: { isDeleted: true },
    include: {
      song: true,
    },
  });

  if (!arrangement?.song) {
    console.error(
      `Arrangement with ID ${arrangementId} not found or already deleted`
    );
    return false;
  }
  await updateDefaultArrangement(arrangement.song.id);
  return true;
}

export async function duplicateArrangement(
  arrangementId: number
): Promise<ClientArrangement> {
  const arrangement = await retrieveArrangement(arrangementId, {
    includeUnits: true,
    includeSong: true,
  });
  if (!arrangement || !arrangement.song) {
    throw new Error("Arrangement or song not found");
  }

  const duplicatedArrangement = await prisma.songArrangement.create({
    data: {
      name: arrangement.name ? `${arrangement.name} (Copy)` : null,
      key: arrangement.key,
      isDefault: false,
      song: {
        connect: { id: arrangement.song.id },
      },
      units: {
        createMany: {
          data:
            arrangement.units?.map(({ arrangementId, id, ...unit }) => unit) ??
            [],
        },
      },
      audios: arrangement.audios?.length
        ? { createMany: { data: arrangement.audios.map(({ id, ...a }) => a) } }
        : undefined,
    },
    include: {
      song: true,
      units: {
        orderBy: { order: "asc" },
      },
      audios: { orderBy: { order: "asc" } },
    },
  });

  return duplicatedArrangement;
}

const arrangementIncludeFields = {
  song: true,
  units: { orderBy: { order: "asc" } },
  audios: { orderBy: { order: "asc" } },
  originalArrangement: {
    select: {
      youtubeUrl: true,
      audios: { orderBy: { order: "asc" } },
    },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hydrateArrangement(row: any): ClientArrangement {
  return {
    ...row,
    youtubeUrl: row.youtubeUrl ?? row.originalArrangement?.youtubeUrl ?? null,
    audios: row.audios?.length ? row.audios : row.originalArrangement?.audios ?? [],
  };
}

export async function retrieveService(
  slugOrId: string | number
): Promise<ClientService | null> {
  const service = await prisma.service.findFirst({
    where: {
      ...selectSlugOrId(slugOrId),
      isDeleted: false,
    },
  });

  if (!service) return null;

  const adjacentSelect = { select: { slug: true, title: true, date: true } } as const;
  const [prevService, nextService] = await Promise.all([
    prisma.service.findFirst({
      where: { isDeleted: false, date: { lt: service.date } },
      orderBy: { date: "desc" },
      ...adjacentSelect,
    }),
    prisma.service.findFirst({
      where: { isDeleted: false, date: { gt: service.date } },
      orderBy: { date: "asc" },
      ...adjacentSelect,
    }),
  ]);

  const rawPlan = service.plan as ServicePlan | null;

  // Toda música do plano referencia um SongArrangement real por id — resolvemos
  // todos de uma vez (em vez de por uma relação de tabela) pra hidratar o plano.
  const arrangementIds = new Set<number>();
  for (const section of rawPlan?.sections ?? []) {
    for (const unit of section.units) {
      if (unit.type === "SONG" && unit.arrangementId != null) arrangementIds.add(unit.arrangementId);
    }
  }

  const arrangementRows = arrangementIds.size
    ? await prisma.songArrangement.findMany({
        where: { id: { in: [...arrangementIds] }, isDeleted: false },
        include: arrangementIncludeFields,
      })
    : [];
  const arrangementById = new Map<number, ClientArrangement>(
    arrangementRows.map((row) => [row.id, hydrateArrangement(row)])
  );

  const plan: ServicePlan | null = rawPlan
    ? {
        ...rawPlan,
        sections: rawPlan.sections.map((section) => ({
          // Planos salvos antes da introdução de ids estáveis não têm `id`/`clientId`
          // gravados no JSON — preenchemos aqui pra que todo plano lido tenha ids
          // completos a partir de agora (persistidos de volta no próximo save).
          ...section,
          id: section.id ?? crypto.randomUUID(),
          units: section.units.map((unit) => {
            const withClientId = unit.clientId ? unit : { ...unit, clientId: crypto.randomUUID() };
            if (withClientId.type === "SONG" && withClientId.arrangementId) {
              return { ...withClientId, arrangement: arrangementById.get(withClientId.arrangementId) ?? null };
            }
            return withClientId;
          }),
        })),
      }
    : null;

  // `units` continua existindo como projeção derivada do plano (só as músicas, em
  // ordem sequencial) pra não quebrar quem ainda lê isso — ex: HolyricsSetlistButton
  // e a aba Cifras. Não é mais uma tabela à parte, é sempre recalculada na leitura.
  let order = 1;
  const flatUnits: ClientServiceUnit[] = (plan?.sections ?? [])
    .flatMap((section) => section.units)
    .filter((unit) => unit.type === "SONG" && unit.arrangement != null)
    .map((unit) => ({ ...unit, order: order++ }));

  return {
    ...service,
    prevService: prevService ?? null,
    nextService: nextService ?? null,
    units: flatUnits,
    plan,
  } as ClientService;
}

export async function retrieveRecentServices(limit = 8): Promise<RecentServiceEntry[]> {
  const services = await prisma.service.findMany({
    where: { isDeleted: false },
    orderBy: { date: "desc" },
    take: limit,
    select: { slug: true, title: true, date: true, worshipLeader: true, plan: true },
  });

  const arrangementIds = new Set<number>();
  for (const service of services) {
    const plan = service.plan as ServicePlan | null;
    for (const section of plan?.sections ?? []) {
      for (const unit of section.units) {
        if (unit.type === "SONG" && unit.arrangementId != null) arrangementIds.add(unit.arrangementId);
      }
    }
  }
  const arrangements = arrangementIds.size
    ? await prisma.songArrangement.findMany({
        where: { id: { in: [...arrangementIds] } },
        select: { id: true, song: { select: { title: true } } },
      })
    : [];
  const titleByArrangementId = new Map(arrangements.map((a) => [a.id, a.song?.title]));

  return services.map((service) => {
    const plan = service.plan as ServicePlan | null;
    const songs = (plan?.sections ?? [])
      .flatMap((section) => section.units)
      .filter((unit) => unit.type === "SONG" && unit.arrangementId != null)
      .map((unit) => titleByArrangementId.get(unit.arrangementId!))
      .filter((title): title is string => title != null);

    return {
      slug: service.slug,
      title: service.title,
      date: service.date,
      worshipLeader: service.worshipLeader,
      songs,
    };
  });
}

export async function retrieveServices(): Promise<ClientService[]> {
  const services = await prisma.service.findMany({ where: { isDeleted: false } });
  return services as unknown as ClientService[];
}

// Lançado quando o culto foi salvo por outra pessoa entre o momento em que o
// client carregou e o momento em que tentou salvar — ver createOrUpdateService.
export class ServiceConflictError extends Error {
  constructor() {
    super("Service was updated by someone else since it was loaded");
    this.name = "ServiceConflictError";
  }
}

export async function createOrUpdateService(
  service: ClientService
): Promise<ClientService> {
  const serviceSlug = service.slug?.length ? service.slug : await slugForService();

  const serviceId = await prisma.$transaction(async (tx) => {
    const existing = await tx.service.findUnique({
      where: { slug: serviceSlug },
      select: { plan: true, updatedAt: true },
    });

    // Culto já existente: o client precisa ter carregado a versão mais recente.
    // A checagem aqui é só pra falhar cedo sem gastar trabalho de sincronizar
    // arranjos — a garantia de verdade, atômica, é o updateMany mais abaixo.
    if (existing && service.updatedAt && existing.updatedAt.getTime() !== new Date(service.updatedAt).getTime()) {
      throw new ServiceConflictError();
    }

    const previousPlan = (existing?.plan as ServicePlan | null) ?? null;

    const resolvedPlan = service.plan
      ? await syncPlanArrangements(tx, service.plan, previousPlan)
      : null;

    const data = {
      title: service.title,
      worshipLeader: service.worshipLeader,
      date: service.date,
      preacher: service.preacher ?? null,
      sermonTheme: service.sermonTheme ?? null,
      sermonReference: service.sermonReference ?? null,
      plan: (resolvedPlan as object) ?? Prisma.DbNull,
    };

    if (!existing) {
      const created = await tx.service.create({ data: { ...data, slug: serviceSlug, isDeleted: false } });
      return created.id;
    }

    // updateMany com `updatedAt` na condição é o que torna a checagem de
    // conflito atômica: se outra transação já commitou uma mudança entre a
    // leitura acima e este update, a condição não bate mais e count vem 0 —
    // sem essa segunda checagem, duas transações concorrentes que leram o
    // mesmo updatedAt poderiam as duas passar pela checagem acima e a segunda
    // sobrescrever a primeira sem avisar ninguém.
    const result = await tx.service.updateMany({
      where: { slug: serviceSlug, updatedAt: existing.updatedAt },
      data,
    });
    if (result.count === 0) throw new ServiceConflictError();

    const current = await tx.service.findUniqueOrThrow({ where: { slug: serviceSlug }, select: { id: true } });
    return current.id;
  });

  const retService = await retrieveService(serviceId);
  if (!retService) throw new Error("Service not found after creation or update");
  return retService;
}

// O JSON do plano guarda só a "forma" do item (ids, tipo, arrangementId, duração, etc.)
// — o conteúdo de arranjo/música em si nunca é lido de volta do JSON, é sempre resolvido
// do banco em retrieveService(), pra nunca correr o risco de ficar dessincronizado.
function stripUnitForPersistence(unit: ClientServiceUnit) {
  return {
    clientId: unit.clientId,
    type: unit.type,
    arrangementId: unit.arrangementId ?? null,
    semitoneTranspose: unit.semitoneTranspose ?? null,
    order: unit.order,
    durationMin: unit.durationMin ?? null,
    label: unit.label ?? null,
    metadata: unit.metadata ?? null,
  };
}

// Diffa o plano sendo salvo contra o plano anteriormente persistido (casando unidades
// pelo `clientId` estável, não por posição) pra decidir quais cópias de arranjo criar,
// reaproveitar ou apagar — em vez de recriar tudo a cada save. Devolve o plano com
// `arrangementId` resolvido em cada unidade SONG e sem o objeto `arrangement` pesado.
async function syncPlanArrangements(
  tx: Prisma.TransactionClient,
  newPlan: ServicePlan,
  previousPlan: ServicePlan | null
): Promise<ServicePlan> {
  const previousArrangementIdByClientId = new Map<string, number>();
  const previousArrangementIds = new Set<number>();
  for (const section of previousPlan?.sections ?? []) {
    for (const unit of section.units) {
      if (unit.type === "SONG" && unit.arrangementId != null) {
        previousArrangementIdByClientId.set(unit.clientId, unit.arrangementId);
        previousArrangementIds.add(unit.arrangementId);
      }
    }
  }

  // Só reaproveitamos uma cópia existente se a música não mudou — pra isso, precisamos
  // saber a que música cada cópia anterior pertencia de fato.
  const songIdByArrangementId = new Map<number, number>();
  if (previousArrangementIds.size > 0) {
    const rows = await tx.songArrangement.findMany({
      where: { id: { in: [...previousArrangementIds] } },
      select: { id: true, songId: true },
    });
    for (const row of rows) songIdByArrangementId.set(row.id, row.songId);
  }

  const keptArrangementIds = new Set<number>();

  const sections = [];
  for (const section of newPlan.sections) {
    const units = [];
    for (const unit of section.units) {
      if (unit.type !== "SONG" || !unit.arrangement?.songId) {
        units.push(stripUnitForPersistence(unit));
        continue;
      }

      const previousArrangementId = previousArrangementIdByClientId.get(unit.clientId) ?? null;
      const sameSong =
        previousArrangementId != null &&
        songIdByArrangementId.get(previousArrangementId) === unit.arrangement.songId;

      let arrangementId: number;
      if (sameSong && previousArrangementId != null) {
        await tx.songArrangement.update({
          where: { id: previousArrangementId },
          data: { name: unit.arrangement.name, key: unit.arrangement.key },
        });
        arrangementId = previousArrangementId;
      } else {
        const originalArrangementId = unit.arrangement.originalArrangementId ?? null;

        let unitsToCopy = unit.arrangement.units?.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ id: _id, arrangementId: _aId, ...u }) => u
        );
        if (!unitsToCopy?.length && originalArrangementId != null) {
          const original = await tx.songArrangement.findUnique({
            where: { id: originalArrangementId },
            select: { units: { orderBy: { order: "asc" } } },
          });
          unitsToCopy = original?.units?.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ id: _id, arrangementId: _aId, ...u }) => u
          );
        }

        const created = await tx.songArrangement.create({
          data: {
            name: unit.arrangement.name,
            key: unit.arrangement.key,
            isServiceArrangement: true,
            song: { connect: { id: unit.arrangement.songId } },
            ...(originalArrangementId != null && {
              originalArrangement: { connect: { id: originalArrangementId } },
            }),
            ...(unitsToCopy?.length ? { units: { createMany: { data: unitsToCopy } } } : {}),
          },
        });
        arrangementId = created.id;
      }

      keptArrangementIds.add(arrangementId);
      units.push({ ...stripUnitForPersistence(unit), arrangementId });
    }
    sections.push({ ...section, units });
  }

  // Cópias que existiam antes mas não sobraram referenciadas por nenhuma unidade agora
  // (música removida, ou trocada por outra no mesmo item) — órfãs, podem ser apagadas.
  const orphanIds = [...previousArrangementIds].filter((id) => !keptArrangementIds.has(id));
  if (orphanIds.length > 0) {
    await tx.songArrangement.deleteMany({ where: { id: { in: orphanIds } } });
  }

  return { ...newPlan, sections };
}

export async function deleteService(
  slugOrId: string | number
): Promise<boolean> {
  const service = await prisma.service.findFirst({
    where: {
      ...selectSlugOrId(slugOrId),
      isDeleted: false,
    },
  });
  if (!service) {
    console.error("Service not found");
    return false;
  }
  await prisma.service.update({
    where: { id: service.id },
    data: { isDeleted: true },
  });
  return true;
}

export async function retrieveTemplates(): Promise<ClientServiceTemplate[]> {
  return prisma.serviceTemplate.findMany({ orderBy: { name: "asc" } });
}

export async function retrieveTemplate(id: number): Promise<ClientServiceTemplate | null> {
  return prisma.serviceTemplate.findUnique({ where: { id } });
}

export async function createOrUpdateTemplate(
  template: ClientServiceTemplate
): Promise<ClientServiceTemplate> {
  const data = { name: template.name, items: template.items as Prisma.InputJsonValue };
  if (template.id) {
    return prisma.serviceTemplate.update({ where: { id: template.id }, data });
  }
  return prisma.serviceTemplate.create({ data });
}

export async function deleteTemplate(id: number): Promise<boolean> {
  await prisma.serviceTemplate.delete({ where: { id } }).catch(() => false);
  return true;
}

function limitLyrics(
  song: ClientSong,
  limitLines: number,
  forceIncludeFirstLine: boolean,
  query: string
): ClientSong {
  let lineLimit = limitLines;
  const lyricsLines = song.lyrics.split("\n");
  const includedLines = [];
  if (forceIncludeFirstLine) {
    includedLines.push(lyricsLines[0]);
    lineLimit--;
  }
  if (query) {
    lineLimit = extractMatchingLines(
      lyricsLines,
      query,
      lineLimit,
      includedLines
    );
  } else {
    includedLines.push(...lyricsLines.slice(1, lineLimit + 1));
  }
  return {
    ...song,
    lyrics: includedLines.join("\n"),
  };
}

function extractMatchingLines(
  lyricsLines: string[],
  query: string,
  lineLimit: number,
  includedLines: any[]
): number {
  let prevLineIncluded = true;
  for (const line of lyricsLines) {
    if (lineLimit <= 0) break;
    if (line.toLowerCase().includes(query.toLowerCase())) {
      if (!prevLineIncluded) {
        includedLines.push("...");
        lineLimit--;
      }
      includedLines.push(line);
      lineLimit--;
      prevLineIncluded = true;
    } else {
      prevLineIncluded = false;
    }
  }
  return lineLimit;
}

function containsOnlyDigits(title: string) {
  return /^\d+$/.test(title);
}

function selectSlugOrId(slugOrId: string | number): {
  slug?: string;
  id?: number;
} {
  if (typeof slugOrId === "number") {
    return { id: slugOrId };
  } else if (containsOnlyDigits(slugOrId)) {
    return { id: parseInt(slugOrId, 10) };
  } else {
    return { slug: slugOrId };
  }
}

export async function retrieveStats(): Promise<StatsData> {
  const [totalSongs, services] = await Promise.all([
    prisma.song.count({ where: { isDeleted: false } }),
    prisma.service.findMany({
      where: { isDeleted: false },
      select: { slug: true, worshipLeader: true, plan: true },
    }),
  ]);

  const arrangementIds = new Set<number>();
  for (const service of services) {
    const plan = service.plan as ServicePlan | null;
    for (const section of plan?.sections ?? []) {
      for (const unit of section.units) {
        if (unit.type === "SONG" && unit.arrangementId != null) arrangementIds.add(unit.arrangementId);
      }
    }
  }
  const arrangements = arrangementIds.size
    ? await prisma.songArrangement.findMany({
        where: { id: { in: [...arrangementIds] } },
        select: { id: true, song: { select: { slug: true, title: true } } },
      })
    : [];
  const songByArrangementId = new Map(arrangements.map((a) => [a.id, a.song]));

  const songMap = new Map<string, SongStat>();
  const leaderMap = new Map<string, { services: Set<string>; songs: Map<string, SongStat> }>();

  for (const service of services) {
    const plan = service.plan as ServicePlan | null;
    const leaderName = service.worshipLeader?.trim() || "Sem dirigente";

    for (const section of plan?.sections ?? []) {
      for (const unit of section.units) {
        if (unit.type !== "SONG" || unit.arrangementId == null) continue;
        const song = songByArrangementId.get(unit.arrangementId);
        if (!song) continue;

        // Global ranking
        const global = songMap.get(song.slug);
        if (global) global.count++;
        else songMap.set(song.slug, { slug: song.slug, title: song.title, count: 1 });

        // By leader
        if (!leaderMap.has(leaderName)) leaderMap.set(leaderName, { services: new Set(), songs: new Map() });
        const leader = leaderMap.get(leaderName)!;
        leader.services.add(service.slug);
        const leaderSong = leader.songs.get(song.slug);
        if (leaderSong) leaderSong.count++;
        else leader.songs.set(song.slug, { slug: song.slug, title: song.title, count: 1 });
      }
    }
  }

  const topSongs = [...songMap.values()].sort((a, b) => b.count - a.count).slice(0, 30);

  const byLeader: LeaderStat[] = [...leaderMap.entries()]
    .map(([name, { services, songs }]) => ({
      name,
      totalServices: services.size,
      topSongs: [...songs.values()].sort((a, b) => b.count - a.count).slice(0, 10),
    }))
    .sort((a, b) => b.totalServices - a.totalServices);

  return { totalSongs, topSongs, byLeader };
}

export async function retrieveTagGroups(): Promise<ClientTagGroup[]> {
  const groups = await prisma.tagGroup.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      tags: {
        select: { id: true, name: true, _count: { select: { songs: true } } },
        orderBy: { name: "asc" },
      },
    },
  });
  return groups.map((group) => ({
    ...group,
    tags: group.tags.map(({ _count, ...tag }) => ({
      ...tag,
      songCount: _count.songs,
    })),
  }));
}
