/**
 * useHifzReviewQueue Hook
 *
 * Provides review queue for spaced repetition
 */

import { useMemo, useCallback, useState } from "react";
import { useHifzStore } from "../stores/hifz-store";
import type { HifzVerseState } from "../../shared/types/hifz";

// =============================================================================
// TYPES
// =============================================================================

export interface UpcomingReviews {
  today: number;
  tomorrow: number;
  thisWeek: number;
}

export interface UseHifzReviewQueueReturn {
  // Review queue
  dueVerses: HifzVerseState[];
  dueCount: number;

  // Upcoming reviews (next 7 days)
  upcomingReviews: UpcomingReviews;

  // Actions
  refreshQueue: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get date range boundaries for filtering
 */
function getDateBoundaries() {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfTomorrow = new Date(endOfToday);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  const endOfThisWeek = new Date(endOfToday);
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);

  return {
    endOfToday: endOfToday.getTime(),
    endOfTomorrow: endOfTomorrow.getTime(),
    endOfThisWeek: endOfThisWeek.getTime(),
  };
}

/**
 * Calculate upcoming review counts
 */
function calculateUpcomingReviews(
  allVerses: HifzVerseState[],
): UpcomingReviews {
  const { endOfToday, endOfTomorrow, endOfThisWeek } = getDateBoundaries();

  let today = 0;
  let tomorrow = 0;
  let thisWeek = 0;

  allVerses.forEach((verse) => {
    const reviewTime = new Date(verse.nextReviewDate).getTime();

    if (reviewTime <= endOfToday) {
      today++;
    } else if (reviewTime <= endOfTomorrow) {
      tomorrow++;
    } else if (reviewTime <= endOfThisWeek) {
      thisWeek++;
    }
  });

  return { today, tomorrow, thisWeek };
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for accessing Hifz review queue and upcoming reviews
 */
export function useHifzReviewQueue(): UseHifzReviewQueueReturn {
  const { getReviewQueue, getDueVerseCount, memorizedVerses } = useHifzStore();
  const [refreshKey, setRefreshKey] = useState(0);

  // ============================================================
  // Review Queue (Due Now)
  // ============================================================

  const dueVerses = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey; // Force recalculation when refreshKey changes
    return getReviewQueue();
  }, [getReviewQueue, refreshKey]);

  const dueCount = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey; // Force recalculation when refreshKey changes
    return getDueVerseCount();
  }, [getDueVerseCount, refreshKey]);

  // ============================================================
  // Upcoming Reviews (Next 7 Days)
  // ============================================================

  const upcomingReviews = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey; // Force recalculation when refreshKey changes

    const allVerses = Array.from(memorizedVerses.values());
    return calculateUpcomingReviews(allVerses);
  }, [memorizedVerses, refreshKey]);

  // ============================================================
  // Refresh Queue
  // ============================================================

  const refreshQueue = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // ============================================================
  // Return
  // ============================================================

  return {
    dueVerses,
    dueCount,
    upcomingReviews,
    refreshQueue,
  };
}
