import { ClientArrangement } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ArrangementActionMenu from "./ArrangementActionMenu";

const meta = {
  title: "song/ArrangementHeader/ArrangementActionMenu",
  component: ArrangementActionMenu,
} satisfies Meta<typeof ArrangementActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangement: buildArrangement(1, true, "A"),
  },
};

function buildArrangement(
  id: number,
  isDefault: boolean,
  key: string,
  name?: string
): ClientArrangement {
  return {
    id,
    name: name ?? null,
    isDefault,
    key,
    isDeleted: false,
    isServiceArrangement: false,
  };
}
