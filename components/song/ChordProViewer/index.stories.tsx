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

export const WithComments: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    chordpro:
      "{c:Suave}\n[D]Uma semente está [G]procurando\n{c:Forte}\n[A]um lugar pra [D]crescer",
    density: "normal",
  },
};

export const WithCommentsCompact: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    chordpro:
      "{c:Pausa}\n[G]Terra [D]boa\n{c:Só voz}\n[Em]bem escondida [C]até poder germinar",
    density: "compact",
  },
};
