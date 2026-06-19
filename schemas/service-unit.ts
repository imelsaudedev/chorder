import { z } from "zod";
import { arrangementSchema } from "./arrangement";

export const serviceUnitTypeSchema = z.enum([
  "SONG",
  "FALA",
  "LEITURA",
  "ORACAO",
  "AVISOS",
  "SERMAO",
  "ENCERRAMENTO",
]);

export const serviceUnitSchema = z.object({
  id: z.number().optional(),
  type: serviceUnitTypeSchema,
  semitoneTranspose: z.number().nullable(),
  arrangementId: z.number().nullable(),
  arrangement: arrangementSchema.optional().nullable(),
  order: z.number().positive(),
  durationMin: z.number().nullable().optional(),
  label: z.string().nullable().optional(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: z.any().nullable().optional(),
});

export type ServiceUnitSchema = z.infer<typeof serviceUnitSchema>;
