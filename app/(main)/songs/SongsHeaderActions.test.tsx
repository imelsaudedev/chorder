import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SongsHeaderActions from "./SongsHeaderActions";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("./NewSongProvider", () => ({ useNewSong: () => ({ openNewSong: vi.fn() }) }));

describe("SongsHeaderActions", () => {
  it("mostra Nova música para quem edita músicas", () => {
    render(<SongsHeaderActions canEdit />);
    expect(screen.getByRole("button", { name: "newSong" })).toBeEnabled();
  });

  it("não renderiza nada (nem botão apagado) para quem não edita", () => {
    const { container } = render(<SongsHeaderActions canEdit={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
