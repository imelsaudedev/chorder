import { z } from "zod";
import { serviceUnitSchema } from "./service-unit";

export const serviceSchema = z
  .object({
    id: z.number().optional(),
    slug: z.string(),
    title: z.string().nullable(),
    worshipLeader: z.string().nullable(),
    date: z.coerce.date(),
    units: z.array(serviceUnitSchema).optional(),
    isDeleted: z.boolean(),
  })
  .refine((data) => data.units && data.units.length > 0, {
    message: "An arrangement must have at least one unit.",
  });

export type ServiceSchema = z.infer<typeof serviceSchema>;
