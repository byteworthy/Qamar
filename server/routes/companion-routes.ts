/**
 * Companion API Routes for Noor
 *
 * Provides the AI companion chat endpoint and conversation starters.
 * Integrates Islamic context detection and enrichment.
 */

import type { Express } from "express";
import { z } from "zod";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import {
  VALIDATION_MODE,
  isAnthropicConfigured,
} from "../config";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import { getAnthropicClient } from "./constants";
import { detectIslamicQuery, fetchIslamicContext } from "../services/islamic-context";
import { buildCompanionSystemPrompt } from "../services/companion-prompts";
import type { IslamicContext } from "../services/islamic-context";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const companionMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(10000),
      }),
    )
    .max(50)
    .optional(),
});

// =============================================================================
// TYPES
// =============================================================================

interface Citation {
  type: "quran" | "hadith" | "concept";
  reference: string;
  text: string;
}

// =============================================================================
// CONVERSATION STARTERS
// =============================================================================

const CONVERSATION_SUGGESTIONS = [
  // Islamic knowledge
  {
    category: "Islamic Knowledge",
    suggestions: [
      "What does tawakkul really mean in everyday life?",
      "How can I build a stronger connection with the Quran?",
      "What are some daily adhkar I can start with?",
      "How did the Prophet (peace be upon him) deal with sadness?",
    ],
  },
  // Reflection
  {
    category: "Reflection",
    suggestions: [
      "I've been feeling distant from my prayers lately",
      "How do I deal with guilt about past mistakes?",
      "I'm struggling to find purpose in what I'm going through",
      "I want to be more grateful but it feels hard right now",
    ],
  },
  // Learning
  {
    category: "Learning",
    suggestions: [
      "What is the difference between sabr and just being passive?",
      "How does Islam view anxiety and mental health?",
      "Tell me about the concept of qadr and free will",
      "What does ihsan mean in practice?",
    ],
  },
];

// =============================================================================
// VALIDATION MODE RESPONSES
// =============================================================================

function getValidationModeCompanionResponse(message: string): {
  response: string;
  citations: Citation[];
} {
  const isIslamic = detectIslamicQuery(message);
  return {
    response: isIslamic
      ? "[VALIDATION MODE] Assalamu alaikum! This is a placeholder response. In production, Noor would share relevant Islamic wisdom here. Configure ANTHROPIC_API_KEY for real responses."
      : "[VALIDATION MODE] This is a placeholder companion response. Configure ANTHROPIC_API_KEY for real conversations with Noor.",
    citations: isIslamic
      ? [
          {
            type: "quran",
            reference: "Surah Ash-Sharh 94:5",
            text: "For indeed, with hardship comes ease.",
          },
        ]
      : [],
  };
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

export function registerCompanionRoutes(app: Express): void {
  /**
   * POST /api/companion/message
   *
   * Send a message to the Noor AI companion.
   * Detects Islamic queries, fetches relevant context, and responds.
   */
  app.post("/api/companion/message", aiRateLimiter, async (req, res) => {
    try {
      // Validate request
      const validationResult = companionMessageSchema.safeParse(req.body);
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

      const { message, conversationHistory } = validationResult.data;

      // Validation mode guard
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        req.logger.info("Validation mode: returning placeholder companion response");
        return res.json(getValidationModeCompanionResponse(message));
      }

      // Anthropic configuration guard
      if (!isAnthropicConfigured()) {
        return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
          createErrorResponse(
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            ERROR_CODES.AI_SERVICE_UNAVAILABLE,
            req.id,
            "AI service not configured. Set VALIDATION_MODE=true for testing.",
          ),
        );
      }

      // Detect Islamic query and fetch context
      let islamicContext: IslamicContext | undefined;
      const citations: Citation[] = [];

      if (detectIslamicQuery(message)) {
        islamicContext = await fetchIslamicContext(message);

        // Build citations from context
        if (islamicContext.relevantVerse) {
          citations.push({
            type: "quran",
            reference: islamicContext.relevantVerse.reference,
            text: islamicContext.relevantVerse.translation,
          });
        }
        if (islamicContext.relevantHadith) {
          citations.push({
            type: "hadith",
            reference: islamicContext.relevantHadith.source,
            text: islamicContext.relevantHadith.text,
          });
        }
        if (islamicContext.islamicConcept) {
          citations.push({
            type: "concept",
            reference: "Islamic Concept",
            text: islamicContext.islamicConcept,
          });
        }
      }

      // Build system prompt with Islamic context
      const systemPrompt = buildCompanionSystemPrompt(islamicContext);

      // Build messages array
      const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

      if (conversationHistory) {
        for (const msg of conversationHistory) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: "user", content: message });

      // Call Claude API
      const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      const firstBlock = response.content[0];
      const responseText =
        firstBlock?.type === "text"
          ? firstBlock.text
          : "I'm here for you. Could you tell me more about what's on your mind?";

      res.json({
        response: responseText,
        citations: citations.length > 0 ? citations : undefined,
      });
    } catch (error) {
      req.logger.error("Companion message failed", error, {
        operation: "companion_message",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to process companion message",
        ),
      );
    }
  });

  /**
   * GET /api/companion/suggestions
   *
   * Returns themed conversation starters for the companion.
   */
  app.get("/api/companion/suggestions", (_req, res) => {
    res.json({
      suggestions: CONVERSATION_SUGGESTIONS,
    });
  });
}
