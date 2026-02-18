import { test, expect } from "@playwright/test";

test.describe("Products page", () => {
  test("products page loads", async ({ page }) => {
    await page.goto("/products");
    await expect(page).toHaveURL(/\/products/);
  });

  test("products page has content", async ({ page }) => {
    await page.goto("/products");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
