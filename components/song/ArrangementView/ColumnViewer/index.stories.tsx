import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongConfigProvider, {
    useSongConfig,
} from "@/components/config/SongConfig";
import { ClientSongUnit } from "@/prisma/models";
import SongConfig from "../../ArrangementHeader/SongConfig";
import ColumnViewer from "./index";

const meta = {
  title: "song/ArrangementView/ColumnViewer",
  component: ColumnViewer,
} satisfies Meta<typeof ColumnViewer>;

export default meta;
type Story = StoryObj<{
  units: ClientSongUnit[];
}>;

export const WithNotes: Story = {
  parameters: { layout: "centered" },
  args: {
    units: [
      { content: "[C]This is a [G]test line with [Am]chords", type: "INTRO", order: 0, notes: "Só base", repeatCount: 1 },
      { content: "[F]Another line with [Dm]chords", type: "VERSE", order: 1, notes: "Suave — só voz", repeatCount: 1 },
      { content: "[G]Ending line with [C]chords", type: "CHORUS", order: 2, notes: null, repeatCount: 3 },
    ],
  },
  render: ({ units }) => {
    return (
      <SongConfigProvider>
        <SongConfig />
        <Viewer units={units} />
      </SongConfigProvider>
    );
  },
};

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    units: [
      { content: "[C]This is a [G]test line with [Am]chords", type: "INTRO", order: 0, notes: null, repeatCount: 1 },
      { content: "[F]Another line with [Dm]chords", type: "VERSE", order: 1, notes: null, repeatCount: 1 },
      { content: "[G]Ending line with [C]chords", type: "CHORUS", order: 2, notes: null, repeatCount: 1 },
    ],
  },
  render: ({ units }) => {
    return (
      <SongConfigProvider>
        <SongConfig />
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
