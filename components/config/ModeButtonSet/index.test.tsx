import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ModeButtonSet from "./index";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => ({ chords: "Cifra", lyrics: "Letra", conventions: "Convenções", text: "Texto" })[key] ?? key,
}));

describe("ModeButtonSet", () => {
  it("mostra os quatro modos, com Convenções entre Letra e Texto", () => {
    render(<ModeButtonSet mode="chords" setMode={() => {}} />);
    expect(screen.getAllByRole("radio").map((el) => el.textContent)).toEqual(["Cifra", "Letra", "Convenções", "Texto"]);
  });

  it("cada botão tem a largura do próprio texto (flex-none): o rótulo longo não estoura o botão", () => {
    render(<ModeButtonSet mode="chords" setMode={() => {}} />);
    screen.getAllByRole("radio").forEach((el) => expect(el.className).toMatch(/(^|\s)flex-none(\s|$)/));
    screen.getAllByRole("radio").forEach((el) => expect(el.className).not.toMatch(/(^|\s)flex-1(\s|$)/));
  });

  it("escolher Convenções chama setMode('conventions')", async () => {
    const user = userEvent.setup();
    const setMode = vi.fn();
    render(<ModeButtonSet mode="chords" setMode={setMode} />);
    await user.click(screen.getByRole("radio", { name: "Convenções" }));
    expect(setMode).toHaveBeenCalledWith("conventions");
  });
});
