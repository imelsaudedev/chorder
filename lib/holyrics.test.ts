import { describe, expect, it } from "vitest";
import { HOLYRICS_DEFAULT_HOST, normalizeHost } from "./holyrics";

describe("normalizeHost", () => {
  it("remove protocolo e barras finais", () => {
    expect(normalizeHost("http://192.168.0.5:8091/")).toBe("192.168.0.5:8091");
    expect(normalizeHost("HTTPS://pc-midia:8091//")).toBe("pc-midia:8091");
  });
  it("mantém host simples e apara espaços", () => {
    expect(normalizeHost("  localhost:8091 ")).toBe("localhost:8091");
  });
  it("vazio ou nulo volta ao padrão", () => {
    expect(normalizeHost("")).toBe(HOLYRICS_DEFAULT_HOST);
    expect(normalizeHost("   ")).toBe(HOLYRICS_DEFAULT_HOST);
    expect(normalizeHost(null)).toBe(HOLYRICS_DEFAULT_HOST);
    expect(normalizeHost(undefined)).toBe(HOLYRICS_DEFAULT_HOST);
  });
});
