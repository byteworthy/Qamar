import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should display Qamar branding correctly", async ({ page }) => {
    await page.goto("/");

    // Verify page title contains Qamar
    await expect(page).toHaveTitle(/Qamar/);

    // Verify main heading exists with Clarity text
    const heading = page.locator("h1").first();
    await expect(heading).toContainText("Find");
    await expect(heading).toContainText("Clarity");

    // Verify Cormorant Garamond font loaded on headings
    const fontFamily = await heading.evaluate(
      (el) => window.getComputedStyle(el).fontFamily,
    );
    expect(fontFamily.toLowerCase()).toContain("cormorant");

    // Verify gold accent color visible (span with text-gold class)
    const goldElement = page.locator("span.text-gold").first();
    await expect(goldElement).toBeVisible();
    await expect(goldElement).toContainText("Clarity");

    // Verify CTA button exists
    const ctaButton = page.getByRole("link", { name: /start.*reflection/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", "/reflect");
  });

  test("should display features section", async ({ page }) => {
    await page.goto("/");

    // Verify "How Qamar Works" section
    const featuresHeading = page.locator("h2", { hasText: "How" });
    await expect(featuresHeading).toBeVisible();

    // Verify 3 feature cards
    await expect(page.locator("text=Share Your Thought")).toBeVisible();
    await expect(page.locator("text=Gain Islamic Perspective")).toBeVisible();
    await expect(page.locator("text=Set Your Intention")).toBeVisible();
  });

  test("should display crisis support section", async ({ page }) => {
    await page.goto("/");

    // Verify crisis support section
    const crisisHeading = page.locator("h2", { hasText: "Crisis Support" });
    await expect(crisisHeading).toBeVisible();

    // Verify mentions 988 Lifeline
    await expect(
      page.locator("text=988 Suicide & Crisis Lifeline"),
    ).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify mobile layout renders
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();

    // Verify heading is visible on mobile
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();

    // Verify CTA button is visible and clickable
    const ctaButton = page
      .getByRole("link", { name: /start.*reflection/i })
      .first();
    await expect(ctaButton).toBeVisible();
  });

  test("should navigate to reflect page when CTA clicked", async ({ page }) => {
    await page.goto("/");

    // Click first CTA button
    const ctaButton = page
      .getByRole("link", { name: /start.*reflection/i })
      .first();
    await ctaButton.click();

    // Verify navigation to /reflect
    await expect(page).toHaveURL(/\/reflect/);
  });
});
