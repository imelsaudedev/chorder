import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useFetchSongs } from "@/app/api/api-client.mock";
import songs from "@/mock/songs";
import { ClientSong } from "@/prisma/models";
import SongPicker from "./index";

const meta = {
  title: "song/SongPicker",
  component: SongPicker,
} satisfies Meta<typeof SongPicker>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  async beforeEach() {
    useFetchSongs.mockReturnValue({ songs, isLoading: false, isError: null });
  },
  render: () => {
    const handleSelected = (song: ClientSong) => {
      console.log("Selected song:", song);
    };

    return <SongPicker onSelected={handleSelected} />;
  },
};
