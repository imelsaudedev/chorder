import { z } from "zod";
import { songSchema } from "./song";
import { songUnitSchema } from "./song-unit";

export const arrangementSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  songId: z.number().optional(),
  key: z.string(),
  isDefault: z.boolean(),
  isDeleted: z.boolean(),
  isServiceArrangement: z.boolean(),
  song: songSchema,
  units: z.array(songUnitSchema).nonempty(),
});

export type ArrangementSchema = z.infer<typeof arrangementSchema>;
