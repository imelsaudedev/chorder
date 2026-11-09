import { AudioPlayerProvider } from "@/components/common/AudioPlayer/context";
import { YoutubePlayerProvider } from "@/components/common/YoutubePlayer/context";
import { clearSongsListMemory, readSongsListMemory, saveSongsListMemory } from "@/lib/songs-list-memory";
import { ClientSong } from "@/prisma/models";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SongsTable from "./index";

let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/songs",
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock("#api-client", () => ({ useUpdateSong: () => ({ updateSong: vi.fn(() => Promise.resolve()) }) }));
vi.mock("@/components/song/SongMetaModal", () => ({ default: () => null }));

const song = (title: string, extra: Partial<ClientSong> = {}): ClientSong =>
  ({ id: 1, slug: title.toLowerCase().replace(/\s+/g, "-"), title, lyrics: "linha", isDeleted: false, tags: [], arrangements: [], ...extra }) as ClientSong;

const songs = [
  song("Água viva", { usageCount: 1 }),
  song("Abra os olhos", { usageCount: 9 }),
  song("Bondade de Deus", { usageCount: 3 }),
];

const renderTable = (sort: { key: "title" | "usage" | "artist"; dir: "asc" | "desc" }, list = songs) =>
  render(
    <AudioPlayerProvider>
      <YoutubePlayerProvider>
        <SongsTable songs={list} sort={sort} />
      </YoutubePlayerProvider>
    </AudioPlayerProvider>
  );

beforeEach(() => {
  search = "";
  window.sessionStorage.clear();
  window.scrollTo = vi.fn() as never;
});

describe("SongsTable", () => {
  it("cabeçalho com a contagem de músicas (singular e plural)", () => {
    const { unmount } = renderTable({ key: "title", dir: "asc" });
    expect(screen.getByText("3 músicas")).toBeInTheDocument();
    unmount();
    renderTable({ key: "title", dir: "asc" }, [songs[0]]);
    expect(screen.getByText("1 música")).toBeInTheDocument();
  });

  it("por título: faixas de letra (uma por inicial) e títulos em ordem alfabética", () => {
    const { container } = renderTable({ key: "title", dir: "asc" });
    const bands = [...container.querySelectorAll("[data-letter-band]")].map((e) => e.id);
    expect(bands).toEqual(["a", "b"]);
    const titles = screen.getAllByRole("link").map((l) => l.getAttribute("aria-label")).filter(Boolean);
    expect(titles).toEqual(["Abra os olhos", "Água viva", "Bondade de Deus"]);
  });

  it("por uso: sem faixas de letra, mais usadas primeiro", () => {
    const { container } = renderTable({ key: "usage", dir: "desc" });
    expect(container.querySelectorAll("[data-letter-band]")).toHaveLength(0);
    const titles = screen.getAllByRole("link").map((l) => l.getAttribute("aria-label")).filter(Boolean);
    expect(titles).toEqual(["Abra os olhos", "Bondade de Deus", "Água viva"]);
  });

  it("lista vazia mostra a mensagem", () => {
    renderTable({ key: "title", dir: "asc" }, []);
    expect(screen.getByText("noSongs")).toBeInTheDocument();
  });

  it("ao abrir uma música, guarda de onde saiu (endereço com filtros)", () => {
    search = "tags=3&sort=usage";
    renderTable({ key: "usage", dir: "desc" });
    fireEvent.click(screen.getByRole("link", { name: "Bondade de Deus" }));
    const memory = readSongsListMemory();
    expect(memory?.url).toBe("/songs?tags=3&sort=usage");
    expect(memory?.slug).toBe("bondade-de-deus");
  });

  it("ao voltar com a memória desta mesma lista, retoma a rolagem e consome a memória", async () => {
    search = "tags=3";
    saveSongsListMemory({ url: "/songs?tags=3", scrollY: 640, slug: "abra-os-olhos" });
    renderTable({ key: "title", dir: "asc" });
    await vi.waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ top: 640 }));
    expect(readSongsListMemory()).toBeNull();
  });

  it("não retoma a rolagem de outra lista (outros filtros)", () => {
    search = "";
    saveSongsListMemory({ url: "/songs?tags=3", scrollY: 640, slug: "x" });
    renderTable({ key: "title", dir: "asc" });
    expect(window.scrollTo).not.toHaveBeenCalled();
    clearSongsListMemory();
  });
});
