import { ViewerProvider } from "@/components/auth/ViewerProvider";
import { ClientSong } from "@/prisma/models";
import type { UserRole } from "@prisma/client";
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
// Registra as props do modal: o que o "Editar dados" entrega a ele (tags atuais, em especial) é o que se testa.
const metaModal = vi.hoisted(() => ({ props: [] as any[] }));
vi.mock("@/components/song/SongMetaModal", () => ({
  default: (props: any) => {
    metaModal.props.push(props);
    return null;
  },
}));

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

const renderRow = (s: ClientSong, query = "", roles: UserRole[] = ["WORSHIP"]) =>
  render(
    <ViewerProvider authenticated roles={roles}>
      <AudioPlayerProvider>
        <YoutubePlayerProvider>
          <SongRow song={s} query={query} />
        </YoutubePlayerProvider>
      </AudioPlayerProvider>
    </ViewerProvider>
  );

describe("SongRow — Editar dados", () => {
  it("entrega as tags atuais da música ao modal, para não abrir sem nenhuma marcada e sobrescrevê-las ao salvar", () => {
    metaModal.props.length = 0;
    const tags = [
      { id: 3, name: "Infantis", group: { id: 1, name: "Tipo", color: "#2563eb" } },
      { id: 5, name: "Ceia do Senhor", group: { id: 2, name: "Ocasião", color: "#f97316" } },
    ];
    renderRow(song({ tags }));
    const last = metaModal.props[metaModal.props.length - 1];
    expect(last.defaultTags).toEqual(tags);
  });

  it("música sem tags entrega lista vazia (não undefined)", () => {
    metaModal.props.length = 0;
    renderRow(song({ tags: undefined }));
    const last = metaModal.props[metaModal.props.length - 1];
    expect(last.defaultTags).toEqual([]);
  });
});

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

  it("uso recente em tom quente; antigo em tom frio", () => {
    const { unmount } = renderRow(song({ lastUsedAt: new Date(Date.now() - 3 * DAY), usageCount: 2 }));
    expect(screen.getAllByText("3 dias")[0].parentElement?.className).toContain("var(--accent)");
    unmount();
    renderRow(song({ lastUsedAt: new Date(Date.now() - 400 * DAY), usageCount: 2 }));
    expect(screen.getAllByText("1 ano")[0].parentElement?.className).toContain("var(--ring)");
  });

  it("mostra a contagem de usos antes do tempo", () => {
    renderRow(song({ lastUsedAt: new Date(Date.now() - 3 * DAY), usageCount: 5 }));
    expect(screen.getAllByText("5×")[0]).toBeInTheDocument();
  });

  it("tem o menu de ações para quem edita músicas (Louvor e Admin)", () => {
    renderRow(song(), "", ["WORSHIP"]);
    expect(screen.getByRole("button", { name: "Mais ações" })).toBeInTheDocument();
  });

  it("não mostra o menu de ações para quem não edita músicas: usuário comum e Mídia", () => {
    for (const roles of [[], ["MEDIA"]] as UserRole[][]) {
      const { unmount } = renderRow(song(), "", roles);
      expect(screen.queryByRole("button", { name: "Mais ações" })).not.toBeInTheDocument();
      unmount();
    }
  });
});
