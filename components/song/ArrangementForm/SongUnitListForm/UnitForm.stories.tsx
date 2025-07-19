import { ClientSongUnit } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import UnitForm from "./UnitForm";

const meta = {
  title: "song/ArrangementForm/SongUnitListForm/UnitForm",
  component: UnitForm,
} satisfies Meta<typeof UnitForm>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [unit, setUnit] = useState<ClientSongUnit>({
      type: "BLOCK",
      content:
        "[D]Twinkle, twinkle, [G]little [D]star,\n[G]How I [D]wonder [A]what you [D]are.",
      order: 0,
    });

    return (
      <UnitForm
        unit={unit}
        removeUnit={() => setUnit({ ...unit, content: "" })}
        duplicateUnit={() => alert("Duplicate unit action")}
        onChangeUnit={(newUnit) => setUnit(newUnit)}
      />
    );
  },
};
