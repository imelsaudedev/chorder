import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StageModeControls from "./StageModeControls";

vi.mock("@/components/config/KeyButtonSet", () => ({
  default: () => <div data-testid="key-button-set" />,
}));

const baseProps = {
  songTitles: ["Abertura", "Grande é o Senhor", "Nada Além do Sangue", "Tu és Fiel", "Final"],
  currentIndex: 2,
  onSelectSong: vi.fn(),
  originalKey: "C",
  transpose: 0,
  setTranspose: vi.fn(),
  fontSize: 24,
  onFontSizeChange: vi.fn(),
  isScrollEnabled: false,
  scrollSpeedMultiplier: 0.5,
  onTogglePlayback: vi.fn(),
  onSlower: vi.fn(),
  onFaster: vi.fn(),
  onExit: vi.fn(),
};

describe("StageModeControls — música atual", () => {
  it("exibe o contador no formato atual/total e o título da música atual", () => {
    render(<StageModeControls {...baseProps} />);
    expect(screen.getByText("3/5")).toBeDefined();
    expect(screen.getByText("Nada Além do Sangue")).toBeDefined();
  });

  it("tocar no título abre a lista do culto e escolher uma música chama onSelectSong", async () => {
    const user = userEvent.setup();
    const onSelectSong = vi.fn();
    render(<StageModeControls {...baseProps} onSelectSong={onSelectSong} />);
    await user.click(screen.getByRole("button", { name: /escolher música/i }));
    await user.click(await screen.findByRole("menuitem", { name: /tu és fiel/i }));
    expect(onSelectSong).toHaveBeenCalledWith(3);
  });

  it("chama onExit ao clicar em sair", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<StageModeControls {...baseProps} onExit={onExit} />);
    await user.click(screen.getByRole("button", { name: /sair do modo palco/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

describe("StageModeControls — configurações (tom + fonte, bandeja única)", () => {
  async function openConfig(props = baseProps) {
    const user = userEvent.setup();
    render(<StageModeControls {...props} />);
    await user.click(screen.getByRole("button", { name: /configurações/i }));
    return user;
  }

  it("não mostra tom nem fonte antes de abrir a bandeja", () => {
    render(<StageModeControls {...baseProps} />);
    expect(screen.queryByTestId("key-button-set")).toBeNull();
    expect(screen.queryByRole("button", { name: "+" })).toBeNull();
  });

  it("abre uma única bandeja com tom e fonte juntos", async () => {
    await openConfig();
    expect(await screen.findByTestId("key-button-set")).toBeDefined();
    expect(screen.getByRole("button", { name: "+" })).toBeDefined();
    expect(screen.getByRole("button", { name: "-" })).toBeDefined();
  });

  it("chama onFontSizeChange com +2 ao aumentar", async () => {
    const onFontSizeChange = vi.fn();
    const user = await openConfig({ ...baseProps, fontSize: 24, onFontSizeChange });
    await user.click(screen.getByRole("button", { name: "+" }));
    expect(onFontSizeChange).toHaveBeenCalledWith(26);
  });

  it("chama onFontSizeChange com -2 ao diminuir", async () => {
    const onFontSizeChange = vi.fn();
    const user = await openConfig({ ...baseProps, fontSize: 24, onFontSizeChange });
    await user.click(screen.getByRole("button", { name: "-" }));
    expect(onFontSizeChange).toHaveBeenCalledWith(22);
  });

  it("diminuir desabilitado no tamanho mínimo (16)", async () => {
    await openConfig({ ...baseProps, fontSize: 16 });
    expect(screen.getByRole("button", { name: "-" })).toBeDisabled();
  });

  it("aumentar desabilitado no tamanho máximo (40)", async () => {
    await openConfig({ ...baseProps, fontSize: 40 });
    expect(screen.getByRole("button", { name: "+" })).toBeDisabled();
  });
});

describe("StageModeControls — rolagem (play separado da velocidade)", () => {
  it("parado: mostra o play com a velocidade da música", () => {
    render(<StageModeControls {...baseProps} isScrollEnabled={false} scrollSpeedMultiplier={0.75} />);
    const button = screen.getByRole("button", { name: /ligar rolagem/i });
    expect(button).toHaveTextContent("0.75x");
  });

  it("ligado: o mesmo botão pausa", () => {
    render(<StageModeControls {...baseProps} isScrollEnabled={true} />);
    expect(screen.getByRole("button", { name: /pausar rolagem/i })).toBeDefined();
  });

  it("play, mais devagar e mais rápido chamam cada um o seu handler", async () => {
    const user = userEvent.setup();
    const onTogglePlayback = vi.fn();
    const onSlower = vi.fn();
    const onFaster = vi.fn();
    render(
      <StageModeControls
        {...baseProps}
        onTogglePlayback={onTogglePlayback}
        onSlower={onSlower}
        onFaster={onFaster}
      />
    );
    await user.click(screen.getByRole("button", { name: /ligar rolagem/i }));
    await user.click(screen.getByRole("button", { name: /mais devagar/i }));
    await user.click(screen.getByRole("button", { name: /mais rápido/i }));
    expect(onTogglePlayback).toHaveBeenCalledTimes(1);
    expect(onSlower).toHaveBeenCalledTimes(1);
    expect(onFaster).toHaveBeenCalledTimes(1);
  });

  it("desabilita mais devagar na menor velocidade e mais rápido na maior", () => {
    const { rerender } = render(<StageModeControls {...baseProps} scrollSpeedMultiplier={0.15} />);
    expect(screen.getByRole("button", { name: /mais devagar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /mais rápido/i })).toBeEnabled();

    rerender(<StageModeControls {...baseProps} scrollSpeedMultiplier={1} />);
    expect(screen.getByRole("button", { name: /mais devagar/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /mais rápido/i })).toBeDisabled();
  });
});
