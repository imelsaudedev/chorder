import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ServiceConfigProvider from "@/components/config/ServiceConfig";
import service from "@/mock/service";
import { ClientServiceUnit } from "@/prisma/models";
import ServiceSongUnitView from "./ServiceSongUnitView";

const meta = {
  title: "service/ServiceView/ServiceSongUnitView",
  component: ServiceSongUnitView,
} satisfies Meta<typeof ServiceSongUnitView>;

export default meta;
type Story = StoryObj<{
  unit: ClientServiceUnit;
}>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    unit: service.units[0] as ClientServiceUnit,
  },
  render: ({ unit }) => {
    return (
      <div className="w-4xl">
        <ServiceConfigProvider>
          <ServiceSongUnitView unit={unit} />
        </ServiceConfigProvider>
      </div>
    );
  },
};
