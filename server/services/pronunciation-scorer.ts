/**
 * Pronunciation Scorer
 *
 * Levenshtein distance-based scoring for Arabic text pronunciation comparison.
 * Normalizes and strips diacritics (tashkeel) for fuzzy matching, then
 * compares word-by-word to produce a structured score result.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface WordResult {
  expected: string;
  actual: string;
  isCorrect: boolean;
}

export interface PronunciationScore {
  score: number;
  accuracy: number;
  wordResults: WordResult[];
}

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
    /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g,
    "",
  );
}

/**
 * Normalize text for comparison: trim, NFC-normalize, and strip diacritics.
 */
function normalizeText(text: string): string {
  return removeDiacritics(text.trim().normalize("NFC"));
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
        row[j] + 1,       // deletion
        prev + 1,          // insertion
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
 * Score a pronunciation attempt by comparing an expected Arabic string
 * against a transcribed string.
 *
 * - Words are matched by position after normalization.
 * - A word is considered correct when its Levenshtein distance is <= 1.
 * - `score` is 0-100 based on the percentage of correct words.
 * - `accuracy` is 0-1 based on character-level similarity across all words.
 */
export function scorePronunciation(
  expected: string,
  transcribed: string,
): PronunciationScore {
  const normalizedExpected = normalizeText(expected);
  const normalizedTranscribed = normalizeText(transcribed);

  const expectedWords = normalizedExpected.split(/\s+/).filter(Boolean);
  const transcribedWords = normalizedTranscribed.split(/\s+/).filter(Boolean);

  const maxLen = Math.max(expectedWords.length, transcribedWords.length);

  // Edge case: both inputs are empty after normalization
  if (maxLen === 0) {
    return { score: 100, accuracy: 1, wordResults: [] };
  }

  const wordResults: WordResult[] = [];
  let correctCount = 0;
  let totalChars = 0;
  let matchingChars = 0;

  for (let i = 0; i < maxLen; i++) {
    const exp = expectedWords[i] ?? "";
    const act = transcribedWords[i] ?? "";
    const dist = levenshteinDistance(exp, act);
    const isCorrect = dist <= 1;

    if (isCorrect) {
      correctCount++;
    }

    // Character-level accuracy: max length minus edit distance
    const longer = Math.max(exp.length, act.length);
    totalChars += longer;
    matchingChars += Math.max(0, longer - dist);

    wordResults.push({ expected: exp, actual: act, isCorrect });
  }

  const score = Math.round((correctCount / maxLen) * 100);
  const accuracy = totalChars > 0 ? matchingChars / totalChars : 1;

  return { score, accuracy, wordResults };
}
