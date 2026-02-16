/**
 * Translation API Routes
 *
 * Provides two endpoints:
 * - POST /api/translate — Free translation via MyMemory/Google (no AI quota)
 * - POST /api/translate/explain — AI-powered Arabic root word analysis (uses daily AI quota)
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
import {
  translateText,
  transliterateArabic,
} from "../services/translation-service";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  from: z.string().length(2).default("en"),
  to: z.string().length(2).default("ar"),
});

const explainSchema = z.object({
  arabicText: z.string().min(1).max(1000),
});

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

export function registerTranslationRoutes(app: Express): void {
  /**
   * POST /api/translate
   *
   * Free translation (no AI quota consumed).
   * Uses MyMemory (primary) with Google Translate fallback.
   * Rate-limited but not quota-limited.
   *
   * Body:
   *   text: string (1-5000 chars)
   *   from: string (2-char language code, default "en")
   *   to: string (2-char language code, default "ar")
   *
   * Response:
   *   { translatedText, transliteration, source }
   */
  app.post("/api/translate", aiRateLimiter, async (req, res) => {
    try {
      const parsed = translateSchema.safeParse(req.body);
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

      const { text, from, to } = parsed.data;

      const result = await translateText(text, from, to);

      const transliteration = to === "ar"
        ? transliterateArabic(result.translatedText)
        : null;

      return res.json({
        translatedText: result.translatedText,
        transliteration,
        source: result.source,
      });
    } catch (error) {
      const logger = req.logger || console;
      if (typeof logger.error === "function") {
        logger.error("Translation failed", error);
      }
      Sentry.captureException(error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Translation failed",
        ),
      );
    }
  });

  /**
   * POST /api/translate/explain
   *
   * AI-powered Arabic root word analysis. Uses daily AI quota.
   *
   * Body:
   *   arabicText: string (1-1000 chars)
   *
   * Response:
   *   { explanation, remainingQuota }
   */
  app.post(
    "/api/translate/explain",
    aiRateLimiter,
    aiDailyQuotaMiddleware,
    async (req, res) => {
      try {
        const parsed = explainSchema.safeParse(req.body);
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

        const { arabicText } = parsed.data;

        // Validation mode guard
        if (VALIDATION_MODE && !isAnthropicConfigured()) {
          return res.json({
            explanation:
              "[VALIDATION MODE] Root word analysis requires ANTHROPIC_API_KEY.",
            remainingQuota: null,
          });
        }

        if (!isAnthropicConfigured()) {
          return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
            createErrorResponse(
              HTTP_STATUS.SERVICE_UNAVAILABLE,
              ERROR_CODES.AI_SERVICE_UNAVAILABLE,
              req.id,
              "AI service not configured.",
            ),
          );
        }

        const response = await Sentry.startSpan(
          { name: "POST /api/translate/explain", op: "ai.translate_explain" },
          async () => {
            return getAnthropicClient().messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 512,
              system:
                "You are an Arabic language expert. Analyze the given Arabic text and explain: 1) The root letters (trilateral root), 2) The word form/pattern, 3) Common usage and related words, 4) Any Quranic context if applicable. Keep it concise (150 words max). Include transliteration.",
              messages: [{ role: "user", content: arabicText }],
            });
          },
        );

        const firstBlock = response.content[0];
        const explanation =
          firstBlock?.type === "text"
            ? firstBlock.text
            : "Unable to generate explanation.";

        // Increment quota after successful AI response
        const userId = req.ip ?? "anonymous";
        incrementAIUsage(userId);

        const { status } = await billingService.getBillingStatus(userId);
        const isPaid = billingService.isPaidUser(status);
        const remainingQuota = isPaid
          ? null
          : FREE_DAILY_LIMIT - getAIUsageToday(userId);

        return res.json({
          explanation,
          remainingQuota,
        });
      } catch (error) {
        const logger = req.logger || console;
        if (typeof logger.error === "function") {
          logger.error("Translation explain failed", error);
        }
        Sentry.captureException(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to analyze Arabic text",
          ),
        );
      }
    },
  );
}
