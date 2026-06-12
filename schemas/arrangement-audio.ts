import { z } from "zod";

export const arrangementAudioSchema = z.object({
  id: z.number().optional(),
  url: z.string().url(),
  label: z.string().min(1),
  order: z.number().int().min(0),
});

export type ArrangementAudioSchema = z.infer<typeof arrangementAudioSchema>;
