import { SongUnitType } from "@/generated/prisma";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import BadgeSelector from "./index";

const meta = {
  title: "song/BadgeSelector",
  component: BadgeSelector,
} satisfies Meta<typeof BadgeSelector>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [badge, setBadge] = useState<SongUnitType>("BLOCK");

    return <BadgeSelector value={badge} onChange={setBadge} />;
  },
};
