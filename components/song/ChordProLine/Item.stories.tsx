import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Item from "./Item";
import { ChordProItem } from "@/chopro/music";
import { items, itemsWithoutChords, itemsWithoutLyrics } from "./stories-utils";

const meta = {
  title: "song/ChordProLine/Item",
  component: Item,
} satisfies Meta<typeof Item>;

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
    <div className="flex flex-row flex-wrap bg-gray-100 px-4 pt-2">
      {items.map((item, index) => (
        <Item
          key={index}
          mode="chords"
          density="normal"
          hasChords={hasChords}
          hasLyrics={hasLyrics}
          item={item}
          isConnection={!item._name && item.lyrics.startsWith("s")}
        />
      ))}
    </div>
  );
}
