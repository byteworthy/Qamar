import rateLimit from "express-rate-limit";

/**
 * Rate limiting middleware for API endpoints
 *
 * Production mode:
 * - Enforces strict limits to prevent abuse
 * - Different limits for different endpoint types
 *
 * Development/validation mode:
 * - More lenient limits for testing
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * General API rate limiter
 * Applies to most endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // 100 requests per 15 min in prod, 1000 in dev
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip health checks
    return req.path === "/api/health";
  },
});

/**
 * Strict rate limiter for AI-powered endpoints
 * These are expensive and should be limited more strictly
 */
export const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProduction ? 10 : 100, // 10 requests per minute in prod, 100 in dev
  message: {
    error:
      "AI endpoint rate limit exceeded. Please wait before making another request.",
    code: "AI_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication endpoint rate limiter
 * Prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 50, // 5 login attempts per 15 min in prod, 50 in dev
  message: {
    error: "Too many authentication attempts, please try again later.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
});

/**
 * Webhook rate limiter
 * For external webhooks (Stripe, etc.)
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProduction ? 100 : 1000, // 100 requests per minute
  message: {
    error: "Webhook rate limit exceeded.",
    code: "WEBHOOK_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin endpoint rate limiter
 * Very strict to prevent brute force attacks on admin token
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 50, // Only 5 attempts per 15 min in production
  message: {
    error: "Too many admin requests. Please try again later.",
    code: "ADMIN_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all attempts (even successful ones)
});
