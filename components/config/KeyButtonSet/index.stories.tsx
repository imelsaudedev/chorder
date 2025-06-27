import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import KeyButtonSet from "./index";

const meta = {
  title: "config/KeyButtonSet",
  component: KeyButtonSet,
} satisfies Meta<typeof KeyButtonSet>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [transpose, setTranspose] = useState(0);
    return (
      <KeyButtonSet
        originalKey="C"
        transpose={transpose}
        setTranspose={setTranspose}
      />
    );
  },
};
