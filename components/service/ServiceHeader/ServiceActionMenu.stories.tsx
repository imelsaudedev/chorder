import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import service from "@/mock/service";
import ServiceActionMenu from "./ServiceActionMenu";

const meta = {
  title: "service/ServiceHeader/ServiceActionMenu",
  component: ServiceActionMenu,
} satisfies Meta<typeof ServiceActionMenu>;

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
