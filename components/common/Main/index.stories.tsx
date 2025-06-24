import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import Main from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "common/Main",
  component: Main,
} satisfies Meta<typeof Main>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [compact, setCompact] = useState(false);

    const handleChangeDensity = (checked: boolean) => {
      setCompact(checked);
    };

    return (
      <>
        <div className="flex items-center space-x-2 mb-4">
          <Switch id="density" onCheckedChange={handleChangeDensity} />
          <Label htmlFor="density">Compact</Label>
        </div>
        <Main
          className="border size-[500px] border-gray-200 rounded-lg shadow-sm"
          density={compact ? "compact" : "normal"}
        >
          <div className="size-full bg-linear-to-br from-primary to-secondary text-primary-foreground flex flex-col items-center justify-center">
            <span>CONTENT</span>
            <span>{compact ? "(Compact)" : "(Normal)"}</span>
          </div>
        </Main>
      </>
    );
  },
};
