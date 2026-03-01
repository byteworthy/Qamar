/**
 * E2E Regression Suite — Qamar App
 *
 * Master smoke test that verifies the most critical user paths
 * in a single run. Designed for fast CI feedback (< 10 min).
 *
 * For deep coverage of individual features, see e2e/flows/
 */
const {
  waitForElementById,
  waitForElementByText,
  tapById,
  tapByText,
  goToTab,
  screenshot,
} = require("./shared/helpers");
const {
  TABS,
  HOME,
  LEARN,
  PRAYER,
  SETTINGS,
  ONBOARDING,
  OFFLINE,
} = require("./shared/selectors");

describe("Qamar App — Regression Suite", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  // ─── App Launch ─────────────────────────────────────────────
  describe("App Launch", () => {
    it("should launch without crashing", async () => {
      // Either welcome or home screen
      await waitFor(element(by.text("Qamar")).or(by.text("Begin Reflection")))
        .toBeVisible()
        .withTimeout(10000);
      await screenshot("app-launch");
    });
  });

  // ─── Tab Navigation ──────────────────────────────────────────
  describe("Tab Navigation", () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      // Skip onboarding if shown
      try {
        await tapByText("Get Started");
        await tapByText("Continue");
        await tapByText("I Understand");
      } catch {
        // Already past onboarding
      }
    });

    it("should navigate all 5 tabs", async () => {
      for (const tab of ["home", "history", "learn", "worship", "settings"]) {
        await goToTab(tab);
        await screenshot(`tab-${tab}`);
      }
    });

    it("should return to home tab", async () => {
      await goToTab("settings");
      await goToTab("home");
      await waitForElementByText("Begin Reflection", 5000);
    });
  });

  // ─── Reflection Flow ─────────────────────────────────────────
  describe("Reflection Flow (smoke)", () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      await goToTab("home");
    });

    it("should open thought capture", async () => {
      await waitForElementByText("Begin Reflection", 5000);
      await tapByText("Begin Reflection");

      await waitFor(element(by.text(/What|Thought|Heart/i)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  // ─── Learn Tab ───────────────────────────────────────────────
  describe("Learn Tab (smoke)", () => {
    beforeEach(async () => {
      await device.reloadReactNative();
      await goToTab("learn");
    });

    it("should display learn screen content", async () => {
      await waitFor(element(by.id(LEARN.QURAN_CARD)).or(by.text("Quran")))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  // ─── Prayer Times ─────────────────────────────────────────────
  describe("Prayer Times (smoke)", () => {
    it("should display prayer times from worship tab", async () => {
      await device.reloadReactNative();
      await goToTab("worship");

      await waitFor(element(by.id(PRAYER.SCREEN)).or(by.text("Prayer")))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  // ─── Settings ────────────────────────────────────────────────
  describe("Settings (smoke)", () => {
    it("should display settings screen", async () => {
      await device.reloadReactNative();
      await goToTab("settings");

      await waitFor(element(by.text("Settings")))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
