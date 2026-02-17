/**
 * Hifz (Quran Memorization) API Routes
 *
 * Provides endpoints for Quran recitation analysis and coaching.
 * Supports mistake analysis with personalized tips for improvement.
 */

import type { Express, Request, Response } from "express";
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
import { buildMistakeAnalysisPrompt } from "../services/hifz-prompts";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import type { WordComparisonResult } from "../../shared/types/hifz";

// =============================================================================
// VALIDATION MODE RESPONSE
// =============================================================================

function getValidationModeResponse(): {
  tips: string;
  remainingQuota: number;
} {
  return {
    tips: "[VALIDATION MODE] Hifz mistake analysis requires Claude API configuration.",
    remainingQuota: FREE_DAILY_LIMIT,
  };
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

/**
 * Register all Hifz routes on the Express app.
 */
export function registerHifzRoutes(app: Express): void {
  /**
   * POST /api/hifz/analyze-mistakes
   *
   * Analyze recitation mistakes and provide AI-generated coaching tips.
   *
   * Request body:
   *   surahNumber: number - Surah number (1-114)
   *   verseNumber: number - Verse number
   *   expectedText: string - Correct Arabic text
   *   transcribedText: string - What the user recited (ASR output)
   *   score: number - Recitation score (0-100)
   *   wordResults: WordComparisonResult[] - Word-by-word comparison results
   *
   * Response:
   *   { tips: string, remainingQuota: number | null }
   */
  app.post(
    "/api/hifz/analyze-mistakes",
    aiRateLimiter,
    aiDailyQuotaMiddleware,
    async (req, res) => {
      try {
        const {
          surahNumber,
          verseNumber,
          expectedText,
          transcribedText,
          score,
          wordResults,
        } = req.body;

        // Validate required fields
        if (
          !surahNumber ||
          !verseNumber ||
          !expectedText ||
          !transcribedText ||
          score === undefined ||
          !wordResults
        ) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Missing required fields"
            )
          );
        }

        // Validate score range
        if (score < 0 || score > 100) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Score must be between 0 and 100"
            )
          );
        }

        // Validate wordResults is an array
        if (!Array.isArray(wordResults)) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "wordResults must be an array"
            )
          );
        }

        const userId = req.ip ?? "anonymous";

        // Validation mode guard
        if (VALIDATION_MODE && !isAnthropicConfigured()) {
          return res.json(getValidationModeResponse());
        }

        // Anthropic configuration guard
        if (!isAnthropicConfigured()) {
          return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
            createErrorResponse(
              HTTP_STATUS.SERVICE_UNAVAILABLE,
              ERROR_CODES.AI_SERVICE_UNAVAILABLE,
              req.id,
              "AI service not configured"
            )
          );
        }

        // Build prompt for Claude
        const prompt = buildMistakeAnalysisPrompt(
          surahNumber,
          verseNumber,
          expectedText,
          transcribedText,
          wordResults,
          score
        );

        // Call Claude Haiku
        const response = await Sentry.startSpan(
          { name: "POST /api/hifz/analyze-mistakes", op: "ai.hifz" },
          async () => {
            return getAnthropicClient().messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 200,
              temperature: 0.7,
              messages: [{ role: "user", content: prompt }],
            });
          }
        );

        const firstBlock = response.content[0];
        const tips =
          firstBlock?.type === "text"
            ? firstBlock.text
            : "Keep practicing! Every recitation brings you closer to mastery.";

        // Track mistake analysis metric
        Sentry.startSpan(
          {
            name: "hifz.analyze_mistakes",
            op: "hifz.metric",
            attributes: {
              "hifz.score": score,
              "hifz.surah": surahNumber,
              "hifz.verse": verseNumber,
              "hifz.mistake_count": wordResults.filter((w) => !w.isCorrect)
                .length,
            },
          },
          () => {}
        );

        // Increment usage after successful response
        incrementAIUsage(userId);

        // Calculate remaining quota (null for paid users)
        const { status } = await billingService.getBillingStatus(userId);
        const isPaid = billingService.isPaidUser(status);
        const remainingQuota = isPaid
          ? null
          : Math.max(0, FREE_DAILY_LIMIT - getAIUsageToday(userId));

        return res.json({
          tips,
          remainingQuota,
        });
      } catch (error) {
        Sentry.captureException(error);
        req.logger.error("Hifz analyze-mistakes failed", error, {
          operation: "hifz_analyze_mistakes",
        });
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to analyze mistakes"
          )
        );
      }
    }
  );
}
