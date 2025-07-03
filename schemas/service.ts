import { z } from "zod";
import { serviceUnitSchema } from "./service-unit";

export const serviceSchema = z.object({
  id: z.number().optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  worshipLeader: z.string().optional(),
  date: z.date(),
  units: z.array(serviceUnitSchema).nonempty(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
