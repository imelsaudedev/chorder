import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("Redirects unauthenticated user on admin page to login", async ({ page }) => {
    await page.goto("/admin/tags");
    // Verify it redirects to /login with the callbackUrl
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin%2Ftags/);

    // Verify login page elements
    await expect(page.getByText("Bem-vindo ao Chorder", { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
  });

  test("Allows unauthenticated access to non-admin pages", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/services/);
  });

  test("Login page renders correctly (Visual)", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
    await expect(page).toHaveScreenshot("login-page.png");
  });
});
