import { z } from "zod";
import { servicePlanSchema } from "./service-section";
import { serviceUnitSchema } from "./service-unit";

export const serviceSchema = z.object({
  id: z.number().optional(),
  slug: z.string(),
  title: z.string().nullable(),
  worshipLeader: z.string().nullable(),
  date: z.coerce.date(),
  units: z.array(serviceUnitSchema).optional(),
  plan: servicePlanSchema.nullable(),
  preacher: z.string().nullable(),
  sermonTheme: z.string().nullable(),
  sermonReference: z.string().nullable(),
  isDeleted: z.boolean(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
