/**
 * Recitation Checker Tests
 *
 * Tests for the recitation checker service that compares user's recited verse
 * against expected Quran text and produces word-level feedback with accuracy scoring.
 */

import { checkRecitation } from "../recitation-checker";
import type { RecitationResult } from "../../../../shared/types/hifz";

describe("checkRecitation", () => {
  describe("perfect match", () => {
    it("should return 100% score for identical text", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
      const transcribedText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.verseKey).toBe("1:1");
      expect(result.surahNumber).toBe(1);
      expect(result.verseNumber).toBe(1);
      expect(result.expectedText).toBe(expectedText);
      expect(result.transcribedText).toBe(transcribedText);
      expect(result.score).toBe(100);
      expect(result.accuracy).toBe(1);
      expect(result.wordResults).toHaveLength(4); // 4 words in Bismillah
      expect(result.wordResults.every((w) => w.isCorrect)).toBe(true);
    });
  });

  describe("partial match", () => {
    it("should identify incorrect words and calculate score", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بسم الله الرحمن الرحيم";
      const transcribedText = "بسم الله الكريم الرحيم"; // "الرحمن" replaced with "الكريم"

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.score).toBe(75); // 3 out of 4 words correct = 75%
      expect(result.accuracy).toBeGreaterThan(0.7); // Not perfect but high
      expect(result.accuracy).toBeLessThan(1);
      expect(result.wordResults).toHaveLength(4);

      // Check individual word results
      expect(result.wordResults[0].isCorrect).toBe(true); // بسم
      expect(result.wordResults[1].isCorrect).toBe(true); // الله
      expect(result.wordResults[2].isCorrect).toBe(false); // الرحمن vs الكريم
      expect(result.wordResults[3].isCorrect).toBe(true); // الرحيم
    });
  });

  describe("diacritic normalization", () => {
    it("should treat text with and without diacritics as equivalent", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"; // With diacritics
      const transcribedText = "بسم الله الرحمن الرحيم"; // Without diacritics

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.score).toBe(100);
      expect(result.accuracy).toBe(1);
      expect(result.wordResults.every((w) => w.isCorrect)).toBe(true);
    });

    it("should normalize whitespace properly", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بسم  الله   الرحمن الرحيم"; // Multiple spaces
      const transcribedText = "بسم الله الرحمن الرحيم"; // Single spaces

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.score).toBe(100);
      expect(result.wordResults).toHaveLength(4);
    });
  });

  describe("edge cases", () => {
    it("should handle empty transcription (0% score)", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بسم الله الرحمن الرحيم";
      const transcribedText = "";

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.score).toBe(0);
      expect(result.accuracy).toBe(0);
      expect(result.wordResults).toHaveLength(4);
      expect(result.wordResults.every((w) => !w.isCorrect)).toBe(true);
      expect(result.wordResults.every((w) => w.actual === "")).toBe(true);
    });

    it("should handle length mismatch (user skipped word)", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بسم الله الرحمن الرحيم";
      const transcribedText = "بسم الله الرحيم"; // Skipped "الرحمن"

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.score).toBe(50); // 2 out of 4 correct (by position)
      expect(result.wordResults).toHaveLength(4);
      expect(result.wordResults[0].isCorrect).toBe(true); // بسم
      expect(result.wordResults[1].isCorrect).toBe(true); // الله
      expect(result.wordResults[2].isCorrect).toBe(false); // الرحمن vs الرحيم
      expect(result.wordResults[3].isCorrect).toBe(false); // الرحيم vs ""
    });

    it("should handle length mismatch (user added extra word)", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "بسم الله الرحمن";
      const transcribedText = "بسم الله الرحمن الرحيم"; // Added "الرحيم"

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      // Score is based on expected words (3), and all 3 are correct = 100%
      // This is correct for Hifz: user memorized the verse correctly, just added extra
      expect(result.score).toBe(100);
      expect(result.wordResults).toHaveLength(4);
      expect(result.wordResults[0].isCorrect).toBe(true);
      expect(result.wordResults[1].isCorrect).toBe(true);
      expect(result.wordResults[2].isCorrect).toBe(true);
      expect(result.wordResults[3].isCorrect).toBe(false); // "" vs "الرحيم"
    });

    it("should handle both texts being empty (100% score)", () => {
      const surahNumber = 1;
      const verseNumber = 1;
      const expectedText = "";
      const transcribedText = "";

      const result: RecitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        expectedText,
        transcribedText,
      );

      expect(result.score).toBe(100);
      expect(result.accuracy).toBe(1);
      expect(result.wordResults).toHaveLength(0);
    });
  });
});
