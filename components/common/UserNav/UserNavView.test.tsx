import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import UserNavView from "./UserNavView";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("UserNavView component", () => {
  vi.setConfig({ testTimeout: 15000 });
  const user = {
    name: "John Doe",
    email: "john@example.com",
    image: "https://github.com/shadcn.png",
  };

  it("renders user initials when no image is provided", () => {
    render(
      <UserNavView
        user={{ ...user, image: null }}
        onSignOut={vi.fn().mockResolvedValue(undefined)}
      />
    );
    expect(screen.getByText("JD")).toBeDefined();
  });

  it("calls onSignOut when logout button is clicked", async () => {
    const userEventInstance = userEvent.setup();
    const onSignOut = vi.fn().mockResolvedValue(undefined);
    render(<UserNavView user={user} onSignOut={onSignOut} />);

    // Click to open dropdown
    const trigger = screen.getByRole("button");
    await userEventInstance.click(trigger);

    // Click logout button
    const logoutButton = screen.getByText("logout");
    await userEventInstance.click(logoutButton);

    expect(onSignOut).toHaveBeenCalled();
  });
});
