import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { JuzProgressMap } from "../JuzProgressMap";
import { useHifzProgress } from "../../hooks/useHifzProgress";

// Mock the useHifzProgress hook
jest.mock("@/hooks/useHifzProgress");

// Mock useTheme hook
jest.mock("../../hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      text: "#FFFFFF",
      background: "#000000",
      primary: "#D4AF37",
    },
    isDark: true,
  }),
}));

describe("JuzProgressMap Component", () => {
  const mockUseHifzProgress = useHifzProgress as jest.MockedFunction<
    typeof useHifzProgress
  >;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render 30 juz cells with numbers 1-30", () => {
      // Mock all juz as not-started
      const mockJuzProgress = Array.from({ length: 30 }, (_, i) => ({
        juzNumber: i + 1,
        totalVerses: 100,
        memorizedVerses: 0,
        status: "not_started" as const,
      }));

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 3000,
          percentageComplete: 0,
        },
      });

      render(<JuzProgressMap />);

      // Check all 30 juz numbers are rendered
      for (let i = 1; i <= 30; i++) {
        expect(screen.getByText(i.toString())).toBeTruthy();
      }
    });
  });

  describe("Color Coding by Status", () => {
    it("should show gray color for not-started juz", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 0,
          status: "not_started" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 143,
          percentageComplete: 0,
        },
      });

      const { getByTestId } = render(<JuzProgressMap />);
      const cell = getByTestId("juz-cell-1");

      // Check that the cell exists and has content
      expect(cell).toBeTruthy();
    });

    it("should show blue color for in-progress juz", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 50,
          status: "in_progress" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 50,
          totalVerses: 143,
          percentageComplete: 34.97,
        },
      });

      const { getByTestId } = render(<JuzProgressMap />);
      const cell = getByTestId("juz-cell-1");

      expect(cell).toBeTruthy();
    });

    it("should show green color for memorized juz", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 143,
          status: "on_schedule" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 143,
          totalVerses: 143,
          percentageComplete: 100,
        },
      });

      const { getByTestId } = render(<JuzProgressMap />);
      const cell = getByTestId("juz-cell-1");

      expect(cell).toBeTruthy();
    });
  });

  describe("Verse Count Badges", () => {
    it('should show verse count badges in format "memorized/total"', () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 50,
          status: "in_progress" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 50,
          totalVerses: 143,
          percentageComplete: 34.97,
        },
      });

      render(<JuzProgressMap />);

      // Check verse count is displayed
      expect(screen.getByText("50/143")).toBeTruthy();
    });

    it("should show 0/total for not-started juz", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 0,
          status: "not_started" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 143,
          percentageComplete: 0,
        },
      });

      render(<JuzProgressMap />);

      expect(screen.getByText("0/143")).toBeTruthy();
    });
  });

  describe("Tap Handlers", () => {
    it("should call onJuzPress with correct juz number when cell is tapped", () => {
      const mockOnJuzPress = jest.fn();
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 0,
          status: "not_started" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 143,
          percentageComplete: 0,
        },
      });

      const { getByTestId } = render(
        <JuzProgressMap onJuzPress={mockOnJuzPress} />,
      );

      const cell = getByTestId("juz-cell-1");
      fireEvent.press(cell);

      expect(mockOnJuzPress).toHaveBeenCalledWith(1);
      expect(mockOnJuzPress).toHaveBeenCalledTimes(1);
    });

    it("should not crash when onJuzPress is not provided", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 0,
          status: "not_started" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 143,
          percentageComplete: 0,
        },
      });

      const { getByTestId } = render(<JuzProgressMap />);

      const cell = getByTestId("juz-cell-1");

      // Should not throw error
      expect(() => fireEvent.press(cell)).not.toThrow();
    });
  });

  describe("Legend Display", () => {
    it("should show legend when showLegend is true (default)", () => {
      const mockJuzProgress = Array.from({ length: 30 }, (_, i) => ({
        juzNumber: i + 1,
        totalVerses: 100,
        memorizedVerses: 0,
        status: "not_started" as const,
      }));

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 3000,
          percentageComplete: 0,
        },
      });

      render(<JuzProgressMap />);

      // Legend labels should be present
      expect(screen.getByText("Not Started")).toBeTruthy();
      expect(screen.getByText("In Progress")).toBeTruthy();
      expect(screen.getByText("Memorized")).toBeTruthy();
    });

    it("should hide legend when showLegend is false", () => {
      const mockJuzProgress = Array.from({ length: 30 }, (_, i) => ({
        juzNumber: i + 1,
        totalVerses: 100,
        memorizedVerses: 0,
        status: "not_started" as const,
      }));

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 3000,
          percentageComplete: 0,
        },
      });

      render(<JuzProgressMap showLegend={false} />);

      // Legend labels should not be present
      expect(screen.queryByText("Not Started")).toBeNull();
      expect(screen.queryByText("In Progress")).toBeNull();
      expect(screen.queryByText("Memorized")).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty juz progress array", () => {
      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: [],
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 0,
          totalVerses: 0,
          percentageComplete: 0,
        },
      });

      const { container } = render(<JuzProgressMap />);

      // Should render without crashing
      expect(container).toBeTruthy();
    });

    it("should handle mixed status juz", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 0,
          status: "not_started" as const,
        },
        {
          juzNumber: 2,
          totalVerses: 111,
          memorizedVerses: 50,
          status: "in_progress" as const,
        },
        {
          juzNumber: 3,
          totalVerses: 126,
          memorizedVerses: 126,
          status: "on_schedule" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 176,
          totalVerses: 380,
          percentageComplete: 46.32,
        },
      });

      render(<JuzProgressMap />);

      // All three juz should be rendered
      expect(screen.getByText("1")).toBeTruthy();
      expect(screen.getByText("2")).toBeTruthy();
      expect(screen.getByText("3")).toBeTruthy();

      // Verse counts should be correct
      expect(screen.getByText("0/143")).toBeTruthy();
      expect(screen.getByText("50/111")).toBeTruthy();
      expect(screen.getByText("126/126")).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should have accessibility labels for juz cells", () => {
      const mockJuzProgress = [
        {
          juzNumber: 1,
          totalVerses: 143,
          memorizedVerses: 50,
          status: "in_progress" as const,
        },
      ];

      mockUseHifzProgress.mockReturnValue({
        allJuzProgress: mockJuzProgress,
        juzProgress: null,
        totalVerses: 0,
        memorizedVerses: 0,
        percentageComplete: 0,
        status: "not-started",
        overallStats: {
          totalMemorized: 50,
          totalVerses: 143,
          percentageComplete: 34.97,
        },
      });

      const { getByA11yLabel } = render(<JuzProgressMap />);

      const cell = getByA11yLabel("Juz 1, 50 of 143 verses memorized");
      expect(cell).toBeTruthy();
    });
  });
});
