import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FloatingAddLink from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "common/FloatingAddLink",
  component: FloatingAddLink,
} satisfies Meta<typeof FloatingAddLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    href: "/",
    label: "Add Link",
  },
  render: (args) => (
    <>
      <div className="flex flex-col items-center justify-center">
        <span>The button is in the bottom right corner</span>
        <span className="text-xl">↘</span>
      </div>
      <FloatingAddLink {...args} />
    </>
  ),
};
