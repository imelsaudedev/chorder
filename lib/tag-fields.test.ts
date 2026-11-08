import { describe, expect, it } from "vitest";
import { parseTagFields, parseTagGroupFields } from "./tag-fields";

describe("parseTagGroupFields", () => {
  it("devolve só as chaves enviadas", () => {
    expect(parseTagGroupFields({ presentation: "SHELF" })).toEqual({ data: { presentation: "SHELF" } });
    expect(parseTagGroupFields({})).toEqual({ data: {} });
  });

  it("aceita todos os campos válidos", () => {
    expect(
      parseTagGroupFields({ description: " Para qual data? ", presentation: "FEATURED", selection: "SINGLE", isProposed: true })
    ).toEqual({ data: { description: "Para qual data?", presentation: "FEATURED", selection: "SINGLE", isProposed: true } });
  });

  it("texto vazio limpa a descrição", () => {
    expect(parseTagGroupFields({ description: "   " })).toEqual({ data: { description: null } });
  });

  it("rejeita valores fora do enum e tipos errados", () => {
    expect(parseTagGroupFields({ presentation: "GRID" })).toHaveProperty("error");
    expect(parseTagGroupFields({ selection: "TWO" })).toHaveProperty("error");
    expect(parseTagGroupFields({ isProposed: "sim" })).toHaveProperty("error");
    expect(parseTagGroupFields({ description: 42 })).toHaveProperty("error");
  });
});

describe("parseTagFields", () => {
  it("aceita cor, padrão e imagem válidos", () => {
    expect(
      parseTagFields({ color: "#dc2626", pattern: "stars", imageUrl: "https://exemplo.com/natal.jpg", description: "O nascimento de Jesus" })
    ).toEqual({
      data: { color: "#dc2626", pattern: "stars", imageUrl: "https://exemplo.com/natal.jpg", description: "O nascimento de Jesus" },
    });
  });

  it("null e vazio limpam o campo", () => {
    expect(parseTagFields({ color: null, imageUrl: "" })).toEqual({ data: { color: null, imageUrl: null } });
  });

  it("rejeita cor fora do formato, padrão desconhecido e imagem que não é http(s)", () => {
    expect(parseTagFields({ color: "vermelho" })).toHaveProperty("error");
    expect(parseTagFields({ color: "#fff" })).toHaveProperty("error");
    expect(parseTagFields({ pattern: "zigzag" })).toHaveProperty("error");
    expect(parseTagFields({ imageUrl: "javascript:alert(1)" })).toHaveProperty("error");
  });
});
