/**
 * Hifz Store — Quran Memorization State Management
 *
 * Manages verse memorization state, FSRS scheduling, and Juz progress tracking.
 * Persisted via AsyncStorage with Map serialization.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HifzVerseState, JuzProgress } from '../../shared/types/hifz';
import {
  initializeVerseState,
  rateRecitation,
  isDueForReview,
  getDaysOverdue,
} from '../services/hifz/fsrs-scheduler';

// =============================================================================
// TYPES
// =============================================================================

interface HifzStore {
  // State
  memorizedVerses: Map<string, HifzVerseState>; // Key: "surahNumber:verseNumber"
  juzProgress: JuzProgress[]; // Array of 30 juz
  isLoading: boolean;
  lastSyncedAt: string | null;

  // Actions
  markVerseAsMemorized: (surahNumber: number, verseNumber: number) => void;
  updateAfterRecitation: (
    surahNumber: number,
    verseNumber: number,
    rating: 'again' | 'hard' | 'good' | 'easy',
    mistakes: string[]
  ) => void;
  getVerseState: (surahNumber: number, verseNumber: number) => HifzVerseState | undefined;
  getReviewQueue: () => HifzVerseState[];
  getDueVerseCount: () => number;
  getJuzProgress: (juzNumber: number) => JuzProgress;
  calculateJuzProgress: () => void;
  reset: () => void;
}

// =============================================================================
// JUZ BOUNDARIES
// =============================================================================

/**
 * Juz boundaries (approximate verse counts per juz)
 * Based on standard 30-part division of Quran
 * Total: ~6,236 verses across 114 surahs
 */
const JUZ_BOUNDARIES: Array<{ juzNumber: number; startSurah: number; startVerse: number; endSurah: number; endVerse: number }> = [
  { juzNumber: 1, startSurah: 1, startVerse: 1, endSurah: 2, endVerse: 141 },
  { juzNumber: 2, startSurah: 2, startVerse: 142, endSurah: 2, endVerse: 252 },
  { juzNumber: 3, startSurah: 2, startVerse: 253, endSurah: 3, endVerse: 92 },
  { juzNumber: 4, startSurah: 3, startVerse: 93, endSurah: 4, endVerse: 23 },
  { juzNumber: 5, startSurah: 4, startVerse: 24, endSurah: 4, endVerse: 147 },
  { juzNumber: 6, startSurah: 4, startVerse: 148, endSurah: 5, endVerse: 81 },
  { juzNumber: 7, startSurah: 5, startVerse: 82, endSurah: 6, endVerse: 110 },
  { juzNumber: 8, startSurah: 6, startVerse: 111, endSurah: 7, endVerse: 87 },
  { juzNumber: 9, startSurah: 7, startVerse: 88, endSurah: 8, endVerse: 40 },
  { juzNumber: 10, startSurah: 8, startVerse: 41, endSurah: 9, endVerse: 92 },
  { juzNumber: 11, startSurah: 9, startVerse: 93, endSurah: 11, endVerse: 5 },
  { juzNumber: 12, startSurah: 11, startVerse: 6, endSurah: 12, endVerse: 52 },
  { juzNumber: 13, startSurah: 12, startVerse: 53, endSurah: 15, endVerse: 1 },
  { juzNumber: 14, startSurah: 15, startVerse: 2, endSurah: 16, endVerse: 128 },
  { juzNumber: 15, startSurah: 17, startVerse: 1, endSurah: 18, endVerse: 74 },
  { juzNumber: 16, startSurah: 18, startVerse: 75, endSurah: 20, endVerse: 135 },
  { juzNumber: 17, startSurah: 21, startVerse: 1, endSurah: 22, endVerse: 78 },
  { juzNumber: 18, startSurah: 23, startVerse: 1, endSurah: 25, endVerse: 20 },
  { juzNumber: 19, startSurah: 25, startVerse: 21, endSurah: 27, endVerse: 55 },
  { juzNumber: 20, startSurah: 27, startVerse: 56, endSurah: 29, endVerse: 45 },
  { juzNumber: 21, startSurah: 29, startVerse: 46, endSurah: 33, endVerse: 30 },
  { juzNumber: 22, startSurah: 33, startVerse: 31, endSurah: 36, endVerse: 27 },
  { juzNumber: 23, startSurah: 36, startVerse: 28, endSurah: 39, endVerse: 31 },
  { juzNumber: 24, startSurah: 39, startVerse: 32, endSurah: 41, endVerse: 46 },
  { juzNumber: 25, startSurah: 41, startVerse: 47, endSurah: 45, endVerse: 37 },
  { juzNumber: 26, startSurah: 46, startVerse: 1, endSurah: 51, endVerse: 30 },
  { juzNumber: 27, startSurah: 51, startVerse: 31, endSurah: 57, endVerse: 29 },
  { juzNumber: 28, startSurah: 58, startVerse: 1, endSurah: 66, endVerse: 12 },
  { juzNumber: 29, startSurah: 67, startVerse: 1, endSurah: 77, endVerse: 50 },
  { juzNumber: 30, startSurah: 78, startVerse: 1, endSurah: 114, endVerse: 6 },
];

/**
 * Total verses per surah (all 114 surahs)
 * Used to calculate accurate juz progress
 */
const SURAH_VERSE_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, // 1-10
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135, // 11-20
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, // 21-30
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85, // 31-40
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, // 41-50
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13, // 51-60
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, // 61-70
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42, // 71-80
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, // 81-90
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11, // 91-100
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, // 101-110
  5, 4, 5, 6, // 111-114
];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get juz number for a given verse
 */
function getJuzForVerse(surahNumber: number, verseNumber: number): number {
  for (const boundary of JUZ_BOUNDARIES) {
    const isAfterStart =
      surahNumber > boundary.startSurah ||
      (surahNumber === boundary.startSurah && verseNumber >= boundary.startVerse);

    const isBeforeEnd =
      surahNumber < boundary.endSurah ||
      (surahNumber === boundary.endSurah && verseNumber <= boundary.endVerse);

    if (isAfterStart && isBeforeEnd) {
      return boundary.juzNumber;
    }
  }

  return 30; // Default to last juz if not found
}

/**
 * Initialize empty juz progress array
 */
function initializeJuzProgress(): JuzProgress[] {
  return Array.from({ length: 30 }, (_, i) => ({
    juzNumber: i + 1,
    totalVerses: 0,
    memorizedVerses: 0,
    status: 'not_started',
  }));
}

/**
 * Calculate total verses in a juz
 */
function calculateJuzTotalVerses(juzNumber: number): number {
  const boundary = JUZ_BOUNDARIES[juzNumber - 1];
  let total = 0;

  for (let surah = boundary.startSurah; surah <= boundary.endSurah; surah++) {
    const surahVerseCount = SURAH_VERSE_COUNTS[surah - 1];

    if (surah === boundary.startSurah && surah === boundary.endSurah) {
      // Juz starts and ends in same surah
      total += boundary.endVerse - boundary.startVerse + 1;
    } else if (surah === boundary.startSurah) {
      // First surah of juz
      total += surahVerseCount - boundary.startVerse + 1;
    } else if (surah === boundary.endSurah) {
      // Last surah of juz
      total += boundary.endVerse;
    } else {
      // Full surah in juz
      total += surahVerseCount;
    }
  }

  return total;
}

// =============================================================================
// STORE
// =============================================================================

export const useHifzStore = create<HifzStore>()(
  persist(
    (set, get) => ({
      // Initial state
      memorizedVerses: new Map(),
      juzProgress: initializeJuzProgress(),
      isLoading: false,
      lastSyncedAt: null,

      // Actions
      markVerseAsMemorized: (surahNumber, verseNumber) =>
        set((state) => {
          const key = `${surahNumber}:${verseNumber}`;
          const existingVerse = state.memorizedVerses.get(key);

          // Don't add duplicate
          if (existingVerse) {
            return state;
          }

          const newVerse = initializeVerseState(surahNumber, verseNumber);
          const newMap = new Map(state.memorizedVerses);
          newMap.set(key, newVerse);

          const newState = {
            ...state,
            memorizedVerses: newMap,
            lastSyncedAt: new Date().toISOString(),
          };

          // Recalculate juz progress
          const updatedJuzProgress = calculateJuzProgressHelper(newMap);

          return {
            ...newState,
            juzProgress: updatedJuzProgress,
          };
        }),

      updateAfterRecitation: (surahNumber, verseNumber, rating, mistakes) =>
        set((state) => {
          const key = `${surahNumber}:${verseNumber}`;
          const verse = state.memorizedVerses.get(key);

          if (!verse) {
            console.warn(`Verse ${key} not found in memorized verses`);
            return state;
          }

          // Update FSRS state
          const updatedVerse = rateRecitation(verse, rating);

          // Update mistake tracking
          if (mistakes.length > 0) {
            updatedVerse.mistakeCount += 1;
            // Keep only the last mistake (replace previous)
            updatedVerse.lastMistakes = mistakes;
          }

          const newMap = new Map(state.memorizedVerses);
          newMap.set(key, updatedVerse);

          // Recalculate juz progress
          const updatedJuzProgress = calculateJuzProgressHelper(newMap);

          return {
            ...state,
            memorizedVerses: newMap,
            juzProgress: updatedJuzProgress,
            lastSyncedAt: new Date().toISOString(),
          };
        }),

      getVerseState: (surahNumber, verseNumber) => {
        const key = `${surahNumber}:${verseNumber}`;
        return get().memorizedVerses.get(key);
      },

      getReviewQueue: () => {
        const verses = Array.from(get().memorizedVerses.values());
        const dueVerses = verses.filter((v) => isDueForReview(v));

        // Sort by days overdue (most overdue first)
        return dueVerses.sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a));
      },

      getDueVerseCount: () => {
        const verses = Array.from(get().memorizedVerses.values());
        return verses.filter((v) => isDueForReview(v)).length;
      },

      getJuzProgress: (juzNumber) => {
        if (juzNumber < 1 || juzNumber > 30) {
          throw new Error(`Invalid juz number: ${juzNumber}. Must be between 1 and 30.`);
        }
        return get().juzProgress[juzNumber - 1];
      },

      calculateJuzProgress: () =>
        set((state) => {
          const updatedJuzProgress = calculateJuzProgressHelper(state.memorizedVerses);
          return {
            ...state,
            juzProgress: updatedJuzProgress,
          };
        }),

      reset: () =>
        set({
          memorizedVerses: new Map(),
          juzProgress: initializeJuzProgress(),
          isLoading: false,
          lastSyncedAt: null,
        }),
    }),
    {
      name: 'hifz-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        memorizedVerses: Array.from(state.memorizedVerses.entries()),
        juzProgress: state.juzProgress,
        lastSyncedAt: state.lastSyncedAt,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as any;
        return {
          ...currentState,
          memorizedVerses: new Map(persisted.memorizedVerses || []),
          juzProgress: persisted.juzProgress || currentState.juzProgress,
          lastSyncedAt: persisted.lastSyncedAt || currentState.lastSyncedAt,
        };
      },
    }
  )
);

/**
 * Helper function to calculate juz progress from memorized verses map
 */
function calculateJuzProgressHelper(memorizedVerses: Map<string, HifzVerseState>): JuzProgress[] {
  const juzProgress = initializeJuzProgress();

  // Count memorized verses per juz
  const juzCounts = new Map<number, number>();

  Array.from(memorizedVerses.values()).forEach((verse) => {
    const juzNumber = getJuzForVerse(verse.surahNumber, verse.verseNumber);
    juzCounts.set(juzNumber, (juzCounts.get(juzNumber) || 0) + 1);
  });

  // Update juz progress
  for (let i = 0; i < 30; i++) {
    const juzNumber = i + 1;
    const memorizedCount = juzCounts.get(juzNumber) || 0;
    const totalVerses = calculateJuzTotalVerses(juzNumber);

    let status: JuzProgress['status'] = 'not_started';
    if (memorizedCount > 0 && memorizedCount < totalVerses) {
      status = 'in_progress';
    } else if (memorizedCount >= totalVerses) {
      status = 'on_schedule';
    }

    juzProgress[i] = {
      juzNumber,
      totalVerses,
      memorizedVerses: memorizedCount,
      status,
    };
  }

  return juzProgress;
}

// =============================================================================
// SELECTORS
// =============================================================================

export const selectMemorizedVerses = (state: HifzStore) => state.memorizedVerses;
export const selectJuzProgress = (state: HifzStore) => state.juzProgress;
export const selectDueVerseCount = (state: HifzStore) => state.getDueVerseCount();
export const selectReviewQueue = (state: HifzStore) => state.getReviewQueue();
