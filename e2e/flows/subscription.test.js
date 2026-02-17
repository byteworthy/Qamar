/**
 * E2E Flow: Subscription & Pricing
 * Tests premium gating, upgrade flow, and pricing display
 */
const { waitForElementById, tapById, goToTab } = require("../shared/helpers");
const { SETTINGS, PRICING } = require("../shared/selectors");

describe("Subscription Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should show subscription status in settings", async () => {
    await goToTab("settings");

    await waitForElementById(SETTINGS.SUBSCRIPTION_STATUS, 5000);
  });

  it("should navigate to pricing screen from settings", async () => {
    await goToTab("settings");
    await waitForElementById(SETTINGS.UPGRADE_BUTTON, 5000);
    await tapById(SETTINGS.UPGRADE_BUTTON);

    await waitForElementById(PRICING.SCREEN, 5000);
  });

  it("should display pricing plans", async () => {
    await goToTab("settings");
    await tapById(SETTINGS.UPGRADE_BUTTON);
    await waitForElementById(PRICING.SCREEN, 5000);

    // Should show price — $2.99/mo or annual
    await waitFor(element(by.text(/\$\d+\.\d+/)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it("should show features list on pricing screen", async () => {
    await goToTab("settings");
    await tapById(SETTINGS.UPGRADE_BUTTON);
    await waitForElementById(PRICING.FEATURES_LIST, 5000);
  });

  it("should have a restore purchases button", async () => {
    await goToTab("settings");
    await tapById(SETTINGS.UPGRADE_BUTTON);
    await waitForElementById(PRICING.RESTORE_BUTTON, 5000);
  });

  it("should be able to dismiss pricing screen", async () => {
    await goToTab("settings");
    await tapById(SETTINGS.UPGRADE_BUTTON);
    await waitForElementById(PRICING.SCREEN, 5000);

    // Swipe down or tap back to dismiss
    await device.pressBack?.(); // Android
    // On iOS, swipe down on modal
    try {
      await element(by.id(PRICING.SCREEN)).swipe("down", "fast");
    } catch {
      // Already dismissed on Android
    }

    // Should be back on settings
    await waitForElementById(SETTINGS.SCREEN, 5000);
  });
});
