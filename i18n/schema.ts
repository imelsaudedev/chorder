import { z } from "zod";

export const messagesSchema = z.object({
  siteName: z.string(),
  siteDescription: z.string(),
  messages: z.object({
    or: z.string(),
    preview: z.string(),
    cancel: z.string(),
    save: z.string(),
    songs: z.string(),
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
    SONG_INTRO: z.string(),
    SONG_ENDING: z.string(),
    SONG_VERSE: z.string(),
    SONG_PRECHORUS: z.string(),
    SONG_CHORUS: z.string(),
    SONG_BRIDGE: z.string(),
    SONG_INTERLUDE: z.string(),
    SONG_SOLO: z.string(),
    SONG_BLOCK: z.string(),
  }),
  songForm: z.object({
    addExistingUnit: z.string(),
    newUnit: z.string(),
  }),
});

export type Messages = z.infer<typeof messagesSchema>;
