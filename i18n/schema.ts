import { z } from 'zod';

export const messagesSchema = z.object({
  siteName: z.string(),
  siteDescription: z.string(),
  messages: z.object({
    or: z.string(),
    preview: z.string(),
    cancel: z.string(),
    save: z.string(),
    songs: z.string(),
    services: z.string(),
  }),
  songData: z.object({
    title: z.string(),
    titlePlaceholder: z.string(),
    artist: z.string(),
    artistPlaceholder: z.string(),
    key: z.string(),
    keyPlaceholder: z.string(),
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
    BLOCK: z.string(),
  }),
  songForm: z.object({
    addExistingUnit: z.string(),
    addUnitWithLabel: z.string(),
    newUnit: z.string(),
  }),
});

export type Messages = z.infer<typeof messagesSchema>;
