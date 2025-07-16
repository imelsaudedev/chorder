import {
  useCreateOrUpdateService,
  useFetchSongArrangements,
  useFetchSongs,
} from "@/app/api/api-client.mock";
import arrangements from "@/mock/arrangements";
import service from "@/mock/service";
import songs from "@/mock/songs";
import { ClientService } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import ServiceForm from "./index";

const meta = {
  title: "service/ServiceForm/Main",
  component: ServiceForm,
} satisfies Meta<typeof ServiceForm>;

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
  render: makeRenderer(service),
};

async function beforeEach() {
  useFetchSongs.mockReturnValue({ songs, isLoading: false, isError: null });
  useFetchSongArrangements.mockReturnValue({
    arrangements,
    isLoading: false,
    isError: null,
  });

  useCreateOrUpdateService.mockImplementation(
    (serviceIdOrSlug: string | number | null) => {
      let service: ClientService | undefined;
      return {
        service,
        createOrUpdateService: async (newService: ClientService) => {
          console.log("Mock useCreateOrUpdateService called with:", newService);
          service = {
            ...newService,
            id: parseInt(serviceIdOrSlug?.toString() ?? "") ?? 1,
          };
          return service;
        },
        isMutating: false,
        isError: null,
      };
    }
  );
}

function makeRenderer(origService: ClientService | null) {
  return function ServiceFormRenderer() {
    const [service, setService] = useState<ClientService | null>(origService);

    function onSubmit(service: ClientService) {
      console.log("Submitted Service:", service);
      setService(service);
    }

    return (
      <div className="max-w-2xl">
        <ServiceForm service={service} onSaved={onSubmit} />

        <div className="mt-4">
          <p>Submitted service:</p>
          <pre>{JSON.stringify(service, null, 2)}</pre>
        </div>
      </div>
    );
  };
}
