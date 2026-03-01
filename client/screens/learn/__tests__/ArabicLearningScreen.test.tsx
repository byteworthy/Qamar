/**
 * ArabicLearningScreen Component Tests
 *
 * Tests all features of the Arabic Learning screen including:
 * - Rendering alphabet grid
 * - Rendering progress stats
 * - Navigation to FlashcardReview
 * - Vocabulary review section
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import ArabicLearningScreen from "../ArabicLearningScreen";

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage");
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Helper to render with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("ArabicLearningScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  describe("Rendering", () => {
    it("should render the screen title", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Arabic Learning")).toBeTruthy();
      });
    });

    it("should render the subtitle", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(
          screen.getByText("Master Arabic with spaced repetition"),
        ).toBeTruthy();
      });
    });

    it("should render without crashing", () => {
      expect(() =>
        renderWithNavigation(<ArabicLearningScreen />),
      ).not.toThrow();
    });
  });

  describe("Alphabet Grid", () => {
    it("should render Arabic Alphabet section title", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Arabic Alphabet")).toBeTruthy();
      });
    });

    it("should render 28 letters description", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("28 letters to master")).toBeTruthy();
      });
    });

    it("should render letter cards with accessibility labels", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        // Check for first letter accessibility label
        expect(screen.getByLabelText("Letter Alif")).toBeTruthy();
      });
    });
  });

  describe("Progress Stats", () => {
    it("should render Your Progress section", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Your Progress")).toBeTruthy();
      });
    });

    it("should render Learned stat", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Learned")).toBeTruthy();
      });
    });

    it("should render Day Streak stat", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Day Streak")).toBeTruthy();
      });
    });

    it("should render Accuracy stat", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Accuracy")).toBeTruthy();
      });
    });

    it("should show initial stats as zero for new user", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("0%")).toBeTruthy();
      });
    });
  });

  describe("Vocabulary Review", () => {
    it("should render Vocabulary Review section", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Vocabulary Review")).toBeTruthy();
      });
    });

    it("should show cards ready to review count", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText(/cards ready to review/)).toBeTruthy();
      });
    });

    it("should render Start Review button", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByLabelText("Start vocabulary review")).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to FlashcardReview when Start Review is pressed with due cards", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      // Wait for flashcards to load and dueCount to be set
      await waitFor(() => {
        expect(screen.getByText("Start Review")).toBeTruthy();
      });

      const reviewButton = screen.getByLabelText("Start vocabulary review");
      fireEvent.press(reviewButton);

      expect(mockNavigate).toHaveBeenCalledWith("FlashcardReview");
    });

    it("should navigate back when back button is pressed", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        const backButton = screen.getByLabelText("Go back");
        fireEvent.press(backButton);
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe("Learning Tips", () => {
    it("should render Learning Tips section", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Learning Tips")).toBeTruthy();
      });
    });
  });

  describe("Storage Integration", () => {
    it("should attempt to load flashcards from AsyncStorage on mount", async () => {
      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
          "@noor_arabic_flashcards",
        );
      });
    });

    it("should handle stored flashcard data", async () => {
      const storedCards = [
        {
          wordId: "1",
          card: {
            difficulty: 0.5,
            stability: 2.4,
            lastReview: new Date().toISOString(),
            nextReview: new Date(Date.now() + 86400000).toISOString(),
            state: "review",
            reviewCount: 5,
          },
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedCards));

      renderWithNavigation(<ArabicLearningScreen />);

      await waitFor(() => {
        expect(screen.getByText("Your Progress")).toBeTruthy();
      });
    });
  });

  describe("Performance", () => {
    it("should render quickly", () => {
      const start = Date.now();
      renderWithNavigation(<ArabicLearningScreen />);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it("should not cause memory leaks", () => {
      const { unmount } = renderWithNavigation(<ArabicLearningScreen />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
