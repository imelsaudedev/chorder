import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import BackLink from "./index";

const meta = {
  title: "common/BackLink",
  component: BackLink,
} satisfies Meta<typeof BackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    href: "/",
    text: "Back to Home",
  },
};
