import { Form } from "@/components/ui/form";
import service from "@/mock/service";
import { ClientServiceUnit } from "@/prisma/models";
import { ServiceSchema } from "@/schemas/service";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { initForm } from "../../useServiceForm";
import ServiceSongUnitForm from "./index";

const meta = {
  title: "service/ServiceUnitListForm/ServiceSongUnitForm/Main",
  component: ServiceSongUnitForm,
} satisfies Meta<typeof ServiceSongUnitForm>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const form = useForm<ServiceSchema>(initForm(service));
    form.watch();

    const index = 0;
    const [unit, setUnit] = useState<ClientServiceUnit>(service.units[index]);
    const handleRemove = () => {
      console.log("Remove unit");
    };

    return (
      <div className="max-w-2xl">
        <Form {...form}>
          <ServiceSongUnitForm
            index={index}
            unit={unit}
            removeUnit={handleRemove}
            onChangeUnit={setUnit}
          />
        </Form>

        <div className="mt-4">
          <pre>{JSON.stringify(form.getValues().units![index], null, 2)}</pre>
        </div>
      </div>
    );
  },
};
