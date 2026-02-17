/**
 * E2E Flow: Hifz Memorization
 * Tests dashboard, session start, and rating cards
 */
const { waitForElementById, tapById, goToTab } = require("../shared/helpers");
const { LEARN, HIFZ } = require("../shared/selectors");

describe("Hifz Memorization Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await goToTab("learn");
  });

  it("should open hifz dashboard from learn tab", async () => {
    await waitForElementById(LEARN.HIFZ_CARD, 5000);
    await tapById(LEARN.HIFZ_CARD);

    await waitForElementById(HIFZ.DASHBOARD, 5000);
  });

  it("should display hifz dashboard with progress", async () => {
    await tapById(LEARN.HIFZ_CARD);
    await waitForElementById(HIFZ.DASHBOARD, 5000);

    // Should show start session button
    await waitForElementById(HIFZ.START_SESSION, 5000);
  });

  it("should start a hifz session", async () => {
    await tapById(LEARN.HIFZ_CARD);
    await waitForElementById(HIFZ.START_SESSION, 5000);
    await tapById(HIFZ.START_SESSION);

    // Should navigate to recitation screen with verse
    await waitForElementById(HIFZ.VERSE_DISPLAY, 8000);
  });

  it("should allow revealing verse in session", async () => {
    await tapById(LEARN.HIFZ_CARD);
    await tapById(HIFZ.START_SESSION);
    await waitForElementById(HIFZ.VERSE_DISPLAY, 8000);

    await tapById(HIFZ.REVEAL_BUTTON);

    // After reveal, rating buttons should appear
    await waitForElementById(HIFZ.EASY_BUTTON, 3000);
    await waitForElementById(HIFZ.GOOD_BUTTON, 3000);
    await waitForElementById(HIFZ.HARD_BUTTON, 3000);
  });

  it("should progress to next card after rating", async () => {
    await tapById(LEARN.HIFZ_CARD);
    await tapById(HIFZ.START_SESSION);
    await waitForElementById(HIFZ.VERSE_DISPLAY, 8000);
    await tapById(HIFZ.REVEAL_BUTTON);
    await waitForElementById(HIFZ.GOOD_BUTTON, 3000);

    await tapById(HIFZ.GOOD_BUTTON);

    // Should either show next card or session complete
    try {
      await waitForElementById(HIFZ.VERSE_DISPLAY, 3000);
    } catch {
      await waitForElementById(HIFZ.SESSION_COMPLETE, 5000);
    }
  });
});
