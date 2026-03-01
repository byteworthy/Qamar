// shared/types/hifz.ts
export interface WordComparisonResult {
  expected: string;
  actual: string;
  isCorrect: boolean;
}

export interface HifzVerseState {
  surahNumber: number;
  verseNumber: number;
  memorizedAt: string; // ISO date
  lastReviewedAt: string | null;
  nextReviewDate: string; // ISO date
  fsrsState: {
    difficulty: number; // 0-1 scale (higher = more difficult)
    stability: number; // days until memory decays
    reviewCount: number;
    state: "new" | "learning" | "review" | "relearning";
  };
  mistakeCount: number;
  lastMistakes: string[]; // Array of incorrect words from recent attempt
}

export interface JuzProgress {
  juzNumber: number; // 1-30
  totalVerses: number;
  memorizedVerses: number;
  status:
    | "not_started"
    | "in_progress"
    | "on_schedule"
    | "review_overdue"
    | "review_critical";
}

export interface RecitationResult {
  verseKey: string; // "1:1" - used for Map indexing
  surahNumber: number; // Used for API calls and display
  verseNumber: number;
  expectedText: string;
  transcribedText: string;
  score: number; // 0-100
  accuracy: number; // 0-1
  wordResults: WordComparisonResult[];
}

export interface DifficultyRating {
  rating: "again" | "hard" | "good" | "easy";
  multiplier: number; // FSRS interval multiplier
}

export const DIFFICULTY_RATINGS: Record<
  DifficultyRating["rating"],
  DifficultyRating
> = {
  again: { rating: "again", multiplier: 0 }, // Reset to 1 day
  hard: { rating: "hard", multiplier: 1.2 },
  good: { rating: "good", multiplier: 2.5 },
  easy: { rating: "easy", multiplier: 4.0 },
};

export interface HifzReviewQueueItem {
  verseKey: string; // "1:1" - used for Map indexing
  surahNumber: number; // Used for API calls and display
  verseNumber: number;
  nextReviewDate: string;
  daysSinceLastReview: number;
  urgency: "due_today" | "overdue" | "critical"; // critical = 7+ days overdue
}
