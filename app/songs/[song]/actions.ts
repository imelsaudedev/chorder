"use server";

import { getLyrics } from "@/chopro/music";
import { createSong } from "@/models/song";
import { Unit } from "@/models/unit";

export async function postSong(
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
  console.log(title, lyrics, availableUnits, unitSequence, artist);
  return JSON.stringify(
    createSong(title, lyrics, availableUnits, unitSequence, artist)
  );
}
