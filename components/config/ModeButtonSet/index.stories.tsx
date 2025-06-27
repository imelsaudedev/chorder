import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import ModeButtonSet from "./index";
import { Mode } from "../config";

const meta = {
  title: "config/ModeButtonSet",
  component: ModeButtonSet,
} satisfies Meta<typeof ModeButtonSet>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [mode, setMode] = useState<Mode>("chords" as const);
    return <ModeButtonSet mode={mode} setMode={setMode} />;
  },
};
