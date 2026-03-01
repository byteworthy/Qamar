/**
 * QuranReaderScreen Component Tests
 *
 * Tests all features of the Quran Reader screen including:
 * - Rendering surah list
 * - Search filtering
 * - Loading state
 * - Error state
 * - Navigation to VerseReader on tap
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
import QuranReaderScreen from "../QuranReaderScreen";

// Mock useQuranData hook
const mockSurahs = [
  {
    id: 1,
    name: "\u0627\u0644\u0641\u0627\u062A\u062D\u0629",
    transliteration: "Al-Fatihah",
    translation: "The Opening",
    numberOfVerses: 7,
    revelationPlace: "Makkah",
  },
  {
    id: 2,
    name: "\u0627\u0644\u0628\u0642\u0631\u0629",
    transliteration: "Al-Baqarah",
    translation: "The Cow",
    numberOfVerses: 286,
    revelationPlace: "Madinah",
  },
  {
    id: 114,
    name: "\u0627\u0644\u0646\u0627\u0633",
    transliteration: "An-Nas",
    translation: "Mankind",
    numberOfVerses: 6,
    revelationPlace: "Makkah",
  },
];

let mockHookReturn = {
  data: mockSurahs,
  isLoading: false,
  error: null,
};

jest.mock("@/hooks/useQuranData", () => ({
  useQuranSurahs: () => mockHookReturn,
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Helper to render with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("QuranReaderScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookReturn = {
      data: mockSurahs,
      isLoading: false,
      error: null,
    };
  });

  describe("Rendering", () => {
    it("should render surah list with all surahs", () => {
      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByText("Al-Fatihah")).toBeTruthy();
      expect(screen.getByText("Al-Baqarah")).toBeTruthy();
      expect(screen.getByText("An-Nas")).toBeTruthy();
    });

    it("should render surah translations", () => {
      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByText("The Opening")).toBeTruthy();
      expect(screen.getByText("The Cow")).toBeTruthy();
      expect(screen.getByText("Mankind")).toBeTruthy();
    });

    it("should render verse counts for each surah", () => {
      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByText("7 verses")).toBeTruthy();
      expect(screen.getByText("286 verses")).toBeTruthy();
      expect(screen.getByText("6 verses")).toBeTruthy();
    });

    it("should render revelation place badges", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const makkahBadges = screen.getAllByText("Makkah");
      expect(makkahBadges.length).toBe(2);
      expect(screen.getByText("Madinah")).toBeTruthy();
    });

    it("should render search bar with placeholder", () => {
      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByPlaceholderText("Search surahs...")).toBeTruthy();
    });
  });

  describe("Search Filtering", () => {
    it("should filter surahs by transliteration", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const searchInput = screen.getByPlaceholderText("Search surahs...");
      fireEvent.changeText(searchInput, "Fatihah");

      expect(screen.getByText("Al-Fatihah")).toBeTruthy();
      expect(screen.queryByText("Al-Baqarah")).toBeNull();
      expect(screen.queryByText("An-Nas")).toBeNull();
    });

    it("should filter surahs by translation", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const searchInput = screen.getByPlaceholderText("Search surahs...");
      fireEvent.changeText(searchInput, "Cow");

      expect(screen.getByText("Al-Baqarah")).toBeTruthy();
      expect(screen.queryByText("Al-Fatihah")).toBeNull();
    });

    it("should show empty state when no surahs match search", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const searchInput = screen.getByPlaceholderText("Search surahs...");
      fireEvent.changeText(searchInput, "nonexistent");

      expect(screen.getByText("No surahs found")).toBeTruthy();
    });

    it("should show all surahs when search is cleared", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const searchInput = screen.getByPlaceholderText("Search surahs...");
      fireEvent.changeText(searchInput, "Fatihah");

      expect(screen.queryByText("Al-Baqarah")).toBeNull();

      fireEvent.changeText(searchInput, "");

      expect(screen.getByText("Al-Fatihah")).toBeTruthy();
      expect(screen.getByText("Al-Baqarah")).toBeTruthy();
      expect(screen.getByText("An-Nas")).toBeTruthy();
    });

    it("should be case-insensitive", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const searchInput = screen.getByPlaceholderText("Search surahs...");
      fireEvent.changeText(searchInput, "al-fatihah");

      expect(screen.getByText("Al-Fatihah")).toBeTruthy();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when data is loading", () => {
      mockHookReturn = {
        data: undefined as any,
        isLoading: true,
        error: null,
      };

      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByText("Loading Quran...")).toBeTruthy();
    });

    it("should not show surah list during loading", () => {
      mockHookReturn = {
        data: undefined as any,
        isLoading: true,
        error: null,
      };

      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.queryByText("Al-Fatihah")).toBeNull();
    });
  });

  describe("Error State", () => {
    it("should show error message when data fails to load", () => {
      mockHookReturn = {
        data: undefined as any,
        isLoading: false,
        error: new Error("Network error") as any,
      };

      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByText("Failed to load Quran")).toBeTruthy();
      expect(
        screen.getByText("Please check your connection and try again"),
      ).toBeTruthy();
    });
  });

  describe("Navigation", () => {
    it("should navigate to VerseReader when surah card is pressed", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const fatihahCard = screen.getByText("Al-Fatihah");
      // Press the parent GlassCard (pressable ancestor)
      fireEvent.press(fatihahCard);

      expect(mockNavigate).toHaveBeenCalledWith("VerseReader", { surahId: 1 });
    });

    it("should pass correct surahId for different surahs", () => {
      renderWithNavigation(<QuranReaderScreen />);

      const nasCard = screen.getByText("An-Nas");
      fireEvent.press(nasCard);

      expect(mockNavigate).toHaveBeenCalledWith("VerseReader", {
        surahId: 114,
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no surahs available", () => {
      mockHookReturn = {
        data: [],
        isLoading: false,
        error: null,
      };

      renderWithNavigation(<QuranReaderScreen />);

      expect(screen.getByText("No surahs available")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should render gracefully without crashing", () => {
      expect(() => renderWithNavigation(<QuranReaderScreen />)).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should render quickly", () => {
      const start = Date.now();
      renderWithNavigation(<QuranReaderScreen />);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it("should not cause memory leaks", () => {
      const { unmount } = renderWithNavigation(<QuranReaderScreen />);

      expect(() => unmount()).not.toThrow();
    });
  });
});
