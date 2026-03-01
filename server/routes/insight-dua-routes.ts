import type { Express } from "express";
import {
  aiRateLimiter,
  insightRateLimiter,
} from "../middleware/ai-rate-limiter";
import { storage } from "../storage";
import { billingService } from "../billing";
import { IslamicContentMapper } from "../islamic-content-mapper";
import {
  CanonicalOrchestrator,
  OrchestrationAuditLogger,
} from "../canonical-orchestrator";
import { loadPrompt } from "../utils/promptLoader";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import {
  duasContextualSchema,
  getAnthropicClient,
  SYSTEM_FOUNDATION,
  DUA_BY_STATE,
} from "./constants";

export function registerInsightDuaRoutes(app: Express): void {
  // GET /api/insights/summary
  // PRO ONLY: Returns pattern insight summaries for the user
  app.get("/api/insights/summary", insightRateLimiter, async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(
            createErrorResponse(
              HTTP_STATUS.UNAUTHORIZED,
              ERROR_CODES.AUTH_REQUIRED,
              req.id,
            ),
          );
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createErrorResponse(
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.PAYMENT_REQUIRED,
            req.id,
            "This feature requires Qamar Plus"
          )
        );
      }

      const reflectionCount = await storage.getReflectionCount(userId);

      if (reflectionCount < 5) {
        return res.json({
          available: false,
          message: "Complete 5 reflections to unlock your pattern summary.",
          reflectionCount,
          requiredCount: 5,
        });
      }

      const existingSummary = await storage.getLatestInsightSummary(userId);

      if (
        existingSummary &&
        existingSummary.reflectionCount === reflectionCount
      ) {
        return res.json({
          available: true,
          summary: existingSummary.summary,
          reflectionCount,
          generatedAt: existingSummary.generatedAt,
        });
      }

      const recentReflections = await storage.getRecentReflections(userId, 15);
      const assumptions = recentReflections
        .filter((r) => r.keyAssumption)
        .map((r) => r.keyAssumption);
      const states = recentReflections
        .filter((r) => r.detectedState)
        .map((r) => r.detectedState);
      const distortions = recentReflections.flatMap((r) => r.distortions || []);

      const summaryPrompt = `Based on these patterns from ${reflectionCount} reflections:
- Recurring assumptions: ${assumptions.join(", ") || "None detected yet"}
- Common emotional states: ${states.join(", ") || "Various"}
- Frequent distortions: ${distortions.join(", ") || "Various"}

Write a 2-3 sentence insight summary that:
1. Names the user's most common cognitive pattern without judgment
2. Notes one area where growth is already visible
3. Offers one gentle observation about what tends to trigger their distortions

Keep the tone warm, observational, not prescriptive. Do not give advice.`;

      // CANONICAL ORCHESTRATION ENFORCEMENT
      const orchestrationResult = await CanonicalOrchestrator.orchestrate({
        userInput: summaryPrompt,
        context: {
          emotionalState: "anxiety",
          distressLevel: "low",
          mode: "dua",
          conversationState: "listening",
        },
        aiResponseGenerator: async (
          safetyGuidance,
          pacingConfig,
          islamicContent,
        ) => {
          // Build Islamic content modifier if available
          const islamicModifier = islamicContent
            ? IslamicContentMapper.buildIslamicPromptModifier(islamicContent)
            : "";

          // Load generate-summary prompt
          const summaryPrompt = loadPrompt("generate-summary.txt");

          const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 256,
            system: `${SYSTEM_FOUNDATION}

${safetyGuidance}

${islamicModifier}

${summaryPrompt}`,
            messages: [
              {
                role: "user",
                content: summaryPrompt,
              },
            ],
          });

          const firstBlock = response.content[0];
          return (
            (firstBlock?.type === "text" ? firstBlock.text : null) ||
            "Your reflections show a pattern of growth. Continue observing your thoughts with curiosity."
          );
        },
      });

      // Log orchestration for audit
      OrchestrationAuditLogger.log(orchestrationResult);

      // Use orchestration response (includes fallback language if failed)
      const summary = orchestrationResult.response;

      await storage.saveInsightSummary(userId, summary, reflectionCount);

      res.json({
        available: true,
        summary,
        reflectionCount,
        generatedAt: new Date(),
      });
    } catch (error) {
      req.logger.error("Failed to generate insight summary", error, {
        operation: "generate_insight_summary",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to generate insight summary",
          ),
        );
    }
  });

  // GET /api/insights/assumptions
  // PRO ONLY: Returns the user's personal assumption library
  app.get("/api/insights/assumptions", aiRateLimiter, async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(
            createErrorResponse(
              HTTP_STATUS.UNAUTHORIZED,
              ERROR_CODES.AUTH_REQUIRED,
              req.id,
            ),
          );
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createErrorResponse(
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.PAYMENT_REQUIRED,
            req.id,
            "This feature requires Qamar Plus"
          )
        );
      }

      const assumptions = await storage.getAssumptionLibrary(userId);

      res.json({
        assumptions,
        total: assumptions.length,
      });
    } catch (error) {
      req.logger.error("Failed to fetch assumption library", error, {
        operation: "fetch_assumption_library",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to fetch assumption library",
          ),
        );
    }
  });

  // POST /api/duas/contextual
  // PRO ONLY: Returns a contextual dua based on the user's inner state
  app.post("/api/duas/contextual", aiRateLimiter, async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(
            createErrorResponse(
              HTTP_STATUS.UNAUTHORIZED,
              ERROR_CODES.AUTH_REQUIRED,
              req.id,
            ),
          );
      }

      // Validate request body
      const validationResult = duasContextualSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid request data",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { state } = validationResult.data;

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          createErrorResponse(
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.PAYMENT_REQUIRED,
            req.id,
            "This feature requires Qamar Plus"
          )
        );
      }

      const normalizedState = (state || "").toLowerCase();
      const dua = DUA_BY_STATE[normalizedState] || DUA_BY_STATE["exhaustion"];

      res.json({
        state: normalizedState || "general",
        dua,
      });
    } catch (error) {
      req.logger.error("Failed to fetch contextual dua", error, {
        operation: "fetch_contextual_dua",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to fetch contextual dua",
          ),
        );
    }
  });
}
