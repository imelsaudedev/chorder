import { describe, expect, it } from "vitest";
import { formatTimeAgo, formatTimeAgoShort } from "./relative-time";

const NOW = new Date("2026-10-23T12:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

describe("formatTimeAgo", () => {
  it.each([
    [0, "hoje"],
    [1, "ontem"],
    [4, "há 4 dias"],
    [7, "há 1 semana"],
    [14, "há 2 semanas"],
    [29, "há 4 semanas"],
    [30, "há 1 mês"],
    [75, "há 2 meses"],
    [364, "há 11 meses"],
    [365, "há 1 ano"],
    [365 + 150, "há 1 ano e meio"],
    [365 + 300, "há quase 2 anos"],
    [2 * 365 + 150, "há 2 anos e meio"],
    [2587, "há 7 anos"],
  ])("%i dias atrás -> %s", (days, expected) => {
    expect(formatTimeAgo(daysAgo(days), NOW)).toBe(expected);
  });

  it("aceita string ISO", () => {
    expect(formatTimeAgo(daysAgo(14).toISOString(), NOW)).toBe("há 2 semanas");
  });

  it("trata data futura como hoje", () => {
    expect(formatTimeAgo(daysAgo(-3), NOW)).toBe("hoje");
  });
});

describe("formatTimeAgoShort", () => {
  it.each([
    [0, "hoje"],
    [1, "ontem"],
    [4, "4 dias"],
    [14, "2 sem"],
    [75, "2 meses"],
    [365, "1 ano"],
    [365 + 300, "2 anos"],
    [3 * 365 + 330, "4 anos"],
    [365 + 150, "1 ano"],
    [2587, "7 anos"],
  ])("%i dias atrás -> %s", (days, expected) => {
    expect(formatTimeAgoShort(daysAgo(days), NOW)).toBe(expected);
  });
});
