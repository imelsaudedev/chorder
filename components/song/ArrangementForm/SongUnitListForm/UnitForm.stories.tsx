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
      notes: null,
    });

    return (
      <UnitForm
        unit={unit}
        removeUnit={() => setUnit({ ...unit, content: "" })}
        duplicateUnit={() => alert("Duplicate unit action")}
        insertBefore={() => {}}
        insertAfter={() => {}}
        onChangeUnit={(newUnit) => setUnit(newUnit)}
      />
    );
  },
};

export const WithNotes: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [unit, setUnit] = useState<ClientSongUnit>({
      type: "VERSE",
      content: "[G]Terra boa\n[D]bem escondida",
      order: 1,
      notes: "Só voz — suave",
    });

    return (
      <UnitForm
        unit={unit}
        removeUnit={() => {}}
        duplicateUnit={() => {}}
        insertBefore={() => {}}
        insertAfter={() => {}}
        onChangeUnit={(newUnit) => setUnit(newUnit)}
      />
    );
  },
};

export const WithInlineComment: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [unit, setUnit] = useState<ClientSongUnit>({
      type: "CHORUS",
      content:
        "{c:Forte}\n[C]Santo, Santo, [G]Santo\n{c:Suave}\n[Am]é o [F]Senhor",
      order: 2,
      notes: null,
    });

    return (
      <UnitForm
        unit={unit}
        removeUnit={() => {}}
        duplicateUnit={() => {}}
        insertBefore={() => {}}
        insertAfter={() => {}}
        onChangeUnit={(newUnit) => setUnit(newUnit)}
      />
    );
  },
};
