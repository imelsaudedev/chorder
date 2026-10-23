import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pushStageModeEntry, requestStageModeExit, useStageModeBack } from "./useStageModeHistory";

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, "");
});

describe("requestStageModeExit", () => {
  it("com a entrada do modo no histórico, volta nela em vez de sair direto", () => {
    pushStageModeEntry();
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    const exitNow = vi.fn();
    requestStageModeExit(exitNow);
    expect(back).toHaveBeenCalledTimes(1);
    expect(exitNow).not.toHaveBeenCalled();
  });

  it("sem a entrada (ex. página recarregada no modo), sai direto", () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    const exitNow = vi.fn();
    requestStageModeExit(exitNow);
    expect(exitNow).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
  });
});

describe("useStageModeBack", () => {
  it("chama onBack quando o histórico volta pra fora da entrada do modo", () => {
    const onBack = vi.fn();
    renderHook(() => useStageModeBack(onBack));
    window.history.replaceState(null, "");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("ignora popstate enquanto ainda está na entrada do modo", () => {
    const onBack = vi.fn();
    renderHook(() => useStageModeBack(onBack));
    pushStageModeEntry();
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(onBack).not.toHaveBeenCalled();
  });

  it("para de escutar ao desmontar", () => {
    const onBack = vi.fn();
    const { unmount } = renderHook(() => useStageModeBack(onBack));
    unmount();
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(onBack).not.toHaveBeenCalled();
  });
});
