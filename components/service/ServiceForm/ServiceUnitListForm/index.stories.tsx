import {
  useFetchSongArrangements,
  useFetchSongs,
} from "@/app/api/api-client.mock";
import { Form } from "@/components/ui/form";
import arrangements from "@/mock/arrangements";
import service from "@/mock/service";
import songs from "@/mock/songs";
import { ServiceSchema } from "@/schemas/service";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { initForm } from "../useServiceForm";
import ServiceUnitListForm from "./index";

const meta = {
  title: "service/ServiceUnitListForm/Main",
  component: ServiceUnitListForm,
} satisfies Meta<typeof ServiceUnitListForm>;

export default meta;
type Story = StoryObj;

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

    return (
      <div className="max-w-2xl">
        <Form {...form}>
          <ServiceUnitListForm />
        </Form>

        <div className="mt-4">
          <pre>{JSON.stringify(form.getValues(), null, 2)}</pre>
        </div>
      </div>
    );
  },
};
