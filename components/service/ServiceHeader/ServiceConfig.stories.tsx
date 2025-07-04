import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ServiceConfigProvider from "@/components/config/ServiceConfig";
import ServiceConfig from "./ServiceConfig";

const meta = {
  title: "service/ServiceHeader/ServiceConfig",
  component: ServiceConfig,
} satisfies Meta<typeof ServiceConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    originalKey: "C",
  },
  render: (args) => {
    return (
      <ServiceConfigProvider>
        <ServiceConfig {...args} />
      </ServiceConfigProvider>
    );
  },
};
