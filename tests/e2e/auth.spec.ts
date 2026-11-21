import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("Allows unauthenticated access to app and admin pages in first iteration", async ({
    page,
  }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/services/);

    await page.goto("/admin/tags");
    await expect(page).toHaveURL(/\/admin\/tags/);
  });

  test("Redirects authenticated user away from /login to callbackUrl", async ({
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

    await page.goto("/login?callbackUrl=%2Fservices");
    await expect(page).toHaveURL(/\/services/);
  });

  test("Login page renders correctly (Visual)", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Bem-vindo ao Chorder", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
    await expect(page).toHaveScreenshot("login-page.png");
  });
});
