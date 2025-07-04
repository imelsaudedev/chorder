import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ServiceConfigProvider from "@/components/config/ServiceConfig";
import service from "@/mock/service";
import ServiceView from "./index";

const meta = {
  title: "service/ServiceView/Main",
  component: ServiceView,
} satisfies Meta<typeof ServiceView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    service,
  },
  render: ({ service }) => {
    return (
      <div className="w-4xl">
        <ServiceConfigProvider>
          <ServiceView service={service} />
        </ServiceConfigProvider>
      </div>
    );
  },
};
