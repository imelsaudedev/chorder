import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import ColumnButtons from "./index";

const meta = {
  title: "config/ColumnButtons",
  component: ColumnButtons,
} satisfies Meta<typeof ColumnButtons>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [columns, setColumns] = useState(0);
    return (
      <ColumnButtons
        id="column-buttons"
        columns={columns}
        setColumns={setColumns}
      />
    );
  },
};
