import { z } from 'zod';
import { songMapSchema } from '../ArrangementForm/schema';

const textUnitSchema = z.object({ type: z.literal('TEXT'), content: z.string() });
const songUnitSchema = z.object({
  type: z.literal('SONG'),
  song: z.object({
    currentArrangementId: z.number(),
    arrangement: z.object({
      songMap: songMapSchema,
      semitoneTranspose: z.number(),
    }),
  }),
});
const unitSchema = z.union([textUnitSchema, songUnitSchema]);

const schema = z.object({
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
