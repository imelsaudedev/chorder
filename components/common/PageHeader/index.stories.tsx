import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import PageHeader from "./index";

const meta = {
  title: "common/PageHeader",
  component: PageHeader,
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Page Header",
    subtitle: "This is a subtitle",
    actions: <Button>Action</Button>,
    backLinkHref: "/",
    backLinkText: "Back",
  },
  render: (args) => (
    <div className="w-4xl">
      <PageHeader {...args} />
    </div>
  ),
};

export const Edit: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Edit Page Header",
    actions: <Button>Action</Button>,
    variant: "edit",
  },
  render: (args) => (
    <div className="w-4xl">
      <PageHeader {...args} />
    </div>
  ),
};
