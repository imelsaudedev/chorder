import type { ClientSong } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import SongList from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/SongList",
  component: SongList,
} satisfies Meta<typeof SongList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    songs: ["A song", "Another song", "Music", "Random Title"].map(mockSong),
    query: "song",
    initialsInSeparateRow: false,
  },
  render: ({ songs, query, initialsInSeparateRow }) => {
    const [selectedSong, setSelectedSong] = useState<ClientSong | null>(null);

    return (
      <>
        <p className="text-red-500">
          Selected: {selectedSong?.title ?? "None"}
        </p>
        <SongList
          songs={songs}
          query={query}
          initialsInSeparateRow={initialsInSeparateRow}
          onSelected={setSelectedSong}
        />
      </>
    );
  },
};

function mockSong(title: string, index: number): ClientSong {
  return {
    slug: `song-${index}`,
    title,
    artist: `Artist ${index}`,
    lyrics: `Lyrics for song ${index}\nLine 2 of song ${index}\nLine 3 of song ${index}`,
    isDeleted: false,
  };
}
