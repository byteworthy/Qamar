import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert, Linking } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PricingScreen from "../PricingScreen";

// Mock the hooks and modules
jest.mock("@tanstack/react-query");
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: jest.fn(),
  }),
}));

// Mock billing provider
jest.mock("@/lib/billingProvider", () => ({
  BILLING_QUERY_KEY: ["billing"],
  getBillingProfile: jest.fn(() =>
    Promise.resolve({ tier: "free", status: "free" }),
  ),
  isPaidTier: jest.fn((tier) => tier === "plus" || tier === "pro"),
  isProTier: jest.fn((tier) => tier === "pro"),
  isStoreBillingActive: jest.fn(() => true),
  openManageSubscriptions: jest.fn(() => Promise.resolve()),
  purchaseTier: jest.fn(() =>
    Promise.resolve({ tier: "plus", status: "active" }),
  ),
  restorePurchases: jest.fn(() =>
    Promise.resolve({ tier: "free", status: "free" }),
  ),
}));

// Mock config
jest.mock("@/lib/config", () => ({
  VALIDATION_MODE: false,
}));

describe("PricingScreen", () => {
  const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
  const mockUseQueryClient = useQueryClient as jest.MockedFunction<
    typeof useQueryClient
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
    } as any);

    mockUseQuery.mockReturnValue({
      data: { tier: "free", status: "free" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  describe("Subscription Legal Disclosures", () => {
    it("should display auto-renewal statement", () => {
      render(<PricingScreen />);

      expect(
        screen.getByText(/Payment will be charged to your Apple ID/i),
      ).toBeTruthy();
      expect(
        screen.getByText(/Subscription automatically renews/i),
      ).toBeTruthy();
      expect(screen.getByText(/manage and cancel subscriptions/i)).toBeTruthy();
    });

    it("should display Terms of Service link", () => {
      render(<PricingScreen />);

      const termsLink = screen.getByText("Terms of Service");
      expect(termsLink).toBeTruthy();
    });

    it("should display Privacy Policy link", () => {
      render(<PricingScreen />);

      const privacyLink = screen.getByText("Privacy Policy");
      expect(privacyLink).toBeTruthy();
    });

    it("should open Terms of Service URL when link is pressed", async () => {
      const openURLSpy = jest.spyOn(Linking, "openURL");

      render(<PricingScreen />);

      const termsLink = screen.getByText("Terms of Service");
      fireEvent.press(termsLink);

      await waitFor(() => {
        expect(openURLSpy).toHaveBeenCalledWith(
          "https://byteworthy.github.io/Qamar/legal/terms.html",
        );
      });
    });

    it("should open Privacy Policy URL when link is pressed", async () => {
      const openURLSpy = jest.spyOn(Linking, "openURL");

      render(<PricingScreen />);

      const privacyLink = screen.getByText("Privacy Policy");
      fireEvent.press(privacyLink);

      await waitFor(() => {
        expect(openURLSpy).toHaveBeenCalledWith(
          "https://byteworthy.github.io/Qamar/legal/privacy.html",
        );
      });
    });

    it("should have proper accessibility hints on legal links", () => {
      render(<PricingScreen />);

      const termsLink = screen.getByA11yHint(/Opens Terms of Service/i);
      const privacyLink = screen.getByA11yHint(/Opens Privacy Policy/i);

      expect(termsLink).toBeTruthy();
      expect(privacyLink).toBeTruthy();
    });
  });

  describe("Plan Display", () => {
    it("should display Free plan", () => {
      render(<PricingScreen />);

      expect(screen.getByText("Free")).toBeTruthy();
      expect(screen.getByText("$0")).toBeTruthy();
      expect(screen.getByText("Current Plan")).toBeTruthy();
    });

    it("should display Noor Plus plan", () => {
      render(<PricingScreen />);

      expect(screen.getByText("Noor Plus (Beta)")).toBeTruthy();
      expect(screen.getByText("$2.99")).toBeTruthy();
      // /month appears multiple times (Free and Plus tiers)
      expect(screen.getAllByText("/month").length).toBeGreaterThan(0);
    });

    it("should display Noor Pro plan as coming soon", () => {
      render(<PricingScreen />);

      expect(screen.getByText("Noor Pro")).toBeTruthy();
      expect(screen.getByText("COMING SOON")).toBeTruthy();
    });

    it("should show Select button for Plus plan when user is free tier", () => {
      render(<PricingScreen />);

      const selectButton = screen.getByText("Select Noor Plus (Beta)");
      expect(selectButton).toBeTruthy();
    });

    it("should show Current Plan badge when user has Plus subscription", () => {
      mockUseQuery.mockReturnValue({
        data: { tier: "plus", status: "active" },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<PricingScreen />);

      // Free plan should not show Current Plan
      const allCurrentPlanTexts = screen.getAllByText("Current Plan");
      expect(allCurrentPlanTexts).toHaveLength(1);
    });
  });

  describe("Restore Purchases", () => {
    it("should display Restore Purchase button", () => {
      render(<PricingScreen />);

      expect(screen.getByText("Already purchased?")).toBeTruthy();
      expect(screen.getByText("Restore Purchase")).toBeTruthy();
    });

    it("should have accessibility hint on Restore Purchase button", () => {
      render(<PricingScreen />);

      const restoreButton = screen.getByA11yHint(
        /Restores previous purchases/i,
      );
      expect(restoreButton).toBeTruthy();
    });
  });

  describe("Manage Subscriptions", () => {
    it("should display Manage Subscriptions button", () => {
      render(<PricingScreen />);

      expect(screen.getByText("Manage Subscriptions")).toBeTruthy();
    });

    it("should have accessibility hint on Manage Subscriptions button", () => {
      render(<PricingScreen />);

      const manageButton = screen.getByA11yHint(
        /Opens App Store or Google Play/i,
      );
      expect(manageButton).toBeTruthy();
    });
  });

  describe("Validation Mode", () => {
    // Skip this test - it requires complex module mocking that affects other tests
    it.skip("should hide legal disclosure when billing is disabled", () => {
      // This test uses jest.doMock which can cause test isolation issues
      // Validation mode behavior is tested in E2E tests
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility labels for all interactive elements", () => {
      render(<PricingScreen />);

      // Check key accessibility hints exist
      expect(screen.getByA11yHint(/Opens Terms of Service/i)).toBeTruthy();
      expect(screen.getByA11yHint(/Opens Privacy Policy/i)).toBeTruthy();
      expect(screen.getByA11yHint(/Restores previous purchases/i)).toBeTruthy();
      expect(
        screen.getByA11yHint(/Opens App Store or Google Play/i),
      ).toBeTruthy();
    });
  });

  describe("Feature Lists", () => {
    it("should display Free tier features", () => {
      render(<PricingScreen />);

      expect(screen.getByText("1 reflection per day")).toBeTruthy();
      expect(screen.getByText("Basic journaling")).toBeTruthy();
      expect(screen.getByText("Islamic reframes")).toBeTruthy();
    });

    it("should display Plus tier features", () => {
      render(<PricingScreen />);

      // "Unlimited reflections" appears in both Free (crossed out) and Plus tiers
      expect(
        screen.getAllByText("Unlimited reflections").length,
      ).toBeGreaterThan(0);
      expect(screen.getAllByText("Pattern insights").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Contextual duas").length).toBeGreaterThan(0);
    });

    it("should display Pro tier features", () => {
      render(<PricingScreen />);

      expect(screen.getByText("Everything in Plus")).toBeTruthy();
      expect(screen.getByText("All personas")).toBeTruthy();
      expect(screen.getByText("Advanced insights")).toBeTruthy();
    });
  });
});
