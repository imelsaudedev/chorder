import { describe, expect, it } from "vitest";
import { isServiceKey } from "./isServiceKey";

const service = { slug: "2026-12-6", id: 42 };

describe("isServiceKey", () => {
  it("aceita o endereço por slug e por id", () => {
    expect(isServiceKey("/api/services/2026-12-6", service)).toBe(true);
    expect(isServiceKey("/api/services/42", service)).toBe(true);
  });
  it("aceita o endereço do link compartilhado (com ?share=)", () => {
    expect(isServiceKey("/api/services/2026-12-6?share=abc", service)).toBe(true);
  });
  it("não aceita outros cultos, listas nem chaves que não são texto", () => {
    expect(isServiceKey("/api/services/2026-12-60", service)).toBe(false);
    expect(isServiceKey("/api/services/2026-12-6/shares", service)).toBe(false);
    expect(isServiceKey("/api/services?view=list", service)).toBe(false);
    expect(isServiceKey("/api/services/421", service)).toBe(false);
    expect(isServiceKey(["/api/services/42"], service)).toBe(false);
  });
});
