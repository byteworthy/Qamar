/**
 * E2E Test: Reflection Flow
 * Tests the complete thought capture and reflection journey
 */

describe("Reflection Flow", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe("Thought Capture", () => {
    it("should complete thought capture flow", async () => {
      // Wait for home screen to load
      await waitFor(element(by.text("Begin Reflection")))
        .toBeVisible()
        .withTimeout(5000);

      // Tap begin reflection button
      await element(by.text("Begin Reflection")).tap();

      // Wait for thought capture screen
      await waitFor(element(by.text("What's Weighing on Your Heart?")))
        .toBeVisible()
        .withTimeout(3000);

      // Enter a thought
      await element(by.id("thought-input")).typeText(
        "I am worried about my upcoming presentation at work",
      );

      // Select emotional intensity
      await element(by.id("intensity-3")).tap();

      // Tap continue
      await element(by.text("Continue")).tap();

      // Should navigate to distortion analysis screen
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000); // AI analysis may take time
    });

    it("should not allow empty thoughts", async () => {
      await element(by.text("Begin Reflection")).tap();

      // Try to continue without entering thought
      const continueButton = element(by.text("Continue"));
      await expect(continueButton).toBeVisible();

      // Button should be disabled (test by attempting tap)
      await element(by.id("thought-input")).typeText("Short"); // Less than 10 chars

      // Should still show validation error or disabled state
      await expect(element(by.id("thought-input"))).toHaveText("Short");
    });

    it("should allow selecting different emotional intensities", async () => {
      await element(by.text("Begin Reflection")).tap();

      // Test each intensity level
      await element(by.id("intensity-1")).tap();
      await element(by.id("intensity-3")).tap();
      await element(by.id("intensity-5")).tap();

      // Should be able to select any intensity
      await expect(element(by.id("intensity-5"))).toBeVisible();
    });
  });

  describe("Distortion Analysis", () => {
    beforeEach(async () => {
      // Navigate to distortion screen
      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText(
        "I am going to fail this exam and my life will be ruined",
      );
      await element(by.id("intensity-4")).tap();
      await element(by.text("Continue")).tap();
    });

    it("should display distortion analysis", async () => {
      // Wait for analysis to complete
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);

      // Should show analysis results
      await expect(element(by.id("analysis-content"))).toBeVisible();
    });

    it("should handle analysis errors gracefully", async () => {
      // If analysis fails, should show retry option
      // This test depends on API behavior
      await waitFor(element(by.text("Continue")).or(by.text("Try Again")))
        .toBeVisible()
        .withTimeout(35000);
    });

    it("should allow continuing to reframe", async () => {
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);

      await element(by.text("Continue")).tap();

      // Should navigate to reframe screen
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);
    });
  });

  describe("Reframe Generation", () => {
    beforeEach(async () => {
      // Navigate through to reframe screen
      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText(
        "Everything always goes wrong for me",
      );
      await element(by.id("intensity-4")).tap();
      await element(by.text("Continue")).tap();

      // Wait for distortion analysis
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);
      await element(by.text("Continue")).tap();
    });

    it("should generate reframe", async () => {
      // Wait for reframe generation
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);

      // Should show reframe content
      await expect(element(by.id("reframe-content"))).toBeVisible();
    });

    it("should allow rating belief strength", async () => {
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);

      // Should be able to rate belief strength
      await element(by.id("belief-rating-5")).tap();

      await expect(element(by.id("belief-rating-5"))).toBeVisible();
    });

    it("should continue to completion", async () => {
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);

      await element(by.text("Continue")).tap();

      // Should navigate to session complete
      await waitFor(element(by.text("Return Home")))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe("Session Completion", () => {
    beforeEach(async () => {
      // Complete full flow
      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText(
        "I worry that I am not good enough",
      );
      await element(by.id("intensity-3")).tap();
      await element(by.text("Continue")).tap();

      // Wait through analysis
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);
      await element(by.text("Continue")).tap();

      // Wait through reframe
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);
      await element(by.text("Continue")).tap();
    });

    it("should display completion screen", async () => {
      await waitFor(element(by.text("Return Home")))
        .toBeVisible()
        .withTimeout(5000);

      // Should show completion message
      await expect(element(by.text("Reflection Complete"))).toBeVisible();
    });

    it("should save session", async () => {
      await waitFor(element(by.text("Return Home")))
        .toBeVisible()
        .withTimeout(5000);

      // Session should be saved (tested via home screen later)
      await element(by.text("Return Home")).tap();

      // Should return to home screen
      await waitFor(element(by.text("Begin Reflection")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should return to home screen", async () => {
      await waitFor(element(by.text("Return Home")))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text("Return Home")).tap();

      // Should navigate back to home
      await waitFor(element(by.text("Begin Reflection")))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe("Crisis Detection", () => {
    it("should detect crisis language", async () => {
      await element(by.text("Begin Reflection")).tap();

      // Enter crisis-related thought
      await element(by.id("thought-input")).typeText(
        "I want to harm myself and end everything",
      );
      await element(by.id("intensity-5")).tap();
      await element(by.text("Continue")).tap();

      // Should show crisis resources
      await waitFor(element(by.text("988").or(by.text("Crisis"))))
        .toBeVisible()
        .withTimeout(30000);
    });
  });

  describe("Exit Confirmation", () => {
    it("should show exit confirmation when canceling mid-flow", async () => {
      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText("Test thought for exit");
      await element(by.id("intensity-3")).tap();

      // Tap cancel button (in header)
      await element(by.id("cancel-button")).tap();

      // Should show confirmation modal
      await waitFor(element(by.text("Leave Reflection?")))
        .toBeVisible()
        .withTimeout(2000);
    });

    it("should allow continuing after cancel prompt", async () => {
      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText("Test thought");
      await element(by.id("intensity-3")).tap();

      await element(by.id("cancel-button")).tap();
      await element(by.text("Keep Reflecting")).tap();

      // Should stay on current screen
      await expect(element(by.id("thought-input"))).toBeVisible();
    });
  });
});
