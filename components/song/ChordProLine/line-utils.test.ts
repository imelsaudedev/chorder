import { describe, expect, it } from "vitest";
import { isConnection } from "./line-utils";

describe("isConnection", () => {
  it("não conecta duas palavras diferentes separadas por um acorde (\"Deus [C]te\")", () => {
    const items = [
      { chords: "", lyrics: "Deus " },
      { chords: "C", lyrics: "te " },
      { chords: "", lyrics: "ama" },
    ];
    expect(isConnection(items, 0)).toBe(false);
    expect(isConnection(items, 1)).toBe(false);
  });

  it("conecta a mesma palavra partida por um acorde no meio (\"gra[D]tidão\")", () => {
    const items = [
      { chords: "", lyrics: "gra" },
      { chords: "D", lyrics: "tidão" },
    ];
    expect(isConnection(items, 0)).toBe(true);
  });

  it("não conecta quando um dos lados é uma convenção", () => {
    const items = [
      { chords: "", lyrics: "gra" },
      { _name: "comment", _value: "Forte" },
      { chords: "D", lyrics: "tidão" },
    ];
    expect(isConnection(items, 0)).toBe(false);
    expect(isConnection(items, 1)).toBe(false);
  });

  it("não conecta o último item da linha", () => {
    const items = [{ chords: "", lyrics: "gra" }];
    expect(isConnection(items, 0)).toBe(false);
  });

  it("não conecta quando um dos lados não tem letra nenhuma (acordes colados)", () => {
    const items = [
      { chords: "C", lyrics: "" },
      { chords: "D", lyrics: "te" },
    ];
    expect(isConnection(items, 0)).toBe(false);
  });
});
