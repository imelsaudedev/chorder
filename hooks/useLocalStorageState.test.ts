import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLocalStorageState } from "./useLocalStorageState";

afterEach(() => {
  window.localStorage.clear();
});

describe("useLocalStorageState", () => {
  it("usa o valor padrão quando não há nada salvo", () => {
    const { result } = renderHook(() => useLocalStorageState("chave", 24));
    expect(result.current[0]).toBe(24);
  });

  it("lê um valor já salvo na chave", () => {
    window.localStorage.setItem("chave", JSON.stringify(30));
    const { result } = renderHook(() => useLocalStorageState("chave", 24));
    expect(result.current[0]).toBe(30);
  });

  it("persiste ao chamar o setter", () => {
    const { result } = renderHook(() => useLocalStorageState("chave", 24));
    act(() => result.current[1](32));
    expect(result.current[0]).toBe(32);
    expect(window.localStorage.getItem("chave")).toBe("32");
  });

  it("recarrega o valor ao trocar de chave", () => {
    window.localStorage.setItem("musica-a", JSON.stringify(20));
    window.localStorage.setItem("musica-b", JSON.stringify(28));
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorageState(key, 24),
      { initialProps: { key: "musica-a" } }
    );
    expect(result.current[0]).toBe(20);
    rerender({ key: "musica-b" });
    expect(result.current[0]).toBe(28);
  });

  it("volta ao valor padrão ao trocar para uma chave nunca salva", () => {
    window.localStorage.setItem("musica-a", JSON.stringify(20));
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorageState(key, 24),
      { initialProps: { key: "musica-a" } }
    );
    expect(result.current[0]).toBe(20);
    rerender({ key: "musica-nova" });
    expect(result.current[0]).toBe(24);
  });

  it("não quebra se o armazenamento lançar erro ao salvar", () => {
    const setItemSpy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const { result } = renderHook(() => useLocalStorageState("chave", 24));
    expect(() => act(() => result.current[1](32))).not.toThrow();
    expect(result.current[0]).toBe(32);
    setItemSpy.mockRestore();
  });

  it("não quebra se o armazenamento lançar erro ao ler", () => {
    const getItemSpy = vi
      .spyOn(window.localStorage, "getItem")
      .mockImplementation(() => {
        throw new Error("SecurityError");
      });
    const { result } = renderHook(() => useLocalStorageState("chave", 24));
    expect(result.current[0]).toBe(24);
    getItemSpy.mockRestore();
  });
});
