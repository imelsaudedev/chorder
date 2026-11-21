import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UsersAdminClient, { type AdminUserRow } from "./UsersAdminClient";

vi.mock("next-intl", () => ({
  useLocale: () => "pt-BR",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (values?.count !== undefined) return `${key}:${values.count}`;
    if (values?.query !== undefined) return `${key}:${values.query}`;
    return key;
  },
}));

const sampleUsers: AdminUserRow[] = [
  {
    id: "u1",
    name: "Maria Clara Silva",
    email: "maria@example.com",
    image: null,
    role: "ADMIN",
    providers: ["google"],
    createdAt: "2026-11-20T15:00:00.000Z",
  },
  {
    id: "u2",
    name: null,
    email: "pedro@example.com",
    image: null,
    role: "USER",
    providers: ["resend"],
    createdAt: "2026-11-21T10:00:00.000Z",
  },
];

describe("UsersAdminClient", () => {
  it("renders user list with initials, roles, and providers", () => {
    render(<UsersAdminClient users={sampleUsers} />);

    expect(screen.getByText("Maria Clara Silva")).toBeDefined();
    expect(screen.getByText("maria@example.com")).toBeDefined();
    expect(screen.getByText("MC")).toBeDefined();
    expect(screen.getByText("roleAdmin")).toBeDefined();
    expect(screen.getByText("providerGoogle")).toBeDefined();

    expect(screen.getByText("unnamed")).toBeDefined();
    expect(screen.getByText("pedro@example.com")).toBeDefined();
    expect(screen.getByText("PE")).toBeDefined();
    expect(screen.getByText("roleUser")).toBeDefined();
    expect(screen.getByText("providerResend")).toBeDefined();
  });

  it("filters users by name or email and shows noResults when none match", async () => {
    const user = userEvent.setup();
    render(<UsersAdminClient users={sampleUsers} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "pedro");

    expect(screen.queryByText("Maria Clara Silva")).toBeNull();
    expect(screen.getByText("pedro@example.com")).toBeDefined();

    await user.clear(input);
    await user.type(input, "nonexistent");

    expect(screen.getByText("noResults:nonexistent")).toBeDefined();
  });

  it("renders empty state when there are no users", () => {
    render(<UsersAdminClient users={[]} />);

    expect(screen.getByText("emptyTitle")).toBeDefined();
    expect(screen.getByText("emptyDescription")).toBeDefined();
  });
});
