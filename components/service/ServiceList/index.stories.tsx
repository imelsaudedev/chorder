import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import service from "@/mock/service";
import ServiceList from "./index";

const meta = {
  title: "service/ServiceList",
  component: ServiceList,
} satisfies Meta<typeof ServiceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    services: [service, service, service, service, service, service],
  },
};
