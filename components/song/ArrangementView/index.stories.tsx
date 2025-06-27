import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongConfigProvider from "@/components/config/SongConfig";
import { ClientArrangement } from "@/prisma/models";
import SongConfig from "../ArrangementHeader/SongConfig";
import ArrangementView from "./index";

const meta = {
  title: "song/ArrangementView/Main",
  component: ArrangementView,
} satisfies Meta<typeof ArrangementView>;

export default meta;
type Story = StoryObj<{
  arrangement: ClientArrangement;
}>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangement: {
      key: "C",
      name: "Test Arrangement",
      isDefault: true,
      isDeleted: false,
      isServiceArrangement: false,
      units: [
        {
          content: "[C]This is a [G]test line with [Am]chords",
          type: "INTRO",
          order: 0,
        },
        {
          content: "[F]Another line with [Dm]chords",
          type: "VERSE",
          order: 1,
        },
        {
          content: "[G]Ending line with [C]chords",
          type: "CHORUS",
          order: 2,
        },
      ],
    },
  },
  render: ({ arrangement }) => {
    return (
      <SongConfigProvider>
        <SongConfig originalKey="C" />
        <ArrangementView arrangement={arrangement} />
      </SongConfigProvider>
    );
  },
};
