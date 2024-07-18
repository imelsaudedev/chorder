import { z } from 'zod';

export const songMapSchema = z.object({
  internalId: z.number(),
});

const songUnitTypeSchema = z.union([
  z.literal('INTRO'),
  z.literal('ENDING'),
  z.literal('VERSE'),
  z.literal('PRECHORUS'),
  z.literal('CHORUS'),
  z.literal('BRIDGE'),
  z.literal('INTERLUDE'),
  z.literal('SOLO'),
  z.literal('BLOCK'),
]);

export const songUnitsSchema = z.object({
  content: z.string().min(1),
  type: songUnitTypeSchema,
  internalId: z.number().positive(),
  typeIdx: z.number().positive().optional(),
});

const schema = z.object({
  title: z.string().min(2, 'CANNOT BE EMPTY'),
  artist: z.string().optional(),
  arrangementName: z.string().optional(),
  key: z.string().optional(),
  lastUnitId: z.number().positive(),
  songMap: z.array(songMapSchema).nonempty(),
  units: z.array(songUnitsSchema).nonempty(),
});

export default schema;
export type ArrangementFormSchema = z.infer<typeof schema>;
export type SongUnitSchema = z.infer<typeof songUnitsSchema>;
export type SongMapElementSchema = z.infer<typeof songMapSchema>;
