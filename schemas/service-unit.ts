import { z } from "zod";
import { arrangementSchema } from "./arrangement";

export const serviceSongUnitSchema = z.object({
  type: z.literal("SONG"),
  semitoneTranspose: z.number(),
  arrangement: arrangementSchema,
  order: z.number().nonnegative(),
});

// const unitSchema = z.union([textUnitSchema, songUnitSchema]);
export const serviceUnitSchema = serviceSongUnitSchema;

export type ServiceUnitSchema = z.infer<typeof serviceUnitSchema>;
export type ServiceSongUnitSchema = z.infer<typeof serviceSongUnitSchema>;
