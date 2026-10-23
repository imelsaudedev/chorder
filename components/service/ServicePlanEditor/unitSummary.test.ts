import { ClientServiceUnit } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { countPlanProgress, isUnitPending, summarizeUnit } from "./unitSummary";

function unit(partial: Partial<ClientServiceUnit> & Pick<ClientServiceUnit, "type">): ClientServiceUnit {
  return {
    clientId: "u1",
    arrangementId: null,
    semitoneTranspose: null,
    order: 1,
    ...partial,
  } as ClientServiceUnit;
}

describe("summarizeUnit (culto)", () => {
  it("fala com título mas sem quem faz: mostra o título, continua pendente e diz o que falta", () => {
    const s = summarizeUnit(unit({ type: "FALA", label: "Boas-vindas" }), "Fala");
    expect(s.title).toBe("Boas-vindas");
    expect(s.pending).toBe(true);
    expect(s.hint).toBe("Falta definir quem faz");
  });

  it("fala sem título e sem quem faz: só a chamada para preencher", () => {
    const s = summarizeUnit(unit({ type: "FALA" }), "Fala");
    expect(s.title).toBeNull();
    expect(s.placeholder).toBe("Adicione uma fala");
    expect(s.pending).toBe(true);
    expect(s.hint).toBeNull();
  });

  it("fala completa não fica pendente e mostra quem faz na sublinha", () => {
    const s = summarizeUnit(
      unit({ type: "FALA", label: "Boas-vindas", metadata: { speaker: "Ana" } }),
      "Fala"
    );
    expect(s.pending).toBe(false);
    expect(s.subtitle).toBe("Ana");
    expect(s.hint).toBeNull();
  });

  it("espaço de música vindo de template mostra o título na chamada", () => {
    const s = summarizeUnit(unit({ type: "SONG", label: "Música de abertura" }), "Música");
    expect(s.title).toBeNull();
    expect(s.pending).toBe(true);
    expect(s.placeholder).toBe("Adicione uma música · Música de abertura");
  });

  it("isUnitPending e countPlanProgress seguem a regra de pendente", () => {
    const done = unit({ type: "FALA", metadata: { speaker: "Ana" } });
    const pending = unit({ type: "FALA", label: "Boas-vindas", clientId: "u2" });
    expect(isUnitPending(done)).toBe(false);
    expect(isUnitPending(pending)).toBe(true);
    expect(
      countPlanProgress([
        { id: "s", type: "CULTO", label: "Culto", order: 1, units: [done, pending] },
      ])
    ).toEqual({ filled: 1, total: 2 });
  });
});

describe("summarizeUnit (template)", () => {
  it("nada fica pendente e o título digitado aparece", () => {
    const s = summarizeUnit(unit({ type: "FALA", label: "Boas-vindas" }), "Fala", "template");
    expect(s.title).toBe("Boas-vindas");
    expect(s.pending).toBe(false);
    expect(s.hint).toBeNull();
  });

  it("sem título, usa o nome do tipo", () => {
    const s = summarizeUnit(unit({ type: "LEITURA" }), "Leitura", "template");
    expect(s.title).toBe("Leitura");
    expect(s.pending).toBe(false);
  });

  it("música é só um espaço, com título opcional", () => {
    expect(summarizeUnit(unit({ type: "SONG" }), "Música", "template").title).toBe("Música");
    expect(
      summarizeUnit(unit({ type: "SONG", label: "Música de abertura" }), "Música", "template").title
    ).toBe("Música de abertura");
  });

  it("avisos aparecem mesmo sem itens", () => {
    const s = summarizeUnit(unit({ type: "AVISOS" }), "Avisos", "template");
    expect(s.title).toBe("Avisos");
    expect(s.pending).toBe(false);
  });
});
