import { Form } from "@/components/ui/form";
import service from "@/mock/service";
import { ServiceSchema } from "@/schemas/service";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import { initForm } from "../useServiceForm";
import SortableServiceUnitForm from "./SortableServiceUnitForm";

const meta = {
  title: "service/ServiceUnitListForm/SortableServiceUnitForm",
  component: SortableServiceUnitForm,
} satisfies Meta<typeof SortableServiceUnitForm>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const form = useForm<ServiceSchema>(initForm(service));
    form.watch();

    const units = form.getValues().units;

    return (
      <div className="max-w-2xl">
        <Form {...form}>
          {units.map((unit, index) => (
            <SortableServiceUnitForm
              key={`${index}-${unit.arrangement.song.id}`}
              unit={unit}
              index={index}
            />
          ))}
        </Form>

        <div className="mt-4">
          <pre>{JSON.stringify(units, null, 2)}</pre>
        </div>
      </div>
    );
  },
};
