/**
 * Daily Quota Middleware
 *
 * Shared daily usage tracking and enforcement for interactive endpoints
 * (tutor, pronunciation, translation). Free users are limited to
 * FREE_DAILY_LIMIT requests per day; paid users have unlimited access.
 *
 * Usage tracking is in-memory (resets on server restart).
 * Route handlers call incrementAIUsage() after a successful response
 * so that failed requests do not count against the quota.
 */

import type { Request, Response, NextFunction } from "express";
import { FREE_DAILY_LIMIT } from "../routes/constants";
import { billingService } from "../billing";

// =============================================================================
// DAILY USAGE TRACKING
// =============================================================================

export const aiDailyUsage = new Map<string, { count: number; date: string }>();

export function getAIUsageToday(userId: string): number {
  const today = new Date().toISOString().split("T")[0];
  const usage = aiDailyUsage.get(userId);
  if (!usage || usage.date !== today) {
    aiDailyUsage.set(userId, { count: 0, date: today });
    return 0;
  }
  return usage.count;
}

export function incrementAIUsage(userId: string): void {
  const today = new Date().toISOString().split("T")[0];
  const usage = aiDailyUsage.get(userId);
  if (!usage || usage.date !== today) {
    aiDailyUsage.set(userId, { count: 1, date: today });
  } else {
    usage.count++;
  }
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Express middleware that enforces the daily AI quota for free users.
 * Paid users pass through without restriction.
 * Does NOT increment usage — the route handler is responsible for that
 * after a successful AI response.
 */
export async function aiDailyQuotaMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.ip ?? "anonymous";

  const { status } = await billingService.getBillingStatus(userId);
  if (billingService.isPaidUser(status)) {
    next();
    return;
  }

  const count = getAIUsageToday(userId);
  if (count >= FREE_DAILY_LIMIT) {
    res.status(429).json({
      error: "Daily AI limit reached",
      limit: FREE_DAILY_LIMIT,
      used: count,
      upgradeRequired: true,
    });
    return;
  }

  next();
}
