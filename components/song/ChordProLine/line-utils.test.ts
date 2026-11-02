import { describe, expect, it } from "vitest";
import type { ChordProItem } from "@/chopro/music";
import { isConnection, prepareItemsForMode } from "./line-utils";

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

describe("prepareItemsForMode", () => {
  const comment: ChordProItem = { _name: "comment", _value: "Bateria entra" };
  const pair = (chords: string, lyrics: string): ChordProItem => ({ _name: "chordlyrics", chords, lyrics });

  it("cifra e texto: a linha como está", () => {
    const items = [comment, pair("C", "Glória ")];
    expect(prepareItemsForMode(items, "chords")).toBe(items);
    expect(prepareItemsForMode(items, "text")).toBe(items);
  });

  it("letra: tira as convenções", () => {
    const result = prepareItemsForMode([comment, pair("C", "Glória "), pair("G", "ao Senhor")], "lyrics");
    expect(result).toHaveLength(2);
    expect(result?.some((item) => item._name === "comment")).toBe(false);
  });

  it("letra: uma linha que só tinha convenção some por inteiro", () => {
    expect(prepareItemsForMode([comment], "lyrics")).toBeNull();
  });

  it("letra: linha em branco continua em branco (espaço entre estrofes)", () => {
    expect(prepareItemsForMode([], "lyrics")).toEqual([]);
  });

  it("convenções: tira os acordes e junta os pedaços de letra entre convenções", () => {
    // "gra[D]tidão" vira um item só (sem o tracinho que liga as partes de uma palavra)
    const result = prepareItemsForMode([pair("", "Deus "), pair("D", "gra"), pair("G", "tidão")], "conventions");
    expect(result).toEqual([{ _name: "chordlyrics", chords: "", lyrics: "Deus gratidão" }]);
  });

  it("convenções: a convenção continua marcando onde começa o trecho seguinte", () => {
    const result = prepareItemsForMode(
      [pair("C", "Glória "), comment, pair("G", "ao "), pair("Am", "Senhor")],
      "conventions"
    );
    expect(result).toEqual([
      { _name: "chordlyrics", chords: "", lyrics: "Glória " },
      comment,
      { _name: "chordlyrics", chords: "", lyrics: "ao Senhor" },
    ]);
  });

  it("convenções: uma linha só com convenção continua aparecendo", () => {
    expect(prepareItemsForMode([comment], "conventions")).toEqual([comment]);
  });
});
