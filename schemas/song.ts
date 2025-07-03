import { z } from "zod";

export const songSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  artist: z.string(),
  isDeleted: z.boolean(),
  slug: z.string(),
  lyrics: z.string(),
});

export type SongSchema = z.infer<typeof songSchema>;
