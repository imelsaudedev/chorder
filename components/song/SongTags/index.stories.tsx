import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SongTags from "./index";

const meta = {
  title: "song/SongTags",
  component: SongTags,
} satisfies Meta<typeof SongTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { layout: "centered" },
  args: {
    tags: [
      { id: 1, name: "Adoração", group: { id: 1, name: "Tema", color: "#10b981" } },
      { id: 2, name: "Missão", group: { id: 1, name: "Tema", color: "#10b981" } },
      { id: 3, name: "Lento", group: { id: 2, name: "Andamento", color: "#6366f1" } },
    ],
  },
};

export const SingleTag: Story = {
  parameters: { layout: "centered" },
  args: {
    tags: [
      { id: 1, name: "Louvor", group: { id: 1, name: "Tema", color: "#f59e0b" } },
    ],
  },
};

export const MultipleGroups: Story = {
  parameters: { layout: "centered" },
  args: {
    tags: [
      { id: 1, name: "Adoração", group: { id: 1, name: "Tema", color: "#10b981" } },
      { id: 2, name: "Páscoa", group: { id: 2, name: "Ocasião", color: "#f59e0b" } },
      { id: 3, name: "Rápido", group: { id: 3, name: "Andamento", color: "#6366f1" } },
      { id: 4, name: "Hino", group: { id: 4, name: "Tipo", color: "#ef4444" } },
    ],
  },
};

export const Empty: Story = {
  parameters: { layout: "centered" },
  args: { tags: [] },
};
