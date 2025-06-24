import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ScrollToTopButton from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "common/ScrollToTopButton",
  component: ScrollToTopButton,
} satisfies Meta<typeof ScrollToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    scrollThreshold: 10,
  },
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <div className="flex flex-col items-center justify-center h-screen">
      <span className="mb-4">Scroll down to see the button appear</span>
      <div className="h-[200vh] bg-gray-100 p-4">
        <ScrollToTopButton {...args} />
      </div>
    </div>
  ),
};
