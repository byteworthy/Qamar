/**
 * Khalil API Routes
 *
 * Provides the Khalil conversational muhasaba endpoint.
 * Integrates crisis detection, Islamic context, and the canonical orchestrator.
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
import { getAnthropicClient } from "./constants";
import {
  detectCrisis,
  CRISIS_RESOURCES,
  validateAndSanitizeInput,
} from "../ai-safety";
import { detectIslamicQuery, fetchIslamicContext } from "../services/islamic-context";
import { buildKhalilSystemPrompt } from "../services/khalil-prompts";
import {
  getOrCreateSession,
  updateSession,
} from "../services/khalil-session-store";
import type { IslamicContext } from "../services/islamic-context";

// =============================================================================
// VALIDATION
// =============================================================================

const khalilMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

// =============================================================================
// TYPES
// =============================================================================

interface KhalilTextBlock {
  type: "text";
  content: string;
}

interface KhalilWaswasaBlock {
  type: "waswasa_card";
  whispers: string[];
  insight: string;
}

interface KhalilBasiraBlock {
  type: "basira_card";
  whisper: string;
  clarity: string;
  ayahOrHadith?: string;
}

interface KhalilDhikrBlock {
  type: "dhikr_card";
  title: string;
  steps: string[];
  duration: string;
}

interface KhalilMuhasabaBlock {
  type: "muhasaba_card";
  summary: string;
  whispersFound: string[];
  clarity: string;
  duaForNext: string;
}

type KhalilResponseBlock =
  | KhalilTextBlock
  | KhalilWaswasaBlock
  | KhalilBasiraBlock
  | KhalilDhikrBlock
  | KhalilMuhasabaBlock;

// =============================================================================
// HELPERS
// =============================================================================

function parseKhalilResponse(raw: string): KhalilResponseBlock[] {
  try {
    // Try to parse as JSON
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

function getValidationModeResponse(): {
  sessionId: string;
  blocks: KhalilResponseBlock[];
  state: string;
} {
  return {
    sessionId: randomUUID(),
    blocks: [
      {
        type: "text",
        content:
          "[VALIDATION MODE] Assalamu alaikum, I'm Khalil. Configure ANTHROPIC_API_KEY for real conversations.",
      },
    ],
    state: "listening",
  };
}

// =============================================================================
// ROUTE REGISTRATION
// =============================================================================

export function registerKhalilRoutes(app: Express): void {
  /**
   * POST /api/khalil/message
   *
   * Send a message to Khalil for conversational muhasaba.
   */
  app.post("/api/khalil/message", aiRateLimiter, async (req, res) => {
    try {
      const validationResult = khalilMessageSchema.safeParse(req.body);
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

      const { message, sessionId: providedSessionId } = validationResult.data;
      const sessionId = providedSessionId || randomUUID();

      // Validation mode guard
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        return res.json(getValidationModeResponse());
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

      // Input validation
      const inputValidation = validateAndSanitizeInput(message);
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

      const sanitizedMessage = inputValidation.sanitized;

      // Crisis detection — highest priority
      const crisisCheck = detectCrisis(sanitizedMessage);
      if (crisisCheck.level === "emergency" || crisisCheck.level === "urgent") {
        const resources =
          crisisCheck.level === "emergency"
            ? CRISIS_RESOURCES.emergency
            : CRISIS_RESOURCES.urgent;

        return res.json({
          sessionId,
          blocks: [
            {
              type: "text",
              content:
                crisisCheck.level === "emergency"
                  ? "What you're going through sounds incredibly painful. Please reach out to someone who can truly help right now. You are not alone, and your life has immense value in the sight of Allah."
                  : "This sounds really heavy. You don't have to carry this alone. Please consider reaching out to someone who can support you.",
            },
          ],
          state: "crisis",
          crisis: true,
          crisisLevel: crisisCheck.level,
          resources,
        });
      }

      await Sentry.startSpan(
        { name: "POST /api/khalil/message", op: "ai.khalil" },
        async () => {
          // Get/create session
          const session = getOrCreateSession(sessionId);

          // Detect Islamic context
          let islamicContext: IslamicContext | undefined;
          if (detectIslamicQuery(sanitizedMessage)) {
            islamicContext = await fetchIslamicContext(sanitizedMessage);
          }

          // Build system prompt
          const systemPrompt = buildKhalilSystemPrompt(islamicContext);

          // Build messages from session history
          const messages: Array<{ role: "user" | "assistant"; content: string }> = [
            ...session.history,
            { role: "user", content: sanitizedMessage },
          ];

          // Call Claude
          const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1500,
            system: systemPrompt,
            messages,
          });

          const firstBlock = response.content[0];
          const rawText =
            firstBlock?.type === "text"
              ? firstBlock.text
              : '{"blocks":[{"type":"text","content":"I am here for you. Tell me more about what is on your heart."}]}';

          // Parse response into typed blocks
          const blocks = parseKhalilResponse(rawText);

          // Extract text content for history
          const assistantText = blocks
            .filter((b): b is KhalilTextBlock => b.type === "text")
            .map((b) => b.content)
            .join("\n");

          // Update session
          session.history = [
            ...session.history,
            { role: "user" as const, content: sanitizedMessage },
            { role: "assistant" as const, content: assistantText || rawText },
          ].slice(-30); // Keep last 30 messages

          // Track whispers and clarity from cards
          for (const block of blocks) {
            if (block.type === "waswasa_card") {
              session.whispersFound.push(...block.whispers);
            }
            if (block.type === "basira_card") {
              session.clarityGained.push(block.clarity);
            }
          }

          // Determine state from block types
          const hasWaswasa = blocks.some((b) => b.type === "waswasa_card");
          const hasBasira = blocks.some((b) => b.type === "basira_card");
          const hasDhikr = blocks.some((b) => b.type === "dhikr_card");
          const hasMuhasaba = blocks.some((b) => b.type === "muhasaba_card");

          let state = session.state;
          if (hasMuhasaba) state = "muhasaba";
          else if (hasDhikr) state = "dhikr";
          else if (hasBasira) state = "basira";
          else if (hasWaswasa) state = "exploring";

          updateSession(sessionId, { state });

          res.json({
            sessionId,
            blocks,
            state,
          });
        },
      );
    } catch (error) {
      req.logger.error("Khalil message failed", error, {
        operation: "khalil_message",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to process message",
        ),
      );
    }
  });
}
