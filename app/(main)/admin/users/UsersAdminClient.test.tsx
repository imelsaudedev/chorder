import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UsersAdminClient, { type AdminUserRow } from "./UsersAdminClient";

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("next-intl", () => ({
  useLocale: () => "pt-BR",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (values?.count !== undefined) return `${key}:${values.count}`;
    if (values?.query !== undefined) return `${key}:${values.query}`;
    if (values?.role !== undefined && values?.user !== undefined) {
      return `${key}:${values.role}:${values.user}`;
    }
    if (values?.user !== undefined) return `${key}:${values.user}`;
    return key;
  },
}));

const sampleUsers: AdminUserRow[] = [
  {
    id: "u1",
    name: "Maria Clara Silva",
    email: "maria@example.com",
    image: null,
    roles: ["ADMIN"],
    providers: ["google"],
    createdAt: "2026-11-20T15:00:00.000Z",
  },
  {
    id: "u2",
    name: null,
    email: "pedro@example.com",
    image: null,
    roles: [],
    providers: ["resend"],
    createdAt: "2026-11-21T10:00:00.000Z",
  },
];

describe("UsersAdminClient", () => {
  beforeEach(() => {
    mockToastSuccess.mockReset();
    mockToastError.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders read-only badges when not admin", () => {
    render(<UsersAdminClient users={sampleUsers} canManageRoles={false} />);

    expect(screen.getByText("Maria Clara Silva")).toBeDefined();
    expect(screen.getByText("roleAdmin")).toBeDefined();
    expect(screen.getByText("roleUser")).toBeDefined();
    expect(screen.queryAllByRole("switch")).toHaveLength(0);
  });

  it("renders multi-role switches when admin, locks own ADMIN switch, and updates roles via PATCH", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "u2", roles: ["WORSHIP"] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <UsersAdminClient
        users={sampleUsers}
        currentUserId="u1"
        canManageRoles={true}
      />
    );

    expect(screen.getByText("(you)")).toBeDefined();
    const selfAdminSwitch = screen.getByRole("switch", {
      name: "toggleRoleLabel:roleAdmin:Maria Clara Silva",
    });
    expect(selfAdminSwitch.hasAttribute("disabled")).toBe(true);

    const pedroWorshipSwitch = screen.getByRole("switch", {
      name: "toggleRoleLabel:roleWorship:pedro@example.com",
    });
    await user.click(pedroWorshipSwitch);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/users/u2", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles: ["WORSHIP"] }),
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "rolesUpdated:pedro@example.com"
      );
    });
  });

  it("shows error toast when PATCH fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      })
    );

    const user = userEvent.setup();
    render(
      <UsersAdminClient
        users={sampleUsers}
        currentUserId="u1"
        canManageRoles={true}
      />
    );

    await user.click(
      screen.getByRole("switch", {
        name: "toggleRoleLabel:roleMedia:pedro@example.com",
      })
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("roleUpdateError");
    });
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
