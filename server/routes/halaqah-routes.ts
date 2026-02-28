/**
 * Halaqah API Routes
 *
 * Islamic learning circle endpoint — scholarly Q&A with adab.
 * Distinct from Khalil (muhasaba) and Companion (conversational support).
 *
 * The Halaqah guide:
 * - Takes questions seriously and responds with knowledge and humility
 * - References Quran and hadith with proper citations
 * - Acknowledges scholarly disagreement rather than presenting a single view
 * - Encourages further study and consultation with real scholars
 */

import type { Express } from "express";
import { z } from "zod";
import * as Sentry from "@sentry/node";
import { randomUUID } from "crypto";
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
import { getAnthropicClient, FREE_DAILY_LIMIT } from "./constants";
import { billingService } from "../billing";
import {
  validateAndSanitizeInput,
} from "../ai-safety";
import { detectIslamicQuery, fetchIslamicContext } from "../services/islamic-context";
import {
  buildHalaqahSystemPrompt,
  HALAQAH_TOPICS,
} from "../services/halaqah-prompts";
import {
  getOrCreateHalaqahSession,
  updateHalaqahSession,
} from "../services/halaqah-session-store";
import {
  findRelevantContent,
  isIslamicKnowledgeQuery,
} from "../services/islamic-knowledge";
import type { IslamicContext } from "../services/islamic-context";

// =============================================================================
// VALIDATION
// =============================================================================

const halaqahMessageSchema = z.object({
  question: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

// =============================================================================
// TYPES
// =============================================================================

interface HalaqahTextBlock {
  type: "text";
  content: string;
}

interface HalaqahAyahBlock {
  type: "ayah_card";
  arabic: string;
  translation: string;
  reference: string;
  context: string;
}

interface HalaqahHadithBlock {
  type: "hadith_card";
  text: string;
  source: string;
  grade: string;
  context: string;
}

interface HalaqahScholarlyBlock {
  type: "scholarly_note";
  positions: Array<{
    view: string;
    held_by: string;
    evidence: string;
  }>;
  summary: string;
}

interface HalaqahFurtherStudyBlock {
  type: "further_study";
  topics: string[];
  recommendation: string;
}

type HalaqahResponseBlock =
  | HalaqahTextBlock
  | HalaqahAyahBlock
  | HalaqahHadithBlock
  | HalaqahScholarlyBlock
  | HalaqahFurtherStudyBlock;

// =============================================================================
// FREE USER DAILY LIMIT TRACKING
// =============================================================================

const halaqahDailyUsage = new Map<string, { count: number; date: string }>();

function getHalaqahUsageToday(userId: string): number {
  const today = new Date().toISOString().split("T")[0];
  const usage = halaqahDailyUsage.get(userId);
  if (!usage || usage.date !== today) {
    halaqahDailyUsage.set(userId, { count: 0, date: today });
    return 0;
  }
  return usage.count;
}

function incrementHalaqahUsage(userId: string): void {
  const today = new Date().toISOString().split("T")[0];
  const usage = halaqahDailyUsage.get(userId);
  if (!usage || usage.date !== today) {
    halaqahDailyUsage.set(userId, { count: 1, date: today });
  } else {
    usage.count++;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function parseHalaqahResponse(raw: string): HalaqahResponseBlock[] {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks;
    }
  } catch {
    // If Claude didn't return JSON, wrap as text
  }

  // Fallback: wrap raw text as a single text block
  return [{ type: "text", content: raw }];
}

function getValidationModeResponse(sessionId: string): {
  sessionId: string;
  blocks: HalaqahResponseBlock[];
} {
  return {
    sessionId,
    blocks: [
      {
        type: "text",
        content:
          "[VALIDATION MODE] Assalamu alaikum! Welcome to the halaqah. Configure ANTHROPIC_API_KEY for real conversations.",
      },
      {
        type: "further_study",
        topics: ["Foundations of aqeedah", "Introduction to fiqh"],
        recommendation:
          "For deeper study, seek out a local halaqah or a trusted teacher in your community.",
      },
    ],
  };
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

export function registerHalaqahRoutes(app: Express): void {
  /**
   * POST /api/halaqah/ask
   *
   * Ask a question in the halaqah learning circle.
   * Returns structured blocks with text, ayah citations, hadith citations,
   * scholarly notes, and further study recommendations.
   */
  app.post("/api/halaqah/ask", aiRateLimiter, async (req, res) => {
    try {
      const validationResult = halaqahMessageSchema.safeParse(req.body);
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

      const { question, sessionId: providedSessionId } = validationResult.data;
      const sessionId = providedSessionId || randomUUID();

      // Validation mode guard
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        req.logger.info("Validation mode: returning placeholder halaqah response");
        return res.json(getValidationModeResponse(sessionId));
      }

      if (!isAnthropicConfigured()) {
        return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
          createErrorResponse(
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            ERROR_CODES.AI_SERVICE_UNAVAILABLE,
            req.id,
            "Service not configured.",
          ),
        );
      }

      // Input validation
      const inputValidation = validateAndSanitizeInput(question);
      if (!inputValidation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT,
            req.id,
            "Invalid input",
          ),
        );
      }

      const sanitizedQuestion = inputValidation.sanitized;

      // Free user daily limit check
      const userId = req.auth?.userId;
      if (userId) {
        const { status } = await billingService.getBillingStatus(userId);
        const isPaid = billingService.isPaidUser(status);
        if (!isPaid) {
          const todayUsage = getHalaqahUsageToday(userId);
          if (todayUsage >= FREE_DAILY_LIMIT) {
            return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json(
              createErrorResponse(
                HTTP_STATUS.PAYMENT_REQUIRED,
                ERROR_CODES.PAYMENT_REQUIRED,
                req.id,
                "Upgrade to Qamar Plus for unlimited halaqah sessions",
              ),
            );
          }
        }
      }

      await Sentry.startSpan(
        { name: "POST /api/halaqah/ask", op: "ai.halaqah" },
        async () => {
          // Get/create session
          const session = getOrCreateHalaqahSession(sessionId);

          // Search Islamic knowledge base for relevant sources
          let islamicContext: IslamicContext | undefined;
          let knowledgeResults;

          const isIslamic = detectIslamicQuery(sanitizedQuestion) || isIslamicKnowledgeQuery(sanitizedQuestion);

          if (isIslamic) {
            await Sentry.startSpan(
              { name: "halaqah_knowledge_search", op: "ai.halaqah.knowledge" },
              async () => {
                islamicContext = await fetchIslamicContext(sanitizedQuestion);
                knowledgeResults = findRelevantContent(sanitizedQuestion, 5);
              },
            );
          }

          // Build system prompt with knowledge context
          const systemPrompt = buildHalaqahSystemPrompt(islamicContext, knowledgeResults);

          // Build messages from session history
          const messages: Array<{ role: "user" | "assistant"; content: string }> = [
            ...session.history,
            { role: "user", content: sanitizedQuestion },
          ];

          // Call Claude
          const response = await Sentry.startSpan(
            { name: "claude_api_call", op: "ai.halaqah.claude" },
            async () => {
              return getAnthropicClient().messages.create({
                model: "claude-sonnet-4-5",
                max_tokens: 2000,
                system: systemPrompt,
                messages,
              });
            },
          );

          const firstBlock = response.content[0];
          const rawText =
            firstBlock?.type === "text"
              ? firstBlock.text
              : '{"blocks":[{"type":"text","content":"That is a wonderful question. Let me share what I can, and I encourage you to bring this to a scholar you trust for deeper guidance."}]}';

          // Parse response into typed blocks
          const blocks = parseHalaqahResponse(rawText);

          // Extract text content for history
          const assistantText = blocks
            .filter((b): b is HalaqahTextBlock => b.type === "text")
            .map((b) => b.content)
            .join("\n");

          // Update session history
          session.history = [
            ...session.history,
            { role: "user" as const, content: sanitizedQuestion },
            { role: "assistant" as const, content: assistantText || rawText },
          ].slice(-30); // Keep last 30 messages

          // Track topics explored from scholarly notes
          for (const block of blocks) {
            if (block.type === "scholarly_note") {
              session.scholarlyNotesCount++;
            }
            if (block.type === "further_study") {
              session.topicsExplored.push(...block.topics);
            }
          }

          updateHalaqahSession(sessionId, {
            topicsExplored: session.topicsExplored,
            scholarlyNotesCount: session.scholarlyNotesCount,
          });

          // Increment free user usage counter
          if (userId) {
            incrementHalaqahUsage(userId);
          }

          res.json({
            sessionId,
            blocks,
          });
        },
      );
    } catch (error) {
      req.logger.error("Halaqah question failed", error, {
        operation: "halaqah_ask",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to process your question",
        ),
      );
    }
  });

  /**
   * GET /api/halaqah/topics
   *
   * Returns suggested topics organized by category for the halaqah.
   */
  app.get("/api/halaqah/topics", (_req, res) => {
    res.json({
      topics: HALAQAH_TOPICS,
    });
  });
}
