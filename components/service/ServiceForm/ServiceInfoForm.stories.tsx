import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import service from "@/mock/service";
import { ServiceSchema } from "@/schemas/service";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import ServiceInfoForm from "./ServiceInfoForm";
import { initForm } from "./useServiceForm";

const meta = {
  title: "service/ServiceForm/ServiceInfoForm",
  component: ServiceInfoForm,
} satisfies Meta<typeof ServiceInfoForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
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
            <ServiceInfoForm />
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
