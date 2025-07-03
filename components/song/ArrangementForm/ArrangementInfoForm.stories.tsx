import { useFetchSongs } from "@/app/api/api-client.mock";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import arrangements from "@/mock/arrangements";
import songs from "@/mock/songs";
import { ArrangementSchema } from "@/schemas/arrangement";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import ArrangementInfoForm from "./ArrangementInfoForm";
import { initForm } from "./useArrangementForm";

const meta = {
  title: "song/ArrangementForm/ArrangementInfoForm",
  component: ArrangementInfoForm,
} satisfies Meta<typeof ArrangementInfoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangementId: arrangements[1].id,
    songSlug: arrangements[1].song.slug,
    isDefault: false,
  },
  async beforeEach() {
    useFetchSongs.mockReturnValue({ songs, isLoading: false, isError: null });
  },
  render: (args) => {
    const form = useForm<ArrangementSchema>(initForm(arrangements[1]));

    function onSubmit(arrangement: ArrangementSchema) {
      console.log("Submitted Arrangement:", arrangement);
    }

    return (
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ArrangementInfoForm {...args} />
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
