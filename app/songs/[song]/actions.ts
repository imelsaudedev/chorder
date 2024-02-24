"use server";

import { getLyrics } from "@/chopro/music";
import {
  ArrangementUnit,
  createOrUpdateSong,
  deleteSongArrangement,
  fetchSong,
} from "@/models/song";
import { RedirectType, redirect } from "next/navigation";

export async function postSong(
  songId: number | null,
  arrangementId: number | null,
  title: string,
  units: ArrangementUnit[],
  artist?: string
) {
  const lyrics = units
    .map((arrangementUnit) => getLyrics(arrangementUnit?.unit?.content || ""))
    .join("\n");

  const song = await createOrUpdateSong(
    songId,
    arrangementId,
    title,
    lyrics,
    units,
    artist
  );

  redirect(`./${song.id}`, RedirectType.replace);
}

export async function deleteArrangement(arrangementId: number) {
  await deleteSongArrangement(arrangementId);

  redirect(`./`, RedirectType.replace);
}

export async function getSong(id: number) {
  return fetchSong(id);
}
