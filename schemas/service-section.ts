import { z } from "zod";
import { serviceUnitSchema } from "./service-unit";

export const serviceSectionTypeSchema = z.enum([
  "PRE_CULTO",
  "CULTO",
  "POS_CULTO",
  "ESPECIAL",
]);

export const serviceSectionSchema = z.object({
  type: serviceSectionTypeSchema,
  label: z.string(),
  order: z.number(),
  units: z.array(serviceUnitSchema),
});

export const servicePlanSchema = z.object({
  startTime: z.string().nullable(),
  sections: z.array(serviceSectionSchema),
});

export type ServiceSectionSchema = z.infer<typeof serviceSectionSchema>;
export type ServicePlanSchema = z.infer<typeof servicePlanSchema>;
