import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import InitialsNav from "./InitialsNav";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/InitialsNav",
  component: InitialsNav,
} satisfies Meta<typeof InitialsNav>;

export default meta;
type Story = StoryObj<{ existingInitials: string }>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    existingInitials: "ADEHW",
  },
  render: ({ existingInitials }) => (
    <InitialsNav existingInitials={existingInitials.split("")} />
  ),
};
