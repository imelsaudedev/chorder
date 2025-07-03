import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TextInput from "./index";

const meta = {
  title: "common/TextInput",
  component: TextInput,
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    long: true,
  },
};
