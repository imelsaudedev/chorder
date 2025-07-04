import ServiceConfigProvider from "@/components/config/ServiceConfig";
import service from "@/mock/service";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ServiceHeader from "./index";

const meta = {
  title: "service/ServiceHeader/Main",
  component: ServiceHeader,
} satisfies Meta<typeof ServiceHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    service,
  },
  render: (args) => {
    return (
      <div className="w-6xl">
        <ServiceConfigProvider>
          <ServiceHeader {...args} />
        </ServiceConfigProvider>
      </div>
    );
  },
};
