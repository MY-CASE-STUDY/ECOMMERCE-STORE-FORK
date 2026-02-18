import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows key content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/GLOBAL CITY|Global City|E-Commerce/i);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("has main content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });
});
