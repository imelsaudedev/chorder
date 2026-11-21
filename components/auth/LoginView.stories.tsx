import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LoginView from "./LoginView";

const meta = {
  title: "auth/LoginView",
  component: LoginView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onGoogleSignIn: async () => {
      console.log("Google Sign In clicked");
    },
    onEmailSignIn: async (formData: FormData) => {
      console.log("Email Sign In clicked", formData.get("email"));
    },
  },
};
