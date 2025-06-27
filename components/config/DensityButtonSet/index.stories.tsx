import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import { Density } from "../config";
import DensityButtonSet from "./index";

const meta = {
  title: "config/DensityButtonSet",
  component: DensityButtonSet,
} satisfies Meta<typeof DensityButtonSet>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [density, setDensity] = useState<Density>("normal" as const);
    return <DensityButtonSet density={density} setDensity={setDensity} />;
  },
};
