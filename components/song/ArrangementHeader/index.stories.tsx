import { ClientArrangement, ClientSong } from "@/prisma/models";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongConfigProvider from "@/components/config/SongConfig";
import ArrangementHeader from "./index";

const meta = {
  title: "song/ArrangementHeader/Main",
  component: ArrangementHeader,
} satisfies Meta<typeof ArrangementHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const arrangements = [
  buildArrangement(1, true, "A"),
  buildArrangement(2, false, "B", "Arrrr"),
  buildArrangement(3, false, "C"),
];
const song = buildSong(
  1,
  "Test Song",
  "test-song",
  "Test Artist",
  "These are the lyrics\nWith multiple lines\nAnd some more lyrics",
  arrangements
);
arrangements[0].song = song;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    arrangement: arrangements[0],
  },
  render: (args) => {
    return (
      <div className="w-6xl">
        <SongConfigProvider>
          <ArrangementHeader {...args} />
        </SongConfigProvider>
      </div>
    );
  },
};

function buildArrangement(
  id: number,
  isDefault: boolean,
  key: string,
  name?: string
): ClientArrangement {
  return {
    id,
    name: name ?? null,
    originalArrangementId: null,
    isDefault,
    key,
    isDeleted: false,
    isServiceArrangement: false,
  };
}

function buildSong(
  id: number,
  title: string,
  slug: string,
  artist: string | null,
  lyrics: string,
  arrangements: ClientArrangement[]
): ClientSong {
  return {
    id,
    title,
    slug,
    artist,
    isDeleted: false,
    lyrics,
    arrangements,
  };
}
