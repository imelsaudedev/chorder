import { z } from "zod";

const songUnitTypeSchema = z.union([
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

export const songUnitsSchema = z.object({
  content: z.string().min(0),
  type: songUnitTypeSchema,
  order: z.number().nonnegative(),
});

const schema = z.object({
  // Song data
  title: z.string().min(2, "CANNOT BE EMPTY"),
  artist: z.string().optional(),
  // Arrangement data
  arrangementId: z.number().optional(),
  arrangementName: z.string().optional(),
  key: z.string().optional(),
  // Song units data
  units: z.array(songUnitsSchema).nonempty(),
});

export default schema;
export type ArrangementFormSchema = z.infer<typeof schema>;
export type SongUnitSchema = z.infer<typeof songUnitsSchema>;
