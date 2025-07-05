import { z } from "zod";
import { arrangementSchema } from "./arrangement";

export const serviceUnitSchema = z.object({
  id: z.number().optional(),
  type: z.literal("SONG"),
  semitoneTranspose: z.number().nullable(),
  arrangementId: z.number().nullable(),
  arrangement: arrangementSchema.optional().nullable(),
  order: z.number().positive(),
});

export type ServiceUnitSchema = z.infer<typeof serviceUnitSchema>;
