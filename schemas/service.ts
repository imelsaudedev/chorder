import { z } from "zod";
import { servicePlanSchema } from "./service-section";
import { serviceUnitSchema } from "./service-unit";

export const serviceSchema = z.object({
  id: z.number().optional(),
  slug: z.string(),
  title: z.string().nullable(),
  worshipLeader: z.string().nullable(),
  leaders: z.array(z.object({ userId: z.string().nullable(), name: z.string() })),
  date: z.coerce.date(),
  units: z.array(serviceUnitSchema).optional(),
  plan: servicePlanSchema.nullable(),
  isDeleted: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  scope: z.enum(["CHURCH", "PERSONAL"]).optional(),
  updatedAt: z.coerce.date().optional(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
