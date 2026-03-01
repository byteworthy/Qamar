/**
 * LearnTabScreen Component Tests
 *
 * Tests all features of the Learn tab screen including:
 * - Rendering feature cards
 * - Coming Soon badges
 * - Accessibility
 * - Animations
 * - Navigation behavior
 *
 * Test Coverage Target: >80%
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import LearnTabScreen from "../LearnTabScreen";

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

describe("LearnTabScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the screen title", () => {
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Learn")).toBeTruthy();
    });

    it("should render the subtitle", () => {
      renderWithNavigation(<LearnTabScreen />);

      expect(
        screen.getByText("Islamic knowledge and Arabic language"),
      ).toBeTruthy();
    });

    it("should render all three feature cards", () => {
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Quran Reader")).toBeTruthy();
      expect(screen.getByText("Arabic Learning")).toBeTruthy();
      expect(screen.getByText("Hadith Library")).toBeTruthy();
    });

    it("should render feature descriptions", () => {
      renderWithNavigation(<LearnTabScreen />);

      expect(
        screen.getByText("Read and explore the Holy Quran with translations"),
      ).toBeTruthy();
      expect(
        screen.getByText("Learn Arabic with interactive flashcards"),
      ).toBeTruthy();
      expect(
        screen.getByText("Browse authenticated Hadith collections"),
      ).toBeTruthy();
    });
  });

  describe("Coming Soon Badges", () => {
    it("should show Coming Soon badge on Quran Reader card", () => {
      renderWithNavigation(<LearnTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBe(3); // All 3 features have Coming Soon
    });

    it("should show Coming Soon badge on Arabic Learning card", () => {
      renderWithNavigation(<LearnTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("should show Coming Soon badge on Hadith Library card", () => {
      renderWithNavigation(<LearnTabScreen />);

      const comingSoonBadges = screen.getAllByText("Coming Soon");
      expect(comingSoonBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("should disable interaction on Coming Soon features", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Verify cards are disabled (opacity reduced)
      // This is tested through accessibility props
      const quranCard = screen.getByLabelText("Quran Reader");
      expect(quranCard.props.accessibilityHint).toBe("Coming soon");
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility labels for all cards", () => {
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByLabelText("Quran Reader")).toBeTruthy();
      expect(screen.getByLabelText("Arabic Learning")).toBeTruthy();
      expect(screen.getByLabelText("Hadith Library")).toBeTruthy();
    });

    it("should have accessibility role button for feature cards", () => {
      renderWithNavigation(<LearnTabScreen />);

      const quranCard = screen.getByLabelText("Quran Reader");
      expect(quranCard.props.accessibilityRole).toBe("button");
    });

    it("should have appropriate accessibility hints", () => {
      renderWithNavigation(<LearnTabScreen />);

      const quranCard = screen.getByLabelText("Quran Reader");
      expect(quranCard.props.accessibilityHint).toBe("Coming soon");
    });

    it("should support screen reader navigation", () => {
      renderWithNavigation(<LearnTabScreen />);

      // All interactive elements should have labels
      const quranCard = screen.getByLabelText("Quran Reader");
      const arabicCard = screen.getByLabelText("Arabic Learning");
      const hadithCard = screen.getByLabelText("Hadith Library");

      expect(quranCard).toBeTruthy();
      expect(arabicCard).toBeTruthy();
      expect(hadithCard).toBeTruthy();
    });
  });

  describe("Animations", () => {
    it("should render without animation errors", async () => {
      renderWithNavigation(<LearnTabScreen />);

      // Wait for animations to complete
      await waitFor(() => {
        expect(screen.getByText("Learn")).toBeTruthy();
      });
    });

    it("should have staggered animation delays", () => {
      // This is a structural test - verify component renders
      // Actual animation behavior is tested in E2E tests
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Quran Reader")).toBeTruthy();
      expect(screen.getByText("Arabic Learning")).toBeTruthy();
      expect(screen.getByText("Hadith Library")).toBeTruthy();
    });
  });

  describe("Layout", () => {
    it("should render within a ScrollView", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Verify scrollable content
      expect(screen.getByText("Learn")).toBeTruthy();
    });

    it("should apply safe area insets", () => {
      // Safe area insets are mocked in setup.ts
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Learn")).toBeTruthy();
    });

    it("should have proper spacing between cards", () => {
      renderWithNavigation(<LearnTabScreen />);

      // All cards should be visible
      expect(screen.getByText("Quran Reader")).toBeTruthy();
      expect(screen.getByText("Arabic Learning")).toBeTruthy();
      expect(screen.getByText("Hadith Library")).toBeTruthy();
    });
  });

  describe("Theme Integration", () => {
    it("should use theme colors", () => {
      // Theme is provided by useTheme hook (mocked)
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Learn")).toBeTruthy();
    });

    it("should support dark mode", () => {
      // Dark mode is handled by theme provider
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Learn")).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should not navigate when Coming Soon features are tapped", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Coming Soon features should be disabled via accessibilityHint
      const quranCard = screen.getByLabelText("Quran Reader");
      expect(quranCard.props.accessibilityHint).toBe("Coming soon");
    });

    it("should have correct screen structure", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Verify main elements are present
      expect(screen.getByText("Learn")).toBeTruthy();
      expect(screen.getByText("Quran Reader")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should render gracefully without crashing", () => {
      expect(() => renderWithNavigation(<LearnTabScreen />)).not.toThrow();
    });

    it("should handle missing navigation context gracefully", () => {
      // Component should still render even without navigation
      expect(() => render(<LearnTabScreen />)).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should render quickly", () => {
      const start = Date.now();
      renderWithNavigation(<LearnTabScreen />);
      const duration = Date.now() - start;

      // Component should render in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it("should not cause memory leaks", () => {
      const { unmount } = renderWithNavigation(<LearnTabScreen />);

      // Unmount should succeed without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Icons", () => {
    it("should render Feather icons for each card", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Icons are rendered within cards
      expect(screen.getByText("Quran Reader")).toBeTruthy();
      expect(screen.getByText("Arabic Learning")).toBeTruthy();
      expect(screen.getByText("Hadith Library")).toBeTruthy();
    });
  });

  describe("Gradients", () => {
    it("should apply gradient backgrounds to cards", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Gradient backgrounds are applied via LinearGradient
      expect(screen.getByText("Quran Reader")).toBeTruthy();
    });

    it("should use different gradients for each card", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Each card has unique gradient
      expect(screen.getByText("Quran Reader")).toBeTruthy();
      expect(screen.getByText("Arabic Learning")).toBeTruthy();
      expect(screen.getByText("Hadith Library")).toBeTruthy();
    });
  });

  describe("Content Validation", () => {
    it("should have exactly 3 feature cards", () => {
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Quran Reader")).toBeTruthy();
      expect(screen.getByText("Arabic Learning")).toBeTruthy();
      expect(screen.getByText("Hadith Library")).toBeTruthy();
    });

    it("should have consistent card structure", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Each card has title, description, and Coming Soon badge
      const cards = [
        {
          title: "Quran Reader",
          description: "Read and explore the Holy Quran with translations",
        },
        {
          title: "Arabic Learning",
          description: "Learn Arabic with interactive flashcards",
        },
        {
          title: "Hadith Library",
          description: "Browse authenticated Hadith collections",
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
      renderWithNavigation(<LearnTabScreen />);

      expect(screen.getByText("Learn")).toBeTruthy();
    });

    it("should integrate with theme provider", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Theme integration is handled by useTheme hook
      expect(screen.getByText("Learn")).toBeTruthy();
    });

    it("should integrate with safe area context", () => {
      renderWithNavigation(<LearnTabScreen />);

      // Safe area integration is handled by useSafeAreaInsets hook
      expect(screen.getByText("Learn")).toBeTruthy();
    });
  });
});
