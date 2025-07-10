import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import service from "@/mock/service";
import { ClientService } from "@/prisma/models";
import { DateTime } from "luxon";
import ServiceList from "./index";

const meta = {
  title: "service/ServiceList",
  component: ServiceList,
} satisfies Meta<typeof ServiceList>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const services: ClientService[] = [];
    const sunday = DateTime.now().plus({ week: 2 }).startOf("week");
    for (let i = 0; i < 20; i++) {
      const date = sunday.minus({ days: 7 * i });
      services.push({
        ...service,
        date: date.toJSDate(),
        slug: date.toFormat("yyyy-MM-dd"),
      });
    }

    return <ServiceList services={services} />;
  },
};
