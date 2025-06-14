"use server";

import {
  createArrangementWithSong,
  makeArrangementDefault,
  moveArrangement,
  retrieveArrangement,
  slugForSong,
  updateArrangement,
} from "@/prisma/data";
import { SongArrangementWithSong } from "@/prisma/models";
import { getChords, getKeyFromChords, getLyrics } from "@chopro/music";
import { SongUnitSchema } from "./schema";

export async function saveSongAction(
  title: string,
  artist: string | null | undefined,
  arrangementId: number | null | undefined,
  arrangementName: string | null | undefined,
  key: string | null | undefined,
  units: SongUnitSchema[],
  slug?: string
) {
  if (!key?.length) {
    const allChords = units.map((unit) => getChords(unit.content)).flat();
    key = getKeyFromChords(allChords) || "";
  }

  let arrangement: SongArrangementWithSong | null = null;
  if (arrangementId) {
    arrangement = await retrieveArrangement(arrangementId, {
      includeSong: true,
      includeUnits: true,
    });
    if (!arrangement) throw new Error("Arrangement not found");
    slug = arrangement.song.slug;
  }

  if (!slug?.length) {
    slug = await slugForSong(title);
  }
  const lyrics =
    arrangement?.song?.lyrics ??
    units.map((unit) => getLyrics(unit.content)).join("\n");

  const unitsWithOrder = units.map(({ content, type }, index) => ({
    content,
    type,
    order: index + 1,
  }));
  if (arrangement) {
    arrangement = await updateArrangement(
      arrangement.id,
      {
        title,
        slug,
        lyrics,
        artist: artist ?? null,
        name: arrangementName ?? null,
        key: key || "",
        isDeleted: false,
        units: unitsWithOrder,
      },
      {
        includeSong: true,
      }
    );
  } else {
    arrangement = await createArrangementWithSong(
      title,
      slug,
      artist ?? null,
      lyrics,
      arrangementName ?? null,
      key || "",
      unitsWithOrder,
      {
        includeSong: true,
        includeUnits: false,
      }
    );
  }
  return arrangement!;
}

export async function makeArrangementDefaultAction(arrangementId: number) {
  await makeArrangementDefault(arrangementId);
}

export async function moveArrangementAction(
  arrangementId: number,
  songSlug: string
) {
  await moveArrangement(arrangementId, songSlug);
}
