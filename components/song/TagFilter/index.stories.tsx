import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import TagFilter from "./index";

const meta = {
  title: "song/TagFilter",
  component: TagFilter,
} satisfies Meta<typeof TagFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const tagGroups = [
  {
    id: 1, name: "Tema", color: "#10b981",
    tags: [
      { id: 1, name: "Adoração", songCount: 12 },
      { id: 2, name: "Louvor", songCount: 8 },
      { id: 3, name: "Missão", songCount: 5 },
    ],
  },
  {
    id: 2, name: "Andamento", color: "#6366f1",
    tags: [
      { id: 4, name: "Lento", songCount: 6 },
      { id: 5, name: "Médio", songCount: 14 },
      { id: 6, name: "Rápido", songCount: 9 },
    ],
  },
  {
    id: 3, name: "Ocasião", color: "#f59e0b",
    tags: [
      { id: 7, name: "Páscoa", songCount: 3 },
      { id: 8, name: "Natal", songCount: 4 },
    ],
  },
];

export const Default: Story = {
  parameters: { layout: "centered" },
  args: { tagGroups, selectedTagIds: [], onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState<number[]>([]);
    return (
      <div className="p-4">
        <TagFilter tagGroups={tagGroups} selectedTagIds={selected} onChange={setSelected} />
        <p className="mt-4 text-sm text-muted-foreground">
          Selecionados: {selected.length === 0 ? "nenhum" : selected.join(", ")}
        </p>
      </div>
    );
  },
};

export const WithPreselected: Story = {
  parameters: { layout: "centered" },
  args: { tagGroups, selectedTagIds: [1, 4], onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState<number[]>([1, 4]);
    return (
      <div className="p-4">
        <TagFilter tagGroups={tagGroups} selectedTagIds={selected} onChange={setSelected} />
      </div>
    );
  },
};

export const Empty: Story = {
  parameters: { layout: "centered" },
  args: { tagGroups: [], selectedTagIds: [], onChange: () => {} },
};
