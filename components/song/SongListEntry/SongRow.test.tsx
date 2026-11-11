import { ClientSong } from "@/prisma/models";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SongRow from "./SongRow";
import { AudioPlayerProvider } from "@/components/common/AudioPlayer/context";
import { YoutubePlayerProvider } from "@/components/common/YoutubePlayer/context";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("#api-client", () => ({ useUpdateSong: () => ({ updateSong: vi.fn(() => Promise.resolve()) }) }));
vi.mock("@/components/song/SongMetaModal", () => ({ default: () => null }));

const DAY = 86_400_000;
const song = (extra: Partial<ClientSong> = {}): ClientSong =>
  ({
    id: 1,
    slug: "a-cada-momento",
    title: "A Cada Momento",
    artist: "Vineyard",
    lyrics: "{start_of_verse}\nVerso 1:\nA cada momento\nAndando na presença\nTerceira linha",
    isDeleted: false,
    tags: [{ id: 1, name: "Congregacional", group: { id: 1, name: "Tipo", color: "#059669" } }],
    arrangements: [],
    ...extra,
  }) as ClientSong;

const renderRow = (s: ClientSong, query = "") =>
  render(
    <AudioPlayerProvider>
      <YoutubePlayerProvider>
        <SongRow song={s} query={query} />
      </YoutubePlayerProvider>
    </AudioPlayerProvider>
  );

describe("SongRow", () => {
  it("abre a música ao tocar na linha", () => {
    renderRow(song());
    expect(screen.getByRole("link", { name: "A Cada Momento" })).toHaveAttribute("href", "/songs/a-cada-momento");
  });

  it("mostra título, autor e as duas primeiras linhas cantáveis da letra (pula marcadores)", () => {
    renderRow(song());
    expect(screen.getByText("Vineyard")).toBeInTheDocument();
    expect(screen.getByText("A cada momento")).toBeInTheDocument();
    expect(screen.getByText("Andando na presença")).toBeInTheDocument();
    expect(screen.queryByText("Terceira linha")).not.toBeInTheDocument();
    expect(screen.queryByText(/start_of_verse/)).not.toBeInTheDocument();
  });

  it("mostra as categorias como chips", () => {
    renderRow(song());
    expect(screen.getByText("Congregacional")).toBeInTheDocument();
  });

  it("sem estatísticas de uso, não mostra o último uso", () => {
    renderRow(song());
    expect(screen.queryByText(/Nunca usada|hoje|há /)).not.toBeInTheDocument();
  });

  it("nunca usada aparece em itálico", () => {
    renderRow(song({ lastUsedAt: null, usageCount: 0 }));
    expect(screen.getAllByText("Nunca usada")[0].className).toContain("italic");
  });

  it("uso recente (menos de 3 semanas) em âmbar; antigo em cinza", () => {
    const { unmount } = renderRow(song({ lastUsedAt: new Date(Date.now() - 3 * DAY), usageCount: 2 }));
    expect(screen.getAllByText("há 3 dias")[0].className).toContain("bg-amber-100");
    unmount();
    renderRow(song({ lastUsedAt: new Date(Date.now() - 100 * DAY), usageCount: 2 }));
    expect(screen.getAllByText("há 3 meses")[0].className).toContain("bg-zinc-100");
  });

  it("mostra a contagem de usos no chip", () => {
    renderRow(song({ lastUsedAt: new Date(Date.now() - 3 * DAY), usageCount: 5 }));
    expect(screen.getAllByText("5×")[0]).toBeInTheDocument();
  });

  it("tem o menu de ações", () => {
    renderRow(song());
    expect(screen.getByRole("button", { name: "Mais ações" })).toBeInTheDocument();
  });
});
