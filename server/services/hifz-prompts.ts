/**
 * Hifz System Prompts
 *
 * Builds AI prompts for analyzing Quran recitation mistakes and
 * providing coaching tips for Hifz (memorization) improvement.
 */

import type { WordComparisonResult } from "../../shared/types/hifz";

/**
 * Build a prompt for Claude to analyze recitation mistakes and provide coaching tips.
 *
 * The prompt instructs Claude to act as a warm, patient Quran teacher who:
 * - Analyzes specific mistakes made during recitation
 * - Identifies patterns in pronunciation or tajweed errors
 * - Provides 2-3 specific, actionable tips for improvement
 * - Encourages the user based on their score
 * - References tajweed rules when relevant
 * - Keeps the response concise (100-150 words)
 */
export function buildMistakeAnalysisPrompt(
  surahNumber: number,
  verseNumber: number,
  expectedText: string,
  transcribedText: string,
  wordResults: WordComparisonResult[],
  score: number
): string {
  // Extract mistakes from word results
  const mistakes = wordResults
    .filter((w) => !w.isCorrect)
    .map((w) => `Expected: ${w.expected}, You said: ${w.actual}`)
    .join("\n");

  const mistakesSection = mistakes
    ? `Mistakes made:\n${mistakes}`
    : "No mistakes - perfect recitation!";

  return `You are a warm, patient Quran teacher helping a student improve their memorization (Hifz).

The student just recited Surah ${surahNumber}, Verse ${verseNumber} from memory and scored ${score}%.

Expected text: ${expectedText}
What they recited: ${transcribedText}

${mistakesSection}

Provide 2-3 specific, actionable tips to help them improve. If you notice patterns in their mistakes, mention them. Reference tajweed rules if relevant (e.g., madd, noon sakinah, qalqalah, etc.). Be encouraging and supportive - learning Quran takes time and effort.

Keep your response under 150 words. Start with brief encouragement, then provide numbered tips, then end with a motivating line.`;
}
