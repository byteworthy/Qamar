/**
 * E2E Test: Navigation & Home Screen
 * Tests app navigation, home screen, and core UI flows
 */

describe("Navigation & Home Screen", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe("Home Screen", () => {
    it("should display home screen on launch", async () => {
      await waitFor(element(by.text("Begin Reflection")))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text("Qamar"))).toBeVisible();
    });

    it("should show stats card", async () => {
      // Home screen should display reflection stats
      await waitFor(element(by.id("stats-card")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should navigate to reflection flow", async () => {
      await element(by.text("Begin Reflection")).tap();

      await waitFor(element(by.text("What's Weighing on Your Heart?")))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe("Tab Navigation", () => {
    it("should navigate between tabs", async () => {
      // Navigate to History tab
      await element(by.id("tab-history")).tap();
      await waitFor(element(by.text("Your Reflections")))
        .toBeVisible()
        .withTimeout(3000);

      // Navigate to Learn tab
      await element(by.id("tab-learn")).tap();
      await waitFor(element(by.text("Understanding Patterns")))
        .toBeVisible()
        .withTimeout(3000);

      // Navigate to Settings tab
      await element(by.id("tab-settings")).tap();
      await waitFor(element(by.text("Settings")))
        .toBeVisible()
        .withTimeout(3000);

      // Navigate back to Home tab
      await element(by.id("tab-home")).tap();
      await waitFor(element(by.text("Begin Reflection")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should persist tab selection", async () => {
      await element(by.id("tab-history")).tap();
      await waitFor(element(by.text("Your Reflections")))
        .toBeVisible()
        .withTimeout(3000);

      // Navigate to reflection flow and back
      await element(by.id("tab-home")).tap();
      await element(by.text("Begin Reflection")).tap();
      await element(by.id("cancel-button")).tap();

      // Should still be on home tab
      await expect(element(by.text("Begin Reflection"))).toBeVisible();
    });
  });

  describe("History Screen", () => {
    it("should display history screen", async () => {
      await element(by.id("tab-history")).tap();

      await waitFor(element(by.text("Your Reflections")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should show recent reflections", async () => {
      await element(by.id("tab-history")).tap();

      // Should display reflection list or empty state
      await waitFor(
        element(by.id("reflection-list")).or(by.text("No reflections yet")),
      )
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should allow viewing reflection details", async () => {
      await element(by.id("tab-history")).tap();

      // If reflections exist, tap first one
      try {
        await element(by.id("reflection-item-0")).tap();
        await waitFor(element(by.id("reflection-detail")))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // No reflections yet - this is okay for fresh install
        await expect(element(by.text("No reflections yet"))).toBeVisible();
      }
    });
  });

  describe("Learn Screen", () => {
    it("should display learn screen", async () => {
      await element(by.id("tab-learn")).tap();

      await waitFor(element(by.text("Understanding Patterns")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should show distortion types", async () => {
      await element(by.id("tab-learn")).tap();

      // Should display cognitive distortion information
      await waitFor(element(by.id("distortions-list")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should allow expanding distortion details", async () => {
      await element(by.id("tab-learn")).tap();

      // Tap a distortion to see details
      await element(by.id("distortion-catastrophizing")).tap();

      await waitFor(element(by.text("Catastrophizing")))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe("Settings Screen", () => {
    it("should display settings screen", async () => {
      await element(by.id("tab-settings")).tap();

      await waitFor(element(by.text("Settings")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should show subscription status", async () => {
      await element(by.id("tab-settings")).tap();

      // Should display subscription information
      await waitFor(element(by.text("Free").or(by.text("Qamar Plus"))))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should allow opening privacy policy", async () => {
      await element(by.id("tab-settings")).tap();

      await element(by.text("Privacy Policy")).tap();

      // Should open web view or external browser
      // Actual behavior depends on implementation
    });

    it("should allow opening terms of service", async () => {
      await element(by.id("tab-settings")).tap();

      await element(by.text("Terms of Service")).tap();

      // Should open web view or external browser
    });
  });

  describe("Pricing Screen", () => {
    it("should navigate to pricing screen", async () => {
      await element(by.id("tab-settings")).tap();
      await element(by.text("Upgrade to Qamar Plus")).tap();

      await waitFor(element(by.text("Qamar Plus")))
        .toBeVisible()
        .withTimeout(3000);
    });

    it("should display pricing information", async () => {
      await element(by.id("tab-settings")).tap();
      await element(by.text("Upgrade to Qamar Plus")).tap();

      // Should show pricing details
      await expect(element(by.text("$2.99"))).toBeVisible();
      await expect(element(by.text("per month"))).toBeVisible();
    });

    it("should show features list", async () => {
      await element(by.id("tab-settings")).tap();
      await element(by.text("Upgrade to Qamar Plus")).tap();

      // Should display feature list
      await expect(element(by.id("features-list"))).toBeVisible();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible navigation buttons", async () => {
      // All tab buttons should have accessibility labels
      await expect(element(by.id("tab-home"))).toHaveLabel("Home");
      await expect(element(by.id("tab-history"))).toHaveLabel("History");
      await expect(element(by.id("tab-learn"))).toHaveLabel("Learn");
      await expect(element(by.id("tab-settings"))).toHaveLabel("Settings");
    });

    it("should have accessible main action button", async () => {
      await expect(element(by.text("Begin Reflection"))).toBeVisible();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Disable network
      await device.setNetworkConnection("off");

      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText("Test thought");
      await element(by.id("intensity-3")).tap();
      await element(by.text("Continue")).tap();

      // Should show error message or retry option
      await waitFor(element(by.text("Try Again").or(by.text("Error"))))
        .toBeVisible()
        .withTimeout(35000);

      // Re-enable network
      await device.setNetworkConnection("on");
    });

    it("should retry after network error", async () => {
      await device.setNetworkConnection("off");

      await element(by.text("Begin Reflection")).tap();
      await element(by.id("thought-input")).typeText("Test thought");
      await element(by.id("intensity-3")).tap();
      await element(by.text("Continue")).tap();

      await waitFor(element(by.text("Try Again")))
        .toBeVisible()
        .withTimeout(35000);

      // Re-enable network and retry
      await device.setNetworkConnection("on");
      await element(by.text("Try Again")).tap();

      // Should proceed with analysis
      await waitFor(element(by.text("Continue")))
        .toBeVisible()
        .withTimeout(30000);
    });
  });
});
