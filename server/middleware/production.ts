/**
 * Production Middleware
 *
 * Request ID generation and rate limiting for production readiness.
 * Rate limiting is disabled by default - set RATE_LIMIT_ENABLED=true to enable.
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// =============================================================================
// REQUEST ID MIDDLEWARE
// =============================================================================

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Adds a unique request ID to each request.
 * The ID is available as req.requestId and in the X-Request-ID response header.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Use existing request ID from client or generate new one
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
}

// =============================================================================
// RATE LIMITER
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (simple implementation, not for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

/**
 * Check if rate limiting is enabled.
 * - Production: enabled by default (set RATE_LIMIT_ENABLED=false to disable)
 * - Development: disabled by default (set RATE_LIMIT_ENABLED=true to enable)
 */
export function isRateLimitEnabled(): boolean {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // In production, enabled unless explicitly disabled
    return process.env.RATE_LIMIT_ENABLED !== "false";
  }

  // In development, disabled unless explicitly enabled
  return process.env.RATE_LIMIT_ENABLED === "true";
}

/**
 * Get client identifier for rate limiting (IP address or forwarded IP).
 */
function getClientIdentifier(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(
      ",",
    );
    return ips[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Clean up expired entries from the rate limit store.
 * Called periodically to prevent memory leaks.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Rate limiter middleware.
 * Disabled by default - set RATE_LIMIT_ENABLED=true to enable.
 *
 * When enabled:
 * - Limits to 100 requests per minute per IP
 * - Returns 429 when exceeded
 * - Includes rate limit headers in response
 */
export function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip if rate limiting is disabled
  if (!isRateLimitEnabled()) {
    return next();
  }

  const clientId = getClientIdentifier(req);
  const now = Date.now();

  let entry = rateLimitStore.get(clientId);

  // Initialize or reset entry if expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  entry.count++;
  rateLimitStore.set(clientId, entry);

  // Set rate limit headers
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

  res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", resetSeconds.toString());

  // Check if limit exceeded
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader("Retry-After", resetSeconds.toString());
    res.status(429).json({
      error: "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: resetSeconds,
    });
    return;
  }

  next();
}

/**
 * Get current rate limit status for debugging.
 */
export function getRateLimitStatus(): {
  enabled: boolean;
  activeClients: number;
} {
  return {
    enabled: isRateLimitEnabled(),
    activeClients: rateLimitStore.size,
  };
}
