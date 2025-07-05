import { z } from "zod";
import { songSchema } from "./song";
import { songUnitSchema } from "./song-unit";

export const arrangementSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().nullable(),
    songId: z.number().optional(),
    key: z.string(),
    isDefault: z.boolean(),
    isDeleted: z.boolean(),
    isServiceArrangement: z.boolean(),
    song: songSchema.optional(),
    units: z.array(songUnitSchema).optional(),
  })
  .refine((data) => data.units && data.units.length > 0, {
    message: "An arrangement must have at least one unit.",
  });

export type ArrangementSchema = z.infer<typeof arrangementSchema>;
