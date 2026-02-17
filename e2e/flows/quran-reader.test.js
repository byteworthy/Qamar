/**
 * E2E Flow: Quran Reader
 * Tests Quran navigation, audio playback, tajweed toggle
 */
const { waitForElementById, tapById, goToTab } = require("../shared/helpers");
const { TABS, LEARN, QURAN } = require("../shared/selectors");

describe("Quran Reader Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await goToTab("learn");
  });

  it("should open Quran reader from learn tab", async () => {
    await waitForElementById(LEARN.QURAN_CARD, 5000);
    await tapById(LEARN.QURAN_CARD);

    await waitForElementById(QURAN.READER_SCREEN, 5000);
  });

  it("should display surah list", async () => {
    await tapById(LEARN.QURAN_CARD);

    await waitForElementById(QURAN.SURAH_LIST, 5000);
    // Al-Fatiha should be the first surah
    await waitFor(element(by.text("Al-Fatiha")))
      .toBeVisible()
      .withTimeout(3000);
  });

  it("should navigate into a surah", async () => {
    await tapById(LEARN.QURAN_CARD);
    await waitForElementById(QURAN.SURAH_LIST, 5000);

    await element(by.text("Al-Fatiha")).tap();

    await waitForElementById(QURAN.VERSE_LIST, 5000);
    // Should show at least one verse
    await waitFor(element(by.id(QURAN.VERSE_ITEM(1))))
      .toBeVisible()
      .withTimeout(3000);
  });

  it("should toggle tajweed display", async () => {
    await tapById(LEARN.QURAN_CARD);
    await element(by.text("Al-Fatiha")).tap();

    await waitForElementById(QURAN.TAJWEED_TOGGLE, 5000);
    await tapById(QURAN.TAJWEED_TOGGLE);

    // Toggling should not crash — verify screen still visible
    await waitForElementById(QURAN.VERSE_LIST, 3000);
  });

  it("should show audio controls", async () => {
    await tapById(LEARN.QURAN_CARD);
    await element(by.text("Al-Fatiha")).tap();

    await waitForElementById(QURAN.PLAY_BUTTON, 5000);
  });
});
