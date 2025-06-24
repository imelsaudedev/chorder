import { z } from "zod";
import arrangementSchema from "../../songs/ArrangementForm/schema";

const songUnitSchema = z.object({
  type: z.literal("SONG"),
  semitoneTranspose: z.number(),
  songId: z.number(),
  arrangement: arrangementSchema,
});
// const unitSchema = z.union([textUnitSchema, songUnitSchema]);
const unitSchema = songUnitSchema;

const schema = z.object({
  slug: z.string().optional(),
  title: z.string().optional(),
  worshipLeader: z.string().optional(),
  date: z.date(),
  units: z.array(unitSchema),
});

export default schema;
export type ServiceFormSchema = z.infer<typeof schema>;
export type UnitSchema = z.infer<typeof unitSchema>;
export type SongUnitSchema = z.infer<typeof songUnitSchema>;
