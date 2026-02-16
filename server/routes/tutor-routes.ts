/**
 * Arabic Language Tutor API Routes
 *
 * Provides the AI Arabic tutor chat endpoint with support for
 * vocabulary, grammar, conversation, and Quranic word analysis modes.
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
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import { getAnthropicClient, FREE_DAILY_LIMIT } from "./constants";
import { billingService } from "../billing";
import { buildTutorSystemPrompt } from "../services/tutor-prompts";
import type { TutorMode } from "../services/tutor-prompts";

// =============================================================================
// VALIDATION
// =============================================================================

const tutorChatSchema = z.object({
  message: z.string().min(1).max(3000),
  mode: z.enum(["vocabulary", "grammar", "conversation", "quran_words"]),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
});

// =============================================================================
// VALIDATION MODE RESPONSE
// =============================================================================

function getValidationModeTutorResponse(mode: TutorMode): {
  response: string;
  mode: TutorMode;
  remainingQuota: number | null;
} {
  return {
    response:
      "[VALIDATION MODE] Assalamu alaikum! I'm your Arabic tutor. Configure ANTHROPIC_API_KEY for real lessons.",
    mode,
    remainingQuota: FREE_DAILY_LIMIT,
  };
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

export function registerTutorRoutes(app: Express): void {
  /**
   * POST /api/tutor/chat
   *
   * Send a message to the Arabic language tutor.
   * Supports vocabulary, grammar, conversation, and quran_words modes.
   */
  app.post(
    "/api/tutor/chat",
    aiRateLimiter,
    aiDailyQuotaMiddleware,
    async (req, res) => {
      try {
        // Validate request body
        const validationResult = tutorChatSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid request data",
              { validationErrors: validationResult.error.issues },
            ),
          );
        }

        const { message, mode, conversationHistory } = validationResult.data;

        // Validation mode guard
        if (VALIDATION_MODE && !isAnthropicConfigured()) {
          return res.json(getValidationModeTutorResponse(mode));
        }

        // Anthropic configuration guard
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

        // Build system prompt for the selected mode
        const systemPrompt = buildTutorSystemPrompt(mode);

        // Build messages array from conversation history + new message
        const messages: Array<{ role: "user" | "assistant"; content: string }> =
          [];

        if (conversationHistory) {
          for (const msg of conversationHistory) {
            messages.push({ role: msg.role, content: msg.content });
          }
        }

        messages.push({ role: "user", content: message });

        // Call Claude Haiku
        const response = await Sentry.startSpan(
          { name: "POST /api/tutor/chat", op: "ai.tutor" },
          async () => {
            return getAnthropicClient().messages.create({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 512,
              system: systemPrompt,
              messages,
            });
          },
        );

        const firstBlock = response.content[0];
        const responseText =
          firstBlock?.type === "text"
            ? firstBlock.text
            : "I'm here to help you learn Arabic. What would you like to study?";

        // Increment usage after successful response
        const userId = req.ip ?? "anonymous";
        incrementAIUsage(userId);

        // Calculate remaining quota (null for paid users)
        const { status } = await billingService.getBillingStatus(userId);
        const isPaid = billingService.isPaidUser(status);
        const remainingQuota = isPaid
          ? null
          : Math.max(0, FREE_DAILY_LIMIT - getAIUsageToday(userId));

        res.json({
          response: responseText,
          mode,
          remainingQuota,
        });
      } catch (error) {
        Sentry.captureException(error);
        req.logger.error("Tutor chat failed", error, {
          operation: "tutor_chat",
        });
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to process tutor message",
          ),
        );
      }
    },
  );
}
