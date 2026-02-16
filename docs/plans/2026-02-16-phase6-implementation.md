# Phase 6: Hifz Memorization + Deep AI Features - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 5 advanced features that leapfrog Tarteel AI on Quran memorization while adding AI depth no competitor has: Hifz system with FSRS spaced repetition, AI Tafsir, Dua Recommender, Personalized Study Plans, and AI Verse Conversations.

**Architecture:** Phase 6A builds the core Hifz memorization system (FSRS scheduler, recitation checker, juz dashboard). Phases 6B-6D add AI-powered companion features (tafsir, dua, study plans, verse chat). Phase 6E integrates everything with gating and gamification. All features use Claude Haiku for AI calls, share the existing AI daily quota system (3 free/day, unlimited Plus), and leverage existing tech stack (STT, TTS, RAG, FSRS patterns).

**Tech Stack:**
- React Native + Expo SDK 54
- Zustand (state) + AsyncStorage (persistence)
- Claude Haiku (`claude-haiku-4-5-20251001`)
- Existing: `@react-native-voice/voice` (STT), `expo-speech` (TTS), `expo-av` (recording)
- FSRS algorithm (adapt from flashcards)
- RAG engine (for dua search)

---

## Phase 6A: Hifz Memorization System Core

### Task 1: Create Hifz Types and Interfaces

**Files:**
- Create: `shared/types/hifz.ts`

**Step 1: Write the type definitions**

```typescript
// shared/types/hifz.ts
export interface HifzVerseState {
  surahNumber: number;
  verseNumber: number;
  memorizedAt: string; // ISO date
  lastReviewedAt: string | null;
  nextReviewDate: string; // ISO date
  fsrsState: {
    easeFactor: number; // 1.3 - 3.0
    interval: number; // days
    repetitions: number; // count
  };
  mistakeCount: number;
  lastMistakes: string[]; // Array of incorrect words from recent attempt
}

export interface JuzProgress {
  juzNumber: number; // 1-30
  totalVerses: number;
  memorizedVerses: number;
  status: 'not_started' | 'in_progress' | 'on_schedule' | 'review_overdue' | 'review_critical';
}

export interface RecitationResult {
  verseKey: string; // "1:1"
  expectedText: string;
  transcribedText: string;
  score: number; // 0-100
  accuracy: number; // 0-1
  wordResults: Array<{
    expected: string;
    actual: string;
    isCorrect: boolean;
  }>;
}

export interface DifficultyRating {
  rating: 'again' | 'hard' | 'good' | 'easy';
  multiplier: number; // FSRS interval multiplier
}

export const DIFFICULTY_RATINGS: Record<DifficultyRating['rating'], DifficultyRating> = {
  again: { rating: 'again', multiplier: 0 }, // Reset to 1 day
  hard: { rating: 'hard', multiplier: 1.2 },
  good: { rating: 'good', multiplier: 2.5 },
  easy: { rating: 'easy', multiplier: 4.0 },
};

export interface HifzReviewQueueItem {
  verseKey: string;
  surahNumber: number;
  verseNumber: number;
  nextReviewDate: string;
  daysSinceLastReview: number;
  urgency: 'due_today' | 'overdue' | 'critical'; // critical = 7+ days overdue
}
```

**Step 2: Commit**

```bash
git add shared/types/hifz.ts
git commit -m "feat(hifz): add core types and interfaces"
```

---

### Task 2: Create Hifz FSRS Scheduler Service

**Files:**
- Create: `client/services/hifz/fsrs-scheduler.ts`
- Reference: `client/services/flashcard.ts` (existing FSRS implementation)

**Step 1: Write the failing test**

```typescript
// client/services/hifz/__tests__/fsrs-scheduler.test.ts
import { describe, test, expect } from '@jest/globals';
import {
  initializeVerseState,
  calculateNextReview,
  rateRecitation,
} from '../fsrs-scheduler';
import type { HifzVerseState, DifficultyRating } from '@shared/types/hifz';

describe('FSRS Scheduler', () => {
  test('initializeVerseState creates new verse with default FSRS values', () => {
    const state = initializeVerseState(1, 1);

    expect(state.surahNumber).toBe(1);
    expect(state.verseNumber).toBe(1);
    expect(state.fsrsState.easeFactor).toBe(2.5);
    expect(state.fsrsState.interval).toBe(1);
    expect(state.fsrsState.repetitions).toBe(0);
    expect(state.mistakeCount).toBe(0);
    expect(new Date(state.nextReviewDate).getTime()).toBeGreaterThan(Date.now());
  });

  test('rateRecitation with "good" increases interval by 2.5x', () => {
    const initial = initializeVerseState(2, 10);
    const updated = rateRecitation(initial, 'good');

    expect(updated.fsrsState.repetitions).toBe(1);
    expect(updated.fsrsState.interval).toBeGreaterThan(initial.fsrsState.interval);
  });

  test('rateRecitation with "again" resets interval to 1 day', () => {
    const initial: HifzVerseState = {
      ...initializeVerseState(3, 5),
      fsrsState: { easeFactor: 2.8, interval: 10, repetitions: 5 },
    };

    const updated = rateRecitation(initial, 'again');

    expect(updated.fsrsState.interval).toBe(1);
    expect(updated.fsrsState.repetitions).toBe(0);
  });

  test('calculateNextReview returns date X days in future based on interval', () => {
    const state: HifzVerseState = {
      ...initializeVerseState(1, 1),
      fsrsState: { easeFactor: 2.5, interval: 7, repetitions: 2 },
    };

    const nextDate = calculateNextReview(state);
    const daysDiff = Math.floor(
      (new Date(nextDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    expect(daysDiff).toBeGreaterThanOrEqual(6);
    expect(daysDiff).toBeLessThanOrEqual(8);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- client/services/hifz/__tests__/fsrs-scheduler.test.ts
```

Expected: FAIL - module not found

**Step 3: Implement the FSRS scheduler**

```typescript
// client/services/hifz/fsrs-scheduler.ts
import type { HifzVerseState, DifficultyRating } from '@shared/types/hifz';
import { DIFFICULTY_RATINGS } from '@shared/types/hifz';

/**
 * Initialize a new verse state with default FSRS parameters
 */
export function initializeVerseState(
  surahNumber: number,
  verseNumber: number
): HifzVerseState {
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    surahNumber,
    verseNumber,
    memorizedAt: now,
    lastReviewedAt: null,
    nextReviewDate: tomorrow,
    fsrsState: {
      easeFactor: 2.5, // Default FSRS ease
      interval: 1, // Start with 1 day
      repetitions: 0,
    },
    mistakeCount: 0,
    lastMistakes: [],
  };
}

/**
 * Calculate next review date based on current FSRS state
 */
export function calculateNextReview(state: HifzVerseState): string {
  const intervalMs = state.fsrsState.interval * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + intervalMs).toISOString();
}

/**
 * Update verse state based on difficulty rating
 * Implements simplified FSRS algorithm
 */
export function rateRecitation(
  state: HifzVerseState,
  rating: DifficultyRating['rating']
): HifzVerseState {
  const ratingConfig = DIFFICULTY_RATINGS[rating];
  const now = new Date().toISOString();

  let newInterval: number;
  let newRepetitions: number;
  let newEaseFactor = state.fsrsState.easeFactor;

  if (rating === 'again') {
    // Reset on failure
    newInterval = 1;
    newRepetitions = 0;
    newEaseFactor = Math.max(1.3, newEaseFactor - 0.2); // Decrease ease
  } else {
    newRepetitions = state.fsrsState.repetitions + 1;

    // Apply multiplier
    if (newRepetitions === 1) {
      // First review
      newInterval = rating === 'easy' ? 4 : rating === 'good' ? 1 : 1;
    } else if (newRepetitions === 2) {
      // Second review
      newInterval = rating === 'easy' ? 7 : rating === 'good' ? 3 : 2;
    } else {
      // Subsequent reviews
      newInterval = Math.ceil(state.fsrsState.interval * ratingConfig.multiplier);
    }

    // Adjust ease factor
    if (rating === 'easy') {
      newEaseFactor = Math.min(3.0, newEaseFactor + 0.15);
    } else if (rating === 'hard') {
      newEaseFactor = Math.max(1.3, newEaseFactor - 0.15);
    }
  }

  return {
    ...state,
    lastReviewedAt: now,
    nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString(),
    fsrsState: {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
    },
  };
}

/**
 * Check if a verse is due for review today
 */
export function isDueForReview(state: HifzVerseState): boolean {
  return new Date(state.nextReviewDate).getTime() <= Date.now();
}

/**
 * Calculate days overdue (0 if not overdue)
 */
export function getDaysOverdue(state: HifzVerseState): number {
  const dueTime = new Date(state.nextReviewDate).getTime();
  const now = Date.now();

  if (now <= dueTime) return 0;

  return Math.floor((now - dueTime) / (1000 * 60 * 60 * 24));
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- client/services/hifz/__tests__/fsrs-scheduler.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add client/services/hifz/fsrs-scheduler.ts client/services/hifz/__tests__/fsrs-scheduler.test.ts
git commit -m "feat(hifz): implement FSRS spaced repetition scheduler"
```

---

### Task 3: Create Recitation Checker Service

**Files:**
- Create: `client/services/hifz/recitation-checker.ts`
- Reference: `server/services/pronunciation-scorer.ts` (similar word-level comparison)

**Step 1: Write the failing test**

```typescript
// client/services/hifz/__tests__/recitation-checker.test.ts
import { describe, test, expect } from '@jest/globals';
import { checkRecitation, scoreAccuracy } from '../recitation-checker';

describe('Recitation Checker', () => {
  test('checkRecitation returns perfect score for identical text', () => {
    const result = checkRecitation(
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      1,
      1
    );

    expect(result.score).toBe(100);
    expect(result.accuracy).toBe(1.0);
    expect(result.wordResults.every((w) => w.isCorrect)).toBe(true);
  });

  test('checkRecitation detects word-level mistakes', () => {
    const result = checkRecitation(
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ',
      'بِسْمِ الاه الرَّحْمَٰنِ',
      1,
      1
    );

    expect(result.wordResults).toHaveLength(3);
    expect(result.wordResults[0].isCorrect).toBe(true); // بِسْمِ
    expect(result.wordResults[1].isCorrect).toBe(false); // اللَّهِ vs الاه
    expect(result.wordResults[2].isCorrect).toBe(true); // الرَّحْمَٰنِ
  });

  test('scoreAccuracy calculates percentage of correct words', () => {
    const wordResults = [
      { expected: 'بِسْمِ', actual: 'بِسْمِ', isCorrect: true },
      { expected: 'اللَّهِ', actual: 'الاه', isCorrect: false },
      { expected: 'الرَّحْمَٰنِ', actual: 'الرَّحْمَٰنِ', isCorrect: true },
    ];

    const accuracy = scoreAccuracy(wordResults);
    expect(accuracy).toBeCloseTo(0.67, 2);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- client/services/hifz/__tests__/recitation-checker.test.ts
```

Expected: FAIL

**Step 3: Implement recitation checker**

```typescript
// client/services/hifz/recitation-checker.ts
import type { RecitationResult } from '@shared/types/hifz';

/**
 * Simple Levenshtein distance for Arabic text comparison
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalize Arabic text: remove tashkeel (diacritics), normalize alif variants
 */
function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel
    .replace(/[آأإ]/g, 'ا') // Normalize alif
    .replace(/ى/g, 'ي') // Normalize ya
    .trim();
}

/**
 * Check recitation by comparing expected verse text to transcribed text
 */
export function checkRecitation(
  expectedText: string,
  transcribedText: string,
  surahNumber: number,
  verseNumber: number
): RecitationResult {
  const verseKey = `${surahNumber}:${verseNumber}`;

  // Split into words
  const expectedWords = expectedText.trim().split(/\s+/);
  const transcribedWords = transcribedText.trim().split(/\s+/);

  // Word-level comparison
  const wordResults = expectedWords.map((expected, index) => {
    const actual = transcribedWords[index] || '';
    const normalizedExpected = normalizeArabicText(expected);
    const normalizedActual = normalizeArabicText(actual);

    // Allow small variation (1-2 character difference)
    const distance = levenshteinDistance(normalizedExpected, normalizedActual);
    const isCorrect = distance <= 1;

    return {
      expected,
      actual,
      isCorrect,
    };
  });

  const accuracy = scoreAccuracy(wordResults);
  const score = Math.round(accuracy * 100);

  return {
    verseKey,
    expectedText,
    transcribedText,
    score,
    accuracy,
    wordResults,
  };
}

/**
 * Calculate accuracy as percentage of correct words
 */
export function scoreAccuracy(
  wordResults: Array<{ expected: string; actual: string; isCorrect: boolean }>
): number {
  if (wordResults.length === 0) return 0;

  const correctCount = wordResults.filter((w) => w.isCorrect).length;
  return correctCount / wordResults.length;
}

/**
 * Extract mistakes from word results
 */
export function extractMistakes(wordResults: RecitationResult['wordResults']): string[] {
  return wordResults.filter((w) => !w.isCorrect).map((w) => w.expected);
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- client/services/hifz/__tests__/recitation-checker.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add client/services/hifz/recitation-checker.ts client/services/hifz/__tests__/recitation-checker.test.ts
git commit -m "feat(hifz): implement recitation checker with word-level comparison"
```

---

### Task 4: Create Hifz Zustand Store

**Files:**
- Create: `client/stores/hifz-store.ts`

**Step 1: Write the store implementation**

```typescript
// client/stores/hifz-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HifzVerseState, JuzProgress } from '@shared/types/hifz';
import { initializeVerseState, rateRecitation, isDueForReview } from '../services/hifz/fsrs-scheduler';

interface HifzStore {
  // State
  memorizedVerses: Map<string, HifzVerseState>; // key: "surahNumber:verseNumber"

  // Actions
  markAsMemorized: (surahNumber: number, verseNumber: number) => void;
  updateAfterRecitation: (
    verseKey: string,
    rating: 'again' | 'hard' | 'good' | 'easy',
    mistakes: string[]
  ) => void;
  getVerseState: (surahNumber: number, verseNumber: number) => HifzVerseState | null;
  getReviewQueue: () => HifzVerseState[];
  getJuzProgress: (juzNumber: number) => JuzProgress;
  getAllJuzProgress: () => JuzProgress[];
  getTotalMemorizedCount: () => number;
}

// Juz to verse mapping (simplified - full mapping should reference Quran metadata)
// Each juz contains ~20 pages, ~600 verses average
const JUZ_VERSE_RANGES = [
  { juz: 1, startSurah: 1, startVerse: 1, endSurah: 2, endVerse: 141 },
  { juz: 2, startSurah: 2, startVerse: 142, endSurah: 2, endVerse: 252 },
  // ... (remaining 28 juz - for MVP, we can use approximate counts)
  // Full mapping requires Quran metadata API or seed data
];

export const useHifzStore = create<HifzStore>()(
  persist(
    (set, get) => ({
      memorizedVerses: new Map(),

      markAsMemorized: (surahNumber, verseNumber) => {
        const verseKey = `${surahNumber}:${verseNumber}`;
        const existing = get().memorizedVerses.get(verseKey);

        if (!existing) {
          const newState = initializeVerseState(surahNumber, verseNumber);
          set((state) => {
            const updated = new Map(state.memorizedVerses);
            updated.set(verseKey, newState);
            return { memorizedVerses: updated };
          });
        }
      },

      updateAfterRecitation: (verseKey, rating, mistakes) => {
        const current = get().memorizedVerses.get(verseKey);
        if (!current) return;

        const updated = rateRecitation(current, rating);
        updated.lastMistakes = mistakes;
        updated.mistakeCount += mistakes.length;

        set((state) => {
          const updatedMap = new Map(state.memorizedVerses);
          updatedMap.set(verseKey, updated);
          return { memorizedVerses: updatedMap };
        });
      },

      getVerseState: (surahNumber, verseNumber) => {
        const verseKey = `${surahNumber}:${verseNumber}`;
        return get().memorizedVerses.get(verseKey) || null;
      },

      getReviewQueue: () => {
        const verses = Array.from(get().memorizedVerses.values());
        return verses
          .filter((v) => isDueForReview(v))
          .sort((a, b) => {
            // Sort by next review date (oldest first)
            return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
          });
      },

      getJuzProgress: (juzNumber) => {
        const verses = Array.from(get().memorizedVerses.values());
        // Simplified: calculate based on verse count
        // In production, use actual juz verse ranges from Quran metadata
        const juzVerses = verses.filter(
          (v) => Math.ceil((v.surahNumber * 10 + v.verseNumber) / 600) === juzNumber
        );

        const memorizedCount = juzVerses.length;
        const totalVerses = 600; // Approximate

        let status: JuzProgress['status'] = 'not_started';
        if (memorizedCount > 0 && memorizedCount < totalVerses) {
          status = 'in_progress';
        } else if (memorizedCount === totalVerses) {
          const overdueCount = juzVerses.filter(
            (v) => new Date(v.nextReviewDate).getTime() < Date.now()
          ).length;

          if (overdueCount === 0) status = 'on_schedule';
          else if (overdueCount < totalVerses * 0.3) status = 'review_overdue';
          else status = 'review_critical';
        }

        return {
          juzNumber,
          totalVerses,
          memorizedVerses: memorizedCount,
          status,
        };
      },

      getAllJuzProgress: () => {
        return Array.from({ length: 30 }, (_, i) => get().getJuzProgress(i + 1));
      },

      getTotalMemorizedCount: () => {
        return get().memorizedVerses.size;
      },
    }),
    {
      name: 'noor-hifz-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Serialize Map to array for storage
      partialize: (state) => ({
        memorizedVerses: Array.from(state.memorizedVerses.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.memorizedVerses)) {
          state.memorizedVerses = new Map(state.memorizedVerses as any);
        }
      },
    }
  )
);
```

**Step 2: Commit**

```bash
git add client/stores/hifz-store.ts
git commit -m "feat(hifz): create Zustand store with AsyncStorage persistence"
```

---

### Task 5: Create Hifz Hooks

**Files:**
- Create: `client/hooks/useHifzRecitation.ts`
- Create: `client/hooks/useHifzProgress.ts`
- Create: `client/hooks/useHifzReviewQueue.ts`

**Step 1: Implement useHifzRecitation hook**

```typescript
// client/hooks/useHifzRecitation.ts
import { useState } from 'react';
import { useHifzStore } from '../stores/hifz-store';
import { checkRecitation, extractMistakes } from '../services/hifz/recitation-checker';
import { useSTT } from './useSTT';
import type { RecitationResult } from '@shared/types/hifz';

interface UseHifzRecitationProps {
  surahNumber: number;
  verseNumber: number;
  expectedText: string;
}

export function useHifzRecitation({ surahNumber, verseNumber, expectedText }: UseHifzRecitationProps) {
  const { startListening, stopListening, transcript, isListening } = useSTT();
  const { updateAfterRecitation, markAsMemorized, getVerseState } = useHifzStore();

  const [result, setResult] = useState<RecitationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecitation = async () => {
    setResult(null);
    await startListening('ar-SA');
  };

  const finishRecitation = async () => {
    await stopListening();
    setIsProcessing(true);

    // Check recitation
    const recitationResult = checkRecitation(
      expectedText,
      transcript,
      surahNumber,
      verseNumber
    );

    setResult(recitationResult);
    setIsProcessing(false);

    // Mark as memorized if first time
    const existing = getVerseState(surahNumber, verseNumber);
    if (!existing) {
      markAsMemorized(surahNumber, verseNumber);
    }

    return recitationResult;
  };

  const rateAndSchedule = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!result) return;

    const verseKey = `${surahNumber}:${verseNumber}`;
    const mistakes = extractMistakes(result.wordResults);

    updateAfterRecitation(verseKey, rating, mistakes);
  };

  return {
    startRecitation,
    finishRecitation,
    rateAndSchedule,
    result,
    isListening,
    isProcessing,
    transcript,
  };
}
```

**Step 2: Implement useHifzProgress hook**

```typescript
// client/hooks/useHifzProgress.ts
import { useMemo } from 'react';
import { useHifzStore } from '../stores/hifz-store';

export function useHifzProgress(juzNumber?: number) {
  const { getAllJuzProgress, getJuzProgress, getTotalMemorizedCount } = useHifzStore();

  const allProgress = useMemo(() => getAllJuzProgress(), [getAllJuzProgress]);
  const specificJuz = juzNumber ? getJuzProgress(juzNumber) : null;
  const totalMemorized = getTotalMemorizedCount();

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalVerses = allProgress.reduce((sum, j) => sum + j.totalVerses, 0);
    const memorized = allProgress.reduce((sum, j) => sum + j.memorizedVerses, 0);
    const percentComplete = totalVerses > 0 ? (memorized / totalVerses) * 100 : 0;

    // Estimate completion date based on current pace
    // (simplified - assumes consistent memorization rate)
    const versesRemaining = totalVerses - memorized;
    const avgVersesPerDay = 3; // Assumption
    const daysRemaining = Math.ceil(versesRemaining / avgVersesPerDay);
    const estimatedCompletionDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

    return {
      totalVerses,
      memorized,
      percentComplete,
      estimatedCompletionDate: estimatedCompletionDate.toISOString(),
    };
  }, [allProgress]);

  return {
    allProgress,
    specificJuz,
    totalMemorized,
    stats,
  };
}
```

**Step 3: Implement useHifzReviewQueue hook**

```typescript
// client/hooks/useHifzReviewQueue.ts
import { useMemo } from 'react';
import { useHifzStore } from '../stores/hifz-store';
import { getDaysOverdue } from '../services/hifz/fsrs-scheduler';
import type { HifzReviewQueueItem } from '@shared/types/hifz';

export function useHifzReviewQueue() {
  const { getReviewQueue } = useHifzStore();

  const reviewQueue = useMemo(() => getReviewQueue(), [getReviewQueue]);

  const queueItems: HifzReviewQueueItem[] = useMemo(() => {
    return reviewQueue.map((verse) => {
      const daysOverdue = getDaysOverdue(verse);
      let urgency: HifzReviewQueueItem['urgency'] = 'due_today';

      if (daysOverdue > 7) urgency = 'critical';
      else if (daysOverdue > 0) urgency = 'overdue';

      const daysSinceLast = verse.lastReviewedAt
        ? Math.floor((Date.now() - new Date(verse.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        verseKey: `${verse.surahNumber}:${verse.verseNumber}`,
        surahNumber: verse.surahNumber,
        verseNumber: verse.verseNumber,
        nextReviewDate: verse.nextReviewDate,
        daysSinceLastReview: daysSinceLast,
        urgency,
      };
    });
  }, [reviewQueue]);

  const todayCount = queueItems.filter((item) => item.urgency === 'due_today').length;
  const overdueCount = queueItems.filter((item) => item.urgency === 'overdue').length;
  const criticalCount = queueItems.filter((item) => item.urgency === 'critical').length;

  return {
    queueItems,
    todayCount,
    overdueCount,
    criticalCount,
    totalDue: queueItems.length,
  };
}
```

**Step 4: Commit**

```bash
git add client/hooks/useHifzRecitation.ts client/hooks/useHifzProgress.ts client/hooks/useHifzReviewQueue.ts
git commit -m "feat(hifz): create hooks for recitation, progress, and review queue"
```

---

### Task 6: Create Juz Progress Map Component

**Files:**
- Create: `client/components/JuzProgressMap.tsx`

**Step 1: Implement component**

```typescript
// client/components/JuzProgressMap.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { JuzProgress } from '@shared/types/hifz';

interface JuzProgressMapProps {
  juzProgress: JuzProgress[];
  onJuzPress: (juzNumber: number) => void;
}

export function JuzProgressMap({ juzProgress, onJuzPress }: JuzProgressMapProps) {
  const theme = useTheme();

  const getStatusColor = (status: JuzProgress['status']) => {
    switch (status) {
      case 'not_started':
        return '#6B7280'; // Gray
      case 'in_progress':
        return '#3B82F6'; // Blue
      case 'on_schedule':
        return '#10B981'; // Green
      case 'review_overdue':
        return '#F59E0B'; // Yellow
      case 'review_critical':
        return '#EF4444'; // Red
    }
  };

  const getStatusLabel = (status: JuzProgress['status']) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'on_schedule':
        return 'On Track';
      case 'review_overdue':
        return 'Review Due';
      case 'review_critical':
        return 'Urgent Review';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>30 Juz Progress</Text>

      <View style={styles.grid}>
        {juzProgress.map((juz) => {
          const statusColor = getStatusColor(juz.status);
          const progress = juz.totalVerses > 0
            ? (juz.memorizedVerses / juz.totalVerses) * 100
            : 0;

          return (
            <TouchableOpacity
              key={juz.juzNumber}
              style={[
                styles.cell,
                {
                  backgroundColor: statusColor,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => onJuzPress(juz.juzNumber)}
            >
              <Text style={styles.cellNumber}>{juz.juzNumber}</Text>
              <Text style={styles.cellProgress}>{Math.round(progress)}%</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {(['not_started', 'in_progress', 'on_schedule', 'review_overdue', 'review_critical'] as const).map(
          (status) => (
            <View key={status} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: getStatusColor(status) }]}
              />
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
                {getStatusLabel(status)}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  cell: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cellNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cellProgress: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  legend: {
    marginTop: 24,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 14,
  },
});
```

**Step 2: Commit**

```bash
git add client/components/JuzProgressMap.tsx
git commit -m "feat(hifz): create 30-juz progress map with color-coded status"
```

---

### Task 7: Create Hifz Mistake Feedback Component

**Files:**
- Create: `client/components/HifzMistakeFeedback.tsx`

**Step 1: Implement component**

```typescript
// client/components/HifzMistakeFeedback.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../hooks/useTheme';
import type { RecitationResult } from '@shared/types/hifz';

interface HifzMistakeFeedbackProps {
  result: RecitationResult;
  aiTips?: string; // Optional AI-generated coaching tips
}

export function HifzMistakeFeedback({ result, aiTips }: HifzMistakeFeedbackProps) {
  const theme = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const scoreColor = getScoreColor(result.score);

  return (
    <GlassCard style={styles.container}>
      {/* Score Display */}
      <View style={styles.scoreSection}>
        <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
          Accuracy Score
        </Text>
        <Text style={[styles.score, { color: scoreColor }]}>
          {result.score}/100
        </Text>
      </View>

      {/* Word-by-Word Results */}
      <View style={styles.wordsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Word-by-Word Results
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.wordsList}>
            {result.wordResults.map((word, index) => {
              const wordColor = word.isCorrect ? '#10B981' : '#EF4444';

              return (
                <View key={index} style={styles.wordItem}>
                  <Text
                    style={[
                      styles.wordText,
                      { color: wordColor, fontFamily: 'Amiri' },
                    ]}
                  >
                    {word.expected}
                  </Text>
                  {!word.isCorrect && (
                    <Text style={[styles.actualText, { color: theme.textSecondary }]}>
                      You: {word.actual || '(skipped)'}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* AI Tips (if provided) */}
      {aiTips && (
        <View style={styles.tipsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Coaching Tips
          </Text>
          <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
            {aiTips}
          </Text>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
          {result.wordResults.filter((w) => w.isCorrect).length} correct,{' '}
          {result.wordResults.filter((w) => !w.isCorrect).length} mistakes
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
  },
  wordsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  wordsList: {
    flexDirection: 'row',
    gap: 12,
  },
  wordItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  wordText: {
    fontSize: 24,
    marginBottom: 4,
  },
  actualText: {
    fontSize: 12,
  },
  tipsSection: {
    marginBottom: 16,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  summary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add client/components/HifzMistakeFeedback.tsx
git commit -m "feat(hifz): create mistake feedback component with word-level results"
```

---

## Phase 6B: AI Tafsir + Verse Conversation

_Remaining tasks for Phase 6B-6E will be added during execution. The core Hifz system (Phase 6A) above provides the foundation pattern._

---

## Remaining Tasks Summary

**Phase 6A (continued):**
- Task 8: HifzPeekOverlay component
- Task 9: HifzDashboardScreen
- Task 10: HifzRecitationScreen
- Task 11: Server hifz-prompts service
- Task 12: Server hifz-routes
- Task 13: Navigation + Learn tab integration
- Task 14: Hifz tests

**Phase 6B:** AI Tafsir + Verse Conversation (8-10 tasks)
**Phase 6C:** Dua Recommender (6-8 tasks)
**Phase 6D:** Personalized Study Plan (10-12 tasks)
**Phase 6E:** Integration + Polish (5-7 tasks)

**Total Estimated Tasks:** 60-75 bite-sized tasks across all phases

---

## Notes on Execution

This plan follows test-driven development (TDD) principles with frequent commits. Each task is designed to take 2-5 minutes and builds incrementally toward the complete feature set.

**Estimated Total Time:** 40-60 hours of focused development across all 5 phases.

**Key Dependencies:**
- Phase 6A must complete before 6B-6E (core Hifz system is foundation)
- Phases 6B, 6C, 6D can be developed in parallel by different agents
- Phase 6E is final integration (depends on all prior phases)

**Testing Strategy:**
- Unit tests for FSRS scheduler, recitation checker, and all services
- Integration tests for API endpoints
- Manual testing on dev build for STT/TTS features
- E2E tests for critical user flows (memorize verse, review queue, rate difficulty)

**Execution Approach:**
- Start with Phase 6A tasks 1-14 (Hifz core foundation)
- Build and test incrementally
- Expand plan with remaining phases as Phase 6A nears completion
- Use parallel agents for 6B/6C/6D once foundation is stable
