import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useFetchSongArrangements } from "@/app/api/api-client.mock";
import arrangements from "@/mock/arrangements";
import { ClientArrangement } from "@/prisma/models";
import ArrangementPicker from "./index";

const meta = {
  title: "song/ArrangementPicker",
  component: ArrangementPicker,
} satisfies Meta<typeof ArrangementPicker>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  async beforeEach() {
    useFetchSongArrangements.mockReturnValue({
      arrangements,
      isLoading: false,
      isError: null,
    });
  },
  render: () => {
    const handleSelected = (arrangement: ClientArrangement) => {
      console.log("Selected arrangement:", arrangement);
    };

    return (
      <ArrangementPicker
        songSlug={arrangements[0].song.slug}
        onSelected={handleSelected}
      />
    );
  },
};
