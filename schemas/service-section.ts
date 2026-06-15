import { z } from "zod";
import { serviceUnitSchema } from "./service-unit";

export const serviceSectionTypeSchema = z.enum([
  "PRE_CULTO",
  "LOUVOR",
  "AVISOS",
  "ORACAO_COMUNITARIA",
  "MENSAGEM",
  "ESPECIAL",
  "ENCERRAMENTO",
]);

export const serviceSectionSchema = z.object({
  id: z.number().optional(),
  type: serviceSectionTypeSchema,
  label: z.string(),
  order: z.number(),
  units: z.array(serviceUnitSchema).optional(),
});

export type ServiceSectionSchema = z.infer<typeof serviceSectionSchema>;
