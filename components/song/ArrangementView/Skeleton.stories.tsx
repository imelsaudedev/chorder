import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Skeleton from "./Skeleton";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/ArrangementView/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    density: "normal",
  },
  render: (args) => (
    <div className="w-4xl">
      <Skeleton {...args} />
    </div>
  ),
};
