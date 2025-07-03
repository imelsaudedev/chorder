import { SONG_UNIT_TYPES, SongUnitType } from "@/models/song-unit";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import UnitCircle from "./index";

const meta = {
  title: "song/UnitCircle",
  component: UnitCircle,
} satisfies Meta<typeof UnitCircle>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      {SONG_UNIT_TYPES.map((unitType: SongUnitType, index: number) => (
        <UnitCircle key={index} unitType={unitType} typeIdx={index + 1} />
      ))}
    </div>
  ),
};
