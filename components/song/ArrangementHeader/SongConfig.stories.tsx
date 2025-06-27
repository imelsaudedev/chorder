import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongConfig from "./SongConfig";
import SongConfigProvider from "@/components/config/SongConfig";

const meta = {
  title: "song/ArrangementHeader/SongConfig",
  component: SongConfig,
} satisfies Meta<typeof SongConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    originalKey: "C",
  },
  render: (args) => {
    return (
      <SongConfigProvider>
        <SongConfig {...args} />
      </SongConfigProvider>
    );
  },
};
