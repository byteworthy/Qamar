import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOfflineDatabase } from "../lib/offline-database";
import type { VocabularyWord } from "../../shared/offline-schema";

// ============================================================================
// TYPES
// ============================================================================

export interface Flashcard {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  category: "alphabet" | "vocabulary" | "phrase";
  difficulty: number;
  stability: number;
  nextReview: string; // ISO date
  state: "new" | "learning" | "review" | "relearning";
  reviewCount: number;
}

export interface ReviewResult {
  cardId: string;
  rating: 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
  reviewedAt: string;
}

export interface LearningProgress {
  totalCards: number;
  cardsLearned: number;
  cardsDue: number;
  streak: number;
  accuracy: number;
  minutesStudied: number;
}

export interface ConversationScenario {
  id: string;
  title: string;
  titleArabic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  phrases: ConversationPhrase[];
}

export interface ConversationPhrase {
  arabic: string;
  transliteration: string;
  english: string;
  audioUrl?: string;
}

// ============================================================================
// FLASHCARD STATE PERSISTENCE (AsyncStorage)
// ============================================================================

interface FlashcardState {
  difficulty: number;
  stability: number;
  nextReview: string;
  state: "new" | "learning" | "review" | "relearning";
  reviewCount: number;
  lastReview?: string;
}

const FLASHCARD_STATE_KEY = "noor_flashcard_progress";
const STREAK_KEY = "noor_learning_streak";
const STUDY_STATS_KEY = "noor_study_stats";

async function loadFlashcardState(): Promise<Record<string, FlashcardState>> {
  const raw = await AsyncStorage.getItem(FLASHCARD_STATE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveFlashcardState(
  state: Record<string, FlashcardState>,
): Promise<void> {
  await AsyncStorage.setItem(FLASHCARD_STATE_KEY, JSON.stringify(state));
}

// ============================================================================
// ALPHABET SEED DATA
// ============================================================================

const ALPHABET_CARDS: {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
}[] = [
  { id: "alpha-1", arabic: "أ", transliteration: "Alif", english: "A" },
  { id: "alpha-2", arabic: "ب", transliteration: "Ba", english: "B" },
  { id: "alpha-3", arabic: "ت", transliteration: "Ta", english: "T" },
  { id: "alpha-4", arabic: "ث", transliteration: "Tha", english: "Th" },
  { id: "alpha-5", arabic: "ج", transliteration: "Jim", english: "J" },
  { id: "alpha-6", arabic: "ح", transliteration: "Ha", english: "H" },
  { id: "alpha-7", arabic: "خ", transliteration: "Kha", english: "Kh" },
  { id: "alpha-8", arabic: "د", transliteration: "Dal", english: "D" },
  { id: "alpha-9", arabic: "ذ", transliteration: "Dhal", english: "Dh" },
  { id: "alpha-10", arabic: "ر", transliteration: "Ra", english: "R" },
  { id: "alpha-11", arabic: "ز", transliteration: "Zay", english: "Z" },
  { id: "alpha-12", arabic: "س", transliteration: "Sin", english: "S" },
  { id: "alpha-13", arabic: "ش", transliteration: "Shin", english: "Sh" },
  { id: "alpha-14", arabic: "ص", transliteration: "Sad", english: "S" },
  { id: "alpha-15", arabic: "ض", transliteration: "Dad", english: "D" },
  { id: "alpha-16", arabic: "ط", transliteration: "Ta", english: "T" },
  { id: "alpha-17", arabic: "ظ", transliteration: "Dha", english: "Dh" },
  { id: "alpha-18", arabic: "ع", transliteration: "Ain", english: "A" },
  { id: "alpha-19", arabic: "غ", transliteration: "Ghain", english: "Gh" },
  { id: "alpha-20", arabic: "ف", transliteration: "Fa", english: "F" },
  { id: "alpha-21", arabic: "ق", transliteration: "Qaf", english: "Q" },
  { id: "alpha-22", arabic: "ك", transliteration: "Kaf", english: "K" },
  { id: "alpha-23", arabic: "ل", transliteration: "Lam", english: "L" },
  { id: "alpha-24", arabic: "م", transliteration: "Mim", english: "M" },
  { id: "alpha-25", arabic: "ن", transliteration: "Nun", english: "N" },
  { id: "alpha-26", arabic: "ه", transliteration: "Ha", english: "H" },
  { id: "alpha-27", arabic: "و", transliteration: "Waw", english: "W" },
  { id: "alpha-28", arabic: "ي", transliteration: "Ya", english: "Y" },
];

// ============================================================================
// HELPERS
// ============================================================================

function vocabToFlashcard(
  word: VocabularyWord,
  fsrs?: FlashcardState,
): Flashcard {
  const now = new Date().toISOString();
  return {
    id: `vocab-${word.id}`,
    arabic: word.arabic_word,
    transliteration: word.transliteration,
    english: word.translation_en,
    category: "vocabulary",
    difficulty: fsrs?.difficulty ?? 0.3,
    stability: fsrs?.stability ?? 1,
    nextReview: fsrs?.nextReview ?? now,
    state: fsrs?.state ?? "new",
    reviewCount: fsrs?.reviewCount ?? 0,
  };
}

function alphabetToFlashcard(
  letter: (typeof ALPHABET_CARDS)[number],
  fsrs?: FlashcardState,
): Flashcard {
  const now = new Date().toISOString();
  return {
    id: letter.id,
    arabic: letter.arabic,
    transliteration: letter.transliteration,
    english: letter.english,
    category: "alphabet",
    difficulty: fsrs?.difficulty ?? 0.3,
    stability: fsrs?.stability ?? 1,
    nextReview: fsrs?.nextReview ?? now,
    state: fsrs?.state ?? "new",
    reviewCount: fsrs?.reviewCount ?? 0,
  };
}

// ============================================================================
// API FUNCTIONS (offline database + AsyncStorage)
// ============================================================================

async function fetchAllCards(): Promise<Flashcard[]> {
  const db = getOfflineDatabase();
  const fsrsState = await loadFlashcardState();

  // Alphabet cards (static seed data)
  const alphabetCards = ALPHABET_CARDS.map((letter) =>
    alphabetToFlashcard(letter, fsrsState[letter.id]),
  );

  // Vocabulary cards from offline DB
  let vocabCards: Flashcard[] = [];
  if (db.isReady()) {
    const allVocab = await db.getVocabularyByDifficulty(1);
    const moreVocab = await db.getVocabularyByDifficulty(2);
    const combined = [...allVocab, ...moreVocab];
    vocabCards = combined.map((w) =>
      vocabToFlashcard(w, fsrsState[`vocab-${w.id}`]),
    );
  }

  return [...alphabetCards, ...vocabCards];
}

async function fetchDueCards(): Promise<Flashcard[]> {
  const allCards = await fetchAllCards();
  const now = new Date();
  return allCards.filter((c) => new Date(c.nextReview) <= now);
}

async function submitReview(result: ReviewResult): Promise<Flashcard> {
  const fsrsState = await loadFlashcardState();

  const current = fsrsState[result.cardId] ?? {
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new" as const,
    reviewCount: 0,
  };

  // Simple FSRS-like scheduling
  const intervals = { 1: 1, 2: 3, 3: 7, 4: 14 };
  const days = intervals[result.rating];
  const next = new Date();
  next.setDate(next.getDate() + days);

  // Adjust difficulty based on rating
  const difficultyDelta = (3 - result.rating) * 0.05;
  const newDifficulty = Math.max(
    0.1,
    Math.min(1.0, current.difficulty + difficultyDelta),
  );

  // Adjust stability
  const stabilityMultiplier =
    result.rating === 1
      ? 0.5
      : result.rating === 2
        ? 1.0
        : result.rating === 3
          ? 1.5
          : 2.0;
  const newStability = Math.max(0.1, current.stability * stabilityMultiplier);

  const updated: FlashcardState = {
    difficulty: newDifficulty,
    stability: newStability,
    nextReview: next.toISOString(),
    state: result.rating >= 3 ? "review" : "relearning",
    reviewCount: current.reviewCount + 1,
    lastReview: result.reviewedAt,
  };

  fsrsState[result.cardId] = updated;
  await saveFlashcardState(fsrsState);

  // Update study stats
  try {
    const raw = await AsyncStorage.getItem(STUDY_STATS_KEY);
    const stats = raw
      ? JSON.parse(raw)
      : { totalReviews: 0, correctReviews: 0 };
    stats.totalReviews++;
    if (result.rating >= 3) stats.correctReviews++;
    stats.lastStudied = result.reviewedAt;
    await AsyncStorage.setItem(STUDY_STATS_KEY, JSON.stringify(stats));
  } catch {
    // Non-critical, ignore
  }

  // Return the updated card shape
  return {
    id: result.cardId,
    arabic: "",
    transliteration: "",
    english: "",
    category: "vocabulary",
    difficulty: updated.difficulty,
    stability: updated.stability,
    nextReview: updated.nextReview,
    state: updated.state,
    reviewCount: updated.reviewCount,
  };
}

async function fetchProgress(): Promise<LearningProgress> {
  const allCards = await fetchAllCards();
  const now = new Date();
  const fsrsState = await loadFlashcardState();

  const cardsLearned = allCards.filter(
    (c) => c.state === "review" && c.reviewCount > 0,
  ).length;
  const cardsDue = allCards.filter((c) => new Date(c.nextReview) <= now).length;

  // Compute accuracy from study stats
  let accuracy = 0;
  let streak = 0;
  try {
    const raw = await AsyncStorage.getItem(STUDY_STATS_KEY);
    if (raw) {
      const stats = JSON.parse(raw);
      accuracy =
        stats.totalReviews > 0 ? stats.correctReviews / stats.totalReviews : 0;
    }
    const streakRaw = await AsyncStorage.getItem(STREAK_KEY);
    if (streakRaw) {
      streak = JSON.parse(streakRaw).streak ?? 0;
    }
  } catch {
    // Non-critical
  }

  return {
    totalCards: allCards.length,
    cardsLearned,
    cardsDue,
    streak,
    accuracy: Math.round(accuracy * 100) / 100,
    minutesStudied: Object.keys(fsrsState).length, // rough proxy
  };
}

async function fetchScenarios(): Promise<ConversationScenario[]> {
  const db = getOfflineDatabase();

  if (!db.isReady()) {
    return [];
  }

  // Query conversation_scenarios table via the db's raw interface
  // The OfflineDatabase interface doesn't expose conversation_scenarios directly,
  // so we use getRowCount to check if data exists, then fall back to a
  // category-based approach or return empty until a dedicated method is added.
  try {
    // Access the underlying SQLite db if available for direct query
    const dbAny = db as any;
    if (dbAny.db && typeof dbAny.db.getAllAsync === "function") {
      const rows = await dbAny.db.getAllAsync(
        "SELECT * FROM conversation_scenarios ORDER BY difficulty, title",
      );
      return (rows ?? []).map((row: any) => {
        let phrases: ConversationPhrase[] = [];
        try {
          const dialogues = JSON.parse(row.dialogues_json || "[]");
          phrases = dialogues.map((d: any) => ({
            arabic: d.arabic || d.speaker_arabic || "",
            transliteration: d.transliteration || "",
            english: d.translation || d.english || "",
            audioUrl: d.audio_url,
          }));
        } catch {
          // Invalid JSON, skip phrases
        }
        return {
          id: row.id,
          title: row.title,
          titleArabic: row.title_arabic ?? row.title,
          difficulty: row.difficulty,
          phrases,
        };
      });
    }
  } catch {
    // Table may not exist yet or DB not ready
  }

  return [];
}

// ============================================================================
// HOOKS
// ============================================================================

export function useDueFlashcards() {
  return useQuery({
    queryKey: ["arabic", "flashcards", "due"],
    queryFn: fetchDueCards,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllFlashcards() {
  return useQuery({
    queryKey: ["arabic", "flashcards", "all"],
    queryFn: fetchAllCards,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result: ReviewResult) => submitReview(result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arabic", "flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["arabic", "progress"] });
    },
  });
}

export function useArabicProgress() {
  return useQuery({
    queryKey: ["arabic", "progress"],
    queryFn: fetchProgress,
    staleTime: 1000 * 60 * 5,
  });
}

export function useConversationScenarios() {
  return useQuery({
    queryKey: ["arabic", "scenarios"],
    queryFn: fetchScenarios,
    staleTime: 1000 * 60 * 60,
  });
}
