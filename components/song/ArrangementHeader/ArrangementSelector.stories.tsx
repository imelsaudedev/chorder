import { ClientArrangement } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ArrangementSelector from "./ArrangementSelector";

const meta = {
  title: "song/ArrangementHeader/ArrangementSelector",
  component: ArrangementSelector,
} satisfies Meta<typeof ArrangementSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangements: [
      buildArrangement(1, true, "A"),
      buildArrangement(2, false, "B", "Arrrr"),
      buildArrangement(3, false, "C"),
    ],
    currentArrangementId: 2,
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
    originalArrangementId: null,
    isDefault,
    key,
    isDeleted: false,
    isServiceArrangement: false,
  };
}
