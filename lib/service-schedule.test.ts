import { describe, expect, it } from "vitest";
import { buildServiceTitle, nextSunday, ordinalWeekdayLabel } from "./service-schedule";

// Datas locais fixas (new Date(ano, mês-1, dia, hora, minuto)).
const d = (y: number, m: number, day: number, h = 0, min = 0) => new Date(y, m - 1, day, h, min);

describe("ordinalWeekdayLabel", () => {
  it("domingo e sábado no masculino", () => {
    expect(ordinalWeekdayLabel(d(2026, 10, 25))).toBe("4º domingo de outubro");
    expect(ordinalWeekdayLabel(d(2026, 10, 3))).toBe("1º sábado de outubro");
  });

  it("dias úteis no feminino", () => {
    expect(ordinalWeekdayLabel(d(2026, 9, 18))).toBe("3ª sexta de setembro");
    expect(ordinalWeekdayLabel(d(2026, 10, 7))).toBe("1ª quarta de outubro");
  });

  it("quinta ocorrência do dia no mês", () => {
    expect(ordinalWeekdayLabel(d(2026, 11, 29))).toBe("5º domingo de novembro");
  });
});

describe("buildServiceTitle", () => {
  it("usa o nome do modelo", () => {
    expect(buildServiceTitle("Culto dominical", d(2026, 10, 25))).toBe(
      "Culto dominical – 4º domingo de outubro"
    );
  });

  it("sem modelo, usa Culto", () => {
    expect(buildServiceTitle(null, d(2026, 10, 25))).toBe("Culto – 4º domingo de outubro");
    expect(buildServiceTitle("  ", d(2026, 10, 25))).toBe("Culto – 4º domingo de outubro");
  });

  it("sem data, não sugere nada", () => {
    expect(buildServiceTitle("Culto dominical", null)).toBe("");
  });
});

describe("nextSunday", () => {
  const sundayOf = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate()];

  it("sexta-feira 23/10/2026 -> domingo 25/10", () => {
    expect(sundayOf(nextSunday(d(2026, 10, 23, 14, 30)))).toEqual([2026, 10, 25]);
  });

  it("quinta e sábado também apontam para o domingo seguinte", () => {
    expect(sundayOf(nextSunday(d(2026, 10, 22)))).toEqual([2026, 10, 25]);
    expect(sundayOf(nextSunday(d(2026, 10, 24, 23, 59)))).toEqual([2026, 10, 25]);
  });

  it("no domingo, o próprio dia", () => {
    expect(sundayOf(nextSunday(d(2026, 10, 25, 8)))).toEqual([2026, 10, 25]);
  });

  it("atravessa a virada de mês", () => {
    expect(sundayOf(nextSunday(d(2026, 10, 28)))).toEqual([2026, 11, 1]);
  });

  it("devolve a meia-noite, sempre um domingo", () => {
    const result = nextSunday(d(2026, 10, 23, 14, 30));
    expect(result.getDay()).toBe(0);
    expect(result.getHours()).toBe(0);
  });
});
