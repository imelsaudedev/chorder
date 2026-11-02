import { ClientService } from "@/prisma/models";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlanDraft } from "./usePlanDraft";

const base = { slug: "culto-1", updatedAt: new Date("2026-01-01T10:00:00Z") } as unknown as ClientService;
const edited = { ...base, title: "Editado" } as ClientService;

describe("usePlanDraft", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  it("grava o rascunho depois do debounce quando há alterações", () => {
    renderHook(() => usePlanDraft(base, edited, true));
    act(() => {
      vi.advanceTimersByTime(600);
    });
    const stored = JSON.parse(window.localStorage.getItem("rascunho-liturgia:culto-1")!);
    expect(stored.service.title).toBe("Editado");
  });

  it("não grava quando nada mudou", () => {
    renderHook(() => usePlanDraft(base, base, false));
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(window.localStorage.getItem("rascunho-liturgia:culto-1")).toBeNull();
  });

  it("detecta conflito quando o servidor mudou depois do rascunho", () => {
    window.localStorage.setItem(
      "rascunho-liturgia:culto-1",
      JSON.stringify({ service: edited, baseUpdatedAt: "2025-12-31T00:00:00.000Z", savedAt: 1 })
    );
    const { result } = renderHook(() => usePlanDraft(base, base, false));
    expect(result.current.pending).not.toBeNull();
    expect(result.current.conflict).toBe(true);
  });

  it("limpa o rascunho", () => {
    window.localStorage.setItem(
      "rascunho-liturgia:culto-1",
      JSON.stringify({ service: edited, baseUpdatedAt: String(base.updatedAt), savedAt: 1 })
    );
    const { result } = renderHook(() => usePlanDraft(base, base, false));
    expect(result.current.conflict).toBe(false);
    act(() => result.current.clear());
    expect(window.localStorage.getItem("rascunho-liturgia:culto-1")).toBeNull();
    expect(result.current.pending).toBeNull();
  });
});
