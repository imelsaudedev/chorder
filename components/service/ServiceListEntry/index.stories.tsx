import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import service from "@/mock/service";
import ServiceListEntry from "./index";

const meta = {
  title: "service/ServiceListEntry",
  component: ServiceListEntry,
} satisfies Meta<typeof ServiceListEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    service,
  },
};
