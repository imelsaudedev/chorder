import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import arrangements from "@/mock/arrangements";
import { ArrangementSchema } from "@/schemas/arrangement";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { initForm } from "../useArrangementForm";
import SongUnitListForm from "./index";

const meta = {
  title: "song/ArrangementForm/SongUnitListForm",
  component: SongUnitListForm,
} satisfies Meta<typeof SongUnitListForm>;

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
      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SongUnitListForm />
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
