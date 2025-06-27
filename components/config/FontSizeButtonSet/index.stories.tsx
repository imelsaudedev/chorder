import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import FontSizeButtonSet from "./index";

const meta = {
  title: "config/FontSizeButtonSet",
  component: FontSizeButtonSet,
} satisfies Meta<typeof FontSizeButtonSet>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [fontSize, setFontSize] = useState(24);
    return <FontSizeButtonSet fontSize={fontSize} setFontSize={setFontSize} />;
  },
};
