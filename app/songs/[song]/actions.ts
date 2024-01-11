"use server";

import { getLyrics } from "@/chopro/music";
import { createOrUpdateSong, fetchSong } from "@/models/song";
import { Unit } from "@/models/unit";
import { RedirectType, redirect } from "next/navigation";

export async function postSong(
  songId: number | null,
  versionId: number | null,
  title: string,
  availableUnits: Unit[],
  unitSequence: number[],
  artist?: string
) {
  const localIdToUnit = new Map<number, Unit>(
    availableUnits.map((unit) => [unit.localId, unit])
  );

  const lyrics = unitSequence
    .map((localId) => getLyrics(localIdToUnit.get(localId)?.content || ""))
    .join("\n");

  const song = await createOrUpdateSong(
    songId,
    versionId,
    title,
    lyrics,
    availableUnits,
    unitSequence.join(","),
    artist
  );

  redirect(`./${song.id}`, RedirectType.replace);
}

export async function getSong(id: number) {
  return fetchSong(id);
}