import { describe, expect, it } from "vitest";
import { isTheme, resolveIsDark } from "./theme";

describe("resolveIsDark", () => {
  it("claro e escuro ignoram o sistema", () => {
    expect(resolveIsDark("light", true)).toBe(false);
    expect(resolveIsDark("dark", false)).toBe(true);
  });
  it("sistema segue a preferência", () => {
    expect(resolveIsDark("system", true)).toBe(true);
    expect(resolveIsDark("system", false)).toBe(false);
  });
});

describe("isTheme", () => {
  it("aceita só os três valores", () => {
    expect(isTheme("system")).toBe(true);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
