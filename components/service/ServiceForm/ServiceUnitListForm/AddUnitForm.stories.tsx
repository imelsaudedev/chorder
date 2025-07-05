import {
  useFetchSongArrangements,
  useFetchSongs,
} from "@/app/api/api-client.mock";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import arrangements from "@/mock/arrangements";
import service from "@/mock/service";
import songs from "@/mock/songs";
import { ServiceSchema } from "@/schemas/service";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { initForm } from "../useServiceForm";
import AddUnitForm from "./AddUnitForm";

const meta = {
  title: "service/ServiceUnitListForm/AddUnitForm",
  component: AddUnitForm,
} satisfies Meta<typeof AddUnitForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  async beforeEach() {
    useFetchSongs.mockReturnValue({ songs, isLoading: false, isError: null });
    useFetchSongArrangements.mockReturnValue({
      arrangements,
      isLoading: false,
      isError: null,
    });
  },
  render: () => {
    const form = useForm<ServiceSchema>(initForm(service));
    form.watch();

    function onSubmit(service: ServiceSchema) {
      console.log("Submitted Service:", service);
    }

    return (
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AddUnitForm />
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
