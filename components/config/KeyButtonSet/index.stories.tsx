import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import SongConfigProvider from "@/components/config/SongConfig";
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
      <SongConfigProvider>
        <KeyButtonSet
          originalKey="C"
          transpose={transpose}
          setTranspose={setTranspose}
        />
      </SongConfigProvider>
    );
  },
};
