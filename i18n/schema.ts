import { z } from "zod";

export const messagesSchema = z.object({
  siteName: z.string(),
  siteDescription: z.string(),
  messages: z.object({
    or: z.string(),
    preview: z.string(),
    save: z.string(),
    songs: z.string(),
  }),
  songData: z.object({
    title: z.string(),
    titlePlaceholder: z.string(),
    artist: z.string(),
    artistPlaceholder: z.string(),
    unit: z.string(),
  }),
  unitData: z.object({
    content: z.string(),
    contentPlaceholder: z.string(),
    unitType: z.string(),
  }),
  unitTypes: z.object({
    INTRO: z.string(),
    ENDING: z.string(),
    VERSE: z.string(),
    PRECHORUS: z.string(),
    CHORUS: z.string(),
    BRIDGE: z.string(),
    INTERLUDE: z.string(),
    SOLO: z.string(),
    NEUTRAL: z.string(),
  }),
  songForm: z.object({
    addExistingUnit: z.string(),
    newUnit: z.string(),
  }),
});

export type Messages = z.infer<typeof messagesSchema>;
