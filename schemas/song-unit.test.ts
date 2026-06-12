import { describe, it, expect } from "vitest";
import { songUnitSchema } from "./song-unit";

const baseUnit = { content: "[G]Verso", type: "VERSE" as const, order: 1, notes: null, repeatCount: 1 };

describe("songUnitSchema — notes", () => {
  it("aceita notes null", () => {
    const result = songUnitSchema.safeParse({ ...baseUnit, notes: null });
    expect(result.success).toBe(true);
  });

  it("aceita notes como string", () => {
    const result = songUnitSchema.safeParse({ ...baseUnit, notes: "Só voz" });
    expect(result.success).toBe(true);
  });

  it("aceita notes como string vazia", () => {
    const result = songUnitSchema.safeParse({ ...baseUnit, notes: "" });
    expect(result.success).toBe(true);
  });

  it("rejeita notes undefined (campo obrigatório no schema)", () => {
    const { notes: _, ...withoutNotes } = baseUnit;
    const result = songUnitSchema.safeParse(withoutNotes);
    expect(result.success).toBe(false);
  });
});

describe("songUnitSchema — content", () => {
  it("rejeita content vazio", () => {
    const result = songUnitSchema.safeParse({ ...baseUnit, content: "" });
    expect(result.success).toBe(false);
  });

  it("aceita content com pelo menos um caractere", () => {
    const result = songUnitSchema.safeParse({ ...baseUnit, content: "a" });
    expect(result.success).toBe(true);
  });
});

describe("songUnitSchema — type", () => {
  const validTypes = [
    "BLOCK", "INTRO", "VERSE", "PRECHORUS", "CHORUS",
    "BRIDGE", "INTERLUDE", "SOLO", "ENDING", "TEXT",
  ] as const;

  validTypes.forEach((type) => {
    it(`aceita type "${type}"`, () => {
      const result = songUnitSchema.safeParse({ ...baseUnit, type });
      expect(result.success).toBe(true);
    });
  });

  it("rejeita type desconhecido", () => {
    const result = songUnitSchema.safeParse({ ...baseUnit, type: "UNKNOWN" });
    expect(result.success).toBe(false);
  });
});
