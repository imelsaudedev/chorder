import { describe, expect, it } from "vitest";
import {
  currentRoot,
  formatKey,
  isAccidentalAllowed,
  isSameShift,
  normalizeShift,
  parseKey,
  semitoneOf,
  shiftToRoot,
} from "./key-utils";

describe("parseKey", () => {
  it("separa letra, acidente e sufixo", () => {
    expect(parseKey("G")).toEqual({ letter: "G", accidental: "", suffix: "" });
    expect(parseKey("Bb")).toEqual({ letter: "B", accidental: "b", suffix: "" });
    expect(parseKey("F#m")).toEqual({ letter: "F", accidental: "#", suffix: "m" });
    expect(parseKey("E9")).toEqual({ letter: "E", accidental: "", suffix: "9" });
  });
  it("tom vazio ou inválido não tem raiz", () => {
    expect(parseKey("")).toBeNull();
    expect(parseKey("H")).toBeNull();
  });
});

describe("semitoneOf", () => {
  it("notas naturais e com acidente", () => {
    expect(semitoneOf("C", "")).toBe(0);
    expect(semitoneOf("D", "#")).toBe(3);
    expect(semitoneOf("E", "b")).toBe(3);
    expect(semitoneOf("C", "b")).toBe(11);
    expect(semitoneOf("B", "#")).toBe(0);
  });
});

describe("normalizeShift / isSameShift", () => {
  it("leva ao menor deslocamento, de -5 a +6", () => {
    expect(normalizeShift(10)).toBe(-2);
    expect(normalizeShift(-10)).toBe(2);
    expect(normalizeShift(6)).toBe(6);
    expect(normalizeShift(-6)).toBe(6);
    expect(normalizeShift(12)).toBe(0);
    expect(normalizeShift(19)).toBe(-5);
  });
  it("deslocamentos que diferem de uma oitava são o mesmo tom", () => {
    expect(isSameShift(-17, 7)).toBe(true);
    expect(isSameShift(19, 7)).toBe(true);
    expect(isSameShift(0, 12)).toBe(true);
    expect(isSameShift(2, 3)).toBe(false);
  });
});

describe("shiftToRoot", () => {
  it("deslocamento do tom original até a nota escolhida", () => {
    expect(shiftToRoot("G", "A", "")).toBe(2);
    expect(shiftToRoot("G", "F", "")).toBe(-2);
    expect(shiftToRoot("G", "G", "")).toBe(0);
    expect(shiftToRoot("G", "G", "#")).toBe(1);
    expect(shiftToRoot("Em", "D", "#")).toBe(-1);
  });
  it("sem tom original válido não calcula", () => {
    expect(shiftToRoot("", "C", "")).toBeNull();
  });
});

describe("currentRoot", () => {
  it("sem deslocamento é o próprio tom original, com o sufixo", () => {
    expect(currentRoot("Em", 0, null)).toEqual({ letter: "E", accidental: "", suffix: "m" });
  });
  it("transpõe e mantém o sufixo (a grafia padrão da transposição do projeto usa bemol)", () => {
    expect(currentRoot("Em", 2, null)).toEqual({ letter: "G", accidental: "b", suffix: "m" });
    expect(currentRoot("Em", 1, null)).toEqual({ letter: "F", accidental: "", suffix: "m" });
  });
  it("a preferência escolhe a grafia do mesmo tom", () => {
    expect(currentRoot("G", 1, "sharp")).toMatchObject({ letter: "G", accidental: "#" });
    expect(currentRoot("G", 1, "flat")).toMatchObject({ letter: "A", accidental: "b" });
  });
  it("aguenta deslocamentos fora de ±11", () => {
    expect(currentRoot("G", -17, null)).toMatchObject({ letter: "D", accidental: "" });
    expect(currentRoot("G", 19, null)).toMatchObject({ letter: "D", accidental: "" });
  });
});

describe("isAccidentalAllowed", () => {
  it("desabilita as combinações que repetem outra nota", () => {
    expect(isAccidentalAllowed("E", "#")).toBe(false);
    expect(isAccidentalAllowed("B", "#")).toBe(false);
    expect(isAccidentalAllowed("C", "b")).toBe(false);
    expect(isAccidentalAllowed("F", "b")).toBe(false);
    expect(isAccidentalAllowed("C", "#")).toBe(true);
    expect(isAccidentalAllowed("B", "b")).toBe(true);
    expect(isAccidentalAllowed("E", "b")).toBe(true);
    expect(isAccidentalAllowed("F", "#")).toBe(true);
  });
});

describe("formatKey", () => {
  it("usa ♯ e ♭ e mantém o sufixo", () => {
    expect(formatKey({ letter: "B", accidental: "b", suffix: "m" })).toBe("B♭m");
    expect(formatKey({ letter: "F", accidental: "#", suffix: "" })).toBe("F♯");
    expect(formatKey({ letter: "G", accidental: "", suffix: "" })).toBe("G");
  });
});
