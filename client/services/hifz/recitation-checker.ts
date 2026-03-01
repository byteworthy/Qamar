/**
 * Recitation Checker Service
 *
 * Compares a user's recited verse (from STT transcription) against the expected
 * Quran text and produces word-level feedback with accuracy scoring.
 */

import type {
  RecitationResult,
  WordComparisonResult,
} from "../../../shared/types/hifz";

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Remove Arabic diacritics (tashkeel / harakat) for fuzzy comparison.
 *
 * Covers: Quranic annotation marks (U+0610-061A), standard harakat
 * (U+064B-065F), superscript alef (U+0670), and extended Quranic
 * marks (U+06D6-06DC, U+06DF-06E4, U+06E7-06E8, U+06EA-06ED).
 */
function removeDiacritics(text: string): string {
  return text.replace(
    /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g,
    "",
  );
}

/**
 * Normalize text for comparison: trim, NFC-normalize, strip diacritics, and collapse whitespace.
 */
function normalizeText(text: string): string {
  return removeDiacritics(text.trim().normalize("NFC")).replace(/\s+/g, " ");
}

/**
 * Standard Levenshtein distance via dynamic programming.
 */
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Fast paths
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Single-row DP to save memory
  const row: number[] = Array.from({ length: bLen + 1 }, (_, i) => i);

  for (let i = 1; i <= aLen; i++) {
    let prev = i;
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(
        row[j] + 1, // deletion
        prev + 1, // insertion
        row[j - 1] + cost, // substitution
      );
      row[j - 1] = prev;
      prev = val;
    }
    row[bLen] = prev;
  }

  return row[bLen];
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Check a recitation attempt by comparing expected vs transcribed text.
 *
 * @param surahNumber - Surah number (1-114)
 * @param verseNumber - Verse number within the surah
 * @param expectedText - The correct Quran text for this verse
 * @param transcribedText - The user's recitation (from STT)
 * @returns RecitationResult with word-level feedback and scoring
 */
export function checkRecitation(
  surahNumber: number,
  verseNumber: number,
  expectedText: string,
  transcribedText: string,
): RecitationResult {
  const normalizedExpected = normalizeText(expectedText);
  const normalizedTranscribed = normalizeText(transcribedText);

  const expectedWords = normalizedExpected.split(/\s+/).filter(Boolean);
  const transcribedWords = normalizedTranscribed.split(/\s+/).filter(Boolean);

  const maxLen = Math.max(expectedWords.length, transcribedWords.length);
  const expectedLen = expectedWords.length;

  const wordResults: WordComparisonResult[] = [];
  let correctCount = 0;
  let totalChars = 0;
  let matchingChars = 0;

  for (let i = 0; i < maxLen; i++) {
    const expected = expectedWords[i] ?? "";
    const actual = transcribedWords[i] ?? "";
    const dist = levenshteinDistance(expected, actual);

    // A word is correct if it exactly matches (distance = 0)
    const isCorrect = dist === 0;

    if (isCorrect) {
      correctCount++;
    }

    // Character-level accuracy: max length minus edit distance
    const longer = Math.max(expected.length, actual.length);
    totalChars += longer;
    matchingChars += Math.max(0, longer - dist);

    wordResults.push({ expected, actual, isCorrect });
  }

  // Score is based on expected word count (not including extra words user added)
  const score =
    expectedLen > 0 ? Math.round((correctCount / expectedLen) * 100) : 100;
  const accuracy = totalChars > 0 ? matchingChars / totalChars : 1;

  return {
    verseKey: `${surahNumber}:${verseNumber}`,
    surahNumber,
    verseNumber,
    expectedText,
    transcribedText,
    score,
    accuracy,
    wordResults,
  };
}
