import { describe, it, expect } from "vitest";
import { arrangementSchema } from "./arrangement";

const baseUnit = { content: "Verso", type: "VERSE" as const, order: 1, notes: null, repeatCount: 1 };

const baseArrangement = {
  key: "G",
  name: null,
  originalArrangementId: null,
  isDefault: true,
  isDeleted: false,
  isServiceArrangement: false,
  youtubeUrl: null,
  audios: [],
  units: [baseUnit],
};

describe("arrangementSchema — youtubeUrl", () => {
  it("aceita URL válida", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
    });
    expect(result.success).toBe(true);
  });

  it("aceita string vazia", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      youtubeUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("aceita null", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      youtubeUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita URL inválida", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      youtubeUrl: "nao-e-uma-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita URL sem protocolo", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      youtubeUrl: "youtube.com/watch?v=abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("arrangementSchema — audios", () => {
  it("aceita array vazio", () => {
    const result = arrangementSchema.safeParse({ ...baseArrangement, audios: [] });
    expect(result.success).toBe(true);
  });

  it("aceita array com um áudio válido", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      audios: [{ url: "https://example.com/audio.mp3", label: "Voz", order: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita áudio sem label", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      audios: [{ url: "https://example.com/audio.mp3", label: "", order: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita áudio com URL inválida", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      audios: [{ url: "nao-e-url", label: "Voz", order: 0 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("arrangementSchema — units", () => {
  it("rejeita arranjo sem unidades", () => {
    const result = arrangementSchema.safeParse({
      ...baseArrangement,
      units: [],
    });
    expect(result.success).toBe(false);
  });

  it("aceita arranjo com pelo menos uma unidade", () => {
    const result = arrangementSchema.safeParse(baseArrangement);
    expect(result.success).toBe(true);
  });
});
