import { ClientArrangement } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ConfirmDeleteAlert from "./index";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";

const meta = {
  title: "common/ConfirmDeleteAlert",
  component: ConfirmDeleteAlert,
} satisfies Meta<typeof ConfirmDeleteAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    alertTitle: "Confirm Delete",
    alertDescription: "Are you sure you want to delete this arrangement?",
    onDelete: () => {
      console.log("Deleted!");
    },
  },
  render: (args) => (
    <AlertDialog>
      <ConfirmDeleteAlert
        alertTitle={args.alertTitle}
        alertDescription={args.alertDescription}
        onDelete={args.onDelete}
      />
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete!</Button>
      </AlertDialogTrigger>
    </AlertDialog>
  ),
};
