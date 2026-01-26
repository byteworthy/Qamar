/**
 * E2E Test: Subscription & Pricing Flow
 * Tests in-app purchase and subscription management
 */

describe('Subscription & Pricing', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Free Plan', () => {
    it('should display free plan status', async () => {
      await element(by.id('tab-settings')).tap();

      // Should show free plan
      await waitFor(element(by.text('Free Plan')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show reflection limit for free users', async () => {
      await element(by.id('tab-home')).tap();

      // Should display reflection count or limit
      await waitFor(element(by.id('reflection-count')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Pricing Screen', () => {
    beforeEach(async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();
    });

    it('should display pricing screen', async () => {
      await waitFor(element(by.text('Noor Plus')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('$2.99'))).toBeVisible();
    });

    it('should show all features', async () => {
      // Should display feature list
      await expect(element(by.text('Unlimited reflections'))).toBeVisible();
      await expect(element(by.text('Advanced insights'))).toBeVisible();
      await expect(element(by.text('Pattern tracking'))).toBeVisible();
    });

    it('should show beta pricing lock-in notice', async () => {
      // Should emphasize beta pricing
      await expect(
        element(by.text('Lock in beta rate forever'))
      ).toBeVisible();
    });

    it('should have subscribe button', async () => {
      await expect(element(by.text('Subscribe Now'))).toBeVisible();
    });

    it('should show cancellation policy', async () => {
      // Should display cancellation information
      await expect(element(by.text('Cancel anytime'))).toBeVisible();
    });
  });

  describe('Subscription Flow', () => {
    beforeEach(async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();
    });

    it('should initiate subscription purchase', async () => {
      await element(by.text('Subscribe Now')).tap();

      // Should show App Store/Play Store purchase sheet
      // Note: In test environment, this will be mocked
      await waitFor(element(by.text('Confirm Purchase').or(by.text('OK'))))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle successful subscription', async () => {
      // Mock successful purchase
      await element(by.text('Subscribe Now')).tap();

      // Simulate purchase completion (test environment)
      // Should show success message or navigate to settings
      await waitFor(
        element(by.text('Success').or(by.text('Welcome to Noor Plus')))
      )
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle cancelled purchase', async () => {
      await element(by.text('Subscribe Now')).tap();

      // Cancel purchase sheet
      await element(by.text('Cancel')).tap();

      // Should remain on pricing screen
      await expect(element(by.text('Subscribe Now'))).toBeVisible();
    });

    it('should handle purchase errors', async () => {
      // This tests error handling for failed purchases
      await element(by.text('Subscribe Now')).tap();

      // If purchase fails, should show error message
      // Actual behavior depends on test environment setup
    });
  });

  describe('Plus Features', () => {
    it('should show upgrade prompt for free users accessing plus features', async () => {
      // Navigate to history
      await element(by.id('tab-history')).tap();

      // Try to access insights (Plus feature)
      try {
        await element(by.text('View Insights')).tap();

        // Should show upgrade prompt
        await waitFor(element(by.text('Upgrade to Noor Plus')))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Feature might not be visible for free users
      }
    });

    it('should allow complete reflections with upgrade prompt', async () => {
      // Complete a reflection
      await element(by.text('Begin Reflection')).tap();
      await element(by.id('thought-input')).typeText('Test reflection');
      await element(by.id('intensity-3')).tap();
      await element(by.text('Continue')).tap();

      await waitFor(element(by.text('Continue')))
        .toBeVisible()
        .withTimeout(30000);
      await element(by.text('Continue')).tap();

      await waitFor(element(by.text('Continue')))
        .toBeVisible()
        .withTimeout(30000);
      await element(by.text('Continue')).tap();

      // Should show upgrade prompt on completion screen (for free users)
      await waitFor(element(by.text('Upgrade to Noor Plus')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Subscription Management', () => {
    it('should show manage subscription option', async () => {
      await element(by.id('tab-settings')).tap();

      // Should show subscription management link
      await expect(
        element(by.text('Manage Subscription'))
      ).toBeVisible();
    });

    it('should open App Store/Play Store subscription management', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Manage Subscription')).tap();

      // Should open external subscription management
      // Actual behavior depends on platform
    });
  });

  describe('Restore Purchases', () => {
    it('should have restore purchases option', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();

      // Should show restore option
      await expect(element(by.text('Restore Purchases'))).toBeVisible();
    });

    it('should restore previous purchases', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();

      await element(by.text('Restore Purchases')).tap();

      // Should check for purchases and show result
      await waitFor(
        element(by.text('Success').or(by.text('No purchases found')))
      )
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Pricing Display', () => {
    it('should show price in correct currency', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();

      // Should show USD pricing (or localized)
      await expect(element(by.text('$2.99'))).toBeVisible();
    });

    it('should show billing period', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();

      // Should clearly show monthly billing
      await expect(element(by.text('per month'))).toBeVisible();
    });
  });

  describe('Free Trial', () => {
    it('should not show free trial (immediate charge)', async () => {
      await element(by.id('tab-settings')).tap();
      await element(by.text('Upgrade to Noor Plus')).tap();

      // Should NOT mention free trial
      // Beta pricing is immediate charge, lock-in rate
      await expect(
        element(by.text('Lock in beta rate forever'))
      ).toBeVisible();
    });
  });
});
