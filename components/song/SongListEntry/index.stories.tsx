import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongListEntry from "./index";
import { ClientSong } from "@/prisma/models";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/SongListEntry",
  component: SongListEntry,
} satisfies Meta<typeof SongListEntry>;

export default meta;
type Story = StoryObj<{
  title: string;
  artist?: string;
  lyrics: string;
  query?: string;
}>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Sample Song",
    artist: "Sample Artist",
    lyrics:
      "This is a sample lyric line.\nAnother line of lyrics.\nAnd yet another line.",
    query: "sample",
  },
  render: ({ title, artist, lyrics, query }) => {
    const song: ClientSong = {
      id: 1,
      slug: "sample-song",
      title,
      artist: artist ?? null,
      lyrics,
      isDeleted: false,
    };

    return <SongListEntry song={song} query={query} />;
  },
};
