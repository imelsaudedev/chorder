import { ClientServiceUnit } from "@/prisma/models";
import { describe, expect, it } from "vitest";
import { countPlanProgress, isUnitPending, songDisplayTitle, summarizeUnit } from "./unitSummary";

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
  it("sermão mostra pregador e referência lado a lado", () => {
    const s = summarizeUnit(
      unit({ type: "SERMAO", metadata: { preacher: "Ziel", reference: "Jo 3:16" } }),
      "Sermão"
    );
    expect(s.subtitle).toBe("Ziel · Jo 3:16");
  });

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

describe("summarizeUnit — item Outro", () => {
  it("sem título fica pendente e mostra a chamada para preencher", () => {
    const s = summarizeUnit(unit({ type: "OUTRO" }), "Outro");
    expect(s.title).toBeNull();
    expect(s.placeholder).toBe("Adicione um item");
    expect(s.pending).toBe(true);
  });

  it("com título e descrição: completo, e a descrição vira o texto de apoio", () => {
    const s = summarizeUnit(
      unit({ type: "OUTRO", label: "Ceia", metadata: { description: "Distribuir o pão e o cálice" } }),
      "Outro"
    );
    expect(s.title).toBe("Ceia");
    expect(s.detail).toBe("Distribuir o pão e o cálice");
    expect(s.pending).toBe(false);
  });

  it("no modelo o item em branco não é pendente e usa o nome do tipo", () => {
    const s = summarizeUnit(unit({ type: "OUTRO" }), "Outro", "template");
    expect(s.title).toBe("Outro");
    expect(s.pending).toBe(false);
  });
});

describe("summarizeUnit — comentário da música", () => {
  const withSong = (metadata: unknown) =>
    unit({
      type: "SONG",
      metadata: metadata as never,
      arrangement: { key: "G", name: null, song: { title: "Grande é o Senhor" } } as never,
    });

  it("o comentário aparece como texto de apoio, abaixo do título e do tom", () => {
    const s = summarizeUnit(withSong({ comment: " Começar só com violão " }), "Música");
    expect(s.title).toBe("Grande é o Senhor");
    expect(s.subtitle).toBe("Tom G");
    expect(s.detail).toBe("Começar só com violão");
  });

  it("sem comentário não há texto de apoio, e comentário vazio conta como sem", () => {
    expect(summarizeUnit(withSong(null), "Música").detail).toBeNull();
    expect(summarizeUnit(withSong({ comment: "  " }), "Música").detail).toBeNull();
  });

  it("o comentário não deixa a música pendente nem aparece sem música escolhida", () => {
    const s = summarizeUnit(unit({ type: "SONG", metadata: { comment: "x" } as never }), "Música");
    expect(s.pending).toBe(true);
    expect(s.detail).toBeNull();
  });
});

describe("título da música só nesta liturgia", () => {
  const withSong = (metadata: unknown) =>
    unit({
      type: "SONG",
      metadata: metadata as never,
      arrangement: { key: "G", name: null, song: { title: "Grande é o Senhor" } } as never,
    });

  it("usa o título próprio no lugar do cadastrado, sem mudar a sublinha", () => {
    const u = withSong({ title: " Grande é o Senhor (versão curta) " });
    const s = summarizeUnit(u, "Música");
    expect(s.title).toBe("Grande é o Senhor (versão curta)");
    expect(s.subtitle).toBe("Tom G");
    expect(songDisplayTitle(u)).toBe("Grande é o Senhor (versão curta)");
  });

  it("sem título próprio mantém o cadastrado", () => {
    expect(summarizeUnit(withSong(null), "Música").title).toBe("Grande é o Senhor");
    expect(songDisplayTitle(withSong({ title: "  " }))).toBe("Grande é o Senhor");
  });

  it("título próprio e comentário convivem", () => {
    const s = summarizeUnit(withSong({ title: "Outro nome", comment: "Só violão" }), "Música");
    expect(s.title).toBe("Outro nome");
    expect(s.detail).toBe("Só violão");
  });

  it("sem música escolhida o título próprio não aparece (continua pendente)", () => {
    const s = summarizeUnit(unit({ type: "SONG", metadata: { title: "X" } as never }), "Música");
    expect(s.title).toBeNull();
    expect(s.pending).toBe(true);
  });
});
