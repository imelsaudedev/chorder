import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginView from "./LoginView";

const mockSignIn = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values?.email ? `${key}:${values.email}` : key,
}));

describe("LoginView component", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it("calls signIn with google and safe callbackUrl", async () => {
    mockSignIn.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginView callbackUrl="/admin/tags" />);

    await user.click(screen.getByRole("button", { name: "signInWithGoogle" }));

    expect(mockSignIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/admin/tags",
    });
  });

  it("sanitizes unsafe callbackUrl before calling signIn", async () => {
    mockSignIn.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginView callbackUrl="https://evil.example" />);

    await user.click(screen.getByRole("button", { name: "signInWithGoogle" }));

    expect(mockSignIn).toHaveBeenCalledWith("google", {
      callbackUrl: "/services",
    });
  });

  it("submits email magic link with redirect: false and shows confirmation", async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });
    const user = userEvent.setup();
    render(<LoginView callbackUrl="/admin/tags" />);

    await user.type(screen.getByLabelText("signInWithEmail"), "user@test.com");
    await user.click(screen.getByRole("button", { name: "sendMagicLink" }));

    expect(mockSignIn).toHaveBeenCalledWith("resend", {
      email: "user@test.com",
      callbackUrl: "/admin/tags",
      redirect: false,
    });

    expect(await screen.findByText("checkEmailTitle")).toBeDefined();
    expect(
      screen.getByText("checkEmailDescription:user@test.com")
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "backToLogin" }));
    expect(screen.getByRole("button", { name: "signInWithGoogle" })).toBeDefined();
  });

  it("renders error alert when initial error prop is provided", () => {
    render(<LoginView error="OAuthAccountNotLinked" />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("authErrorOAuthAccountNotLinked");
  });

  it("shows error alert if signIn rejects", async () => {
    mockSignIn.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<LoginView />);

    await user.click(screen.getByRole("button", { name: "signInWithGoogle" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe("authErrorGeneric");
    });
  });
});
