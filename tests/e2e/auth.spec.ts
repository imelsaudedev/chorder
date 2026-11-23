import { test, expect } from "@playwright/test";

test.describe("Authentication & Role Protection", () => {
  test("Redirects unauthenticated visitors from / to public /songs", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/songs/);
  });

  test("Redirects unauthenticated users from /admin/* and /services to /login", async ({
    page,
  }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin%2Fusers/);

    await page.goto("/services");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fservices/);
  });

  test("Allows authenticated admin to access /services, /admin/users and redirects away from /login", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-session-token",
        domain: "127.0.0.1",
        path: "/",
      },
      {
        name: "next-auth.session-token",
        value: "mock-session-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/services");
    await expect(page).toHaveURL(/\/services/);

    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin\/users/);

    await page.goto("/login?callbackUrl=%2Fservices");
    await expect(page).toHaveURL(/\/services/);
  });

  test("Login page renders correctly (Visual)", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText("Bem-vindo ao Chorder", { exact: false })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
    await expect(page).toHaveScreenshot("login-page.png");
  });
});
