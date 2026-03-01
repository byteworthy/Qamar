/**
 * Test Utilities for Qamar Client Tests
 *
 * Provides factory functions for creating mock data and
 * shared test helpers for hook and component tests.
 */

import type { Hadith, HadithCollection } from "../hooks/useHadithData";
import type {
  Flashcard,
  ReviewResult,
  LearningProgress,
} from "../hooks/useArabicLearning";

// ============================================================================
// FACTORY: Mock Hadith Data
// ============================================================================

export function createMockHadith(overrides: Partial<Hadith> = {}): Hadith {
  return {
    id: "1",
    collection: "bukhari",
    bookNumber: 1,
    hadithNumber: 1,
    narrator: "Abu Hurairah",
    textArabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    textEnglish:
      "Actions are judged by intentions, and every person will get what they intended.",
    grade: "Sahih",
    topics: ["intention", "sincerity"],
    ...overrides,
  };
}

export function createMockHadithCollection(
  overrides: Partial<HadithCollection> = {},
): HadithCollection {
  return {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    nameArabic: "صحيح البخاري",
    compiler: "Imam Muhammad al-Bukhari",
    description: "The most authentic collection of hadith.",
    totalHadiths: 7563,
    ...overrides,
  };
}

// ============================================================================
// FACTORY: Mock Flashcard Data
// ============================================================================

export function createMockFlashcard(
  overrides: Partial<Flashcard> = {},
): Flashcard {
  return {
    id: "alpha-1",
    arabic: "أ",
    transliteration: "Alif",
    english: "A",
    category: "alphabet",
    difficulty: 0.3,
    stability: 1,
    nextReview: new Date().toISOString(),
    state: "new",
    reviewCount: 0,
    ...overrides,
  };
}

export function createMockReviewResult(
  overrides: Partial<ReviewResult> = {},
): ReviewResult {
  return {
    cardId: "alpha-1",
    rating: 3,
    reviewedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockLearningProgress(
  overrides: Partial<LearningProgress> = {},
): LearningProgress {
  return {
    totalCards: 28,
    cardsLearned: 5,
    cardsDue: 10,
    streak: 3,
    accuracy: 0.75,
    minutesStudied: 15,
    ...overrides,
  };
}

// ============================================================================
// FACTORY: Mock Verse Data
// ============================================================================

export function createMockVerse(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    surah_number: 1,
    verse_number: 1,
    arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation_en:
      "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillahi ar-rahmani ar-raheem",
    juz_number: 1,
    page_number: 1,
    ...overrides,
  };
}

export function createMockSurah(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    surah_number: 1,
    name_arabic: "الفاتحة",
    name_english: "Al-Fatiha",
    name_translation: "The Opening",
    revelation_type: "Meccan",
    total_verses: 7,
    ...overrides,
  };
}

// ============================================================================
// MOCK OFFLINE DATABASE
// ============================================================================

export function createMockOfflineDatabase(
  data: {
    surahs?: ReturnType<typeof createMockSurah>[];
    verses?: ReturnType<typeof createMockVerse>[];
    hadiths?: Record<string, unknown>[];
    vocabulary?: Record<string, unknown>[];
  } = {},
) {
  return {
    isReady: jest.fn(() => true),
    getAllSurahs: jest.fn(async () => data.surahs ?? []),
    getVersesBySurah: jest.fn(async () => data.verses ?? []),
    searchVerses: jest.fn(async () => data.verses ?? []),
    upsertSurahs: jest.fn(async () => {}),
    upsertVerses: jest.fn(async () => {}),
    getHadithsByCollection: jest.fn(async () => data.hadiths ?? []),
    getHadith: jest.fn(async () => data.hadiths?.[0] ?? null),
    upsertHadiths: jest.fn(async () => {}),
    getVocabularyByCategory: jest.fn(async () => data.vocabulary ?? []),
    getVocabularyByDifficulty: jest.fn(async () => data.vocabulary ?? []),
    upsertVocabulary: jest.fn(async () => {}),
    getRowCount: jest.fn(async () => 0),
  };
}
