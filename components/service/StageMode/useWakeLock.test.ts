import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWakeLock } from "./useWakeLock";

function makeSentinel() {
  const listeners: Record<string, () => void> = {};
  return {
    release: vi.fn(async () => {
      listeners.release?.();
    }),
    addEventListener: vi.fn((type: string, cb: () => void) => {
      listeners[type] = cb;
    }),
    // Simula o navegador liberando o lock sozinho (ex. trocou de app).
    browserReleases: () => listeners.release?.(),
  };
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: state });
  document.dispatchEvent(new Event("visibilitychange"));
}

afterEach(() => {
  // @ts-expect-error — limpa o mock entre testes
  delete navigator.wakeLock;
  setVisibility("visible");
});

describe("useWakeLock", () => {
  it("pede o lock ao montar e libera ao desmontar", async () => {
    const sentinel = makeSentinel();
    const request = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request } });

    const { result, unmount } = renderHook(() => useWakeLock());
    await waitFor(() => expect(request).toHaveBeenCalledWith("screen"));
    expect(result.current.isUnavailable).toBe(false);

    unmount();
    expect(sentinel.release).toHaveBeenCalled();
  });

  it("pede de novo quando a página volta a ficar visível depois de o navegador liberar", async () => {
    const first = makeSentinel();
    const second = makeSentinel();
    const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request } });

    renderHook(() => useWakeLock());
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    // Troca de app: o navegador solta o lock; ao voltar, reativa.
    act(() => {
      first.browserReleases();
      setVisibility("hidden");
    });
    await act(async () => setVisibility("visible"));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("não pede um segundo lock se o primeiro ainda está ativo", async () => {
    const request = vi.fn(async () => makeSentinel());
    Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request } });

    renderHook(() => useWakeLock());
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await act(async () => setVisibility("visible"));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("marca como indisponível quando o aparelho não suporta", async () => {
    const { result } = renderHook(() => useWakeLock());
    await waitFor(() => expect(result.current.isUnavailable).toBe(true));
  });

  it("marca como indisponível quando o navegador nega com a página visível", async () => {
    const request = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request } });

    const { result } = renderHook(() => useWakeLock());
    await waitFor(() => expect(result.current.isUnavailable).toBe(true));
  });
});
