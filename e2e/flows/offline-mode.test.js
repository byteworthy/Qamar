/**
 * E2E Flow: Offline Mode
 * Tests offline banner display and graceful degradation
 */
const {
  waitForElementById,
  goToTab,
  waitForElementByText,
} = require("../shared/helpers");
const { OFFLINE, TABS } = require("../shared/selectors");

describe("Offline Mode Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  afterEach(async () => {
    // Always restore network
    await device.setNetworkConnection("on");
    await device.reloadReactNative();
  });

  it("should show offline banner when network is disabled", async () => {
    await device.setNetworkConnection("off");

    // Wait for offline detection (up to 10s)
    await waitForElementById(OFFLINE.BANNER, 10000);
    await waitForElementByText("You're offline", 3000);
  });

  it("should show offline capabilities message", async () => {
    await device.setNetworkConnection("off");
    await waitForElementById(OFFLINE.BANNER, 10000);

    await waitFor(element(by.text(/Quran.*still work/)))
      .toBeVisible()
      .withTimeout(3000);
  });

  it("should allow dismissing offline banner", async () => {
    await device.setNetworkConnection("off");
    await waitForElementById(OFFLINE.BANNER, 10000);

    await element(by.id(OFFLINE.BANNER))
      .swipe("up", "fast")
      .catch(() => element(by.id(OFFLINE.DISMISS)).tap());

    // Banner should be gone
    await waitFor(element(by.id(OFFLINE.BANNER)))
      .not.toBeVisible()
      .withTimeout(2000);
  });

  it("should hide offline banner when network restored", async () => {
    await device.setNetworkConnection("off");
    await waitForElementById(OFFLINE.BANNER, 10000);

    await device.setNetworkConnection("on");

    // Banner should disappear
    await waitFor(element(by.id(OFFLINE.BANNER)))
      .not.toBeVisible()
      .withTimeout(15000);
  });

  it("should allow Quran access while offline", async () => {
    await device.setNetworkConnection("off");
    await waitForElementById(OFFLINE.BANNER, 10000);

    await goToTab("learn");

    // Quran reader card should still be accessible
    await waitFor(element(by.text("Quran")))
      .toBeVisible()
      .withTimeout(5000);
  });
});
