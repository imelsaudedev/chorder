import { z } from 'zod';
import { songMapSchema, songUnitsSchema } from '../ArrangementForm/schema';

const textUnitSchema = z.object({ type: z.literal('TEXT'), content: z.string() });
const songUnitSchema = z.object({
  type: z.literal('SONG'),
  slug: z.string(),
  title: z.string(),
  artist: z.string().optional(),
  currentArrangementId: z.number(),
  baseKey: z.string(),
  semitoneTranspose: z.number(),
  lastUnitId: z.number().positive(),
  songMap: z.array(songMapSchema),
  units: z.array(songUnitsSchema),
});
const unitSchema = z.union([textUnitSchema, songUnitSchema]);

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
export type TextUnitSchema = z.infer<typeof textUnitSchema>;
export type SongUnitSchema = z.infer<typeof songUnitSchema>;
