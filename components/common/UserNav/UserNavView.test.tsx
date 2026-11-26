import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UserNavView from "./UserNavView";

const mockSignOut = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("UserNavView component", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
  });

  const user = {
    name: "John Doe",
    email: "john@example.com",
    image: "https://github.com/shadcn.png",
  };

  it("renders 2-character initials when no image is provided", () => {
    render(
      <UserNavView
        user={{ ...user, image: null }}
        onSignOut={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByText("JD")).toBeDefined();
    expect(screen.getByRole("button", { name: "userMenu" })).toBeDefined();
  });

  it("caps initials to 2 characters for multi-word names", () => {
    render(
      <UserNavView
        user={{ name: "  João Pedro Silva  ", email: "joao@example.com", image: null }}
        onSignOut={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByText("JP")).toBeDefined();
  });

  it("falls back to email prefix when name is null", () => {
    render(
      <UserNavView
        user={{ name: null, email: "only@email.com", image: null }}
        onSignOut={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByText("ON")).toBeDefined();
  });

  it("calls onSignOut when logout button is clicked", async () => {
    const userEventInstance = userEvent.setup();
    const onSignOut = vi.fn().mockResolvedValue(undefined);
    render(<UserNavView user={user} onSignOut={onSignOut} />);

    await userEventInstance.click(screen.getByRole("button", { name: "userMenu" }));
    await userEventInstance.click(screen.getByText("logout"));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("calls next-auth signOut by default when onSignOut is not provided", async () => {
    mockSignOut.mockResolvedValue(undefined);
    const userEventInstance = userEvent.setup();
    render(<UserNavView user={user} />);

    await userEventInstance.click(screen.getByRole("button", { name: "userMenu" }));
    await userEventInstance.click(screen.getByText("logout"));

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("hides role preview controls for non-admin users", async () => {
    const userEventInstance = userEvent.setup();
    render(
      <UserNavView
        user={user}
        isRealAdmin={false}
        activeRoles={["WORSHIP"]}
      />
    );

    await userEventInstance.click(screen.getByRole("button", { name: "userMenu" }));
    expect(screen.queryByText("rolePreviewTitle")).toBeNull();
  });

  it("allows real admins to toggle simulated roles, apply, and reset preview", async () => {
    const userEventInstance = userEvent.setup();
    const onApplyRolePreview = vi.fn().mockResolvedValue(undefined);
    render(
      <UserNavView
        user={user}
        isRealAdmin
        activeRoles={["ADMIN"]}
        isPreviewing={false}
        onApplyRolePreview={onApplyRolePreview}
      />
    );

    await userEventInstance.click(screen.getByRole("button", { name: "userMenu" }));
    expect(screen.getByText("rolePreviewTitle")).toBeDefined();

    // Uncheck Admin, check Media
    await userEventInstance.click(screen.getByRole("menuitemcheckbox", { name: "roleAdmin" }));
    await userEventInstance.click(screen.getByRole("menuitemcheckbox", { name: "roleMedia" }));
    await userEventInstance.click(screen.getByRole("button", { name: "rolePreviewApply" }));

    expect(onApplyRolePreview).toHaveBeenCalledWith(["MEDIA"]);
  });

  it("renders reset button when preview mode is active", async () => {
    const userEventInstance = userEvent.setup();
    const onApplyRolePreview = vi.fn().mockResolvedValue(undefined);
    render(
      <UserNavView
        user={user}
        isRealAdmin
        activeRoles={[]}
        isPreviewing
        onApplyRolePreview={onApplyRolePreview}
      />
    );

    await userEventInstance.click(screen.getByRole("button", { name: "userMenu" }));
    await userEventInstance.click(screen.getByRole("button", { name: "rolePreviewReset" }));

    expect(onApplyRolePreview).toHaveBeenCalledWith(null);
  });
});
