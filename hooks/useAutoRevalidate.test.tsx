import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoRevalidate } from "./useAutoRevalidate";

const mutate = vi.fn((..._args: unknown[]) => Promise.resolve([]));
vi.mock("swr", async (importOriginal) => {
  const actual = await importOriginal<typeof import("swr")>();
  return { ...actual, useSWRConfig: () => ({ mutate }) };
});

const wrapper = ({ children }: { children: ReactNode }) => <SWRConfig value={{}}>{children}</SWRConfig>;
const setVisibility = (state: "visible" | "hidden") =>
  Object.defineProperty(document, "visibilityState", { configurable: true, value: state });

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  mutate.mockClear();
  setVisibility("visible");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  setVisibility("visible");
});

describe("useAutoRevalidate", () => {
  it("reconsulta as chaves aceitas a cada intervalo (com variação de ±10%)", () => {
    renderHook(() => useAutoRevalidate((k) => k === "/api/x", { intervalMs: 1000 }), { wrapper });
    expect(mutate).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate).toHaveBeenCalledTimes(1);
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it("o filtro repassado ao SWR só aceita as chaves pedidas", () => {
    renderHook(() => useAutoRevalidate((k) => typeof k === "string" && k.startsWith("/api/songs/a"), { intervalMs: 1000 }), { wrapper });
    act(() => void vi.advanceTimersByTime(1100));
    const filter = mutate.mock.calls[0][0] as (key: unknown) => boolean;
    expect(filter("/api/songs/a-cada-momento")).toBe(true);
    expect(filter("/api/tags")).toBe(false);
    expect(filter(["/api/songs/a", "x"])).toBe(false);
  });

  it("pausado (enabled=false) não consulta, e volta a consultar ao reabilitar", () => {
    const { rerender } = renderHook(({ enabled }) => useAutoRevalidate(() => true, { intervalMs: 1000, enabled }), {
      wrapper,
      initialProps: { enabled: false },
    });
    act(() => void vi.advanceTimersByTime(5000));
    expect(mutate).not.toHaveBeenCalled();
    rerender({ enabled: true });
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("aba oculta não consulta, mas continua agendando", () => {
    renderHook(() => useAutoRevalidate(() => true, { intervalMs: 1000 }), { wrapper });
    setVisibility("hidden");
    act(() => void vi.advanceTimersByTime(3300));
    expect(mutate).not.toHaveBeenCalled();
    setVisibility("visible");
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("sem rede não consulta", () => {
    renderHook(() => useAutoRevalidate(() => true, { intervalMs: 1000 }), { wrapper });
    const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate).not.toHaveBeenCalled();
    online.mockRestore();
  });

  it("ao desmontar, para de consultar", () => {
    const { unmount } = renderHook(() => useAutoRevalidate(() => true, { intervalMs: 1000 }), { wrapper });
    unmount();
    act(() => void vi.advanceTimersByTime(5000));
    expect(mutate).not.toHaveBeenCalled();
  });

  it("erro na consulta não derruba nada", async () => {
    mutate.mockImplementationOnce(() => Promise.reject(new Error("rede")));
    renderHook(() => useAutoRevalidate(() => true, { intervalMs: 1000 }), { wrapper });
    await act(async () => void vi.advanceTimersByTime(1100));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("sem interação por idleMs para de consultar; ao tocar na tela consulta na hora e retoma", () => {
    renderHook(() => useAutoRevalidate(() => true, { intervalMs: 1000, idleMs: 5000 }), { wrapper });
    act(() => void vi.advanceTimersByTime(7000));
    const before = mutate.mock.calls.length;
    act(() => void vi.advanceTimersByTime(3000));
    expect(mutate.mock.calls.length).toBe(before); // parou
    act(() => void window.dispatchEvent(new Event("pointerdown")));
    expect(mutate.mock.calls.length).toBe(before + 1); // consulta imediata
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate.mock.calls.length).toBe(before + 2); // retomou o ritmo
  });

  it("interação mantém ativo além do idleMs", () => {
    renderHook(() => useAutoRevalidate(() => true, { intervalMs: 1000, idleMs: 5000 }), { wrapper });
    for (let i = 0; i < 4; i++) {
      act(() => void vi.advanceTimersByTime(3000));
      act(() => void window.dispatchEvent(new Event("keydown")));
    }
    const before = mutate.mock.calls.length;
    act(() => void vi.advanceTimersByTime(1100));
    expect(mutate.mock.calls.length).toBe(before + 1);
  });
});
