import { z } from "zod";

export const songUnitTypeSchema = z.union([
  z.literal("BLOCK"),
  z.literal("INTRO"),
  z.literal("VERSE"),
  z.literal("PRECHORUS"),
  z.literal("CHORUS"),
  z.literal("BRIDGE"),
  z.literal("INTERLUDE"),
  z.literal("SOLO"),
  z.literal("ENDING"),
]);

export const songUnitSchema = z.object({
  content: z.string().min(1),
  type: songUnitTypeSchema,
  order: z.number().positive(),
});

export type SongUnitSchema = z.infer<typeof songUnitSchema>;
