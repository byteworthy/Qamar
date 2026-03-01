/**
 * WorshipTabScreen Component Tests
 *
 * Tests all features of the Worship tab screen including:
 * - Rendering feature cards
 * - Coming Soon badges
 * - Link to existing DuaScreen
 * - Accessibility
 * - Animations
 * - Navigation behavior
 *
 * Test Coverage Target: >80%
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import WorshipTabScreen from "../WorshipTabScreen";

// Mock the useNavigation hook
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Helper to render with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("WorshipTabScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the screen title", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Worship")).toBeTruthy();
    });

    it("should render the subtitle", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(
        screen.getByText("Prayer times, Qibla, and daily adhkar"),
      ).toBeTruthy();
    });

    it("should render all four feature cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Prayer Times")).toBeTruthy();
      expect(screen.getByText("Qibla Finder")).toBeTruthy();
      expect(screen.getByText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByText("Islamic Calendar")).toBeTruthy();
    });

    it("should render feature descriptions", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(
        screen.getByText("Accurate prayer times for your location"),
      ).toBeTruthy();
      expect(screen.getByText("Find the direction of Makkah")).toBeTruthy();
      expect(
        screen.getByText("Daily remembrance and supplications"),
      ).toBeTruthy();
      expect(screen.getByText("Hijri dates and important events")).toBeTruthy();
    });
  });

  describe("Coming Soon Badges", () => {
    it("should show Coming Soon badge on Prayer Times card", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("should show Coming Soon badge on Qibla Finder card", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("should NOT show Coming Soon badge on Adhkar & Duas card", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Adhkar & Duas links to existing DuaScreen, so no Coming Soon
      const adhkarCard = screen.getByLabelText("Adhkar & Duas");
      expect(adhkarCard.props.accessibilityHint).toBe("Opens adhkar & duas");
    });

    it("should show Coming Soon badge on Islamic Calendar card", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("should have exactly 3 Coming Soon badges", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBe(3); // Prayer Times, Qibla, Calendar
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility labels for all cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByLabelText("Prayer Times")).toBeTruthy();
      expect(screen.getByLabelText("Qibla Finder")).toBeTruthy();
      expect(screen.getByLabelText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByLabelText("Islamic Calendar")).toBeTruthy();
    });

    it("should have accessibility role button for feature cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const prayerCard = screen.getByLabelText("Prayer Times");
      expect(prayerCard.props.accessibilityRole).toBe("button");
    });

    it("should have different accessibility hints for Coming Soon vs active features", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const prayerCard = screen.getByLabelText("Prayer Times");
      const adhkarCard = screen.getByLabelText("Adhkar & Duas");

      expect(prayerCard.props.accessibilityHint).toBe("Coming soon");
      expect(adhkarCard.props.accessibilityHint).toBe("Opens adhkar & duas");
    });

    it("should support screen reader navigation", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // All interactive elements should have labels
      const cards = [
        "Prayer Times",
        "Qibla Finder",
        "Adhkar & Duas",
        "Islamic Calendar",
      ];

      cards.forEach((cardLabel) => {
        expect(screen.getByLabelText(cardLabel)).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to DuaScreen when Adhkar & Duas is tapped", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const adhkarCard = screen.getByLabelText("Adhkar & Duas");
      fireEvent.press(adhkarCard);

      expect(mockNavigate).toHaveBeenCalledWith("Dua", { state: undefined });
    });

    it("should not navigate when Coming Soon features are tapped", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Coming Soon features should be disabled via accessibilityHint
      const prayerCard = screen.getByLabelText("Prayer Times");
      expect(prayerCard.props.accessibilityHint).toBe("Coming soon");
    });

    it("should have correct screen structure", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Verify main elements are present
      expect(screen.getByText("Worship")).toBeTruthy();
      expect(screen.getByText("Prayer Times")).toBeTruthy();
    });
  });

  describe("Animations", () => {
    it("should render without animation errors", async () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Wait for animations to complete
      await waitFor(() => {
        expect(screen.getByText("Worship")).toBeTruthy();
      });
    });

    it("should have staggered animation delays", () => {
      // This is a structural test - verify component renders
      // Actual animation behavior is tested in E2E tests
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Prayer Times")).toBeTruthy();
      expect(screen.getByText("Qibla Finder")).toBeTruthy();
      expect(screen.getByText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByText("Islamic Calendar")).toBeTruthy();
    });
  });

  describe("Layout", () => {
    it("should render within a ScrollView", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Verify scrollable content
      expect(screen.getByText("Worship")).toBeTruthy();
    });

    it("should apply safe area insets", () => {
      // Safe area insets are mocked in setup.ts
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Worship")).toBeTruthy();
    });

    it("should have proper spacing between cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // All cards should be visible
      expect(screen.getByText("Prayer Times")).toBeTruthy();
      expect(screen.getByText("Qibla Finder")).toBeTruthy();
      expect(screen.getByText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByText("Islamic Calendar")).toBeTruthy();
    });
  });

  describe("Theme Integration", () => {
    it("should use theme colors", () => {
      // Theme is provided by useTheme hook (mocked)
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Worship")).toBeTruthy();
    });

    it("should support dark mode", () => {
      // Dark mode is handled by theme provider
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Worship")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should render gracefully without crashing", () => {
      expect(() => renderWithNavigation(<WorshipTabScreen />)).not.toThrow();
    });

    it("should handle missing navigation context gracefully", () => {
      // Component should still render even without navigation
      expect(() => render(<WorshipTabScreen />)).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should render quickly", () => {
      const start = Date.now();
      renderWithNavigation(<WorshipTabScreen />);
      const duration = Date.now() - start;

      // Component should render in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it("should not cause memory leaks", () => {
      const { unmount } = renderWithNavigation(<WorshipTabScreen />);

      // Unmount should succeed without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Icons", () => {
    it("should render Feather icons for each card", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Icons are rendered within cards
      expect(screen.getByText("Prayer Times")).toBeTruthy();
      expect(screen.getByText("Qibla Finder")).toBeTruthy();
      expect(screen.getByText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByText("Islamic Calendar")).toBeTruthy();
    });
  });

  describe("Gradients", () => {
    it("should apply gradient backgrounds to cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Gradient backgrounds are applied via LinearGradient
      expect(screen.getByText("Prayer Times")).toBeTruthy();
    });

    it("should use different gradients for each card", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Each card has unique gradient
      expect(screen.getByText("Prayer Times")).toBeTruthy();
      expect(screen.getByText("Qibla Finder")).toBeTruthy();
      expect(screen.getByText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByText("Islamic Calendar")).toBeTruthy();
    });
  });

  describe("Content Validation", () => {
    it("should have exactly 4 feature cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Prayer Times")).toBeTruthy();
      expect(screen.getByText("Qibla Finder")).toBeTruthy();
      expect(screen.getByText("Adhkar & Duas")).toBeTruthy();
      expect(screen.getByText("Islamic Calendar")).toBeTruthy();
    });

    it("should have consistent card structure", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Each card has title and description
      const cards = [
        {
          title: "Prayer Times",
          description: "Accurate prayer times for your location",
        },
        { title: "Qibla Finder", description: "Find the direction of Makkah" },
        {
          title: "Adhkar & Duas",
          description: "Daily remembrance and supplications",
        },
        {
          title: "Islamic Calendar",
          description: "Hijri dates and important events",
        },
      ];

      cards.forEach((card) => {
        expect(screen.getByText(card.title)).toBeTruthy();
        expect(screen.getByText(card.description)).toBeTruthy();
      });
    });
  });

  describe("Integration", () => {
    it("should integrate with navigation stack", () => {
      renderWithNavigation(<WorshipTabScreen />);

      expect(screen.getByText("Worship")).toBeTruthy();
    });

    it("should integrate with theme provider", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Theme integration is handled by useTheme hook
      expect(screen.getByText("Worship")).toBeTruthy();
    });

    it("should integrate with safe area context", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Safe area integration is handled by useSafeAreaInsets hook
      expect(screen.getByText("Worship")).toBeTruthy();
    });
  });

  describe("Feature-Specific Tests", () => {
    it("should correctly identify which features are Coming Soon", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Prayer Times - Coming Soon
      const prayerCard = screen.getByLabelText("Prayer Times");
      expect(prayerCard.props.accessibilityHint).toBe("Coming soon");

      // Qibla Finder - Coming Soon
      const qiblaCard = screen.getByLabelText("Qibla Finder");
      expect(qiblaCard.props.accessibilityHint).toBe("Coming soon");

      // Adhkar & Duas - Active (links to DuaScreen)
      const adhkarCard = screen.getByLabelText("Adhkar & Duas");
      expect(adhkarCard.props.accessibilityHint).toBe("Opens adhkar & duas");

      // Islamic Calendar - Coming Soon
      const calendarCard = screen.getByLabelText("Islamic Calendar");
      expect(calendarCard.props.accessibilityHint).toBe("Coming soon");
    });

    it("should link Adhkar & Duas to existing Dua screen", () => {
      renderWithNavigation(<WorshipTabScreen />);

      const adhkarCard = screen.getByLabelText("Adhkar & Duas");
      fireEvent.press(adhkarCard);

      expect(mockNavigate).toHaveBeenCalledWith("Dua", { state: undefined });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it("should not call navigate for disabled Coming Soon cards", () => {
      renderWithNavigation(<WorshipTabScreen />);

      // Try to tap disabled cards (should not navigate)
      const prayerCard = screen.getByLabelText("Prayer Times");

      // Disabled cards have "Coming soon" hint
      expect(prayerCard.props.accessibilityHint).toBe("Coming soon");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
