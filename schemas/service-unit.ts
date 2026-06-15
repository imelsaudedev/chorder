import { z } from "zod";
import { arrangementSchema } from "./arrangement";

export const serviceUnitTypeSchema = z.enum([
  "SONG",
  "PRELUDIO",
  "ABERTURA",
  "LEITURA",
  "ORACAO",
  "AVISOS",
  "SERMAO",
  "ESPECIAL",
  "ENCERRAMENTO",
]);

export const serviceUnitSchema = z.object({
  id: z.number().optional(),
  type: serviceUnitTypeSchema,
  semitoneTranspose: z.number().nullable(),
  arrangementId: z.number().nullable(),
  arrangement: arrangementSchema.optional().nullable(),
  order: z.number().positive(),
  sectionId: z.number().nullable(),
  durationMin: z.number().nullable(),
  label: z.string().nullable(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: z.any().nullable(),
});

export type ServiceUnitSchema = z.infer<typeof serviceUnitSchema>;
