/**
 * useHifzProgress Hook
 *
 * Provides juz-level progress statistics for the dashboard
 */

import { useMemo } from 'react';
import { useHifzStore } from '../stores/hifz-store';
import type { JuzProgress } from '../../shared/types/hifz';

// =============================================================================
// TYPES
// =============================================================================

export type JuzStatus = 'not-started' | 'in-progress' | 'memorized';

export interface UseHifzProgressReturn {
  // All juz (if juzNumber not provided)
  allJuzProgress: JuzProgress[];

  // Specific juz (if juzNumber provided)
  juzProgress: JuzProgress | null;
  totalVerses: number;
  memorizedVerses: number;
  percentageComplete: number;
  status: JuzStatus;

  // Overall stats
  overallStats: {
    totalMemorized: number;
    totalVerses: number;
    percentageComplete: number;
  };
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for accessing Hifz progress statistics
 *
 * @param juzNumber - Optional juz number (1-30). If provided, returns specific juz stats.
 */
export function useHifzProgress(juzNumber?: number): UseHifzProgressReturn {
  const { juzProgress: allJuzProgress, getJuzProgress } = useHifzStore();

  // ============================================================
  // Specific Juz Progress
  // ============================================================

  const juzProgress = useMemo(() => {
    if (juzNumber === undefined) {
      return null;
    }
    return getJuzProgress(juzNumber);
  }, [juzNumber, getJuzProgress]);

  const totalVerses = juzProgress?.totalVerses ?? 0;
  const memorizedVerses = juzProgress?.memorizedVerses ?? 0;

  const percentageComplete = useMemo(() => {
    if (totalVerses === 0) return 0;
    return (memorizedVerses / totalVerses) * 100;
  }, [memorizedVerses, totalVerses]);

  const status: JuzStatus = useMemo(() => {
    if (memorizedVerses === 0) return 'not-started';
    if (memorizedVerses >= totalVerses) return 'memorized';
    return 'in-progress';
  }, [memorizedVerses, totalVerses]);

  // ============================================================
  // Overall Stats
  // ============================================================

  const overallStats = useMemo(() => {
    const totalMemorized = allJuzProgress.reduce(
      (sum, juz) => sum + juz.memorizedVerses,
      0
    );

    const totalVerses = allJuzProgress.reduce(
      (sum, juz) => sum + juz.totalVerses,
      0
    );

    const percentageComplete = totalVerses > 0 ? (totalMemorized / totalVerses) * 100 : 0;

    return {
      totalMemorized,
      totalVerses,
      percentageComplete,
    };
  }, [allJuzProgress]);

  // ============================================================
  // Return
  // ============================================================

  return {
    allJuzProgress,
    juzProgress,
    totalVerses,
    memorizedVerses,
    percentageComplete,
    status,
    overallStats,
  };
}
