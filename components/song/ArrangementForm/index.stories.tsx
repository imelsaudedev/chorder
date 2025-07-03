import { useCreateOrUpdateArrangement } from "@/app/api/api-client.mock";
import arrangements from "@/mock/arrangements";
import { ClientArrangement } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import ArrangementForm from "./index";

const meta = {
  title: "song/ArrangementForm/Main",
  component: ArrangementForm,
} satisfies Meta<typeof ArrangementForm>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  beforeEach,
  render: makeRenderer(null),
};
export const EditForm: Story = {
  parameters: {
    layout: "centered",
  },
  beforeEach,
  render: makeRenderer(arrangements[1]),
};

async function beforeEach() {
  useCreateOrUpdateArrangement.mockImplementation(
    (arrangementId?: number | null) => {
      let arrangement: ClientArrangement | undefined;
      return {
        arrangement,
        createOrUpdateArrangement: async (
          newArrangement: ClientArrangement
        ) => {
          console.log(
            "Mock createOrUpdateArrangement called with:",
            newArrangement
          );
          arrangement = { ...newArrangement, id: arrangementId ?? 1 };
          return arrangement;
        },
        isMutating: false,
        isError: null,
      };
    }
  );
}

function makeRenderer(origArrangement: ClientArrangement | null) {
  return () => {
    const [arrangement, setArrangement] = useState<ClientArrangement | null>(
      origArrangement
    );

    function onSubmit(arrangement: ClientArrangement) {
      console.log("Submitted Arrangement:", arrangement);
      setArrangement(arrangement);
    }

    return (
      <div className="max-w-2xl">
        <ArrangementForm arrangement={arrangement} onSaved={onSubmit} />

        <div className="mt-4">
          <p>Submitted arrangement:</p>
          <pre>{JSON.stringify(arrangement, null, 2)}</pre>
        </div>
      </div>
    );
  };
}
