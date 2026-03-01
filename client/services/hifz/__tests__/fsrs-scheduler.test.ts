import { describe, test, expect } from "@jest/globals";
import {
  initializeVerseState,
  calculateNextReview,
  rateRecitation,
  isDueForReview,
  getDaysOverdue,
} from "../fsrs-scheduler";
import type { HifzVerseState } from "../../../../shared/types/hifz";

describe("FSRS Scheduler", () => {
  test("initializeVerseState creates new verse with default FSRS values", () => {
    const state = initializeVerseState(1, 1);

    expect(state.surahNumber).toBe(1);
    expect(state.verseNumber).toBe(1);
    expect(state.fsrsState.difficulty).toBe(0.5);
    expect(state.fsrsState.stability).toBe(0);
    expect(state.fsrsState.reviewCount).toBe(0);
    expect(state.fsrsState.state).toBe("new");
    expect(state.mistakeCount).toBe(0);
    expect(new Date(state.nextReviewDate).getTime()).toBeGreaterThan(
      Date.now(),
    );
  });

  test('rateRecitation with "good" increases stability', () => {
    const initial = initializeVerseState(2, 10);
    const updated = rateRecitation(initial, "good");

    expect(updated.fsrsState.reviewCount).toBe(1);
    expect(updated.fsrsState.stability).toBeGreaterThan(
      initial.fsrsState.stability,
    );
  });

  test('rateRecitation with "again" resets stability to short interval', () => {
    const initial: HifzVerseState = {
      ...initializeVerseState(3, 5),
      fsrsState: {
        difficulty: 0.3,
        stability: 10,
        reviewCount: 5,
        state: "review",
      },
    };

    const updated = rateRecitation(initial, "again");

    expect(updated.fsrsState.stability).toBeLessThan(2);
    expect(updated.fsrsState.state).toBe("relearning");
  });

  test("isDueForReview returns true when nextReviewDate has passed", () => {
    const state: HifzVerseState = {
      ...initializeVerseState(1, 1),
      nextReviewDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    expect(isDueForReview(state)).toBe(true);
  });

  test("getDaysOverdue returns 0 when not overdue", () => {
    const state: HifzVerseState = {
      ...initializeVerseState(1, 1),
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    expect(getDaysOverdue(state)).toBe(0);
  });
});
