import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ServiceKeyNotice from "./ServiceKeyNotice";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => (params ? `${key}:${params.key}` : key),
}));

describe("ServiceKeyNotice", () => {
  it("no tom do culto não mostra nada", () => {
    const { container } = render(<ServiceKeyNotice originalKey="G" transpose={2} cultoTranspose={2} onReset={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("em outro tom é um único botão que diz para qual tom volta (o do culto, não o do aparelho)", () => {
    render(<ServiceKeyNotice originalKey="G" transpose={2} cultoTranspose={0} onReset={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "backToOriginalKey:G" })).toBeInTheDocument();
  });

  it("Voltar ao original chama onReset", async () => {
    const onReset = vi.fn();
    render(<ServiceKeyNotice originalKey="G" transpose={-1} cultoTranspose={0} onReset={onReset} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "backToOriginalKey:G" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("deslocamentos equivalentes (-17 e +7) são o mesmo tom: não mostra nada", () => {
    const { container } = render(<ServiceKeyNotice originalKey="G" transpose={7} cultoTranspose={-17} onReset={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
