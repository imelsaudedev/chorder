import SongConfigProvider, { useSongConfig } from "@/components/config/SongConfig";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import KeyButtonSet from "./index";

function Preference() {
  const { enharmonicPreference } = useSongConfig();
  return <span data-testid="pref">{String(enharmonicPreference)}</span>;
}

function Harness({ originalKey = "G", initial = 0, onSet }: { originalKey?: string; initial?: number; onSet?: (v: number) => void }) {
  const [transpose, setTranspose] = useState(initial);
  return (
    <SongConfigProvider>
      <KeyButtonSet
        originalKey={originalKey}
        transpose={transpose}
        setTranspose={(action) => {
          const next = typeof action === "function" ? action(transpose) : action;
          onSet?.(next);
          setTranspose(next);
        }}
      />
      <Preference />
      <button onClick={() => setTranspose(0)}>externo</button>
    </SongConfigProvider>
  );
}

const readout = () => screen.getByTestId("key-readout").textContent;
const pref = () => screen.getByTestId("pref").textContent;
const note = (n: string) => screen.getByRole("button", { name: `Nota ${n}` });
const flat = () => screen.getByRole("button", { name: "Bemol" });
const sharp = () => screen.getByRole("button", { name: "Sustenido" });

describe("KeyButtonSet", () => {
  it("mostra as sete notas, bemol e sustenido, e o tom atual", () => {
    render(<Harness originalKey="G" />);
    expect(screen.getAllByRole("button", { name: /^Nota [A-G]$/ }).map((b) => b.textContent)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    expect(flat()).toBeInTheDocument();
    expect(sharp()).toBeInTheDocument();
    expect(note("G")).toHaveAttribute("aria-pressed", "true");
    expect(note("A")).toHaveAttribute("aria-pressed", "false");
    expect(readout()).toBe("G");
  });

  it("tocar numa nota escolhe o tom natural e calcula o deslocamento sobre o tom original", async () => {
    const onSet = vi.fn();
    render(<Harness originalKey="G" onSet={onSet} />);
    await userEvent.setup().click(note("A"));
    expect(onSet).toHaveBeenCalledWith(2);
    expect(readout()).toBe("A");
    expect(pref()).toBe("null");
  });

  it("tocar em ♯ liga o acidente sobre a nota atual e define a preferência de grafia", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="G" />);
    await user.click(sharp());
    expect(readout()).toBe("G♯");
    expect(pref()).toBe("sharp");
    expect(sharp()).toHaveAttribute("aria-pressed", "true");
    expect(note("G")).toHaveAttribute("aria-pressed", "true");
  });

  it("tocar de novo no acidente ativo desliga e volta ao tom natural", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="G" />);
    await user.click(sharp());
    await user.click(sharp());
    expect(readout()).toBe("G");
    expect(pref()).toBe("null");
  });

  it("com ♯ ativo, tocar em ♭ troca para bemol sobre a mesma nota", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="G" />);
    await user.click(note("D"));
    await user.click(sharp());
    expect(readout()).toBe("D♯");
    await user.click(flat());
    expect(readout()).toBe("D♭");
    expect(pref()).toBe("flat");
  });

  it("tocar numa nota com acidente ativo volta ao tom natural daquela nota", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="G" />);
    await user.click(note("D"));
    await user.click(sharp());
    await user.click(note("D"));
    expect(readout()).toBe("D");
  });

  it("desabilita as combinações que repetem outra nota (E♯, B♯, C♭, F♭)", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="G" />);
    await user.click(note("E"));
    expect(sharp()).toBeDisabled();
    expect(flat()).toBeEnabled();
    await user.click(note("B"));
    expect(sharp()).toBeDisabled();
    await user.click(note("C"));
    expect(flat()).toBeDisabled();
    expect(sharp()).toBeEnabled();
    await user.click(note("F"));
    expect(flat()).toBeDisabled();
  });

  it("mantém o sufixo do tom original (tom menor)", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="Em" />);
    expect(readout()).toBe("Em");
    await user.click(note("D"));
    await user.click(sharp());
    expect(readout()).toBe("D♯m");
  });

  it("escolher o mesmo tom que já está (ainda que o deslocamento seja outro) não mexe no deslocamento", async () => {
    const onSet = vi.fn();
    render(<Harness originalKey="G" initial={-17} onSet={onSet} />);
    expect(readout()).toBe("D");
    await userEvent.setup().click(note("D"));
    expect(onSet).not.toHaveBeenCalled();
  });

  it("trocar o tom por outro caminho limpa a preferência de grafia", async () => {
    const user = userEvent.setup();
    render(<Harness originalKey="G" />);
    await user.click(sharp());
    expect(pref()).toBe("sharp");
    await user.click(screen.getByRole("button", { name: "externo" }));
    expect(readout()).toBe("G");
    expect(pref()).toBe("null");
  });

  it("sem tom original válido não renderiza", () => {
    const { container } = render(<Harness originalKey="" />);
    expect(container.querySelector("[role=group]")).toBeNull();
  });
});
