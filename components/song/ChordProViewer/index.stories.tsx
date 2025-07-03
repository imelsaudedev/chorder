import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ChordProViewer from "./index";

const meta = {
  title: "song/ChordProViewer",
  component: ChordProViewer,
} satisfies Meta<typeof ChordProViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    chordpro:
      "[D]Twinkle, twinkle, [G]little [D]star,\n[G]How I [D]wonder [A]what you [D]are.",
    density: "normal",
  },
};
