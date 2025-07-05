import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ServiceConfigProvider from "@/components/config/ServiceConfig";
import Skeleton from "./Skeleton";

const meta = {
  title: "service/ServiceForm/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    return (
      <div className="w-4xl">
        <ServiceConfigProvider>
          <Skeleton />
        </ServiceConfigProvider>
      </div>
    );
  },
};
