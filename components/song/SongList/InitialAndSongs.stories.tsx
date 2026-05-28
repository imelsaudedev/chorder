import type { ClientSong } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import InitialAndSongs from "./InitialAndSongs";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/InitialAndSongs",
  component: InitialAndSongs,
} satisfies Meta<typeof InitialAndSongs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    letter: "A",
    songs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(mockSong),
    query: "song",
    veryBigInitial: true,
  },
};

function mockSong(index: number): ClientSong {
  return {
    slug: `song-${index}`,
    title: `Song ${index}`,
    artist: `Artist ${index}`,
    lyrics: `Lyrics for song ${index}\nLine 2 of song ${index}\nLine 3 of song ${index}`,
    isDeleted: false,
  };
}
