import type { Express } from "express";
import { storage } from "../storage";
import { billingService } from "../billing";
import {
  inferInnerState,
  detectAssumptionPattern,
} from "../stateInference";
import { encryptData, decryptData } from "../encryption";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import {
  reflectionSaveSchema,
  FREE_DAILY_LIMIT,
  FREE_HISTORY_LIMIT,
} from "./constants";

export function registerReflectionRoutes(app: Express): void {
  // POST /api/reflection/save
  // SECURITY: userId is derived from server-side session, NOT from request body.
  // ENCRYPTION: Sensitive fields are encrypted before storage
  app.post("/api/reflection/save", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.AUTH_REQUIRED,
            req.id
          )
        );
      }

      // Validate request body
      const validationResult = reflectionSaveSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_FAILED,
            req.id,
            "Invalid request data",
            { validationErrors: validationResult.error.issues }
          )
        );
      }

      const { thought, patterns, reframe, intention, practice, anchor } =
        validationResult.data;
      const distortions = patterns; // backward compat for DB field

      const user = await storage.getOrCreateUser(userId);
      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        const todayCount = await storage.getTodayReflectionCount(userId);
        if (todayCount >= FREE_DAILY_LIMIT) {
          return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json(
            createErrorResponse(
              HTTP_STATUS.PAYMENT_REQUIRED,
              ERROR_CODES.PAYMENT_REQUIRED,
              req.id,
              "Upgrade to Qamar Plus for unlimited reflections"
            )
          );
        }
      }

      const stateInference = inferInnerState(thought);
      const assumptionDetection = detectAssumptionPattern(thought);

      const detectedState = stateInference.state;
      const keyAssumption =
        assumptionDetection.detected && assumptionDetection.assumption
          ? assumptionDetection.assumption
          : undefined;

      // ENCRYPT SENSITIVE FIELDS before saving
      let encryptedThought: string;
      let encryptedReframe: string;
      let encryptedIntention: string | undefined;
      try {
        encryptedThought = encryptData(thought);
        encryptedReframe = encryptData(reframe);
        encryptedIntention = intention ? encryptData(intention) : undefined;
      } catch (error) {
        req.logger.error("Encryption failed for reflection", error, {
          operation: "encrypt_reflection",
        });
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            createErrorResponse(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              ERROR_CODES.INTERNAL_ERROR,
              req.id,
              "Failed to securely store reflection"
            )
          );
      }

      await storage.saveReflection(userId, {
        thought: encryptedThought,
        distortions,
        reframe: encryptedReframe,
        intention: encryptedIntention || "",
        practice,
        keyAssumption,
        detectedState,
        anchor,
      });

      res.json({
        success: true,
        detectedState: isPaid ? detectedState : undefined,
      });
    } catch (error) {
      req.logger.error("Failed to save reflection", error, {
        operation: "save_reflection",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to save reflection"
        )
      );
    }
  });

  // GET /api/reflection/history
  // SECURITY: userId is derived from server-side session, NOT from query params.
  // DECRYPTION: Sensitive fields are decrypted before sending to client
  app.get("/api/reflection/history", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.AUTH_REQUIRED,
            req.id
          )
        );
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      const limit = isPaid ? undefined : FREE_HISTORY_LIMIT;
      const history = await storage.getReflectionHistory(userId, limit);

      // DECRYPT SENSITIVE FIELDS before sending to client
      const decryptedHistory = history.map((reflection) => {
        try {
          return {
            ...reflection,
            thought: decryptData(reflection.thought),
            reframe: decryptData(reflection.reframe),
            intention: reflection.intention
              ? decryptData(reflection.intention)
              : undefined,
          };
        } catch (error) {
          req.logger.error("Decryption failed for reflection", error, {
            reflectionId: reflection.id,
            operation: "decrypt_reflection",
          });
          return {
            ...reflection,
            thought: "[Unable to decrypt]",
            reframe: "[Unable to decrypt]",
            intention: reflection.intention ? "[Unable to decrypt]" : undefined,
          };
        }
      });

      res.json({
        history: decryptedHistory,
        isLimited: !isPaid,
        limit: isPaid ? null : FREE_HISTORY_LIMIT,
      });
    } catch (error) {
      req.logger.error("Failed to fetch reflection history", error, {
        operation: "fetch_history",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to fetch history"
        )
      );
    }
  });

  // DELETE /api/reflection/:id
  // Delete a single reflection by ID
  // SECURITY: userId is derived from server-side session, ensures user owns the reflection
  app.delete("/api/reflection/:id", async (req, res) => {
    try {
      const userId = req.auth?.userId;
      const sessionId = parseInt(req.params.id, 10);

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.AUTH_REQUIRED,
            req.id
          )
        );
      }

      if (isNaN(sessionId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_INPUT,
            req.id,
            "Invalid reflection ID"
          )
        );
      }

      const deletedCount = await storage.deleteReflection(userId, sessionId);

      if (deletedCount === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            req.id,
            "Reflection not found or already deleted"
          )
        );
      }

      res.json({ success: true, deletedCount });
    } catch (error) {
      req.logger.error("Failed to delete reflection", error, {
        operation: "delete_reflection",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to delete reflection"
        )
      );
    }
  });

  // GET /api/reflection/can-reflect
  // SECURITY: userId is derived from server-side session, NOT from query params.
  app.get("/api/reflection/can-reflect", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.json({ canReflect: true, remaining: FREE_DAILY_LIMIT });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (isPaid) {
        return res.json({ canReflect: true, remaining: null, isPaid: true });
      }

      const todayCount = await storage.getTodayReflectionCount(userId);
      const remaining = Math.max(0, FREE_DAILY_LIMIT - todayCount);

      res.json({
        canReflect: remaining > 0,
        remaining,
        isPaid: false,
      });
    } catch (error) {
      req.logger.error("Failed to check reflection limit", error, {
        operation: "check_reflection_limit",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to check limit"
        )
      );
    }
  });

  // GET /api/reflection/patterns
  // PRO ONLY: Returns pattern data for insights screen
  app.get("/api/reflection/patterns", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.AUTH_REQUIRED,
            req.id
          )
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

      if (reflectionCount < 3) {
        return res.json({
          summary: null,
          assumptions: [],
        });
      }

      const recentReflections = await storage.getRecentReflections(userId, 15);

      const assumptionCounts: Record<string, number> = {};
      recentReflections.forEach((r) => {
        if (r.keyAssumption) {
          assumptionCounts[r.keyAssumption] =
            (assumptionCounts[r.keyAssumption] || 0) + 1;
        }
      });

      const assumptions = Object.entries(assumptionCounts)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const states = recentReflections
        .filter((r) => r.detectedState)
        .map((r) => r.detectedState);
      const distortions = recentReflections.flatMap((r) => r.distortions || []);

      const mostCommonState =
        states.length > 0
          ? states.sort(
              (a, b) =>
                states.filter((v) => v === b).length -
                states.filter((v) => v === a).length,
            )[0]
          : null;

      const mostCommonDistortion =
        distortions.length > 0
          ? distortions.sort(
              (a, b) =>
                distortions.filter((v) => v === b).length -
                distortions.filter((v) => v === a).length,
            )[0]
          : null;

      let summary = "";
      if (mostCommonState && mostCommonDistortion) {
        summary = `Your reflections often arise from feelings of ${mostCommonState}. The thinking pattern "${mostCommonDistortion}" appears frequently. This is observation, not judgment - just data to help you see yourself more clearly.`;
      } else if (reflectionCount >= 3) {
        summary = `You've completed ${reflectionCount} reflections. Patterns are still emerging. Keep reflecting - clarity comes with consistency.`;
      }

      res.json({
        summary: summary || null,
        assumptions,
      });
    } catch (error) {
      req.logger.error("Failed to fetch patterns", error, {
        operation: "fetch_patterns",
      });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          "Failed to fetch patterns"
        )
      );
    }
  });
}
