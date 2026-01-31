import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ActionMenu from "./index";

const meta = {
  title: "common/ActionMenu",
  component: ActionMenu,
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    editUrl: "/edit",
    isDeleting: false,
    isDuplicating: false,
    onDelete: () => {
      console.log("Delete action triggered");
    },
    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteDescription: "Are you sure you want to delete this item?",
  },
};
