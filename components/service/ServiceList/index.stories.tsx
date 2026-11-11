import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ServiceListItem } from "@/prisma/models";
import { DateTime } from "luxon";
import ServiceList from "./index";

const meta = {
  title: "service/ServiceList",
  component: ServiceList,
} satisfies Meta<typeof ServiceList>;

export default meta;
type Story = StoryObj;

const LEADERS = ["Rafael", "Ana", "Davi", "Lívia"];

export const Default: Story = {
  parameters: {
    layout: "padded",
  },
  render: () => {
    const services: ServiceListItem[] = [];
    const sunday = DateTime.now().plus({ week: 2 }).startOf("week");
    for (let i = 0; i < 20; i++) {
      const date = sunday.minus({ days: 7 * i });
      services.push({
        slug: date.toFormat("yyyy-MM-dd"),
        title: i % 5 === 0 ? null : "Culto de domingo",
        date: date.toJSDate(),
        worshipLeader: LEADERS[i % LEADERS.length],
        preacher: i % 3 === 0 ? "Pr. Samuel" : null,
        sermonTheme: i % 2 === 0 ? "A graça que nos sustenta" : null,
        sermonReference: i % 2 === 0 ? "Ef 2.8-10" : null,
        startTime: "09:30",
        songCount: i % 4 === 3 ? 0 : 3 + (i % 3),
        songTitles: [],
        updatedAt: date.toJSDate(),
      });
    }
    return <ServiceList services={services} />;
  },
};
