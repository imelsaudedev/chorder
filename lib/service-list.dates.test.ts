import { describe, expect, it } from "vitest";
import { daysUntil, groupByMonth, splitUpcomingAndPast } from "./service-list";

const at = (iso: string) => ({ date: new Date(iso), id: iso });
const NOW = new Date(2026, 10, 11, 15, 0); // 11/11/2026, quarta

describe("splitUpcomingAndPast", () => {
  it("hoje conta como próxima; próximas em ordem crescente, passadas da mais recente à mais antiga", () => {
    const items = [
      at("2026-11-08T12:00:00"),
      at("2026-11-22T12:00:00"),
      at("2026-11-11T09:00:00"),
      at("2026-10-25T12:00:00"),
      at("2026-11-15T12:00:00"),
    ];
    const { upcoming, past } = splitUpcomingAndPast(items, NOW);
    expect(upcoming.map((i) => i.id)).toEqual(["2026-11-11T09:00:00", "2026-11-15T12:00:00", "2026-11-22T12:00:00"]);
    expect(past.map((i) => i.id)).toEqual(["2026-11-08T12:00:00", "2026-10-25T12:00:00"]);
  });

  it("aceita datas como texto (resposta JSON)", () => {
    const { upcoming } = splitUpcomingAndPast([{ date: "2026-12-06T12:00:00.000Z" }], NOW);
    expect(upcoming).toHaveLength(1);
  });
});

describe("groupByMonth", () => {
  it("agrupa por mês mantendo a ordem", () => {
    const groups = groupByMonth([at("2026-11-08T12:00:00"), at("2026-11-01T12:00:00"), at("2026-10-25T12:00:00")]);
    expect(groups.map((g) => [g.key, g.items.length])).toEqual([
      ["2026-11", 2],
      ["2026-10", 1],
    ]);
    expect(groups[0].date.getMonth()).toBe(10);
  });
});

describe("daysUntil", () => {
  it("conta dias de calendário", () => {
    expect(daysUntil(new Date(2026, 10, 11, 23, 0), NOW)).toBe(0);
    expect(daysUntil(new Date(2026, 10, 15, 9, 0), NOW)).toBe(4);
    expect(daysUntil(new Date(2026, 10, 10, 9, 0), NOW)).toBe(-1);
  });
});
