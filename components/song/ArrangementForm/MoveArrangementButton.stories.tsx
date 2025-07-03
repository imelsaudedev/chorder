import { useFetchSongs } from "@/app/api/api-client.mock";
import arrangements from "@/mock/arrangements";
import songs from "@/mock/songs";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MoveArrangementButton from "./MoveArrangementButton";

const meta = {
  title: "song/ArrangementForm/MoveArrangementButton",
  component: MoveArrangementButton,
} satisfies Meta<typeof MoveArrangementButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangementId: arrangements[1].id,
    songSlug: arrangements[1].song.slug,
  },
  async beforeEach() {
    useFetchSongs.mockReturnValue({ songs, isLoading: false, isError: null });
  },
};
