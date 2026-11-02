import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StageModeControls from "./StageModeControls";

vi.mock("@/components/config/KeyButtonSet", () => ({
  default: () => <div data-testid="key-button-set" />,
}));

const baseProps = {
  indexLabel: "3/5" as string | null,
  title: "Nada Além do Sangue",
  map: null,
  layoutMode: "scroll" as const,
  onLayoutModeChange: vi.fn(),
  showRoteiro: false,
  onShowRoteiroChange: vi.fn(),
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

  it("sem contador (item do roteiro na tela) mostra só o título", () => {
    render(<StageModeControls {...baseProps} indexLabel={null} title="Oração · Oração inicial" />);
    expect(screen.queryByText("3/5")).toBeNull();
    expect(screen.getByText("Oração · Oração inicial")).toBeDefined();
  });

  it("o seletor de layout fica no rodapé e troca para a visão geral", async () => {
    const user = userEvent.setup();
    const onLayoutModeChange = vi.fn();
    render(<StageModeControls {...baseProps} onLayoutModeChange={onLayoutModeChange} />);
    expect(screen.getByRole("radio", { name: /rolagem/i })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /visão geral/i }));
    expect(onLayoutModeChange).toHaveBeenCalledWith("overview");
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
  it("parado: o play traz a velocidade da música no nome, sem mostrá-la", () => {
    render(<StageModeControls {...baseProps} isScrollEnabled={false} scrollSpeedMultiplier={0.75} />);
    const button = screen.getByRole("button", { name: /ligar rolagem \(0\.75x\)/i });
    expect(button).not.toHaveTextContent("0.75x");
  });

  it("rolando: o botão mostra só a velocidade e pausa", () => {
    render(<StageModeControls {...baseProps} isScrollEnabled={true} scrollSpeedMultiplier={0.5} />);
    const button = screen.getByRole("button", { name: /pausar rolagem/i });
    expect(button).toHaveTextContent("0.5x");
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

describe("StageModeControls — visão geral", () => {
  const overview = {
    editable: true,
    settings: { columns: 0, fontSize: 0, density: "auto" as const },
    fit: null,
    onChange: vi.fn(),
    position: "2/6",
    canPrev: true,
    canNext: true,
    onPrev: vi.fn(),
    onNext: vi.fn(),
  };

  it("troca o play por anterior/próxima, com a posição entre as telas", async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(<StageModeControls {...baseProps} layoutMode="overview" overview={{ ...overview, onPrev, onNext }} />);
    expect(screen.queryByRole("button", { name: /rolagem/i })).toBeNull();
    expect(screen.getByText("2/6")).toBeDefined();
    await user.click(screen.getByRole("button", { name: /tela anterior/i }));
    await user.click(screen.getByRole("button", { name: /próxima tela/i }));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("desabilita anterior na primeira tela e próxima na última", () => {
    render(
      <StageModeControls
        {...baseProps}
        layoutMode="overview"
        overview={{ ...overview, canPrev: false, canNext: false }}
      />
    );
    expect(screen.getByRole("button", { name: /tela anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /próxima tela/i })).toBeDisabled();
  });
});

describe("StageModeControls — exibir roteiro", () => {
  it("o interruptor nas configurações liga o roteiro", async () => {
    const user = userEvent.setup();
    const onShowRoteiroChange = vi.fn();
    render(<StageModeControls {...baseProps} onShowRoteiroChange={onShowRoteiroChange} />);
    await user.click(screen.getByRole("button", { name: /configurações/i }));
    await user.click(await screen.findByRole("switch", { name: /exibir roteiro/i }));
    expect(onShowRoteiroChange).toHaveBeenCalledWith(true);
  });
});

describe("StageModeControls — mapa no lugar do título", () => {
  it("com o mapa, mostra o mapa numa linha abaixo e mantém título, contador, configurações e sair", () => {
    render(<StageModeControls {...baseProps} map={<div data-testid="mapa" />} />);
    expect(screen.getByTestId("mapa")).toBeDefined();
    expect(screen.getByText("Nada Além do Sangue")).toBeDefined();
    expect(screen.getByText("3/5")).toBeDefined();
    expect(screen.getByRole("button", { name: /configurações/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /sair do modo palco/i })).toBeDefined();
  });
});
