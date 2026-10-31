import { describe, expect, it } from "vitest";
import { ClientSongUnit } from "@/prisma/models";
import {
  appendUnit,
  changeUnitType,
  duplicateUnit,
  insertUnitAfter,
  insertUnitBefore,
  moveUnitDown,
  moveUnitTo,
  moveUnitUp,
  removeUnit,
  setUnitContent,
  setUnitNotes,
} from "./unitListOperations";

function makeUnits(types: ClientSongUnit["type"][]): ClientSongUnit[] {
  return types.map((type, i) => ({
    type,
    content: `conteúdo ${i}`,
    order: i + 1,
    notes: null,
    repeatCount: 1,
  }));
}

function orders(units: ClientSongUnit[]) {
  return units.map((u) => u.order);
}

describe("moveUnitUp/moveUnitDown", () => {
  it("troca de posição e renumera order (critério 7)", () => {
    const units = makeUnits(["INTRO", "VERSE", "CHORUS"]);
    const moved = moveUnitDown(units, 0);
    expect(moved.map((u) => u.type)).toEqual(["VERSE", "INTRO", "CHORUS"]);
    expect(orders(moved)).toEqual([1, 2, 3]);
  });

  it("não move além das pontas", () => {
    const units = makeUnits(["INTRO", "VERSE"]);
    expect(moveUnitUp(units, 0)).toBe(units);
    expect(moveUnitDown(units, 1)).toBe(units);
  });

  it("moveUnitUp é o inverso de moveUnitDown", () => {
    const units = makeUnits(["INTRO", "VERSE", "CHORUS"]);
    const down = moveUnitDown(units, 1);
    const backUp = moveUnitUp(down, 2);
    expect(backUp.map((u) => u.type)).toEqual(units.map((u) => u.type));
  });
});

describe("moveUnitTo", () => {
  it("move de um índice pra qualquer outro (não só vizinho), renumera", () => {
    const units = makeUnits(["INTRO", "VERSE", "CHORUS", "BRIDGE"]);
    const moved = moveUnitTo(units, 0, 2);
    expect(moved.map((u) => u.type)).toEqual(["VERSE", "CHORUS", "INTRO", "BRIDGE"]);
    expect(orders(moved)).toEqual([1, 2, 3, 4]);
  });

  it("move pra trás também", () => {
    const units = makeUnits(["INTRO", "VERSE", "CHORUS", "BRIDGE"]);
    const moved = moveUnitTo(units, 3, 0);
    expect(moved.map((u) => u.type)).toEqual(["BRIDGE", "INTRO", "VERSE", "CHORUS"]);
  });

  it("é a mesma operação de moveUnitUp/moveUnitDown pra vizinhos", () => {
    const units = makeUnits(["INTRO", "VERSE", "CHORUS"]);
    expect(moveUnitTo(units, 0, 1)).toEqual(moveUnitDown(units, 0));
  });

  it("não faz nada se origem e destino são iguais, ou fora dos limites", () => {
    const units = makeUnits(["INTRO", "VERSE"]);
    expect(moveUnitTo(units, 0, 0)).toBe(units);
    expect(moveUnitTo(units, -1, 0)).toBe(units);
    expect(moveUnitTo(units, 0, 2)).toBe(units);
  });
});

describe("duplicateUnit", () => {
  it("insere uma cópia logo depois e renumera", () => {
    const units = makeUnits(["INTRO", "VERSE"]);
    const result = duplicateUnit(units, 0);
    expect(result.map((u) => u.type)).toEqual(["INTRO", "INTRO", "VERSE"]);
    expect(orders(result)).toEqual([1, 2, 3]);
    // original não é alterado (mutação apenas na cópia nova)
    expect(units).toHaveLength(2);
  });
});

describe("insertUnitBefore/insertUnitAfter", () => {
  it("insere bloco em branco na posição certa e renumera", () => {
    const units = makeUnits(["INTRO", "VERSE"]);
    const before = insertUnitBefore(units, 1);
    expect(before.map((u) => u.type)).toEqual(["INTRO", "BLOCK", "VERSE"]);
    expect(orders(before)).toEqual([1, 2, 3]);

    const after = insertUnitAfter(units, 1);
    expect(after.map((u) => u.type)).toEqual(["INTRO", "VERSE", "BLOCK"]);
    expect(orders(after)).toEqual([1, 2, 3]);
  });
});

describe("appendUnit", () => {
  it("adiciona bloco em branco no fim (D10)", () => {
    const units = makeUnits(["INTRO"]);
    const result = appendUnit(units);
    expect(result.map((u) => u.type)).toEqual(["INTRO", "BLOCK"]);
    expect(orders(result)).toEqual([1, 2]);
  });
});

describe("removeUnit", () => {
  it("remove e renumera os seguintes", () => {
    const units = makeUnits(["INTRO", "VERSE", "CHORUS"]);
    const result = removeUnit(units, 0);
    expect(result.map((u) => u.type)).toEqual(["VERSE", "CHORUS"]);
    expect(orders(result)).toEqual([1, 2]);
  });

  it("D12: nunca remove o último bloco restante", () => {
    const units = makeUnits(["INTRO"]);
    expect(removeUnit(units, 0)).toBe(units);
  });
});

describe("changeUnitType/setUnitNotes/setUnitContent", () => {
  it("alteram só o bloco tocado (critério 6)", () => {
    const units = makeUnits(["INTRO", "VERSE"]);
    const retyped = changeUnitType(units, 0, "BRIDGE");
    expect(retyped[0].type).toBe("BRIDGE");
    expect(retyped[1]).toBe(units[1]);

    const noted = setUnitNotes(units, 1, "mais lento");
    expect(noted[1].notes).toBe("mais lento");
    expect(noted[0]).toBe(units[0]);

    const edited = setUnitContent(units, 1, "[D]novo conteúdo");
    expect(edited[1].content).toBe("[D]novo conteúdo");
    expect(edited[0]).toBe(units[0]);
  });
});
