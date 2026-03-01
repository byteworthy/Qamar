import type { Express } from "express";
import { storage } from "../storage";
import { VALIDATION_MODE, isAnthropicConfigured } from "../config";
import {
  runManualCleanup,
  verifyAdminToken,
  isAdminEndpointEnabled,
} from "../data-retention";
import { adminLimiter } from "../middleware/rate-limit";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import { getAnthropicClient } from "./constants";

export function registerAdminHealthRoutes(app: Express): void {
  // Health check endpoint for monitoring and uptime checks
  app.get("/api/health", async (req, res) => {
    const checks = {
      database: false,
      ai: false,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      mode: VALIDATION_MODE ? "validation" : "production",
    };

    try {
      // Test 1: Database connection
      try {
        await storage.getReflectionHistory("health-check", 1);
        checks.database = true;
      } catch (dbError) {
        req.logger.error("Database health check failed", dbError);
      }

      // Test 2: AI Provider (only in production mode with configured API)
      if (!VALIDATION_MODE && isAnthropicConfigured()) {
        try {
          const client = getAnthropicClient();
          // Quick test with Haiku (cheapest model) - minimal tokens
          const testResponse = await client.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 10,
            messages: [{ role: "user", content: "health" }],
          });
          checks.ai = testResponse.content.length > 0;
        } catch (aiError) {
          req.logger.error("AI provider health check failed", aiError);
          checks.ai = false;
        }
      } else {
        // In validation mode or when AI is not configured, skip AI check
        checks.ai = true;
      }

      // Determine overall health
      const healthy = checks.database && checks.ai;

      res.status(healthy ? 200 : 503).json({
        status: healthy ? "healthy" : "degraded",
        checks,
        ...(healthy
          ? {}
          : {
              error:
                !checks.database && !checks.ai
                  ? "Database and AI provider unavailable"
                  : !checks.database
                    ? "Database unavailable"
                    : "AI provider unavailable",
            }),
      });
    } catch (error) {
      req.logger.error("Health check failed", error);
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        status: "unhealthy",
        checks,
        error: "Health check failed",
      });
    }
  });

  // ADMIN: Manual data retention cleanup trigger
  // Protected by ADMIN_TOKEN - disabled unless env var is set
  // Rate limited to prevent brute force attacks
  app.post("/api/admin/retention/run", adminLimiter, async (req, res) => {
    // Check if admin endpoint is enabled
    if (!isAdminEndpointEnabled()) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(
          createErrorResponse(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            req.id,
            "Not found",
          ),
        );
    }

    // Verify admin token
    const token = req.headers["x-admin-token"] as string | undefined;
    if (!verifyAdminToken(token)) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(
          createErrorResponse(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.AUTH_INVALID,
            req.id,
            "Unauthorized",
          ),
        );
    }

    try {
      req.logger.info("Manual retention cleanup triggered", {
        operation: "manual_cleanup",
      });
      const result = await runManualCleanup();
      res.json({
        success: true,
        message: "Data retention cleanup completed",
        result,
      });
    } catch (error) {
      req.logger.error("Manual cleanup failed", error, {
        operation: "manual_cleanup",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Cleanup failed",
          ),
        );
    }
  });
}
