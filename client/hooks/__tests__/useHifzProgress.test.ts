/**
 * useHifzProgress Hook Tests
 *
 * Tests juz-level progress statistics for the dashboard
 */

import { renderHook } from "@testing-library/react-native";
import { useHifzProgress } from "../useHifzProgress";
import { useHifzStore } from "../../stores/hifz-store";
import type { JuzProgress } from "../../../shared/types/hifz";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock dependencies
jest.mock("../../stores/hifz-store");

const mockUseHifzStore = useHifzStore as jest.MockedFunction<
  typeof useHifzStore
>;

describe("useHifzProgress", () => {
  const mockJuzProgress: JuzProgress[] = [
    {
      juzNumber: 1,
      totalVerses: 148,
      memorizedVerses: 100,
      status: "in_progress",
    },
    {
      juzNumber: 2,
      totalVerses: 111,
      memorizedVerses: 111,
      status: "on_schedule",
    },
    {
      juzNumber: 3,
      totalVerses: 126,
      memorizedVerses: 0,
      status: "not_started",
    },
    // Fill remaining juz with defaults
    ...Array.from({ length: 27 }, (_, i) => ({
      juzNumber: i + 4,
      totalVerses: 200,
      memorizedVerses: 0,
      status: "not_started" as const,
    })),
  ];

  const mockGetJuzProgress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store
    mockUseHifzStore.mockReturnValue({
      juzProgress: mockJuzProgress,
      getJuzProgress: mockGetJuzProgress,
      memorizedVerses: new Map(),
      isLoading: false,
      lastSyncedAt: null,
      markVerseAsMemorized: jest.fn(),
      updateAfterRecitation: jest.fn(),
      getVerseState: jest.fn(),
      getReviewQueue: jest.fn(),
      getDueVerseCount: jest.fn(),
      calculateJuzProgress: jest.fn(),
      reset: jest.fn(),
    } as any);
  });

  describe("All juz progress (no juzNumber)", () => {
    it("should return all juz progress", () => {
      const { result } = renderHook(() => useHifzProgress());

      expect(result.current.allJuzProgress).toEqual(mockJuzProgress);
      expect(result.current.allJuzProgress).toHaveLength(30);
    });

    it("should return null for juzProgress when no juzNumber provided", () => {
      const { result } = renderHook(() => useHifzProgress());

      expect(result.current.juzProgress).toBeNull();
      expect(result.current.totalVerses).toBe(0);
      expect(result.current.memorizedVerses).toBe(0);
      expect(result.current.percentageComplete).toBe(0);
      expect(result.current.status).toBe("not-started");
    });

    it("should calculate overall stats correctly", () => {
      const { result } = renderHook(() => useHifzProgress());

      // Total memorized: 100 + 111 = 211
      expect(result.current.overallStats.totalMemorized).toBe(211);

      // Total verses: sum of all juz
      const expectedTotal = mockJuzProgress.reduce(
        (sum, juz) => sum + juz.totalVerses,
        0,
      );
      expect(result.current.overallStats.totalVerses).toBe(expectedTotal);

      // Percentage: (211 / total) * 100
      const expectedPercentage = (211 / expectedTotal) * 100;
      expect(result.current.overallStats.percentageComplete).toBeCloseTo(
        expectedPercentage,
        2,
      );
    });
  });

  describe("Specific juz progress", () => {
    it("should return specific juz progress when juzNumber provided", () => {
      mockGetJuzProgress.mockReturnValue(mockJuzProgress[0]);

      const { result } = renderHook(() => useHifzProgress(1));

      expect(mockGetJuzProgress).toHaveBeenCalledWith(1);
      expect(result.current.juzProgress).toEqual(mockJuzProgress[0]);
      expect(result.current.totalVerses).toBe(148);
      expect(result.current.memorizedVerses).toBe(100);
    });

    it("should calculate percentage correctly for specific juz", () => {
      mockGetJuzProgress.mockReturnValue(mockJuzProgress[0]);

      const { result } = renderHook(() => useHifzProgress(1));

      // 100 / 148 * 100 = 67.57%
      expect(result.current.percentageComplete).toBeCloseTo(67.57, 2);
    });

    it("should return correct status for in-progress juz", () => {
      mockGetJuzProgress.mockReturnValue(mockJuzProgress[0]);

      const { result } = renderHook(() => useHifzProgress(1));

      expect(result.current.status).toBe("in-progress");
    });

    it("should return correct status for memorized juz", () => {
      mockGetJuzProgress.mockReturnValue(mockJuzProgress[1]);

      const { result } = renderHook(() => useHifzProgress(2));

      expect(result.current.status).toBe("memorized");
    });

    it("should return correct status for not-started juz", () => {
      mockGetJuzProgress.mockReturnValue(mockJuzProgress[2]);

      const { result } = renderHook(() => useHifzProgress(3));

      expect(result.current.status).toBe("not-started");
    });

    it("should handle 100% completion correctly", () => {
      const completeJuz: JuzProgress = {
        juzNumber: 2,
        totalVerses: 111,
        memorizedVerses: 111,
        status: "on_schedule",
      };

      mockGetJuzProgress.mockReturnValue(completeJuz);

      const { result } = renderHook(() => useHifzProgress(2));

      expect(result.current.percentageComplete).toBe(100);
      expect(result.current.status).toBe("memorized");
    });

    it("should handle 0% completion correctly", () => {
      mockGetJuzProgress.mockReturnValue(mockJuzProgress[2]);

      const { result } = renderHook(() => useHifzProgress(3));

      expect(result.current.percentageComplete).toBe(0);
      expect(result.current.status).toBe("not-started");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty juz progress array", () => {
      mockUseHifzStore.mockReturnValue({
        juzProgress: [],
        getJuzProgress: mockGetJuzProgress,
      } as any);

      const { result } = renderHook(() => useHifzProgress());

      expect(result.current.allJuzProgress).toEqual([]);
      expect(result.current.overallStats.totalMemorized).toBe(0);
      expect(result.current.overallStats.totalVerses).toBe(0);
      expect(result.current.overallStats.percentageComplete).toBe(0);
    });

    it("should handle division by zero in percentage calculation", () => {
      const zeroJuz: JuzProgress = {
        juzNumber: 1,
        totalVerses: 0,
        memorizedVerses: 0,
        status: "not_started",
      };

      mockGetJuzProgress.mockReturnValue(zeroJuz);

      const { result } = renderHook(() => useHifzProgress(1));

      expect(result.current.percentageComplete).toBe(0);
    });
  });
});
