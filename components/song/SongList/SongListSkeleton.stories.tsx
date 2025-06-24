import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongListSkeleton from "./SongListSkeleton";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/SongListSkeleton",
  component: SongListSkeleton,
} satisfies Meta<typeof SongListSkeleton>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
};
