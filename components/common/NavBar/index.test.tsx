import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NavBar from "./index";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("next/navigation", () => ({ usePathname: () => "/songs" }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock("@/hooks/useBottomNavVisible", () => ({ useBottomNavVisible: () => false }));
vi.mock("@/components/common/Theme/ThemeToggle", () => ({ ThemeMenu: () => null, ThemeSheet: () => null }));

describe("NavBar", () => {
  it("visitante: Liturgias some (não aparece apagada) e há o botão Entrar", () => {
    render(<NavBar isAuthenticated={false} />);
    expect(screen.queryByText("services")).not.toBeInTheDocument();
    expect(screen.getByText("songs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /signIn/ })).toHaveAttribute("href", "/login");
  });

  it("logado: Liturgias aparece como link", () => {
    render(<NavBar isAuthenticated userNav={<span>conta</span>} />);
    expect(screen.getByRole("link", { name: /services/ })).toHaveAttribute("href", "/services");
  });

  it("o atalho Admin só aparece para Admin", () => {
    const { rerender } = render(<NavBar isAuthenticated isAdmin={false} />);
    expect(screen.queryByText("admin")).not.toBeInTheDocument();
    rerender(<NavBar isAuthenticated isAdmin />);
    expect(screen.getByText("admin")).toBeInTheDocument();
  });
});
