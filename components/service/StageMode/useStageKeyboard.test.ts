import { fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStageKeyboard } from "./useStageKeyboard";

function setup(layout: "scroll" | "overview") {
  const onSong = vi.fn();
  const onSpeed = vi.fn();
  renderHook(() => useStageKeyboard({ layout, onSong, onSpeed }));
  return { onSong, onSpeed };
}

describe("useStageKeyboard", () => {
  it("rolagem: ↑↓ trocam de música e ←→ mudam a velocidade", () => {
    const { onSong, onSpeed } = setup("scroll");
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(onSong.mock.calls).toEqual([[1], [-1]]);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onSpeed.mock.calls).toEqual([[1], [-1]]);
  });

  it("rolagem: PageUp/PageDown ficam com o navegador", () => {
    const { onSong } = setup("scroll");
    const down = new KeyboardEvent("keydown", { key: "PageDown", cancelable: true });
    window.dispatchEvent(down);
    expect(onSong).not.toHaveBeenCalled();
    expect(down.defaultPrevented).toBe(false);
  });

  it("visão geral: as quatro setas e PageUp/PageDown trocam de tela; velocidade não existe", () => {
    const { onSong, onSpeed } = setup("overview");
    for (const key of ["ArrowDown", "ArrowRight", "PageDown"]) fireEvent.keyDown(window, { key });
    for (const key of ["ArrowUp", "ArrowLeft", "PageUp"]) fireEvent.keyDown(window, { key });
    expect(onSong.mock.calls).toEqual([[1], [1], [1], [-1], [-1], [-1]]);
    expect(onSpeed).not.toHaveBeenCalled();
  });

  it("impede a rolagem nativa quando trata a tecla", () => {
    setup("scroll");
    const event = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("ignora teclas em campos, janelas e com modificadores", () => {
    const { onSong, onSpeed } = setup("scroll");
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.appendChild(dialog);
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowDown", metaKey: true });
    fireEvent.keyDown(window, { key: "ArrowRight", altKey: true });
    expect(onSong).not.toHaveBeenCalled();
    expect(onSpeed).not.toHaveBeenCalled();
    input.remove();
    dialog.remove();
  });

  it("usa sempre os handlers mais recentes", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ onSong }) => useStageKeyboard({ layout: "scroll", onSong, onSpeed: vi.fn() }), {
      initialProps: { onSong: first },
    });
    rerender({ onSong: second });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);
  });
});
