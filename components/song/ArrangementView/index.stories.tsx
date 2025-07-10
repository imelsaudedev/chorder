import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongConfigProvider from "@/components/config/SongConfig";
import arrangements from "@/mock/arrangements";
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
    arrangement: arrangements[2],
  },
  render: ({ arrangement }) => {
    return (
      <SongConfigProvider>
        <SongConfig originalKey={arrangement.key} />
        <ArrangementView arrangement={arrangement} />
      </SongConfigProvider>
    );
  },
};
