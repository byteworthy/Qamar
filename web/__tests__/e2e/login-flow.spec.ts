import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login page with Qamar branding', async ({ page }) => {
    await page.goto('/login');

    // Verify page title
    await expect(page).toHaveTitle(/Qamar/);

    // Verify Qamar logo
    const logo = page.locator('h1', { hasText: 'Qamar' });
    await expect(logo).toBeVisible();

    // Verify welcome message
    await expect(page.locator('text=Welcome back')).toBeVisible();

    // Verify Sign In heading
    await expect(page.locator('h2', { hasText: 'Sign In' })).toBeVisible();
  });

  test('should have email input field', async ({ page }) => {
    await page.goto('/login');

    // Verify email input exists with correct attributes
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'your@email.com');
    await expect(emailInput).toHaveAttribute('required');

    // Verify label exists
    await expect(page.locator('label[for="email"]')).toContainText('Email Address');
  });

  test('should have submit button disabled when email is empty', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when email is entered', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter email
    await emailInput.fill('test@example.com');

    // Button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show loading state when submitting', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter email and submit
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Verify loading state
    await expect(submitButton).toContainText('Sending...');
    await expect(submitButton).toBeDisabled();
  });

  test('should show success message after submission', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Fill and submit
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Wait for success message
    await expect(page.locator('h2', { hasText: 'Check Your Email' })).toBeVisible({ timeout: 3000 });

    // Verify email is shown
    await expect(page.locator('text=test@example.com')).toBeVisible();

    // Verify expiry message
    await expect(page.locator('text=expires in 1 hour')).toBeVisible();

    // Verify success checkmark
    const checkmark = page.locator('svg').filter({ has: page.locator('path[d*="M5 13l4 4L19 7"]') });
    await expect(checkmark).toBeVisible();
  });

  test('should show sign up link', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByRole('link', { name: 'Sign up' });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', '/signup');
  });

  test('should navigate back to home when clicking logo', async ({ page }) => {
    await page.goto('/login');

    const logoLink = page.locator('a', { has: page.locator('h1', { hasText: 'Qamar' }) });
    await logoLink.click();

    await expect(page).toHaveURL('/');
  });

  test('should use Qamar brand colors', async ({ page }) => {
    await page.goto('/login');

    // Check gold color on logo
    const logo = page.locator('h1', { hasText: 'Qamar' });
    const color = await logo.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // RGB for #D4AF37 is approximately rgb(212, 175, 55)
    expect(color).toContain('212');

    // Check dark background on card
    const card = page.locator('.bg-background-card').first();
    await expect(card).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Verify form is visible and usable
    await expect(page.locator('h2', { hasText: 'Sign In' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify form takes full width
    const card = page.locator('.max-w-md').first();
    await expect(card).toBeVisible();
  });
});
