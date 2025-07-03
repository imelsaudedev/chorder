import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Or from "./index";

const meta = {
  title: "common/Or",
  component: Or,
} satisfies Meta<typeof Or>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => (
    <div className="min-w-xl bg-gray-100">
      <Or />
    </div>
  ),
};
