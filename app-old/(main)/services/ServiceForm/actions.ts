"use server";

import { createOrUpdateService } from "@/prisma/data";
import { UnitSchema } from "./schema";

export async function saveServiceAction(
  slug: string | null | undefined,
  title: string | null | undefined,
  worshipLeader: string | null,
  date: Date,
  units: UnitSchema[]
) {
  const serviceUnits = units
    .map((unit, order) => {
      if (unit.type === "SONG") {
        const arrangement = {
          id: unit.arrangementId,
          songId: unit.songId,
          key: unit.key ?? "C",
          name: unit.arrangementName ?? null,
          isDefault: false,
          isDeleted: false,
          isServiceArrangement: true,
          units: unit.units,
        };

        return {
          type: "SONG" as const,
          semitoneTranspose: unit.semitoneTranspose,
          arrangementId: unit.arrangementId,
          arrangement,
          arrangementName: unit.arrangementName,
          key: unit.key,
          units: unit.units,
          order,
        };
      }
      // Add handling for other unit types if necessary
      console.error("Unsupported unit type:", unit.type);
      return null;
    })
    .filter((unit) => unit !== null);
  return createOrUpdateService(title, slug, worshipLeader, date, serviceUnits);
}
