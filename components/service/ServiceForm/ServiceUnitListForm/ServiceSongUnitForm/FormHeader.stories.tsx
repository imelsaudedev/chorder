import service from "@/mock/service";
import { ServiceUnitSchema } from "@/schemas/service-unit";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import FormHeader from "./FormHeader";

const meta = {
  title: "service/ServiceUnitListForm/ServiceSongUnitForm/FormHeader",
  component: FormHeader,
} satisfies Meta<typeof FormHeader>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => {
    const [unit, setUnit] = useState<ServiceUnitSchema>(
      service.units![0] as unknown as ServiceUnitSchema
    );
    const [isEditing, setIsEditing] = useState(true);
    const handleRemove = () => {
      console.log("Remove unit");
    };
    const handleToggleEdit = () => {
      setIsEditing((prev) => !prev);
      console.log("Toggle edit mode");
    };

    return (
      <div className="max-w-2xl">
        <FormHeader
          index={1}
          unit={unit}
          onChangeUnit={setUnit}
          onRemoveUnit={handleRemove}
          onToggleEdit={handleToggleEdit}
          isEditing={isEditing}
        />

        <div className="mt-4">
          <pre>{JSON.stringify(unit, null, 2)}</pre>
        </div>
      </div>
    );
  },
};
