/**
 * Health Check
 *
 * Provides health status endpoint for load balancers and monitoring.
 * Returns 200 even if DB is not configured (with db.connected = false).
 */

import type { Express, Request, Response } from "express";
import {
  isRateLimitEnabled,
  healthCheckRateLimiter,
} from "./middleware/production";
import { isSentryEnabled } from "./sentry";
import { defaultLogger } from "./utils/logger";

// =============================================================================
// DATABASE CONNECTIVITY CHECK
// =============================================================================

/**
 * Check if database URL is configured.
 */
function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Check database connectivity.
 * Returns true if connected, false otherwise.
 */
async function checkDatabaseConnection(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    // Dynamic import to avoid loading db if not configured
    const { db } = await import("./db");

    const timeoutMs = 2000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error("DB health check timed out"));
      }, timeoutMs);
    });

    // Simple query to check connectivity with timeout
    await Promise.race([db.execute("SELECT 1"), timeoutPromise]);
    return true;
  } catch (error) {
    defaultLogger.warn("[Health] Database check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// =============================================================================
// HEALTH STATUS TYPES
// =============================================================================

interface HealthStatus {
  status: "ok" | "degraded";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      configured: boolean;
      connected: boolean;
    };
    ai: {
      configured: boolean;
    };
    sentry: {
      configured: boolean;
    };
    rateLimit: {
      enabled: boolean;
    };
  };
}

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

/**
 * Get current health status.
 * Always returns 200 (use status field for degraded state).
 */
async function getHealthStatus(): Promise<HealthStatus> {
  const dbConfigured = isDatabaseConfigured();
  const dbConnected = dbConfigured ? await checkDatabaseConnection() : false;

  const aiConfigured = Boolean(process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
  const sentryConfigured = isSentryEnabled();
  const rateLimitEnabled = isRateLimitEnabled();

  // Determine overall status
  // "degraded" if essential services are down but app is still running
  const status: "ok" | "degraded" =
    dbConfigured && !dbConnected ? "degraded" : "ok";

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    uptime: process.uptime(),
    checks: {
      database: {
        configured: dbConfigured,
        connected: dbConnected,
      },
      ai: {
        configured: aiConfigured,
      },
      sentry: {
        configured: sentryConfigured,
      },
      rateLimit: {
        enabled: rateLimitEnabled,
      },
    },
  };
}

/**
 * Register health check route.
 * GET /health - Returns health status (always 200).
 * Rate limited to 60 requests per minute per IP to prevent abuse.
 */
export function registerHealthRoute(app: Express): void {
  app.get(
    "/health",
    healthCheckRateLimiter,
    async (_req: Request, res: Response) => {
      try {
        const health = await getHealthStatus();
        res.json(health);
      } catch (error) {
        // Even on error, return 200 with error info
        res.json({
          status: "degraded",
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || "1.0.0",
          uptime: process.uptime(),
          error: "Health check failed",
          checks: {
            database: { configured: false, connected: false },
            ai: { configured: false },
            sentry: { configured: false },
            rateLimit: { enabled: false },
          },
        });
      }
    },
  );

  defaultLogger.info("[Health] Health check endpoint registered: GET /health");
}
