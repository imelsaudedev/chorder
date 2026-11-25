import { ClientServiceUnit } from "@/prisma/models";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { resolveTranspose, transposeStorageKey, useServiceTransposes } from "./useServiceTransposes";

const unit = (arrangementId: number, semitoneTranspose: number | null = 0): ClientServiceUnit =>
  ({ type: "SONG", semitoneTranspose, arrangement: { id: arrangementId, originalArrangementId: 100 + arrangementId } }) as ClientServiceUnit;

beforeEach(() => window.localStorage.clear());

describe("resolveTranspose", () => {
  it("sem ajuste local vale o tom do culto", () => {
    expect(resolveTranspose(2, null)).toBe(2);
  });
  it("ajuste local vale enquanto o culto continua no mesmo tom de quando foi feito", () => {
    expect(resolveTranspose(2, { value: 4, base: 2 })).toBe(4);
  });
  it("se o grupo mudou o tom do culto depois, o ajuste antigo deixa de valer", () => {
    expect(resolveTranspose(3, { value: 4, base: 2 })).toBe(3);
  });
});

describe("transposeStorageKey", () => {
  it("é por arranjo do culto, com fallback no original", () => {
    expect(transposeStorageKey(unit(7))).toBe("culto-tom:7");
    expect(transposeStorageKey({ type: "SONG", arrangement: { originalArrangementId: 9 } } as ClientServiceUnit)).toBe("culto-tom:9");
    expect(transposeStorageKey({ type: "SONG" } as ClientServiceUnit)).toBe("culto-tom:sem-arranjo");
  });
});

describe("useServiceTransposes", () => {
  it("começa no tom do culto (inclusive negativo e nulo)", () => {
    const { result } = renderHook(() => useServiceTransposes([unit(1, 2), unit(2, -1), unit(3, null)]));
    expect(result.current.transposes).toEqual([2, -1, 0]);
    expect(result.current.cultoTransposes).toEqual([2, -1, 0]);
  });

  it("ajustar guarda no aparelho só aquela música e sobrevive a recarregar", () => {
    const units = [unit(1, 0), unit(2, 0)];
    const first = renderHook(() => useServiceTransposes(units));
    act(() => first.result.current.setTranspose(0, 2));
    expect(first.result.current.transposes).toEqual([2, 0]);
    expect(JSON.parse(window.localStorage.getItem("culto-tom:1")!)).toEqual({ value: 2, base: 0 });
    expect(window.localStorage.getItem("culto-tom:2")).toBeNull();

    first.unmount();
    const reloaded = renderHook(() => useServiceTransposes(units));
    expect(reloaded.result.current.transposes).toEqual([2, 0]);
  });

  it("o tom do culto não muda ao ajustar localmente", () => {
    const { result } = renderHook(() => useServiceTransposes([unit(1, 0)]));
    act(() => result.current.setTranspose(0, 3));
    expect(result.current.cultoTransposes).toEqual([0]);
  });

  it("voltar ao tom do culto apaga o ajuste local", () => {
    const { result } = renderHook(() => useServiceTransposes([unit(1, 1)]));
    act(() => result.current.setTranspose(0, 4));
    expect(window.localStorage.getItem("culto-tom:1")).not.toBeNull();
    act(() => result.current.setTranspose(0, 1));
    expect(result.current.transposes).toEqual([1]);
    expect(window.localStorage.getItem("culto-tom:1")).toBeNull();
  });

  it("aviso sem mudança real (o provider avisa ao montar) não apaga nem regrava o ajuste", () => {
    window.localStorage.setItem("culto-tom:1", JSON.stringify({ value: 5, base: 0 }));
    const { result } = renderHook(() => useServiceTransposes([unit(1, 0)]));
    expect(result.current.transposes).toEqual([5]);
    act(() => result.current.setTranspose(0, 5));
    expect(JSON.parse(window.localStorage.getItem("culto-tom:1")!)).toEqual({ value: 5, base: 0 });
  });

  it("culto que carrega depois da montagem aplica o tom do culto e o ajuste local", () => {
    window.localStorage.setItem("culto-tom:1", JSON.stringify({ value: 4, base: 2 }));
    const { result, rerender } = renderHook(({ units }) => useServiceTransposes(units), {
      initialProps: { units: [] as ClientServiceUnit[] },
    });
    expect(result.current.transposes).toEqual([]);
    rerender({ units: [unit(1, 2), unit(2, 3)] });
    expect(result.current.transposes).toEqual([4, 3]);
  });

  it("ajuste de um tom de culto que já mudou é ignorado", () => {
    window.localStorage.setItem("culto-tom:1", JSON.stringify({ value: 4, base: 2 }));
    const { result } = renderHook(() => useServiceTransposes([unit(1, 5)]));
    expect(result.current.transposes).toEqual([5]);
  });

  it("valor salvo inválido é ignorado", () => {
    window.localStorage.setItem("culto-tom:1", "lixo");
    const { result } = renderHook(() => useServiceTransposes([unit(1, 2)]));
    expect(result.current.transposes).toEqual([2]);
  });
});
