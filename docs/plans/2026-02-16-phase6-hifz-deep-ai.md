# Phase 6: Hifz Memorization + Deep AI Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete Hifz memorization system with FSRS spaced repetition, plus four deep AI features (Tafsir, Dua Recommender, Study Plans, Verse Conversation) that leapfrog competitors.

**Architecture:** Five sub-phases (6A-6E) with parallel agent execution within each. Server routes follow the existing `register*Routes(app)` pattern with Zod validation, `aiDailyQuotaMiddleware`, and Claude Haiku. Client screens follow existing patterns (Zustand + persist stores, Reanimated UI, GlassCard design). FSRS algorithm from `client/lib/fsrs.ts` is reused for verse-level scheduling.

**Tech Stack:** React Native + Expo SDK 54, Zustand + AsyncStorage, Express + Zod, Anthropic Claude Haiku (`claude-haiku-4-5-20251001`), existing FSRS, RAG engine, pronunciation scorer, STT (`@react-native-voice/voice`).

---

## Phase 6A: Hifz Core (Memorization System)

### Task 1: Hifz FSRS Scheduler Service

Adapts the existing flashcard FSRS (`client/lib/fsrs.ts`) for verse-level memorization tracking. Each memorized verse is a "card" with its own FSRS state.

**Files:**
- Create: `client/services/hifz/fsrs-scheduler.ts`

**Step 1: Create the scheduler service**

```typescript
// client/services/hifz/fsrs-scheduler.ts
import { FSRSCard, Rating, createNewCard, scheduleReview, getDueCards, calculateRetention, getCardStatistics } from "@/lib/fsrs";

export interface HifzVerse {
  surahNumber: number;
  verseNumber: number;
  card: FSRSCard;
  addedAt: string; // ISO date
  lastScore?: number; // 0-100 pronunciation score
}

export type JuzStatus = "not_started" | "in_progress" | "memorized" | "overdue" | "critical";

/** Create a new hifz verse entry */
export function createHifzVerse(surahNumber: number, verseNumber: number): HifzVerse {
  return {
    surahNumber,
    verseNumber,
    card: createNewCard(),
    addedAt: new Date().toISOString(),
  };
}

/** Schedule next review after user rates difficulty */
export function reviewVerse(verse: HifzVerse, rating: Rating, score?: number): HifzVerse {
  return {
    ...verse,
    card: scheduleReview(verse.card, rating),
    lastScore: score ?? verse.lastScore,
  };
}

/** Get verses due for review today, sorted by urgency */
export function getDueVerses(verses: HifzVerse[], now?: Date): HifzVerse[] {
  const dueCards = getDueCards(verses.map((v) => v.card), now);
  const dueSet = new Set(dueCards);
  return verses
    .filter((v) => dueSet.has(v.card))
    .sort((a, b) => {
      if (!a.card.nextReview) return -1;
      if (!b.card.nextReview) return 1;
      return a.card.nextReview.getTime() - b.card.nextReview.getTime();
    });
}

/** Map surah/verse to juz number (simplified — covers major boundaries) */
const JUZ_BOUNDARIES: Array<{ juz: number; surah: number; verse: number }> = [
  { juz: 1, surah: 1, verse: 1 }, { juz: 2, surah: 2, verse: 142 },
  { juz: 3, surah: 2, verse: 253 }, { juz: 4, surah: 3, verse: 93 },
  { juz: 5, surah: 4, verse: 24 }, { juz: 6, surah: 4, verse: 148 },
  { juz: 7, surah: 5, verse: 82 }, { juz: 8, surah: 6, verse: 111 },
  { juz: 9, surah: 7, verse: 88 }, { juz: 10, surah: 8, verse: 41 },
  { juz: 11, surah: 9, verse: 93 }, { juz: 12, surah: 11, verse: 6 },
  { juz: 13, surah: 12, verse: 53 }, { juz: 14, surah: 15, verse: 1 },
  { juz: 15, surah: 17, verse: 1 }, { juz: 16, surah: 18, verse: 75 },
  { juz: 17, surah: 21, verse: 1 }, { juz: 18, surah: 23, verse: 1 },
  { juz: 19, surah: 25, verse: 21 }, { juz: 20, surah: 27, verse: 56 },
  { juz: 21, surah: 29, verse: 46 }, { juz: 22, surah: 33, verse: 31 },
  { juz: 23, surah: 36, verse: 28 }, { juz: 24, surah: 39, verse: 32 },
  { juz: 25, surah: 41, verse: 47 }, { juz: 26, surah: 46, verse: 1 },
  { juz: 27, surah: 51, verse: 31 }, { juz: 28, surah: 58, verse: 1 },
  { juz: 29, surah: 67, verse: 1 }, { juz: 30, surah: 78, verse: 1 },
];

export function getJuzForVerse(surahNumber: number, verseNumber: number): number {
  for (let i = JUZ_BOUNDARIES.length - 1; i >= 0; i--) {
    const b = JUZ_BOUNDARIES[i];
    if (surahNumber > b.surah || (surahNumber === b.surah && verseNumber >= b.verse)) {
      return b.juz;
    }
  }
  return 1;
}

/** Get juz progress status based on memorized verses */
export function getJuzStatus(juz: number, verses: HifzVerse[]): JuzStatus {
  const juzVerses = verses.filter((v) => getJuzForVerse(v.surahNumber, v.verseNumber) === juz);
  if (juzVerses.length === 0) return "not_started";

  const now = new Date();
  const overdueCount = juzVerses.filter((v) => {
    if (!v.card.nextReview) return false;
    const daysOverdue = (now.getTime() - v.card.nextReview.getTime()) / (1000 * 60 * 60 * 24);
    return daysOverdue > 7;
  }).length;

  if (overdueCount > juzVerses.length * 0.3) return "critical";

  const anyOverdue = juzVerses.some(
    (v) => v.card.nextReview && v.card.nextReview.getTime() < now.getTime(),
  );
  if (anyOverdue) return "overdue";

  return juzVerses.length > 10 ? "memorized" : "in_progress";
}

/** Get overall hifz statistics */
export function getHifzStats(verses: HifzVerse[]) {
  const cardStats = getCardStatistics(verses.map((v) => v.card));
  const juzCoverage = new Set(verses.map((v) => getJuzForVerse(v.surahNumber, v.verseNumber)));
  return {
    totalVerses: verses.length,
    dueToday: cardStats.due,
    juzStarted: juzCoverage.size,
    avgRetention: verses.reduce((sum, v) => sum + calculateRetention(v.card), 0) / Math.max(verses.length, 1),
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/kevinrichards/projects/noor && npx tsc --noEmit`
Expected: 0 errors from this file

**Step 3: Commit**

```bash
git add client/services/hifz/fsrs-scheduler.ts
git commit -m "feat(hifz): add FSRS scheduler service for verse-level memorization"
```

---

### Task 2: Recitation Checker Service

Compares STT transcription to expected verse text using the existing pronunciation scorer pattern. Produces word-level mistake reports with color-coded results.

**Files:**
- Create: `client/services/hifz/recitation-checker.ts`

**Step 1: Create the recitation checker**

```typescript
// client/services/hifz/recitation-checker.ts

export type WordStatus = "correct" | "mistake" | "skipped" | "extra";

export interface WordCheckResult {
  expected: string;
  actual: string;
  status: WordStatus;
  index: number;
}

export interface RecitationResult {
  score: number; // 0-100
  wordResults: WordCheckResult[];
  totalWords: number;
  correctWords: number;
  mistakeWords: number;
  skippedWords: number;
}

/** Remove Arabic diacritics for fuzzy comparison */
function stripDiacritics(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "")
    .trim();
}

/** Normalize whitespace and common OCR/STT artifacts */
function normalizeArabic(text: string): string {
  return stripDiacritics(text)
    .replace(/\s+/g, " ")
    .replace(/ٱ/g, "ا") // alef wasla → plain alef
    .trim();
}

/** Simple Levenshtein distance */
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

/** Word similarity (0-1, 1 = identical) */
function wordSimilarity(expected: string, actual: string): number {
  const a = normalizeArabic(expected);
  const b = normalizeArabic(actual);
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/** Check recitation against expected verse text */
export function checkRecitation(expectedText: string, transcribedText: string): RecitationResult {
  const expectedWords = expectedText.trim().split(/\s+/);
  const actualWords = transcribedText.trim().split(/\s+/).filter(Boolean);

  const wordResults: WordCheckResult[] = [];
  let correctCount = 0;
  let mistakeCount = 0;
  let skippedCount = 0;

  // Simple alignment: walk through expected words, try to match with actual
  let actualIdx = 0;
  for (let i = 0; i < expectedWords.length; i++) {
    if (actualIdx >= actualWords.length) {
      // Ran out of actual words — rest are skipped
      wordResults.push({
        expected: expectedWords[i],
        actual: "",
        status: "skipped",
        index: i,
      });
      skippedCount++;
      continue;
    }

    const similarity = wordSimilarity(expectedWords[i], actualWords[actualIdx]);
    if (similarity >= 0.7) {
      // Good enough match
      const status = similarity >= 0.95 ? "correct" : "mistake";
      wordResults.push({
        expected: expectedWords[i],
        actual: actualWords[actualIdx],
        status,
        index: i,
      });
      if (status === "correct") correctCount++;
      else mistakeCount++;
      actualIdx++;
    } else {
      // Check if the next actual word matches better (user may have inserted extra word)
      if (actualIdx + 1 < actualWords.length && wordSimilarity(expectedWords[i], actualWords[actualIdx + 1]) >= 0.7) {
        actualIdx++; // Skip the extra word
        const sim2 = wordSimilarity(expectedWords[i], actualWords[actualIdx]);
        wordResults.push({
          expected: expectedWords[i],
          actual: actualWords[actualIdx],
          status: sim2 >= 0.95 ? "correct" : "mistake",
          index: i,
        });
        if (sim2 >= 0.95) correctCount++;
        else mistakeCount++;
        actualIdx++;
      } else {
        // No match — word was skipped
        wordResults.push({
          expected: expectedWords[i],
          actual: actualWords[actualIdx] ?? "",
          status: "mistake",
          index: i,
        });
        mistakeCount++;
        actualIdx++;
      }
    }
  }

  const total = expectedWords.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    score,
    wordResults,
    totalWords: total,
    correctWords: correctCount,
    mistakeWords: mistakeCount,
    skippedWords: skippedCount,
  };
}
```

**Step 2: Commit**

```bash
git add client/services/hifz/recitation-checker.ts
git commit -m "feat(hifz): add recitation checker with word-level mistake detection"
```

---

### Task 3: Hifz Zustand Store

Persisted store for memorized verses, juz progress, and review queue.

**Files:**
- Create: `client/stores/hifz-store.ts`

**Step 1: Create the store**

```typescript
// client/stores/hifz-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  HifzVerse,
  createHifzVerse,
  reviewVerse,
  getDueVerses,
  getJuzStatus,
  getHifzStats,
  getJuzForVerse,
  JuzStatus,
} from "@/services/hifz/fsrs-scheduler";
import type { Rating } from "@/lib/fsrs";

export interface HifzState {
  // Data
  verses: HifzVerse[];
  reviewHistory: Array<{ date: string; count: number }>;

  // Actions
  addVerse: (surahNumber: number, verseNumber: number) => void;
  addVerseRange: (surahNumber: number, startVerse: number, endVerse: number) => void;
  removeVerse: (surahNumber: number, verseNumber: number) => void;
  reviewComplete: (surahNumber: number, verseNumber: number, rating: Rating, score?: number) => void;

  // Queries (derived from state, but exposed as actions for convenience)
  getDueToday: () => HifzVerse[];
  getJuzMap: () => Array<{ juz: number; status: JuzStatus; verseCount: number }>;
  getStats: () => ReturnType<typeof getHifzStats>;
  isVerseMemorized: (surahNumber: number, verseNumber: number) => boolean;
}

export const useHifzStore = create<HifzState>()(
  persist(
    (set, get) => ({
      verses: [],
      reviewHistory: [],

      addVerse: (surahNumber, verseNumber) =>
        set((state) => {
          if (state.verses.some((v) => v.surahNumber === surahNumber && v.verseNumber === verseNumber)) {
            return state; // Already tracking
          }
          return { verses: [...state.verses, createHifzVerse(surahNumber, verseNumber)] };
        }),

      addVerseRange: (surahNumber, startVerse, endVerse) =>
        set((state) => {
          const newVerses = [...state.verses];
          for (let v = startVerse; v <= endVerse; v++) {
            if (!newVerses.some((hv) => hv.surahNumber === surahNumber && hv.verseNumber === v)) {
              newVerses.push(createHifzVerse(surahNumber, v));
            }
          }
          return { verses: newVerses };
        }),

      removeVerse: (surahNumber, verseNumber) =>
        set((state) => ({
          verses: state.verses.filter(
            (v) => !(v.surahNumber === surahNumber && v.verseNumber === verseNumber),
          ),
        })),

      reviewComplete: (surahNumber, verseNumber, rating, score) =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const updatedVerses = state.verses.map((v) => {
            if (v.surahNumber === surahNumber && v.verseNumber === verseNumber) {
              return reviewVerse(v, rating, score);
            }
            return v;
          });

          // Update review history
          const history = [...state.reviewHistory];
          const todayEntry = history.find((h) => h.date === today);
          if (todayEntry) {
            todayEntry.count++;
          } else {
            history.push({ date: today, count: 1 });
          }
          // Keep last 90 days
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 90);
          const cutoffStr = cutoff.toISOString().split("T")[0];

          return {
            verses: updatedVerses,
            reviewHistory: history.filter((h) => h.date >= cutoffStr),
          };
        }),

      getDueToday: () => getDueVerses(get().verses),

      getJuzMap: () => {
        const verses = get().verses;
        return Array.from({ length: 30 }, (_, i) => {
          const juz = i + 1;
          const juzVerses = verses.filter((v) => getJuzForVerse(v.surahNumber, v.verseNumber) === juz);
          return {
            juz,
            status: getJuzStatus(juz, verses),
            verseCount: juzVerses.length,
          };
        });
      },

      getStats: () => getHifzStats(get().verses),

      isVerseMemorized: (surahNumber, verseNumber) =>
        get().verses.some((v) => v.surahNumber === surahNumber && v.verseNumber === verseNumber),
    }),
    {
      name: "noor-hifz",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

**Step 2: Commit**

```bash
git add client/stores/hifz-store.ts
git commit -m "feat(hifz): add Zustand store with FSRS verse tracking and juz map"
```

---

### Task 4: Hifz Server Routes + Prompts

Server-side AI mistake analysis using Claude Haiku.

**Files:**
- Create: `server/services/hifz-prompts.ts`
- Create: `server/routes/hifz-routes.ts`
- Modify: `server/routes.ts` — register new routes

**Step 1: Create hifz prompts**

```typescript
// server/services/hifz-prompts.ts
export function buildHifzMistakeAnalysisPrompt(
  surahNumber: number,
  verseNumber: number,
  expectedText: string,
  transcribedText: string,
  score: number,
): string {
  return `You are a Quran memorization coach (hifz teacher) helping a student improve their recitation.

The student attempted to recite Surah ${surahNumber}, Verse ${verseNumber} from memory.

Expected text (correct): ${expectedText}
Student's recitation (transcribed): ${transcribedText}
Accuracy score: ${score}/100

Analyze the mistakes and provide:
1. **Specific mistakes**: Which words were wrong, skipped, or mispronounced
2. **Common cause**: Why this mistake commonly happens (similar letters, long verse, etc.)
3. **Memorization tip**: One practical tip to remember this section better
4. **Encouragement**: Brief, warm encouragement

Keep your response under 200 words. Be specific about Arabic words. Use transliteration when helpful.
Speak warmly like an encouraging teacher, not a stern judge.`;
}
```

**Step 2: Create hifz routes**

```typescript
// server/routes/hifz-routes.ts
import type { Express } from "express";
import { z } from "zod";
import * as Sentry from "@sentry/node";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import { aiDailyQuotaMiddleware, incrementAIUsage, getAIUsageToday } from "../middleware/ai-daily-quota";
import { VALIDATION_MODE, isAnthropicConfigured } from "../config";
import { createErrorResponse, ERROR_CODES, HTTP_STATUS } from "../types/error-response";
import { getAnthropicClient, FREE_DAILY_LIMIT } from "./constants";
import { billingService } from "../billing";
import { buildHifzMistakeAnalysisPrompt } from "../services/hifz-prompts";

const analyzeMistakesSchema = z.object({
  surahNumber: z.number().int().min(1).max(114),
  verseNumber: z.number().int().min(1).max(286),
  expectedText: z.string().min(1).max(5000),
  transcribedText: z.string().max(5000),
  score: z.number().min(0).max(100),
});

export function registerHifzRoutes(app: Express): void {
  app.post(
    "/api/hifz/analyze-mistakes",
    aiRateLimiter,
    aiDailyQuotaMiddleware,
    async (req, res) => {
      try {
        const result = analyzeMistakesSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_FAILED, req.id, "Invalid request", {
              validationErrors: result.error.issues,
            }),
          );
        }

        const { surahNumber, verseNumber, expectedText, transcribedText, score } = result.data;

        if (VALIDATION_MODE && !isAnthropicConfigured()) {
          return res.json({
            analysis: "[VALIDATION MODE] Configure ANTHROPIC_API_KEY for real mistake analysis.",
            remainingQuota: FREE_DAILY_LIMIT,
          });
        }

        if (!isAnthropicConfigured()) {
          return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
            createErrorResponse(HTTP_STATUS.SERVICE_UNAVAILABLE, ERROR_CODES.AI_SERVICE_UNAVAILABLE, req.id, "AI service not configured."),
          );
        }

        const prompt = buildHifzMistakeAnalysisPrompt(surahNumber, verseNumber, expectedText, transcribedText, score);

        const response = await Sentry.startSpan(
          { name: "POST /api/hifz/analyze-mistakes", op: "ai.hifz" },
          async () =>
            getAnthropicClient().messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 400,
              messages: [{ role: "user", content: prompt }],
            }),
        );

        const firstBlock = response.content[0];
        const analysis = firstBlock?.type === "text" ? firstBlock.text : "Unable to analyze at this time.";

        const userId = req.ip ?? "anonymous";
        incrementAIUsage(userId);

        const { status } = await billingService.getBillingStatus(userId);
        const isPaid = billingService.isPaidUser(status);
        const remainingQuota = isPaid ? null : Math.max(0, FREE_DAILY_LIMIT - getAIUsageToday(userId));

        res.json({ analysis, remainingQuota });
      } catch (error) {
        Sentry.captureException(error);
        req.logger.error("Hifz mistake analysis failed", error, { operation: "hifz_analyze" });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createErrorResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, req.id, "Failed to analyze mistakes"),
        );
      }
    },
  );
}
```

**Step 3: Register routes in `server/routes.ts`**

Add import:
```typescript
import { registerHifzRoutes } from "./routes/hifz-routes";
```

Add registration before the HTTP server creation:
```typescript
registerHifzRoutes(app);
```

**Step 4: Commit**

```bash
git add server/services/hifz-prompts.ts server/routes/hifz-routes.ts server/routes.ts
git commit -m "feat(hifz): add server routes for AI mistake analysis"
```

---

### Task 5: Hifz Hooks

React hooks for the recitation flow, progress tracking, and review queue.

**Files:**
- Create: `client/hooks/useHifzRecitation.ts`
- Create: `client/hooks/useHifzProgress.ts`
- Create: `client/hooks/useHifzReviewQueue.ts`

**Step 1: Create useHifzRecitation hook**

This hook manages the full recitation flow: hide verse, record via STT, score, rate difficulty, schedule next review.

```typescript
// client/hooks/useHifzRecitation.ts
import { useState, useCallback } from "react";
import { checkRecitation, RecitationResult } from "@/services/hifz/recitation-checker";
import { useHifzStore } from "@/stores/hifz-store";
import type { Rating } from "@/lib/fsrs";

export type RecitationPhase = "ready" | "reciting" | "checking" | "results" | "rating";

export interface UseHifzRecitationReturn {
  phase: RecitationPhase;
  result: RecitationResult | null;
  aiAnalysis: string | null;
  isAnalyzing: boolean;
  startRecitation: () => void;
  submitTranscription: (transcribedText: string, expectedText: string) => void;
  rateDifficulty: (rating: Rating) => void;
  reset: () => void;
  peekWord: (index: number) => void;
  peekedWords: Set<number>;
}

export function useHifzRecitation(surahNumber: number, verseNumber: number): UseHifzRecitationReturn {
  const [phase, setPhase] = useState<RecitationPhase>("ready");
  const [result, setResult] = useState<RecitationResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [peekedWords, setPeekedWords] = useState<Set<number>>(new Set());

  const reviewComplete = useHifzStore((s) => s.reviewComplete);

  const startRecitation = useCallback(() => {
    setPhase("reciting");
    setResult(null);
    setAiAnalysis(null);
    setPeekedWords(new Set());
  }, []);

  const submitTranscription = useCallback(
    (transcribedText: string, expectedText: string) => {
      const checkResult = checkRecitation(expectedText, transcribedText);
      setResult(checkResult);
      setPhase("results");

      // Fetch AI analysis if score < 90
      if (checkResult.score < 90) {
        setIsAnalyzing(true);
        fetch("/api/hifz/analyze-mistakes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surahNumber,
            verseNumber,
            expectedText,
            transcribedText,
            score: checkResult.score,
          }),
        })
          .then((r) => r.json())
          .then((data) => setAiAnalysis(data.analysis))
          .catch(() => setAiAnalysis(null))
          .finally(() => setIsAnalyzing(false));
      }
    },
    [surahNumber, verseNumber],
  );

  const rateDifficulty = useCallback(
    (rating: Rating) => {
      reviewComplete(surahNumber, verseNumber, rating, result?.score);
      setPhase("ready");
    },
    [surahNumber, verseNumber, result, reviewComplete],
  );

  const reset = useCallback(() => {
    setPhase("ready");
    setResult(null);
    setAiAnalysis(null);
    setPeekedWords(new Set());
  }, []);

  const peekWord = useCallback((index: number) => {
    setPeekedWords((prev) => new Set(prev).add(index));
  }, []);

  return {
    phase, result, aiAnalysis, isAnalyzing,
    startRecitation, submitTranscription, rateDifficulty, reset,
    peekWord, peekedWords,
  };
}
```

**Step 2: Create useHifzProgress hook**

```typescript
// client/hooks/useHifzProgress.ts
import { useMemo } from "react";
import { useHifzStore } from "@/stores/hifz-store";

export function useHifzProgress() {
  const getJuzMap = useHifzStore((s) => s.getJuzMap);
  const getStats = useHifzStore((s) => s.getStats);
  const verses = useHifzStore((s) => s.verses);
  const reviewHistory = useHifzStore((s) => s.reviewHistory);

  const juzMap = useMemo(() => getJuzMap(), [verses]);
  const stats = useMemo(() => getStats(), [verses]);

  const reviewStreak = useMemo(() => {
    if (reviewHistory.length === 0) return 0;
    const sorted = [...reviewHistory].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (sorted[i]?.date === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [reviewHistory]);

  return { juzMap, stats, reviewStreak };
}
```

**Step 3: Create useHifzReviewQueue hook**

```typescript
// client/hooks/useHifzReviewQueue.ts
import { useMemo } from "react";
import { useHifzStore } from "@/stores/hifz-store";

export function useHifzReviewQueue() {
  const getDueToday = useHifzStore((s) => s.getDueToday);
  const verses = useHifzStore((s) => s.verses);

  const dueToday = useMemo(() => getDueToday(), [verses]);

  const upcomingThisWeek = useMemo(() => {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return verses.filter((v) => {
      if (!v.card.nextReview) return false;
      const reviewDate = new Date(v.card.nextReview);
      return reviewDate > new Date() && reviewDate <= weekFromNow;
    }).length;
  }, [verses]);

  return { dueToday, dueCount: dueToday.length, upcomingThisWeek };
}
```

**Step 4: Commit**

```bash
git add client/hooks/useHifzRecitation.ts client/hooks/useHifzProgress.ts client/hooks/useHifzReviewQueue.ts
git commit -m "feat(hifz): add hooks for recitation flow, progress, and review queue"
```

---

### Task 6: Hifz UI Components

JuzProgressMap, HifzMistakeFeedback, and HifzPeekOverlay.

**Files:**
- Create: `client/components/JuzProgressMap.tsx`
- Create: `client/components/HifzMistakeFeedback.tsx`
- Create: `client/components/HifzPeekOverlay.tsx`

These are complex UI components. Each follows the app's pattern: `useTheme()`, `NoorColors`, `Animated` from Reanimated, `ThemedText`, `GlassCard`.

**Step 1: Create JuzProgressMap** — 30-cell grid, color-coded by status

**Step 2: Create HifzMistakeFeedback** — word-level colored results (green=correct, red=mistake, yellow=skipped) + AI tips panel

**Step 3: Create HifzPeekOverlay** — tap-to-reveal overlay for words during recitation

(Full code for each component should follow the existing component patterns in the codebase. Each component is ~80-150 lines using NoorColors, GlassCard, ThemedText, Feather icons, and Reanimated animations.)

**Step 4: Commit**

```bash
git add client/components/JuzProgressMap.tsx client/components/HifzMistakeFeedback.tsx client/components/HifzPeekOverlay.tsx
git commit -m "feat(hifz): add JuzProgressMap, MistakeFeedback, PeekOverlay components"
```

---

### Task 7: Hifz Dashboard Screen

Main entry point for the hifz system. Shows juz map, daily review queue, stats.

**Files:**
- Create: `client/screens/learn/HifzDashboardScreen.tsx`

Follows LearnTabScreen layout pattern: `useSafeAreaInsets()`, header with title, `ScrollView`, `GlassCard` sections, `Animated.View` with `FadeInUp`.

Sections:
1. Stats header (total verses, due today, review streak)
2. JuzProgressMap component (30-cell grid)
3. "Due Today" review queue with verse cards
4. "Start Review" button that navigates to HifzRecitationScreen

**Step 1: Create the screen** (following AskKarimScreen / LearnTabScreen patterns)

**Step 2: Commit**

```bash
git add client/screens/learn/HifzDashboardScreen.tsx
git commit -m "feat(hifz): add HifzDashboardScreen with juz map and review queue"
```

---

### Task 8: Hifz Recitation Screen

Hidden verse mode with peek, record, STT, mistake feedback, rate difficulty.

**Files:**
- Create: `client/screens/learn/HifzRecitationScreen.tsx`

Uses:
- `useHifzRecitation` hook for flow state
- Existing `useSTT` hook for speech-to-text
- `HifzMistakeFeedback` component for results
- `HifzPeekOverlay` component for peek
- `AudioRecordButton` component (existing from Phase 5) for recording

Phases:
- **ready**: Shows verse reference (not text), "Start Recitation" button
- **reciting**: Hidden text (with peek per-word), recording UI, stop button
- **results**: Score, word-level feedback, AI analysis (if score < 90)
- **rating**: 4 difficulty buttons (Again/Hard/Good/Easy), then returns to dashboard

**Step 1: Create the screen**

**Step 2: Commit**

```bash
git add client/screens/learn/HifzRecitationScreen.tsx
git commit -m "feat(hifz): add HifzRecitationScreen with hidden verse mode"
```

---

### Phase 6A Checkpoint: Navigation + Learn Tab Integration

**Files to modify:**
- `client/navigation/types.ts` — Add `HifzDashboard` and `HifzRecitation` routes
- `client/navigation/RootStackNavigator.tsx` — Import + register both screens
- `client/screens/learn/LearnTabScreen.tsx` — Add "Hifz" feature card

**Modifications:**

`client/navigation/types.ts` — Add to `RootStackParamList`:
```typescript
HifzDashboard: undefined;
HifzRecitation: { surahNumber: number; startVerse: number; endVerse: number };
```

`client/navigation/RootStackNavigator.tsx` — Add imports and `<Stack.Screen>` entries

`client/screens/learn/LearnTabScreen.tsx` — Add to `features` array:
```typescript
{
  title: "Hifz",
  description: "Memorize the Quran with spaced repetition and recitation practice",
  gradient: ["#3a4a3a", "#5a7a5a"],
  icon: "book" as const,
  screen: "HifzDashboard" as const,
  comingSoon: false,
},
```

**Commit:**
```bash
git add client/navigation/types.ts client/navigation/RootStackNavigator.tsx client/screens/learn/LearnTabScreen.tsx
git commit -m "feat(hifz): integrate navigation, register screens, add Learn tab card"
```

**Phase 6A Verification:**
```bash
cd /Users/kevinrichards/projects/noor && npx tsc --noEmit
cd /Users/kevinrichards/projects/noor && npm test
```

**Push:**
```bash
git push origin main
```

---

## Phase 6B: AI Tafsir + Verse Conversation

### Task 9: Tafsir Server (prompts + routes)

**Files:**
- Create: `server/services/tafsir-prompts.ts`
- Create: `server/routes/tafsir-routes.ts`
- Modify: `server/routes.ts` — register

**Tafsir prompt** instructs Claude to reference classical tafsir sources (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di), explain in accessible English, include root word analysis, note scholarly differences, end with a practical reflection question.

**Route:** `POST /api/tafsir/explain` with `{ surahNumber, verseNumber, verseText }` → structured explanation.

Follows exact same pattern as `tutor-routes.ts`: Zod validation, `aiRateLimiter`, `aiDailyQuotaMiddleware`, `getAnthropicClient()`, Sentry span, `incrementAIUsage()`.

**Commit:**
```bash
git add server/services/tafsir-prompts.ts server/routes/tafsir-routes.ts server/routes.ts
git commit -m "feat(tafsir): add server route for AI verse explanations"
```

---

### Task 10: Verse Conversation Server (prompts + routes)

**Files:**
- Create: `server/services/verse-conversation-prompts.ts`
- Create: `server/routes/verse-conversation-routes.ts`
- Modify: `server/routes.ts` — register

**System prompt** positions Claude as a warm Quran study companion. Draws from tafsir, Arabic linguistics, historical context. Avoids fatawa.

**Route:** `POST /api/verse/discuss` with `{ surahNumber, verseNumber, verseText, message, conversationHistory }` → response text.

Same middleware pattern. Conversation history limited to 20 messages.

**Commit:**
```bash
git add server/services/verse-conversation-prompts.ts server/routes/verse-conversation-routes.ts server/routes.ts
git commit -m "feat(verse-discuss): add server route for AI verse conversation"
```

---

### Task 11: Tafsir Client (hook + panel)

**Files:**
- Create: `client/hooks/useTafsir.ts`
- Create: `client/components/TafsirPanel.tsx`

**useTafsir hook:** Fetches tafsir from server, caches in AsyncStorage per verse key (`tafsir:${surah}:${verse}`). Returns `{ tafsir, isLoading, error, refresh }`.

**TafsirPanel:** Slide-up panel rendered below a verse. Sections: Context (occasion of revelation), Language (key Arabic roots), Scholars (interpretations), Application (practical takeaway). Uses `GlassCard`, `ThemedText`, `FadeInUp` animation.

**Commit:**
```bash
git add client/hooks/useTafsir.ts client/components/TafsirPanel.tsx
git commit -m "feat(tafsir): add hook with caching and slide-up TafsirPanel"
```

---

### Task 12: Verse Conversation Client (hook + screen)

**Files:**
- Create: `client/hooks/useVerseConversation.ts`
- Create: `client/screens/learn/VerseDiscussionScreen.tsx`

**useVerseConversation hook:** Per-verse chat state with `sendMessage()`, conversation history persisted in AsyncStorage per verse key. Follows AskKarimScreen chat pattern.

**VerseDiscussionScreen:** Chat UI following AskKarimScreen pattern exactly (KeyboardAvoidingView, ScrollView, MessageBubble, TypingIndicator, input bar). Verse text pinned at top in a GlassCard.

**Commit:**
```bash
git add client/hooks/useVerseConversation.ts client/screens/learn/VerseDiscussionScreen.tsx
git commit -m "feat(verse-discuss): add per-verse chat screen with history persistence"
```

---

### Task 13: Integrate into VerseReaderScreen

**Files to modify:**
- `client/screens/learn/VerseReaderScreen.tsx` — Add "Explain" and "Discuss" buttons to verse action bar
- `client/navigation/types.ts` — Add `VerseDiscussion` route
- `client/navigation/RootStackNavigator.tsx` — Register VerseDiscussionScreen

**Verse action bar additions:**
- "Explain" button (icon: `info`) → toggles inline TafsirPanel below the verse
- "Discuss" button (icon: `message-circle`) → navigates to VerseDiscussionScreen

**Route addition:**
```typescript
VerseDiscussion: { surahNumber: number; verseNumber: number };
```

**Commit:**
```bash
git add client/screens/learn/VerseReaderScreen.tsx client/navigation/types.ts client/navigation/RootStackNavigator.tsx
git commit -m "feat(tafsir+discuss): add Explain and Discuss buttons to verse reader"
```

**Phase 6B Verification:**
```bash
npx tsc --noEmit && npm test
git push origin main
```

---

## Phase 6C: Dua Recommender

### Task 14: Dua Recommender Server (service + routes)

**Files:**
- Create: `server/services/dua-recommender.ts`
- Create: `server/routes/dua-routes.ts`
- Modify: `server/routes.ts` — register

**dua-recommender.ts:** Uses existing RAG engine (`server/services/rag-engine.ts`) to search for relevant duas from the knowledge base. Formats results with Claude Haiku for warm, structured output including Arabic text, transliteration, translation, and source citation.

**Authenticity guardrail** in system prompt: Only recommend duas from Quran, Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, Tirmidhi, or Hisn al-Muslim. Always cite source. Never fabricate.

**Route:** `POST /api/duas/recommend` with `{ situation, category? }` → array of dua results.

**Commit:**
```bash
git add server/services/dua-recommender.ts server/routes/dua-routes.ts server/routes.ts
git commit -m "feat(dua): add RAG-powered dua recommender with authenticity guardrails"
```

---

### Task 15: Dua Client (store + hook + screen + component)

**Files:**
- Create: `client/stores/dua-favorites-store.ts`
- Create: `client/hooks/useDuaRecommender.ts`
- Create: `client/components/DuaCard.tsx`
- Create: `client/screens/learn/DuaFinderScreen.tsx`

**dua-favorites-store.ts:** Zustand + persist. Saved duas collection with `addFavorite()`, `removeFavorite()`, `isFavorite()`.

**useDuaRecommender hook:** `recommend(situation)`, loading state, results array, category browse.

**DuaCard component:** Arabic text (Amiri font), transliteration, translation, source citation, TTSButton (existing), save/unsave button. Uses `GlassCard`.

**DuaFinderScreen:** Input field at bottom (chat-style), category chips at top for quick selection (anxiety, gratitude, travel, forgiveness, morning/evening, before eating), DuaCard results. Follows AskKarimScreen input pattern.

**Commit:**
```bash
git add client/stores/dua-favorites-store.ts client/hooks/useDuaRecommender.ts client/components/DuaCard.tsx client/screens/learn/DuaFinderScreen.tsx
git commit -m "feat(dua): add DuaFinder screen with RAG search, favorites, and TTS"
```

---

### Task 16: Dua Navigation Integration

**Files to modify:**
- `client/navigation/types.ts` — Add `DuaFinder` route
- `client/navigation/RootStackNavigator.tsx` — Register DuaFinderScreen
- `client/screens/learn/LearnTabScreen.tsx` — Add "Find a Dua" feature card

**Feature card:**
```typescript
{
  title: "Find a Dua",
  description: "Find authentic duas for any situation from Quran and Hadith",
  gradient: ["#4a3a4a", "#7a6a7a"],
  icon: "heart" as const,
  screen: "DuaFinder" as const,
  comingSoon: false,
},
```

**Commit:**
```bash
git add client/navigation/types.ts client/navigation/RootStackNavigator.tsx client/screens/learn/LearnTabScreen.tsx
git commit -m "feat(dua): integrate navigation and Learn tab card"
```

**Phase 6C Verification:**
```bash
npx tsc --noEmit && npm test
git push origin main
```

---

## Phase 6D: Personalized Study Plan

### Task 17: Study Plan Server (generator + routes)

**Files:**
- Create: `server/services/study-plan-generator.ts`
- Create: `server/routes/study-plan-routes.ts`
- Modify: `server/routes.ts` — register

**study-plan-generator.ts:** Takes goal/time/level → asks Claude to generate a structured weekly plan as JSON. Each daily task has: title, type (quran_read | memorize | review | tutor | reflect), reference (surah/verse range or topic), estimated minutes, and screen link.

**Routes:**
- `POST /api/study-plan/generate` — Create new plan from goal/time/level
- `POST /api/study-plan/adapt` — Weekly adaptation: takes completion data, generates adjusted plan

Both use `aiDailyQuotaMiddleware`.

**Commit:**
```bash
git add server/services/study-plan-generator.ts server/routes/study-plan-routes.ts server/routes.ts
git commit -m "feat(study-plan): add server routes for plan generation and adaptation"
```

---

### Task 18: Study Plan Client (store + hook + components + screen)

**Files:**
- Create: `client/stores/study-plan-store.ts`
- Create: `client/hooks/useStudyPlan.ts`
- Create: `client/components/StudyPlanOnboarding.tsx`
- Create: `client/components/DailyTaskCard.tsx`
- Create: `client/screens/learn/StudyPlanScreen.tsx`

**study-plan-store.ts:** Zustand + persist. Stores current plan (JSON), task completion tracking, goal/time/level settings, last adaptation date.

**useStudyPlan hook:** `generate()`, `completeTask()`, `requestAdaptation()`, derives today's tasks and weekly overview.

**StudyPlanOnboarding:** 3-step picker: Goal (memorize juz 30 / read entire Quran / understand specific surah / improve tajweed / custom), Time (10/20/30/45+ min/day), Level (beginner/intermediate/advanced). Each step is a screen with pill-style selection options.

**DailyTaskCard:** Task title, type icon, estimated time, linked screen navigation, completion checkbox toggle. Uses `GlassCard`, `Pressable`.

**StudyPlanScreen:** If no plan → shows onboarding. If plan exists → weekly calendar view with daily task cards, "This Week" header, progress ring, adaptation prompt if Sunday.

**Commit:**
```bash
git add client/stores/study-plan-store.ts client/hooks/useStudyPlan.ts client/components/StudyPlanOnboarding.tsx client/components/DailyTaskCard.tsx client/screens/learn/StudyPlanScreen.tsx
git commit -m "feat(study-plan): add study plan screen with onboarding, daily tasks, and weekly view"
```

---

### Task 19: Study Plan Navigation Integration

**Files to modify:**
- `client/navigation/types.ts` — Add `StudyPlan` route
- `client/navigation/RootStackNavigator.tsx` — Register StudyPlanScreen
- `client/screens/learn/LearnTabScreen.tsx` — Add "My Study Plan" feature card (promoted near top)

**Feature card:**
```typescript
{
  title: "My Study Plan",
  description: "Personalized daily Quran study plan that adapts to your progress",
  gradient: ["#3a5a3a", "#5a8a5a"],
  icon: "calendar" as const,
  screen: "StudyPlan" as const,
  comingSoon: false,
},
```

**Commit:**
```bash
git add client/navigation/types.ts client/navigation/RootStackNavigator.tsx client/screens/learn/LearnTabScreen.tsx
git commit -m "feat(study-plan): integrate navigation and Learn tab card"
```

**Phase 6D Verification:**
```bash
npx tsc --noEmit && npm test
git push origin main
```

---

## Phase 6E: Integration + Polish

### Task 20: Update Entitlements for New Features

**Files to modify:**
- `client/hooks/useEntitlements.ts` — Add new feature names + tier mapping

**Add to FeatureName type:**
```typescript
| "hifz_all_juz"
| "hifz_fsrs"
| "hifz_mistake_history"
| "hifz_ai_analysis"
| "study_plan_adaptation"
```

**Add to FEATURE_TIER_MAP:**
```typescript
// Free
hifz_all_juz: "free", // Free tracks 1 juz — but gating is in client logic, not entitlements
// Plus
hifz_fsrs: "plus",
hifz_mistake_history: "plus",
study_plan_adaptation: "plus",
// Plus (AI-powered)
hifz_ai_analysis: "plus",
```

Note: The design doc lists hifz_ai_analysis and hifz_circles as "Pro" tier, but since the current codebase only has free/plus (no Pro tier after cleanup), map these to "plus" for now.

**Commit:**
```bash
git add client/hooks/useEntitlements.ts
git commit -m "feat(entitlements): add hifz and study plan feature gates"
```

---

### Task 21: Add Gamification Hooks

**Files to modify:**
- `client/stores/gamification-store.ts` — Add new ActivityType values
- Hifz screens — Add `recordActivity()` calls

**Add to ActivityType:**
```typescript
| "hifz_review"
| "hifz_recitation"
| "study_plan_task"
| "tafsir_read"
| "dua_searched"
| "verse_discussed"
```

**Add activity recording in:**
- `HifzRecitationScreen.tsx` → `recordActivity("hifz_recitation")` on recitation complete
- `HifzDashboardScreen.tsx` → `recordActivity("hifz_review")` when review session completes
- `StudyPlanScreen.tsx` → `recordActivity("study_plan_task")` on task completion
- `TafsirPanel.tsx` → `recordActivity("tafsir_read")` on tafsir load
- `DuaFinderScreen.tsx` → `recordActivity("dua_searched")` on first search
- `VerseDiscussionScreen.tsx` → `recordActivity("verse_discussed")` on first message

**Commit:**
```bash
git add client/stores/gamification-store.ts client/screens/learn/HifzRecitationScreen.tsx client/screens/learn/HifzDashboardScreen.tsx client/screens/learn/StudyPlanScreen.tsx client/components/TafsirPanel.tsx client/screens/learn/DuaFinderScreen.tsx client/screens/learn/VerseDiscussionScreen.tsx
git commit -m "feat(gamification): add activity types for hifz, study plan, tafsir, dua, verse discussion"
```

---

### Task 22: TypeScript Check + Test Run

**Step 1: Fix any TypeScript errors**

```bash
cd /Users/kevinrichards/projects/noor && npx tsc --noEmit
```

Fix all errors. Common issues:
- Import paths
- Missing type exports
- Date serialization (Zustand persist serializes Date → string, needs rehydration)

**Step 2: Run tests**

```bash
cd /Users/kevinrichards/projects/noor && npm test
```

All 675+ tests should still pass. New code doesn't break existing tests.

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors from Phase 6 integration"
```

---

### Task 23: Update CONTINUE.md

Update the project continuation document with Phase 6 status.

**Step 1: Update CONTINUE.md** with:
- Phase 6 feature list and status
- New file inventory
- Test count
- Next steps (Phase 7 ideas)

**Step 2: Final push**

```bash
git add CONTINUE.md
git commit -m "docs: update CONTINUE.md with Phase 6 completion"
git push origin main
```

---

## Execution Strategy: Parallel Agent Swarm

### Phase 6A (Tasks 1-8): 4 parallel agents + main thread

| Agent | Tasks | Files |
|-------|-------|-------|
| **Agent A** | Task 1 + Task 2 | `fsrs-scheduler.ts`, `recitation-checker.ts` |
| **Agent B** | Task 3 | `hifz-store.ts` |
| **Agent C** | Task 4 | `hifz-prompts.ts`, `hifz-routes.ts` |
| **Agent D** | Task 6 | `JuzProgressMap.tsx`, `HifzMistakeFeedback.tsx`, `HifzPeekOverlay.tsx` |
| **Main** | Task 5 (hooks depend on store+services), Task 7+8 (screens depend on hooks+components), navigation integration |

### Phase 6B (Tasks 9-13): 2 parallel agents + main thread

| Agent | Tasks | Files |
|-------|-------|-------|
| **Agent E** | Task 9 + Task 11 | Tafsir server + client |
| **Agent F** | Task 10 + Task 12 | Verse conversation server + client |
| **Main** | Task 13 (VerseReaderScreen integration) |

### Phase 6C (Tasks 14-16): 1 agent + main thread

| Agent | Tasks | Files |
|-------|-------|-------|
| **Agent G** | Task 14 + Task 15 | Dua server + client |
| **Main** | Task 16 (navigation) |

### Phase 6D (Tasks 17-19): 1 agent + main thread

| Agent | Tasks | Files |
|-------|-------|-------|
| **Agent H** | Task 17 + Task 18 | Study plan server + client |
| **Main** | Task 19 (navigation) |

### Phase 6E (Tasks 20-23): Main thread only

Sequential: entitlements → gamification → TypeScript fix → tests → CONTINUE.md → push.

---

## File Inventory (New Files: ~30)

| File | Phase | Purpose |
|------|-------|---------|
| `client/services/hifz/fsrs-scheduler.ts` | 6A | FSRS for verse memorization |
| `client/services/hifz/recitation-checker.ts` | 6A | STT vs expected text comparison |
| `client/stores/hifz-store.ts` | 6A | Zustand: memorized verses + reviews |
| `client/hooks/useHifzRecitation.ts` | 6A | Full recitation flow hook |
| `client/hooks/useHifzProgress.ts` | 6A | Juz map + stats |
| `client/hooks/useHifzReviewQueue.ts` | 6A | Daily due queue |
| `client/components/JuzProgressMap.tsx` | 6A | 30-juz color grid |
| `client/components/HifzMistakeFeedback.tsx` | 6A | Word-level results display |
| `client/components/HifzPeekOverlay.tsx` | 6A | Tap-to-reveal word |
| `client/screens/learn/HifzDashboardScreen.tsx` | 6A | Main hifz screen |
| `client/screens/learn/HifzRecitationScreen.tsx` | 6A | Hidden verse recitation |
| `server/services/hifz-prompts.ts` | 6A | AI mistake analysis prompts |
| `server/routes/hifz-routes.ts` | 6A | Hifz API endpoint |
| `server/services/tafsir-prompts.ts` | 6B | Tafsir generation prompts |
| `server/routes/tafsir-routes.ts` | 6B | Tafsir API endpoint |
| `client/hooks/useTafsir.ts` | 6B | Fetch + cache tafsir |
| `client/components/TafsirPanel.tsx` | 6B | Slide-up tafsir display |
| `server/services/verse-conversation-prompts.ts` | 6B | Verse discussion prompts |
| `server/routes/verse-conversation-routes.ts` | 6B | Verse discussion API |
| `client/hooks/useVerseConversation.ts` | 6B | Per-verse chat state |
| `client/screens/learn/VerseDiscussionScreen.tsx` | 6B | Verse chat screen |
| `server/services/dua-recommender.ts` | 6C | RAG + Claude for duas |
| `server/routes/dua-routes.ts` | 6C | Dua recommend API |
| `client/stores/dua-favorites-store.ts` | 6C | Zustand: saved duas |
| `client/hooks/useDuaRecommender.ts` | 6C | Dua search hook |
| `client/components/DuaCard.tsx` | 6C | Dua display card |
| `client/screens/learn/DuaFinderScreen.tsx` | 6C | Dua finder screen |
| `server/services/study-plan-generator.ts` | 6D | Plan generation prompts |
| `server/routes/study-plan-routes.ts` | 6D | Study plan API |
| `client/stores/study-plan-store.ts` | 6D | Zustand: current plan |
| `client/hooks/useStudyPlan.ts` | 6D | Plan management hook |
| `client/components/StudyPlanOnboarding.tsx` | 6D | 3-step goal picker |
| `client/components/DailyTaskCard.tsx` | 6D | Task card component |
| `client/screens/learn/StudyPlanScreen.tsx` | 6D | Study plan screen |

**Modified files:**
- `server/routes.ts` — Register 4 new route groups
- `client/navigation/types.ts` — Add 5 new routes
- `client/navigation/RootStackNavigator.tsx` — Register 5 new screens
- `client/screens/learn/LearnTabScreen.tsx` — Add 3 new feature cards
- `client/screens/learn/VerseReaderScreen.tsx` — Add Explain + Discuss buttons
- `client/hooks/useEntitlements.ts` — Add 5 new feature gates
- `client/stores/gamification-store.ts` — Add 6 new activity types

---

**STATUS:** Ready for execution. Recommend subagent-driven approach for maximum parallelism.
