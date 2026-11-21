import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import UserNavView from "./UserNavView";

const meta = {
  title: "common/UserNav",
  component: UserNavView,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof UserNavView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "https://github.com/shadcn.png",
    },
    onSignOut: async () => {
      console.log("Signing out...");
    },
  },
};

export const NoImage: Story = {
  args: {
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      image: null,
    },
    onSignOut: async () => {
      console.log("Signing out...");
    },
  },
};

export const OnlyEmail: Story = {
  args: {
    user: {
      name: null,
      email: "only@email.com",
      image: null,
    },
    onSignOut: async () => {
      console.log("Signing out...");
    },
  },
};
