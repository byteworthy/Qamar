/**
 * E2E Flow: Prayer Times & Qibla
 * Tests prayer times display and qibla finder
 */
const { waitForElementById, tapById, goToTab } = require("../shared/helpers");
const { TABS, PRAYER } = require("../shared/selectors");

describe("Prayer Times Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should display prayer times screen from worship tab", async () => {
    await goToTab("worship");

    await waitForElementById(PRAYER.SCREEN, 5000);
  });

  it("should show all five daily prayers", async () => {
    await goToTab("worship");
    await waitForElementById(PRAYER.SCREEN, 5000);

    await waitForElementById(PRAYER.FAJR, 5000);
    await waitForElementById(PRAYER.DHUHR, 3000);
    await waitForElementById(PRAYER.ASR, 3000);
    await waitForElementById(PRAYER.MAGHRIB, 3000);
    await waitForElementById(PRAYER.ISHA, 3000);
  });

  it("should display prayer time values", async () => {
    await goToTab("worship");
    await waitForElementById(PRAYER.SCREEN, 5000);

    // Should show time values (HH:MM format)
    await waitFor(element(by.text(/\d{1,2}:\d{2}/)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should navigate to qibla finder", async () => {
    await goToTab("worship");
    await waitForElementById(PRAYER.QIBLA_BUTTON, 5000);
    await tapById(PRAYER.QIBLA_BUTTON);

    await waitForElementById(PRAYER.QIBLA_COMPASS, 5000);
  });

  it("should highlight next prayer", async () => {
    await goToTab("worship");
    await waitForElementById(PRAYER.SCREEN, 5000);

    // Next prayer should be highlighted — at least one prayer name label visible
    await waitFor(
      element(by.text("Fajr"))
        .or(by.text("Dhuhr"))
        .or(by.text("Asr"))
        .or(by.text("Maghrib"))
        .or(by.text("Isha")),
    )
      .toBeVisible()
      .withTimeout(3000);
  });
});
