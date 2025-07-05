import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";
import DatePicker from "./index";

const meta = {
  title: "common/DatePicker",
  component: DatePicker,
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [value, setValue] = useState<Date | undefined>(new Date());

    return <DatePicker value={value} onChange={(date) => setValue(date)} />;
  },
};
