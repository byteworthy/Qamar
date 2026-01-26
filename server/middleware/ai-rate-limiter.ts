/**
 * AI Endpoint Rate Limiter
 *
 * Protects expensive Claude API endpoints from abuse and cost attacks.
 * More restrictive than global rate limiter to prevent API cost spikes.
 */

import rateLimit from "express-rate-limit";

/**
 * Rate limiter for AI-powered endpoints (analyze, reframe, practice, dua, insights)
 *
 * Limits:
 * - 10 requests per minute per IP
 * - Prevents rapid-fire API abuse
 * - Protects against cost attacks ($$ per request)
 *
 * Apply to: /api/analyze, /api/reframe, /api/practice, /api/duas/contextual, /api/insights/*
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 requests per minute per IP
  message: {
    error: "Too many AI requests. Please wait a moment before trying again.",
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks and other non-AI endpoints
  skip: (req) => {
    return req.path === "/api/health" || req.path === "/api/reflection/save";
  },
});

/**
 * Even more restrictive rate limiter for insight generation
 * (computationally expensive - processes 15 reflections)
 *
 * Limits:
 * - 3 requests per 5 minutes per IP
 */
export const insightRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 3, // 3 requests per 5 minutes per IP
  message: {
    error:
      "Insight generation is resource-intensive. Please wait 5 minutes before requesting again.",
    retryAfter: 300,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
