import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import arrangements from "@/mock/arrangements";
import ArrangementActionMenu from "./ArrangementActionMenu";

const meta = {
  title: "song/ArrangementHeader/ArrangementActionMenu",
  component: ArrangementActionMenu,
} satisfies Meta<typeof ArrangementActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangement: arrangements[1],
  },
};
