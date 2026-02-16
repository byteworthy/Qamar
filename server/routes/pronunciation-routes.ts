/**
 * Pronunciation API Routes
 *
 * Provides an endpoint for scoring Arabic pronunciation attempts.
 * Compares transcribed text against expected text using Levenshtein
 * distance, and optionally requests coaching tips from Claude Haiku
 * when the score is imperfect.
 */

import type { Express } from "express";
import { z } from "zod";
import * as Sentry from "@sentry/node";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import {
  aiDailyQuotaMiddleware,
  getAIUsageToday,
  incrementAIUsage,
} from "../middleware/ai-daily-quota";
import { VALIDATION_MODE, isAnthropicConfigured } from "../config";
import { getAnthropicClient, FREE_DAILY_LIMIT } from "./constants";
import { billingService } from "../billing";
import { scorePronunciation } from "../services/pronunciation-scorer";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";

// =============================================================================
// VALIDATION
// =============================================================================

const pronunciationCheckSchema = z.object({
  expectedText: z.string().min(1).max(2000),
  transcribedText: z.string().min(1).max(2000),
  surahNumber: z.number().int().min(1).max(114).optional(),
  verseNumber: z.number().int().min(1).optional(),
});

// =============================================================================
// ROUTES
// =============================================================================

export function registerPronunciationRoutes(app: Express): void {
  /**
   * POST /api/pronunciation/check
   *
   * Score an Arabic pronunciation attempt and optionally return coaching tips.
   *
   * Body:
   *   expectedText:    string  - The correct Arabic text
   *   transcribedText: string  - What the user actually said (ASR output)
   *   surahNumber?:    number  - Optional surah reference (1-114)
   *   verseNumber?:    number  - Optional verse reference
   *
   * Response:
   *   { score, accuracy, wordResults, tips, remainingQuota }
   */
  app.post(
    "/api/pronunciation/check",
    aiRateLimiter,
    aiDailyQuotaMiddleware,
    async (req, res) => {
      try {
        // Validate request body
        const parsed = pronunciationCheckSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid request data",
              { validationErrors: parsed.error.issues },
            ),
          );
        }

        const { expectedText, transcribedText } = parsed.data;
        const userId = req.ip ?? "anonymous";

        // Score the pronunciation
        const { score, accuracy, wordResults } = scorePronunciation(
          expectedText,
          transcribedText,
        );

        // Track pronunciation check metric
        Sentry.startSpan(
          {
            name: "pronunciation.check",
            op: "pronunciation.metric",
            attributes: {
              "pronunciation.score": score,
              "pronunciation.word_count": wordResults.length,
            },
          },
          () => {},
        );

        // Generate coaching tips when the score is imperfect
        let tips: string | null = null;

        if (score < 100) {
          if (VALIDATION_MODE && !isAnthropicConfigured()) {
            tips =
              "[VALIDATION MODE] Pronunciation tips require Claude API configuration.";
          } else if (isAnthropicConfigured()) {
            const response = await getAnthropicClient().messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 256,
              system:
                "You are an Arabic pronunciation coach. The student attempted to recite Arabic text. Compare their transcription to the expected text and provide 2-3 specific, actionable tips for improvement. Focus on common Arabic pronunciation challenges for English speakers. Keep it encouraging and concise (100 words max).",
              messages: [
                {
                  role: "user",
                  content: `Expected: "${expectedText}"\nTranscribed: "${transcribedText}"\nScore: ${score}/100`,
                },
              ],
            });

            const firstBlock = response.content[0];
            tips = firstBlock?.type === "text" ? firstBlock.text : null;
          }
        }

        // Increment usage after successful response
        incrementAIUsage(userId);

        // Calculate remaining quota (null for paid users)
        const { status } = await billingService.getBillingStatus(userId);
        const isPaid = billingService.isPaidUser(status);
        const remainingQuota = isPaid
          ? null
          : Math.max(0, FREE_DAILY_LIMIT - getAIUsageToday(userId));

        return res.json({
          score,
          accuracy,
          wordResults,
          tips,
          remainingQuota,
        });
      } catch (error) {
        Sentry.captureException(error);
        req.logger.error("Pronunciation check failed", error, {
          operation: "pronunciation_check",
        });
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to process pronunciation check",
          ),
        );
      }
    },
  );
}
