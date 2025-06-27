import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ColumnViewer from "./index";
import { ClientSongUnit } from "@/prisma/models";
import SongConfigProvider, {
  useSongConfig,
} from "@/components/config/SongConfig";
import SongConfig from "../../ArrangementHeader/SongConfig";

const meta = {
  title: "song/ArrangementView/ColumnViewer",
  component: ColumnViewer,
} satisfies Meta<typeof ColumnViewer>;

export default meta;
type Story = StoryObj<{
  units: ClientSongUnit[];
}>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    units: [
      {
        content: "[C]This is a [G]test line with [Am]chords",
        type: "INTRO",
        order: 0,
      },
      {
        content: "[F]Another line with [Dm]chords",
        type: "VERSE",
        order: 1,
      },
      {
        content: "[G]Ending line with [C]chords",
        type: "CHORUS",
        order: 2,
      },
    ],
  },
  render: ({ units }) => {
    return (
      <SongConfigProvider>
        <SongConfig originalKey="C" />
        <Viewer units={units} />
      </SongConfigProvider>
    );
  },
};

function Viewer({ units }: { units: ClientSongUnit[] }) {
  const { columns, transpose, density, mode } = useSongConfig();
  const props = { columns, transpose, density, mode };
  return <ColumnViewer originalKey="C" songUnits={units} {...props} />;
}
