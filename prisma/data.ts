import { joinLeaderNames, normalizeLeaders, type ServiceLeaderEntry } from "@/lib/service-leaders";
import { Prisma, ServiceScope, UserRole } from "@prisma/client";
import { timingSafeEqual } from "crypto";
import { getLyrics } from "@/chopro/music";
import {
  canEditChurchServices,
  canManageChurchServices,
  canViewChurchServices,
} from "@/lib/permissions";
import { summarizeServicePlan } from "@/lib/service-list";
import { summarizeSermons } from "@/lib/sermon-summary";
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
  ServiceListItem,
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

// Ordem dos chips de uma música: a do grupo e, dentro dele, a da tag.
const SONG_TAG_ORDER: Prisma.TagOrderByWithRelationInput[] = [{ group: { order: "asc" } }, { order: "asc" }, { name: "asc" }];

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
        orderBy: SONG_TAG_ORDER,
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
    const usage = await retrieveSongUsage(songIds);
    songs = songs.map((song) => {
      const stat = song.id !== undefined ? usage.get(song.id) : undefined;
      return { ...song, lastUsedAt: stat?.lastUsedAt ?? null, usageCount: stat?.usageCount ?? 0 };
    });
  }

  return songs;
}

// Último uso e quantidade de usos de cada música, lidos de Service.plan (a fonte
// de verdade das liturgias; a tabela ServiceUnit não é mais escrita — ver
// docs/arquitetura-plano-culto.md). Mesma fonte de retrieveStats.
export async function retrieveSongUsage(
  songIds: number[]
): Promise<Map<number, { lastUsedAt: Date; usageCount: number }>> {
  const usage = new Map<number, { lastUsedAt: Date; usageCount: number }>();
  if (songIds.length === 0) return usage;

  const services = await prisma.service.findMany({
    where: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED" },
    select: { date: true, plan: true },
  });
  const servicesArrangementIds = services.map((service) => {
    const ids = new Set<number>();
    for (const section of (service.plan as ServicePlan | null)?.sections ?? []) {
      for (const unit of section.units) {
        if (unit.type === "SONG" && unit.arrangementId != null) ids.add(unit.arrangementId);
      }
    }
    return ids;
  });
  const allArrangementIds = new Set(servicesArrangementIds.flatMap((ids) => [...ids]));
  if (allArrangementIds.size === 0) return usage;

  const arrangements = await prisma.songArrangement.findMany({
    where: { id: { in: [...allArrangementIds] }, songId: { in: songIds } },
    select: { id: true, songId: true },
  });
  const songByArrangementId = new Map(arrangements.map((a) => [a.id, a.songId]));

  services.forEach((service, index) => {
    const songsInService = new Set<number>();
    for (const arrangementId of servicesArrangementIds[index]) {
      const songId = songByArrangementId.get(arrangementId);
      if (songId !== undefined) songsInService.add(songId);
    }
    for (const songId of songsInService) {
      const current = usage.get(songId);
      usage.set(songId, {
        lastUsedAt: !current || service.date > current.lastUsedAt ? service.date : current.lastUsedAt,
        usageCount: (current?.usageCount ?? 0) + 1,
      });
    }
  });
  return usage;
}

export async function restoreSong(slug: string) {
  return prisma.song.update({
    where: { slug },
    data: { isDeleted: false },
  });
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
        orderBy: SONG_TAG_ORDER,
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

// Para uma música adicionada à liturgia como placeholder, sem nenhum arranjo
// ainda (nada pra ser "o original"): cria um arranjo mínimo, sem cifra, só
// pra servir de lugar onde a primeira referência de mídia pode ser gravada.
// Se a música já ganhou um arranjo nesse meio tempo, reaproveita em vez de
// duplicar.
export async function createMinimalArrangementForSong(
  songSlugOrId: string | number
): Promise<ClientArrangement> {
  const existing = await prisma.songArrangement.findFirst({
    where: {
      song: selectSlugOrId(songSlugOrId),
      isServiceArrangement: false,
      isDeleted: false,
    },
    include: { audios: { orderBy: { order: "asc" } } },
  });
  if (existing) return existing;

  const song = await prisma.song.findFirst({
    where: selectSlugOrId(songSlugOrId),
  });
  if (!song) {
    throw new Error("Song not found");
  }

  return prisma.songArrangement.create({
    data: {
      songId: song.id,
      key: "C",
      isDefault: true,
      isServiceArrangement: false,
    },
    include: { audios: { orderBy: { order: "asc" } } },
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
                  orderBy: SONG_TAG_ORDER,
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
                orderBy: SONG_TAG_ORDER,
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
    // true para quem só edita cifra/dados do arranjo (ex.: o editor de
    // liturgia) e nunca mexe em vídeo/áudio — preserva o que já está
    // salvo em vez de sobrescrever com o que o chamador carregava, que
    // pode estar desatualizado se um vídeo foi inserido por outro caminho
    // (ServiceMediaReferences) um instante antes deste save.
    preserveMedia = false,
  }: {
    includeSong?: boolean;
    includeUnits?: boolean;
    preserveMedia?: boolean;
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
  };
  if (!preserveMedia) {
    arrangementData.youtubeUrl = arrangement.youtubeUrl || null;
  }

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
  if (arrangement.audios !== undefined && !preserveMedia) {
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

/** Liturgias (slugs) cujo plano usa o arranjo `arrangementId`. Uma cópia de arranjo pertence a uma só. */
export async function retrieveServiceSlugsUsingArrangement(arrangementId: number): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ slug: string }[]>`
    SELECT slug FROM "Service"
    WHERE "isDeleted" = false
      AND plan IS NOT NULL
      AND jsonb_path_exists(
        plan::jsonb,
        '$.sections[*].units[*] ? (@.arrangementId == $id)',
        jsonb_build_object('id', ${arrangementId}::int)
      )`;
  return rows.map((row) => row.slug);
}

/**
 * Grava só a cifra de uma cópia de arranjo de liturgia. Não toca na música (título, autor, letra),
 * no original nem nas mídias: é o que quem edita a liturgia, mas não as músicas, pode alterar.
 */
export async function updateServiceArrangementUnits(
  arrangementId: number,
  units: NonNullable<ClientArrangement["units"]>
): Promise<ClientArrangement> {
  return prisma.songArrangement.update({
    where: { id: arrangementId },
    data: { units: { deleteMany: {}, createMany: { data: units as any } } },
    include: {
      song: { include: { arrangements: { where: { isDeleted: false } } } },
      units: { orderBy: { order: "asc" } },
      audios: { orderBy: { order: "asc" } },
    },
  }) as unknown as Promise<ClientArrangement>;
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

// Operações granulares de áudio de referência: cada ação (adicionar, remover,
// renomear) toca só o item em questão, nunca o array inteiro — diferente do
// PATCH antigo (que reenviava/apagava tudo que não estivesse no array),
// permitindo que duas abas editando a mesma música não se sobrescrevam.

export async function addArrangementAudio(
  arrangementId: number,
  data: { url: string; label: string; order?: number }
) {
  const order =
    data.order ??
    (await prisma.arrangementAudio.count({ where: { arrangementId } }));
  return prisma.arrangementAudio.create({
    data: { arrangementId, url: data.url, label: data.label, order },
  });
}

export async function removeArrangementAudio(
  arrangementId: number,
  audioId: number
) {
  const audio = await prisma.arrangementAudio.findFirst({
    where: { id: audioId, arrangementId },
  });
  if (!audio) return null;
  await prisma.arrangementAudio.delete({ where: { id: audioId } });
  return audio;
}

export async function renameArrangementAudio(
  arrangementId: number,
  audioId: number,
  label: string
): Promise<boolean> {
  const { count } = await prisma.arrangementAudio.updateMany({
    where: { id: audioId, arrangementId },
    data: { label },
  });
  return count > 0;
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

export type ServiceViewerContext = {
  userId?: string | null;
  roles?: readonly UserRole[];
  shareToken?: string | null;
};

function timingSafeTokenMatch(expected: string, provided: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function visibleServicesWhere(
  viewerUserId?: string | null,
  scope: ServiceScope = "CHURCH"
): Prisma.ServiceWhereInput {
  if (scope === "PERSONAL") {
    if (!viewerUserId) {
      // No personal services are visible without an authenticated user in list queries
      return { id: -1 };
    }
    return {
      isDeleted: false,
      scope: "PERSONAL",
      OR: [
        { createdById: viewerUserId },
        { shares: { some: { userId: viewerUserId } } },
      ],
    };
  }

  if (!viewerUserId) {
    return { isDeleted: false, scope: "CHURCH", status: "PUBLISHED" };
  }
  return {
    isDeleted: false,
    scope: "CHURCH",
    OR: [
      { status: "PUBLISHED" },
      { status: "DRAFT", createdById: viewerUserId },
      { status: "DRAFT", shares: { some: { userId: viewerUserId } } },
    ],
  };
}

export async function retrieveService(
  slugOrId: string | number,
  viewer?: ServiceViewerContext | string | null
): Promise<ClientService | null> {
  const ctx: ServiceViewerContext | undefined =
    typeof viewer === "string" || viewer === null
      ? { userId: viewer, roles: ["ADMIN"] }
      : viewer;

  const service = await prisma.service.findFirst({
    where: {
      ...selectSlugOrId(slugOrId),
      isDeleted: false,
    },
    include: {
      shares: ctx?.userId
        ? { where: { userId: ctx.userId }, select: { userId: true, permission: true } }
        : false,
      leaders: { orderBy: { order: "asc" }, select: { userId: true, name: true, user: { select: { image: true } } } },
    },
  });

  if (!service) return null;

  let isOwner = false;
  let canEdit = false;
  let canDelete = false;
  let canPublish = false;
  let canManageShareLink = false;
  let canManagePeopleShares = false;
  let allowAdjacentNav = false;

  if (ctx !== undefined) {
    isOwner = Boolean(ctx.userId && service.createdById === ctx.userId);
    const userShare = Array.isArray(service.shares) ? service.shares[0] : undefined;
    const hasValidShareToken = Boolean(
      service.shareToken &&
        ctx.shareToken &&
        timingSafeTokenMatch(service.shareToken, ctx.shareToken)
    );

    if (service.scope === "CHURCH") {
      if (service.status === "PUBLISHED") {
        const hasChurchAccess = canViewChurchServices(ctx.roles);
        if (!hasChurchAccess && !hasValidShareToken) return null;
        if (hasChurchAccess) {
          canEdit = canEditChurchServices(ctx.roles);
          canDelete = canManageChurchServices(ctx.roles);
          canManageShareLink = canManageChurchServices(ctx.roles);
          allowAdjacentNav = true;
        }
      } else {
        // CHURCH DRAFT: visible to creator, explicitly shared collaborators, or valid share link
        if (!isOwner && !userShare && !hasValidShareToken) return null;
        const canCoManageDraft =
          isOwner ||
          (userShare?.permission === "EDIT" && canManageChurchServices(ctx.roles));
        canEdit = isOwner || userShare?.permission === "EDIT";
        canDelete = isOwner && canManageChurchServices(ctx.roles);
        canPublish = canManageChurchServices(ctx.roles) && canCoManageDraft;
        canManageShareLink = canCoManageDraft;
        canManagePeopleShares = canCoManageDraft;
      }
    } else {
      // PERSONAL service
      if (!isOwner && !userShare && !hasValidShareToken) return null;
      canEdit = isOwner || userShare?.permission === "EDIT";
      canDelete = isOwner;
      canManageShareLink = isOwner;
      canManagePeopleShares = isOwner;
    }
  } else {
    // Internal / legacy calls without viewer context only access published church services
    if (service.scope !== "CHURCH" || service.status !== "PUBLISHED") return null;
    canEdit = true;
    canDelete = true;
    allowAdjacentNav = true;
  }

  const adjacentSelect = { select: { slug: true, title: true, date: true } } as const;
  const [prevService, nextService] = allowAdjacentNav
    ? await Promise.all([
        prisma.service.findFirst({
          where: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED", date: { lt: service.date } },
          orderBy: { date: "desc" },
          ...adjacentSelect,
        }),
        prisma.service.findFirst({
          where: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED", date: { gt: service.date } },
          orderBy: { date: "asc" },
          ...adjacentSelect,
        }),
      ])
    : [null, null];

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

  const { shares: _shares, shareToken, leaders: leaderRows, ...serviceFields } = service;
  return {
    ...serviceFields,
    // Culto salvo antes da lista de dirigentes só tem o texto: vira um dirigente sem conta.
    leaders: leaderRows.length
      ? leaderRows.map(({ userId, name }) => ({ userId, name }))
      : service.worshipLeader?.trim()
        ? [{ userId: null, name: service.worshipLeader.trim() }]
        : [],
    leaderPeople: leaderRows.map((l) => ({ userId: l.userId, name: l.name, image: l.user?.image ?? null })),
    shareToken: canManageShareLink ? shareToken : null,
    isOwner,
    canEdit,
    canDelete,
    canPublish,
    canManageShareLink,
    canManagePeopleShares,
    prevService: prevService ?? null,
    nextService: nextService ?? null,
    units: flatUnits,
    plan,
  } as ClientService;
}

export async function retrieveRecentServices(limit = 8): Promise<RecentServiceEntry[]> {
  const services = await prisma.service.findMany({
    where: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED" },
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

export async function retrieveServices(
  viewerUserId?: string | null,
  scope: ServiceScope = "CHURCH"
): Promise<ClientService[]> {
  const services = await prisma.service.findMany({
    where: visibleServicesWhere(viewerUserId, scope),
  });
  return services.map((service) => ({
    ...service,
    shareToken:
      viewerUserId && service.createdById === viewerUserId
        ? service.shareToken
        : null,
  })) as unknown as ClientService[];
}

// Lista de Liturgias: só o que a tela mostra e pesquisa. Não devolve o plano
// (que cresce com o histórico); resolve os arranjos para os títulos das músicas
// numa única consulta.
export async function retrieveServicesList(
  viewerUserId?: string | null,
  scope: ServiceScope = "CHURCH"
): Promise<ServiceListItem[]> {
  const services = await prisma.service.findMany({
    where: visibleServicesWhere(viewerUserId, scope),
    select: {
      slug: true,
      title: true,
      date: true,
      worshipLeader: true,
      leaders: { orderBy: { order: "asc" }, select: { userId: true, name: true, user: { select: { image: true } } } },
      preacher: true,
      sermonTheme: true,
      sermonReference: true,
      status: true,
      scope: true,
      createdById: true,
      plan: true,
      updatedAt: true,
    },
  });
  const summaries = services.map((service) => summarizeServicePlan(service.plan as ServicePlan | null));
  const arrangementIds = [...new Set(summaries.flatMap((summary) => summary.arrangementIds))];
  const arrangements = arrangementIds.length
    ? await prisma.songArrangement.findMany({
        where: { id: { in: arrangementIds } },
        select: { id: true, song: { select: { title: true } } },
      })
    : [];
  const titleByArrangementId = new Map(arrangements.map((a) => [a.id, a.song.title]));

  return services.map(({ plan, createdById, leaders, ...service }, index) => {
    const summary = summaries[index];
    // Pregador, tema e texto vêm do item Sermão do roteiro; as colunas antigas só valem onde o item não diz nada.
    const sermon = summarizeSermons(plan as ServicePlan | null, service);
    return {
      ...service,
      preacher: sermon.preacher,
      sermonTheme: sermon.theme,
      sermonReference: sermon.reference,
      // Culto antigo, sem a lista: o texto do dirigente conta como um nome só.
      leaders: leaders.length ? leaders.map((l) => l.name) : service.worshipLeader?.trim() ? [service.worshipLeader.trim()] : [],
      leaderPeople: leaders.map((l) => ({ userId: l.userId, name: l.name, image: l.user?.image ?? null })),
      isSharedWithMe:
        service.scope === "PERSONAL" &&
        Boolean(viewerUserId) &&
        createdById !== viewerUserId,
      startTime: summary.startTime,
      songCount: summary.songCount,
      songTitles: summary.arrangementIds
        .map((id) => titleByArrangementId.get(id))
        .filter((title): title is string => Boolean(title)),
    };
  });
}

// Lançado quando o culto foi salvo por outra pessoa entre o momento em que o
// client carregou e o momento em que tentou salvar — ver createOrUpdateService.
export class ServiceConflictError extends Error {
  constructor() {
    super("Service was updated by someone else since it was loaded");
    this.name = "ServiceConflictError";
  }
}

export class ServiceSlugExistsError extends Error {
  constructor() {
    super("A service with this slug already exists");
    this.name = "ServiceSlugExistsError";
  }
}

export async function createOrUpdateService(
  service: ClientService,
  options?: {
    mode?: "create" | "update";
    actorUserId?: string | null;
    actorRoles?: readonly UserRole[];
  }
): Promise<ClientService> {
  const serviceSlug = service.slug?.length ? service.slug : await slugForService();

  const serviceId = await prisma.$transaction(async (tx) => {
    const existing = await tx.service.findUnique({
      where: { slug: serviceSlug },
      select: { plan: true, updatedAt: true, status: true, scope: true, createdById: true },
    });

    if (options?.mode === "create" && existing) {
      throw new ServiceSlugExistsError();
    }

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

    // Dirigentes: a lista é a fonte; o texto `worshipLeader` é derivado dela. Cliente antigo,
    // que só manda o texto, continua valendo como um dirigente sem conta.
    const leaders = await resolveLeaders(tx, service.leaders, service.worshipLeader);

    const data = {
      // Título em branco (liturgia pessoal pode não ter) vira "sem título", nunca texto vazio.
      title: service.title?.trim() || null,
      worshipLeader: joinLeaderNames(leaders.map((l) => l.name)),
      date: service.date,
      plan: (resolvedPlan as object) ?? Prisma.DbNull,
      ...(service.status && existing?.scope !== "PERSONAL" ? { status: service.status } : {}),
    };

    if (!existing) {
      const actorExists = options?.actorUserId
        ? await tx.user.findUnique({ where: { id: options.actorUserId }, select: { id: true } })
        : null;
      const targetScope: ServiceScope = service.scope ?? "CHURCH";
      const created = await tx.service.create({
        data: {
          ...data,
          slug: serviceSlug,
          isDeleted: false,
          scope: targetScope,
          status: targetScope === "PERSONAL" ? "PUBLISHED" : (service.status ?? "PUBLISHED"),
          createdById: actorExists?.id ?? null,
        },
      });
      await replaceLeaders(tx, created.id, leaders);
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
    await replaceLeaders(tx, current.id, leaders);
    return current.id;
  });

  const retService = await retrieveService(
    serviceId,
    options?.actorUserId
      ? { userId: options.actorUserId, roles: options.actorRoles ?? ["ADMIN"] }
      : undefined
  );
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
/** Id de usuário só se ele existir; senão nulo (evita erro de chave estrangeira por id velho). */
export async function existingUserId(
  db: Pick<Prisma.TransactionClient, "user">,
  id: string | null | undefined
): Promise<string | null> {
  if (!id) return null;
  const user = await db.user.findUnique({ where: { id }, select: { id: true } });
  return user?.id ?? null;
}

/** Lista final de dirigentes: limpa, sem repetidos e só com contas que existem (as outras viram só o nome). */
async function resolveLeaders(
  db: Pick<Prisma.TransactionClient, "user">,
  leaders: readonly ServiceLeaderEntry[] | null | undefined,
  legacyText: string | null | undefined
): Promise<ServiceLeaderEntry[]> {
  let list = normalizeLeaders(leaders);
  if (list.length === 0 && legacyText?.trim()) list = [{ userId: null, name: legacyText.trim() }];
  const ids = [...new Set(list.map((l) => l.userId).filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return list;
  const found = new Set((await db.user.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((u) => u.id));
  return list.map((l) => (l.userId && !found.has(l.userId) ? { ...l, userId: null } : l));
}

/**
 * Troca a lista de dirigentes de uma liturgia (edição rápida pela lista) e devolve o texto derivado,
 * que também é gravado em `Service.worshipLeader`.
 */
export async function setServiceLeaders(
  serviceId: number,
  entries: readonly ServiceLeaderEntry[]
): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const leaders = await resolveLeaders(tx, entries, null);
    await replaceLeaders(tx, serviceId, leaders);
    const worshipLeader = joinLeaderNames(leaders.map((l) => l.name));
    await tx.service.update({ where: { id: serviceId }, data: { worshipLeader } });
    return worshipLeader;
  });
}

async function replaceLeaders(tx: Prisma.TransactionClient, serviceId: number, leaders: readonly ServiceLeaderEntry[]) {
  await tx.serviceLeader.deleteMany({ where: { serviceId } });
  if (leaders.length === 0) return;
  await tx.serviceLeader.createMany({
    data: leaders.map((l, index) => ({ serviceId, userId: l.userId, name: l.name, order: index })),
  });
}

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

  // Só reaproveitamos uma cópia existente se nem a música nem o arranjo
  // original escolhido mudaram — senão a cópia continuaria com a cifra e o
  // originalArrangementId do arranjo antigo, mesmo trocando pra outro na UI.
  const arrangementInfoById = new Map<number, { songId: number; originalArrangementId: number | null }>();
  if (previousArrangementIds.size > 0) {
    const rows = await tx.songArrangement.findMany({
      where: { id: { in: [...previousArrangementIds] } },
      select: { id: true, songId: true, originalArrangementId: true },
    });
    for (const row of rows) {
      arrangementInfoById.set(row.id, { songId: row.songId, originalArrangementId: row.originalArrangementId });
    }
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
      const previousInfo = previousArrangementId != null ? arrangementInfoById.get(previousArrangementId) : undefined;
      const sameArrangementSource =
        previousInfo != null &&
        previousInfo.songId === unit.arrangement.songId &&
        previousInfo.originalArrangementId === (unit.arrangement.originalArrangementId ?? null);

      let arrangementId: number;
      if (sameArrangementSource && previousArrangementId != null) {
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
  slugOrId: string | number,
  viewer?: ServiceViewerContext | string | null
): Promise<boolean> {
  const service = await retrieveService(slugOrId, viewer);
  if (!service || !service.id || !service.canDelete) {
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
      where: { isDeleted: false, scope: "CHURCH", status: "PUBLISHED" },
      select: { slug: true, worshipLeader: true, leaders: { orderBy: { order: "asc" }, select: { name: true } }, plan: true },
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
    // Cada dirigente do culto conta; sem nenhum, "Sem dirigente".
    const leaderNames = service.leaders.length
      ? service.leaders.map((l) => l.name)
      : [service.worshipLeader?.trim() || "Sem dirigente"];

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
        for (const leaderName of leaderNames) {
          if (!leaderMap.has(leaderName)) leaderMap.set(leaderName, { services: new Set(), songs: new Map() });
          const leader = leaderMap.get(leaderName)!;
          leader.services.add(service.slug);
          const leaderSong = leader.songs.get(song.slug);
          if (leaderSong) leaderSong.count++;
          else leader.songs.set(song.slug, { slug: song.slug, title: song.title, count: 1 });
        }
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
      description: true,
      presentation: true,
      selection: true,
      isProposed: true,
      tags: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          pattern: true,
          imageUrl: true,
          // músicas arquivadas (isDeleted) não contam
          _count: { select: { songs: { where: { isDeleted: false } } } },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
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
