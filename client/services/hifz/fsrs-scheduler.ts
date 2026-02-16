import type { HifzVerseState } from '../../../shared/types/hifz';

// FSRS parameters (matching existing implementation at client/lib/fsrs.ts)
const FSRS_PARAMETERS = {
  w: [0.4, 0.6, 2.4, 5.8], // Initial stability for ratings 1-4
  difficultyDecay: 0.9,
  easyBonus: 1.3,
  hardFactor: 0.8,
};

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
      difficulty: 0.5, // Medium difficulty
      stability: 0,
      reviewCount: 0,
      state: 'new',
    },
    mistakeCount: 0,
    lastMistakes: [],
  };
}

/**
 * Calculate next review date based on stability
 * Adds ±10% randomization to prevent card clustering
 */
export function calculateNextReview(stability: number): string {
  const fuzz = 0.9 + Math.random() * 0.2; // ±10% (0.9x to 1.1x)
  const interval = Math.max(0.1, Math.round(stability * fuzz * 10) / 10); // Round to 1 decimal
  const intervalMs = interval * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + intervalMs).toISOString();
}

/**
 * Update verse state based on difficulty rating
 * Maps Hifz ratings to FSRS ratings: again=1, hard=2, good=3, easy=4
 */
export function rateRecitation(
  state: HifzVerseState,
  rating: 'again' | 'hard' | 'good' | 'easy'
): HifzVerseState {
  const now = new Date().toISOString();
  const ratingMap = { again: 1, hard: 2, good: 3, easy: 4 };
  const numericRating = ratingMap[rating];

  let newDifficulty = state.fsrsState.difficulty;
  let newStability = state.fsrsState.stability;
  let newState = state.fsrsState.state;

  if (rating === 'again') {
    // Failed review - increase difficulty, short interval
    newDifficulty = Math.min(1, state.fsrsState.difficulty + 0.2);
    newStability = FSRS_PARAMETERS.w[0]; // 0.4 days
    newState = state.fsrsState.state === 'new' ? 'learning' : 'relearning';
  } else {
    // Successful review - adjust difficulty and stability
    const difficultyDelta = (numericRating - 3) * 0.15;
    newDifficulty = Math.max(0.1, Math.min(1, state.fsrsState.difficulty - difficultyDelta));

    if (state.fsrsState.state === 'new') {
      // First successful review
      newStability = FSRS_PARAMETERS.w[numericRating - 1];
      newState = rating === 'easy' ? 'review' : 'learning';
    } else {
      // Subsequent reviews - multiply stability
      const multiplier = getStabilityMultiplier(numericRating, state.fsrsState.difficulty);
      newStability = state.fsrsState.stability * multiplier;

      if ((state.fsrsState.state === 'learning' || state.fsrsState.state === 'relearning') && newStability >= 1) {
        newState = 'review';
      }
    }
  }

  return {
    ...state,
    lastReviewedAt: now,
    nextReviewDate: calculateNextReview(newStability),
    fsrsState: {
      difficulty: newDifficulty,
      stability: newStability,
      reviewCount: state.fsrsState.reviewCount + 1,
      state: newState,
    },
  };
}

/**
 * Helper: Calculate stability multiplier based on rating and difficulty
 * Matches reference implementation at client/lib/fsrs.ts
 */
function getStabilityMultiplier(rating: number, difficulty: number): number {
  // Base multipliers matching reference implementation
  const baseMultipliers: { [key: number]: number } = {
    1: 0.5,    // Again
    2: 0.8,    // Hard (FSRS_PARAMETERS.hardFactor)
    3: 2.5,    // Good
    4: 3.25,   // Easy (2.5 * 1.3)
  };

  const baseMultiplier = baseMultipliers[rating];

  // Adjust based on difficulty (easier cards = longer intervals)
  const difficultyFactor = 1 + (1 - difficulty) * 0.5;

  return baseMultiplier * difficultyFactor;
}

/**
 * Check if a verse is due for review
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
