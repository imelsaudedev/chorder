import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongConfigProvider from "@/components/config/SongConfig";
import arrangements from "@/mock/arrangements";
import { ClientArrangement } from "@/prisma/models";
import ServiceArrangementHeader from "./ServiceArrangementHeader";

const meta = {
  title: "service/ServiceView/ServiceArrangementHeader",
  component: ServiceArrangementHeader,
} satisfies Meta<typeof ServiceArrangementHeader>;

export default meta;
type Story = StoryObj<{
  arrangement: ClientArrangement;
}>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangement: arrangements[0],
  },
  render: ({ arrangement }) => {
    return (
      <div className="w-4xl">
        <SongConfigProvider>
          <ServiceArrangementHeader arrangement={arrangement} order={1} />
        </SongConfigProvider>
      </div>
    );
  },
};
