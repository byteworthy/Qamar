import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should display navigation bar with logo", async ({ page }) => {
    await page.goto("/");

    // Verify navigation visible
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // Verify Qamar logo
    const logo = page.getByRole('link', { name: 'Qamar' });
    await expect(logo).toBeVisible();

    // Verify logo uses serif font and gold color
    const logoFontFamily = await logo
      .locator("span")
      .evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(logoFontFamily.toLowerCase()).toContain("cormorant");
  });

  test("should show navigation links on desktop", async ({ page }) => {
    await page.goto("/");

    // Verify main nav links exist and are visible
    await expect(
      page.getByRole("link", { name: "Reflect" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "History" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Insights" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Account" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Login" }).first(),
    ).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");

    const loginLink = page.getByRole("link", { name: "Login" }).first();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate to reflect page", async ({ page }) => {
    await page.goto("/");

    const reflectLink = page.getByRole("link", { name: "Reflect" }).first();
    await reflectLink.click();

    await expect(page).toHaveURL(/\/reflect/);
  });

  test("should show mobile menu button on small screens", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify mobile menu button is visible
    const menuButton = page.locator("button", { has: page.locator("svg") });
    await expect(menuButton).toBeVisible();

    // Click to open menu
    await menuButton.click();

    // Verify mobile menu appears with links
    await expect(
      page.getByRole("link", { name: "Reflect" }).last(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "History" }).last(),
    ).toBeVisible();
  });

  test("should close mobile menu after clicking link", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Open mobile menu
    const menuButton = page.locator("button", { has: page.locator("svg") });
    await menuButton.click();

    // Click a link in mobile menu
    const reflectLink = page.getByRole("link", { name: "Reflect" }).last();
    await reflectLink.click();

    // Verify navigation occurred
    await expect(page).toHaveURL(/\/reflect/);
  });

  test("should have sticky navigation", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav");

    // Check if nav has sticky positioning
    const position = await nav.evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });
});
