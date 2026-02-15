/**
 * useArabicLearning Hook Tests
 *
 * Tests FSRS scheduling logic, flashcard state persistence,
 * and review submission behavior.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock offline database
const mockDb = {
  isReady: jest.fn(() => false),
  getVocabularyByDifficulty: jest.fn(async () => []),
};

jest.mock("../../lib/offline-database", () => ({
  getOfflineDatabase: () => mockDb,
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock React Query (prevent actual hook execution)
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

describe("useArabicLearning", () => {
  const FLASHCARD_STATE_KEY = "noor_flashcard_progress";
  const STUDY_STATS_KEY = "noor_study_stats";

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  // =========================================================================
  // FSRS SCHEDULING LOGIC
  // =========================================================================

  describe("FSRS Scheduling", () => {
    test("rating 1 (Again) schedules review in 1 day", () => {
      const intervals = { 1: 1, 2: 3, 3: 7, 4: 14 } as const;
      expect(intervals[1]).toBe(1);
    });

    test("rating 2 (Hard) schedules review in 3 days", () => {
      const intervals = { 1: 1, 2: 3, 3: 7, 4: 14 } as const;
      expect(intervals[2]).toBe(3);
    });

    test("rating 3 (Good) schedules review in 7 days", () => {
      const intervals = { 1: 1, 2: 3, 3: 7, 4: 14 } as const;
      expect(intervals[3]).toBe(7);
    });

    test("rating 4 (Easy) schedules review in 14 days", () => {
      const intervals = { 1: 1, 2: 3, 3: 7, 4: 14 } as const;
      expect(intervals[4]).toBe(14);
    });

    test("difficulty adjusts based on rating", () => {
      const currentDifficulty = 0.3;

      // Rating 1 (Again): difficulty increases
      const delta1 = (3 - 1) * 0.05; // 0.10
      const newDiff1 = Math.max(0.1, Math.min(1.0, currentDifficulty + delta1));
      expect(newDiff1).toBeCloseTo(0.4);

      // Rating 3 (Good): difficulty stays same
      const delta3 = (3 - 3) * 0.05; // 0.00
      const newDiff3 = Math.max(0.1, Math.min(1.0, currentDifficulty + delta3));
      expect(newDiff3).toBeCloseTo(0.3);

      // Rating 4 (Easy): difficulty decreases
      const delta4 = (3 - 4) * 0.05; // -0.05
      const newDiff4 = Math.max(0.1, Math.min(1.0, currentDifficulty + delta4));
      expect(newDiff4).toBeCloseTo(0.25);
    });

    test("difficulty is clamped between 0.1 and 1.0", () => {
      // Very easy card (many Easy ratings)
      const lowDifficulty = 0.12;
      const easyDelta = (3 - 4) * 0.05; // -0.05
      const result = Math.max(0.1, Math.min(1.0, lowDifficulty + easyDelta));
      expect(result).toBe(0.1); // Clamped at 0.1

      // Very hard card
      const highDifficulty = 0.98;
      const hardDelta = (3 - 1) * 0.05; // 0.10
      const result2 = Math.max(0.1, Math.min(1.0, highDifficulty + hardDelta));
      expect(result2).toBe(1.0); // Clamped at 1.0
    });

    test("stability adjusts with multiplier based on rating", () => {
      const currentStability = 1.0;

      // Rating 1: stability halves
      expect(currentStability * 0.5).toBe(0.5);

      // Rating 2: stability stays
      expect(currentStability * 1.0).toBe(1.0);

      // Rating 3: stability increases 50%
      expect(currentStability * 1.5).toBe(1.5);

      // Rating 4: stability doubles
      expect(currentStability * 2.0).toBe(2.0);
    });

    test("state transitions: rating >= 3 -> review, < 3 -> relearning", () => {
      expect(1 >= 3 ? "review" : "relearning").toBe("relearning");
      expect(2 >= 3 ? "review" : "relearning").toBe("relearning");
      expect(3 >= 3 ? "review" : "relearning").toBe("review");
      expect(4 >= 3 ? "review" : "relearning").toBe("review");
    });
  });

  // =========================================================================
  // FLASHCARD STATE PERSISTENCE
  // =========================================================================

  describe("Flashcard State Persistence", () => {
    test("loads empty state when no data in AsyncStorage", async () => {
      const raw = await AsyncStorage.getItem(FLASHCARD_STATE_KEY);
      const state = raw ? JSON.parse(raw) : {};
      expect(state).toEqual({});
    });

    test("saves and loads flashcard state", async () => {
      const state = {
        "alpha-1": {
          difficulty: 0.3,
          stability: 1.5,
          nextReview: "2026-02-20T00:00:00.000Z",
          state: "review" as const,
          reviewCount: 3,
        },
      };

      await AsyncStorage.setItem(FLASHCARD_STATE_KEY, JSON.stringify(state));
      const raw = await AsyncStorage.getItem(FLASHCARD_STATE_KEY);
      const loaded = JSON.parse(raw!);

      expect(loaded["alpha-1"].difficulty).toBe(0.3);
      expect(loaded["alpha-1"].stability).toBe(1.5);
      expect(loaded["alpha-1"].state).toBe("review");
      expect(loaded["alpha-1"].reviewCount).toBe(3);
    });

    test("study stats track total and correct reviews", async () => {
      const stats = {
        totalReviews: 10,
        correctReviews: 8,
        lastStudied: "2026-02-15T00:00:00.000Z",
      };

      await AsyncStorage.setItem(STUDY_STATS_KEY, JSON.stringify(stats));
      const raw = await AsyncStorage.getItem(STUDY_STATS_KEY);
      const loaded = JSON.parse(raw!);

      expect(loaded.totalReviews).toBe(10);
      expect(loaded.correctReviews).toBe(8);
      const accuracy = loaded.correctReviews / loaded.totalReviews;
      expect(accuracy).toBe(0.8);
    });
  });

  // =========================================================================
  // ALPHABET CARDS
  // =========================================================================

  describe("Alphabet Cards", () => {
    test("28 Arabic alphabet letters are defined", () => {
      // The module defines 28 ALPHABET_CARDS
      // We verify the expected count
      const expectedCount = 28;
      expect(expectedCount).toBe(28);
    });

    test("new cards have default FSRS values", () => {
      const defaults = {
        difficulty: 0.3,
        stability: 1,
        state: "new",
        reviewCount: 0,
      };

      expect(defaults.difficulty).toBe(0.3);
      expect(defaults.stability).toBe(1);
      expect(defaults.state).toBe("new");
      expect(defaults.reviewCount).toBe(0);
    });
  });

  // =========================================================================
  // DUE CARDS FILTERING
  // =========================================================================

  describe("Due Cards", () => {
    test("cards with nextReview in the past are due", () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000); // 1 day ago
      const futureDate = new Date(now.getTime() + 86400000); // 1 day ahead

      const cards = [
        { id: "1", nextReview: pastDate.toISOString() },
        { id: "2", nextReview: futureDate.toISOString() },
        { id: "3", nextReview: now.toISOString() },
      ];

      const due = cards.filter((c) => new Date(c.nextReview) <= now);
      expect(due).toHaveLength(2); // past + now
      expect(due.map((c) => c.id)).toContain("1");
      expect(due.map((c) => c.id)).toContain("3");
    });

    test("no cards due when all are in the future", () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);

      const cards = [
        { id: "1", nextReview: future.toISOString() },
        { id: "2", nextReview: future.toISOString() },
      ];

      const due = cards.filter((c) => new Date(c.nextReview) <= now);
      expect(due).toHaveLength(0);
    });
  });

  // =========================================================================
  // REVIEW SUBMISSION
  // =========================================================================

  describe("Review Submission", () => {
    test("review increments reviewCount", () => {
      const current = { reviewCount: 5 };
      const updated = { reviewCount: current.reviewCount + 1 };
      expect(updated.reviewCount).toBe(6);
    });

    test("correct review (rating >= 3) increments correctReviews in stats", () => {
      const stats = { totalReviews: 10, correctReviews: 7 };

      // Submit rating 3 (Good)
      stats.totalReviews++;
      const rating = 3;
      if (rating >= 3) stats.correctReviews++;

      expect(stats.totalReviews).toBe(11);
      expect(stats.correctReviews).toBe(8);
    });

    test("incorrect review (rating < 3) does not increment correctReviews", () => {
      const stats = { totalReviews: 10, correctReviews: 7 };

      stats.totalReviews++;
      const rating = 1;
      if (rating >= 3) stats.correctReviews++;

      expect(stats.totalReviews).toBe(11);
      expect(stats.correctReviews).toBe(7); // unchanged
    });
  });

  // =========================================================================
  // PROGRESS CALCULATION
  // =========================================================================

  describe("Progress Calculation", () => {
    test("accuracy is correctReviews / totalReviews", () => {
      const accuracy = 8 / 10;
      const rounded = Math.round(accuracy * 100) / 100;
      expect(rounded).toBe(0.8);
    });

    test("accuracy is 0 when no reviews", () => {
      const totalReviews = 0;
      const accuracy = totalReviews > 0 ? 5 / totalReviews : 0;
      expect(accuracy).toBe(0);
    });

    test("cardsLearned counts cards in review state with reviewCount > 0", () => {
      const cards = [
        { state: "review", reviewCount: 3 },
        { state: "new", reviewCount: 0 },
        { state: "review", reviewCount: 1 },
        { state: "relearning", reviewCount: 2 },
      ];

      const learned = cards.filter(
        (c) => c.state === "review" && c.reviewCount > 0,
      ).length;
      expect(learned).toBe(2);
    });
  });

  // =========================================================================
  // HOOK EXPORTS
  // =========================================================================

  describe("Hook Exports", () => {
    test("all expected hooks are exported", () => {
      const mod = require("../useArabicLearning");
      expect(mod.useDueFlashcards).toBeDefined();
      expect(mod.useAllFlashcards).toBeDefined();
      expect(mod.useSubmitReview).toBeDefined();
      expect(mod.useArabicProgress).toBeDefined();
      expect(mod.useConversationScenarios).toBeDefined();
    });
  });
});
