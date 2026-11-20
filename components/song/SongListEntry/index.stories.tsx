import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SongListEntry from "./index";
import { ClientSong } from "@/prisma/models";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "song/SongListEntry",
  component: SongListEntry,
} satisfies Meta<typeof SongListEntry>;

export default meta;
type Story = StoryObj<{
  title: string;
  artist?: string;
  lyrics: string;
  query?: string;
}>;

export const Default: Story = {
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Sample Song",
    artist: "Sample Artist",
    lyrics:
      "This is a sample lyric line.\nAnother line of lyrics.\nAnd yet another line.",
    query: "sample",
  },
  render: ({ title, artist, lyrics, query }) => {
    const song: ClientSong = {
      id: 1,
      slug: "sample-song",
      title,
      artist: artist ?? null,
      lyrics,
      isDeleted: false,
    };

    return <SongListEntry song={song} query={query} />;
  },
};

// O item muda de layout pela largura da lista (contêiner), não da tela:
// celular < 560px, tablet 560-859px, desktop >= 860px.
const sampleSong = (extra: Partial<ClientSong>): ClientSong => ({
  id: 1,
  slug: "sample-song",
  title: "A Cada Momento",
  artist: "Vineyard",
  lyrics: "A cada momento\nAndando na presença de Jesus\n\nOutra linha",
  isDeleted: false,
  lastUsedAt: new Date(Date.now() - 3 * 86_400_000),
  usageCount: 4,
  tags: [
    { id: 1, name: "Congregacional", group: { id: 1, name: "Tipo", color: "#059669" } },
    { id: 2, name: "Natal", group: { id: 2, name: "Ocasião", color: "#dc2626" } },
  ],
  arrangements: [
    {
      id: 1,
      songId: 1,
      name: null,
      key: "G",
      isDefault: true,
      isDeleted: false,
      isServiceArrangement: false,
      originalArrangementId: null,
      youtubeUrl: "https://youtu.be/abc",
      audios: [{ url: "/ensaio.mp3", label: "Ensaio", order: 0 }],
    } as never,
  ],
  ...extra,
});

export const Responsive: Story = {
  parameters: { layout: "padded" },
  args: { title: "", lyrics: "" },
  render: () => (
    <div className="flex flex-col gap-6">
      {[400, 700, 1100].map((w) => (
        <div key={w} style={{ width: w }} className="@container divide-y divide-border border border-dashed p-4">
          <p className="mb-2 text-xs text-muted-foreground">contêiner {w}px</p>
          <SongListEntry song={sampleSong({})} />
          <SongListEntry song={sampleSong({ id: 2, slug: "b", title: "Nunca usada, sem referências", artist: null, lastUsedAt: null, usageCount: 0, arrangements: [] })} />
        </div>
      ))}
    </div>
  ),
};
