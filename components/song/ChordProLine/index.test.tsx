import type { ChordProItem } from "@/chopro/music";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChordProLine from "./index";

const comment: ChordProItem = { _name: "comment", _value: "Bateria entra" };
const withComment: ChordProItem[] = [
  comment,
  { _name: "chordlyrics", chords: "Cm7", lyrics: "Glória " },
  { _name: "chordlyrics", chords: "G7", lyrics: "ao Senhor" },
];

function renderLine(items: ChordProItem[], mode: "chords" | "lyrics" | "conventions" | "text") {
  return render(<ChordProLine items={items} mode={mode} density="normal" />);
}

describe("ChordProLine — modos de visualização", () => {
  it("cifra: mostra acordes, letra e convenção", () => {
    renderLine(withComment, "chords");
    expect(screen.getByText("Cm7")).toBeDefined();
    expect(screen.getByText("Bateria entra")).toBeDefined();
  });

  it("letra: sem acordes, sem convenção e sem o espaço reservado a ela", () => {
    const { container } = renderLine(withComment, "lyrics");
    expect(screen.queryByText("Cm7")).toBeNull();
    expect(screen.queryByText("Bateria entra")).toBeNull();
    expect((container.firstChild as HTMLElement).className).not.toContain("pt-[1.5em]");
  });

  it("letra: uma linha só com convenção não deixa linha em branco", () => {
    const { container } = renderLine([comment], "lyrics");
    expect(container.firstChild).toBeNull();
  });

  it("convenções: letra e convenção, sem acordes", () => {
    renderLine(withComment, "conventions");
    expect(screen.queryByText("Cm7")).toBeNull();
    expect(screen.queryByText("G7")).toBeNull();
    expect(screen.getByText("Bateria entra")).toBeDefined();
    // os dois pedaços de letra viram um só (sem acordes não há por que partir)
    expect(screen.getByText("Glória ao Senhor")).toBeDefined();
  });

  it("convenções: o espaço acima da linha é reservado ao chip", () => {
    const { container } = renderLine(withComment, "conventions");
    expect((container.firstChild as HTMLElement).className).toContain("pt-[1.5em]");
  });

  it("o chip da convenção tem a face esquerda reta e a direita arredondada", () => {
    renderLine(withComment, "chords");
    const chip = screen.getByText("Bateria entra");
    expect(chip.className).toContain("rounded-r-[4px]");
    expect(chip.className).not.toMatch(/(^|\s)rounded(-[a-z]+)?(\s|$)/);
  });

  it("a linha pontilhada sobe até o topo do chip, que fica a 1px dela (não encostado)", () => {
    const { container } = renderLine(withComment, "chords");
    const chip = screen.getByText("Bateria entra");
    const line = container.querySelector(".border-dotted") as HTMLElement;
    expect(line.className).toContain("-top-[1.5em]");
    expect(chip.className).toContain("-top-[1.5em]");
    // linha em 0.25em (+1px de largura); chip começa 1px depois
    expect(line.className).toContain("left-[0.25em]");
    expect(chip.className).toContain("left-[calc(0.25em+2px)]");
  });

  it("convenção solta (sozinha na linha) também vira chip", () => {
    renderLine([comment], "conventions");
    expect(screen.getByText("Bateria entra").className).toContain("rounded-r-[4px]");
  });

  it("texto: convenção continua em itálico monoespaçado, sem chip", () => {
    renderLine(withComment, "text");
    const label = screen.getAllByText("Bateria entra")[0];
    expect(label.className).toContain("italic");
    expect(label.className).not.toContain("rounded-r-[4px]");
  });
});
