import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChordProItem } from "@/chopro/music";
import StyledLine from "./StyledLine";
import { items, itemsWithoutChords, itemsWithoutLyrics } from "./stories-utils";

const meta = {
  title: "song/ChordProLine/StyledLine",
  component: StyledLine,
} satisfies Meta<typeof StyledLine>;

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

function render({ items }: Args) {
  const hasChords = items.some(
    (item) => item._name !== "comment" && item.chords
  );
  const hasLyrics = items.some(
    (item) => item._name !== "comment" && item.lyrics
  );
  return (
    <div className="`flex flex-col relative bg-gray-100 px-4 py-2">
      <StyledLine
        density="normal"
        mode="chords"
        hasChords={hasChords}
        hasLyrics={hasLyrics}
        items={items}
      />
    </div>
  );
}
