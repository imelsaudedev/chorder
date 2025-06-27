import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import IncreaseDecreaseButtonSet from "./index";

const meta = {
  title: "common/IncreaseDecreaseButtonSet",
  component: IncreaseDecreaseButtonSet,
} satisfies Meta<typeof IncreaseDecreaseButtonSet>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [value, setValue] = useState("A");
    const handleIncrease = () => {
      setValue((prev) => String.fromCharCode(prev.charCodeAt(0) + 1));
    };
    const handleDecrease = () => {
      setValue((prev) => String.fromCharCode(prev.charCodeAt(0) - 1));
    };

    return (
      <IncreaseDecreaseButtonSet
        decrease={handleDecrease}
        increase={handleIncrease}
        setStringValue={setValue}
        stringValue={value}
        decreaseDisabled={value === "A"}
        increaseDisabled={value === "Z"}
        increaseLabel=">>"
        decreaseLabel="<<"
      />
    );
  },
};
