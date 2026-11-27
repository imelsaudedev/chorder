import type { NotificationItem } from "@/lib/notifications";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NotificationsBellView from "./NotificationsBellView";

vi.mock("next-intl", () => ({
  useLocale: () => "pt-BR",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (values?.count !== undefined) return `${key}:${values.count}`;
    return key;
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const groupedNotification: NotificationItem = {
  id: "group:NEW_USER_REGISTERED",
  ids: ["n1", "n2", "n3", "n4", "n5", "n6"],
  type: "NEW_USER_REGISTERED",
  unread: true,
  href: "/admin/users?filter=unseen",
  createdAt: "2026-11-27T15:00:00.000Z",
  users: [
    { id: "u1", name: "Ana", email: "ana@example.com" },
    { id: "u2", name: "Bruno", email: "bruno@example.com" },
    { id: "u3", name: "Carla", email: "carla@example.com" },
    { id: "u4", name: "Daniel", email: "daniel@example.com" },
    { id: "u5", name: "Elena", email: "elena@example.com" },
    { id: "u6", name: "Felipe", email: "felipe@example.com" },
  ],
};

describe("NotificationsBellView", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [groupedNotification],
          unreadCount: 1,
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hides unread dot when there are no unread notifications", () => {
    render(<NotificationsBellView initialItems={[]} initialUnreadCount={0} />);
    expect(screen.queryByTestId("notifications-unread-dot")).toBeNull();
  });

  it("shows unread dot, unified new-users list with overflow count, and marks all read", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/notifications/read") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, updatedCount: 6 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          items: [groupedNotification],
          unreadCount: 1,
        }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(
      <NotificationsBellView
        initialItems={[groupedNotification]}
        initialUnreadCount={1}
      />
    );

    expect(screen.getByTestId("notifications-unread-dot")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "bellAriaUnread:1" }));

    expect(screen.getByText("newUsersTitle:6")).toBeDefined();
    expect(screen.getByText("Ana (ana@example.com)")).toBeDefined();
    expect(screen.getByText("andMoreUsers:1")).toBeDefined();

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/admin/users?filter=unseen");

    await user.click(screen.getByRole("button", { name: "markAllRead" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });

    await waitFor(() => {
      expect(screen.queryByTestId("notifications-unread-dot")).toBeNull();
    });
  });
});
