import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Skeleton from "./Skeleton";

const meta = {
  title: "song/ArrangementHeader/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
};
