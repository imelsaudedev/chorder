import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color-contrast";
import Tag from "./index";

const rgbOf = (css: string) => css.match(/\d+/g)!.slice(0, 3).map(Number) as [number, number, number];

describe("Tag", () => {
  it("mostra o texto", () => {
    render(<Tag label="Natal" />);
    expect(screen.getByText("Natal")).toBeInTheDocument();
  });

  it("variante fixa: fundo claro, sem borda", () => {
    render(<Tag label="Ok" variant="success" />);
    const el = screen.getByText("Ok");
    expect(el.className).toContain("bg-success-muted");
    expect(el.className).toContain("text-success-text");
    expect(el.className).not.toMatch(/\bborder\b/);
  });

  it("cor do banco: texto legível (contraste >= 4,5) mesmo em cor clara", () => {
    render(<Tag label="Páscoa" color="#f59e0b" />);
    const el = screen.getByText("Páscoa");
    const bg = rgbOf(el.style.backgroundColor);
    const fg = rgbOf(el.style.color);
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    expect(el.style.borderColor).toBe("");
  });

  it("cor inválida não quebra", () => {
    render(<Tag label="X" color="nada" />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("tamanhos: xs tem 11px e sm tem 12px", () => {
    const { rerender } = render(<Tag label="T" size="xs" />);
    expect(screen.getByText("T").className).toContain("text-[11px]");
    rerender(<Tag label="T" size="sm" />);
    expect(screen.getByText("T").className).toContain("text-xs");
  });
});
