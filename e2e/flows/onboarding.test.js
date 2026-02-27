/**
 * E2E Flow: Onboarding
 * Tests welcome screen, feature carousel, privacy, and safety screens
 */
const { waitForElementById, tapByText } = require("../shared/helpers");
const { ONBOARDING } = require("../shared/selectors");

describe("Onboarding Flow", () => {
  beforeAll(async () => {
    // Clear storage so onboarding shows
    await device.launchApp({
      newInstance: true,
      launchArgs: { reset_onboarding: "1" },
    });
  });

  it("should show welcome screen on fresh install", async () => {
    await waitFor(element(by.text("Qamar")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should display feature preview carousel", async () => {
    await waitForElementById(ONBOARDING.CAROUSEL, 5000);
  });

  it("should auto-scroll carousel items", async () => {
    await waitForElementById(ONBOARDING.CAROUSEL, 5000);
    // Carousel auto-scrolls every 3s — wait for second item
    await waitFor(element(by.text("Hifz Memorization")))
      .toBeVisible()
      .withTimeout(8000);
  });

  it("should navigate to privacy screen on Get Started", async () => {
    await tapByText("Get Started");

    await waitFor(element(by.text("Privacy")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should navigate to safety screen", async () => {
    await tapByText("Get Started");
    await waitFor(element(by.text("Privacy")))
      .toBeVisible()
      .withTimeout(5000);
    await tapByText("Continue");

    await waitFor(element(by.text("Safety")))
      .toBeVisible()
      .withTimeout(5000);
  });

  it("should reach main app after completing onboarding", async () => {
    await tapByText("Get Started");
    await waitFor(element(by.text("Privacy")))
      .toBeVisible()
      .withTimeout(5000);
    await tapByText("Continue");
    await waitFor(element(by.text("Safety")))
      .toBeVisible()
      .withTimeout(5000);
    await tapByText("I Understand");

    // Should land on home/main screen
    await waitFor(element(by.text("Begin Reflection")))
      .toBeVisible()
      .withTimeout(8000);
  });
});
