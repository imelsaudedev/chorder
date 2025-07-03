import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import arrangements from "@/mock/arrangements";
import { ArrangementSchema } from "@/schemas/arrangement";
import { useForm } from "react-hook-form";
import SongInfoForm from "./SongInfoForm";
import { initForm } from "./useArrangementForm";

const meta = {
  title: "song/ArrangementForm/SongInfoForm",
  component: SongInfoForm,
} satisfies Meta<typeof SongInfoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const form = useForm<ArrangementSchema>(initForm(arrangements[1]));

    function onSubmit(arrangement: ArrangementSchema) {
      console.log("Submitted Arrangement:", arrangement);
    }

    return (
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SongInfoForm />
            <Button type="submit">Submit</Button>
          </form>
        </Form>

        <div className="mt-4">
          <pre>{JSON.stringify(form.getValues(), null, 2)}</pre>
        </div>
      </div>
    );
  },
};
