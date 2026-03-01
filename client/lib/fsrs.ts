/**
 * FSRS (Free Spaced Repetition Scheduler)
 *
 * Simplified implementation of FSRS algorithm for flashcard scheduling
 * Based on the FSRS-4 algorithm with modifications for mobile use
 *
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 */

export interface FSRSCard {
  /** Difficulty rating (0-1, higher = more difficult) */
  difficulty: number;
  /** Stability in days (how long until memory decays) */
  stability: number;
  /** Last review timestamp */
  lastReview: Date | null;
  /** Next scheduled review timestamp */
  nextReview: Date | null;
  /** Current state of the card */
  state: "new" | "learning" | "review" | "relearning";
  /** Total number of reviews */
  reviewCount: number;
}

/** User rating for a card review */
export type Rating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

/** FSRS algorithm parameters (tuned for optimal spacing) */
const FSRS_PARAMETERS = {
  // Initial stability for each rating (in days)
  w: [0.4, 0.6, 2.4, 5.8],
  // Difficulty decay rate
  difficultyDecay: 0.9,
  // Stability increase factors
  easyBonus: 1.3,
  hardFactor: 0.8,
  // State transition thresholds
  graduatingInterval: 1, // days
  easyInterval: 4, // days
};

/**
 * Create a new FSRS card with default values
 */
export function createNewCard(): FSRSCard {
  return {
    difficulty: 0.5, // Start at medium difficulty
    stability: 0,
    lastReview: null,
    nextReview: null,
    state: "new",
    reviewCount: 0,
  };
}

/**
 * Schedule the next review for a card based on user rating
 * @param card - Current card state
 * @param rating - User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @returns Updated card with new schedule
 */
export function scheduleReview(card: FSRSCard, rating: Rating): FSRSCard {
  const now = new Date();
  const newCard = { ...card };

  // Update review count
  newCard.reviewCount += 1;
  newCard.lastReview = now;

  // Handle rating
  if (rating === 1) {
    // Again - card failed, reset to learning
    newCard.state = card.state === "new" ? "learning" : "relearning";
    newCard.difficulty = Math.min(1, card.difficulty + 0.2);
    newCard.stability = FSRS_PARAMETERS.w[0]; // Short interval
  } else {
    // Update difficulty (becomes easier over time with successful reviews)
    const difficultyDelta = (rating - 3) * 0.15;
    newCard.difficulty = Math.max(
      0.1,
      Math.min(1, card.difficulty - difficultyDelta),
    );

    // Calculate new stability based on rating
    if (card.state === "new") {
      // First successful review
      newCard.stability = FSRS_PARAMETERS.w[rating - 1];
      if (rating === 4) {
        newCard.state = "review"; // Easy graduates immediately
      } else {
        newCard.state = "learning";
      }
    } else {
      // Subsequent reviews
      const stabilityMultiplier = getStabilityMultiplier(
        rating,
        card.difficulty,
      );
      newCard.stability = card.stability * stabilityMultiplier;

      // State transitions
      if (card.state === "learning" || card.state === "relearning") {
        if (newCard.stability >= FSRS_PARAMETERS.graduatingInterval) {
          newCard.state = "review";
        }
      }
    }
  }

  // Calculate next review date
  const intervalDays = calculateInterval(newCard.stability);
  newCard.nextReview = new Date(
    now.getTime() + intervalDays * 24 * 60 * 60 * 1000,
  );

  return newCard;
}

/**
 * Get cards that are due for review
 * @param cards - Array of cards to check
 * @param now - Current time (defaults to now)
 * @returns Array of due cards sorted by priority
 */
export function getDueCards(
  cards: FSRSCard[],
  now: Date = new Date(),
): FSRSCard[] {
  const dueCards = cards.filter((card) => {
    if (card.state === "new") return true; // New cards always due
    if (!card.nextReview) return true; // No schedule = due
    return card.nextReview.getTime() <= now.getTime();
  });

  // Sort by priority: new cards first, then by next review time
  return dueCards.sort((a, b) => {
    if (a.state === "new" && b.state !== "new") return -1;
    if (a.state !== "new" && b.state === "new") return 1;
    if (!a.nextReview) return -1;
    if (!b.nextReview) return 1;
    return a.nextReview.getTime() - b.nextReview.getTime();
  });
}

/**
 * Calculate interval in days based on stability
 * @param stability - Card stability in days
 * @returns Interval in days (rounded)
 */
export function calculateInterval(stability: number): number {
  // Add some randomness (±10%) to prevent card clustering
  const fuzz = 0.9 + Math.random() * 0.2;
  return Math.max(0.1, Math.round(stability * fuzz * 10) / 10);
}

/**
 * Get stability multiplier based on rating and difficulty
 * @param rating - User rating (2, 3, or 4)
 * @param difficulty - Card difficulty (0-1)
 * @returns Multiplier for stability calculation
 */
function getStabilityMultiplier(rating: Rating, difficulty: number): number {
  // Base multipliers for each rating
  const baseMultipliers = {
    1: 0.5, // Again (shouldn't be called, but safe default)
    2: FSRS_PARAMETERS.hardFactor, // Hard
    3: 2.5, // Good
    4: 2.5 * FSRS_PARAMETERS.easyBonus, // Easy
  };

  const base = baseMultipliers[rating];

  // Adjust based on difficulty (easier cards = longer intervals)
  const difficultyFactor = 1 + (1 - difficulty) * 0.5;

  return base * difficultyFactor;
}

/**
 * Calculate retention rate for a card
 * @param card - Card to analyze
 * @returns Estimated retention rate (0-1)
 */
export function calculateRetention(card: FSRSCard): number {
  if (card.state === "new") return 0;
  if (!card.lastReview || !card.nextReview) return 0;

  const now = new Date();
  const timeSinceReview = now.getTime() - card.lastReview.getTime();
  const scheduledInterval =
    card.nextReview.getTime() - card.lastReview.getTime();

  if (timeSinceReview <= 0) return 1; // Just reviewed

  // Exponential decay model
  const decay = Math.exp(-timeSinceReview / scheduledInterval);
  return Math.max(0, Math.min(1, decay));
}

/**
 * Get statistics for a collection of cards
 * @param cards - Array of cards to analyze
 * @returns Statistics object
 */
export function getCardStatistics(cards: FSRSCard[]) {
  const now = new Date();

  const stats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    due: 0,
    avgDifficulty: 0,
    avgStability: 0,
  };

  let difficultySum = 0;
  let stabilitySum = 0;
  let reviewedCount = 0;

  cards.forEach((card) => {
    // Count by state
    stats[card.state]++;

    // Count due cards
    if (
      card.state === "new" ||
      !card.nextReview ||
      card.nextReview.getTime() <= now.getTime()
    ) {
      stats.due++;
    }

    // Accumulate for averages
    if (card.state !== "new") {
      difficultySum += card.difficulty;
      stabilitySum += card.stability;
      reviewedCount++;
    }
  });

  // Calculate averages
  if (reviewedCount > 0) {
    stats.avgDifficulty = difficultySum / reviewedCount;
    stats.avgStability = stabilitySum / reviewedCount;
  }

  return stats;
}
