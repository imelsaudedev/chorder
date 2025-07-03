import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SaveButtonSet from "./index";

const meta = {
  title: "common/SaveButtonSet",
  component: SaveButtonSet,
} satisfies Meta<typeof SaveButtonSet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    cancelUrl: "/",
    enabled: true,
  },
};
