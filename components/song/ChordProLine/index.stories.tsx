import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChordProItem } from "@/chopro/music";
import ChordProLine from "./index";
import { items, itemsWithoutChords, itemsWithoutLyrics, itemsWithComments } from "./stories-utils";

const meta = {
  title: "song/ChordProLine/ChordProLine",
  component: ChordProLine,
} satisfies Meta<typeof ChordProLine>;

export default meta;
type Args = {
  items: ChordProItem[];
};
type Story = StoryObj<Args>;

export const ChordsAndLyrics: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    items,
  },
  render,
};

export const ChordsOnly: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    items: itemsWithoutLyrics,
  },
  render,
};

export const LyricsOnly: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    items: itemsWithoutChords,
  },
  render,
};

export const WithInlineComments: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    items: itemsWithComments,
  },
  render,
};

function render({ items }: Args) {
  return (
    <div className="`flex flex-col relative bg-gray-100 pt-2">
      <ChordProLine density="normal" mode="chords" items={items} />
    </div>
  );
}
