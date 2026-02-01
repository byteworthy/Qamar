/**
 * Notification API Routes for Noor
 *
 * Handles push token registration and server-triggered notifications
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  sendPushNotification,
  sendPushNotifications,
  sendInactivityReminder,
  isValidPushToken,
  type PushToken,
} from "./notifications";

const router = Router();

// =============================================================================
// IN-MEMORY TOKEN STORAGE (Replace with database in production)
// =============================================================================

// For production, store these in your database with the users table
const pushTokens: Map<string, PushToken> = new Map();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const registerTokenSchema = z.object({
  token: z.string().min(1),
  userId: z.string().optional(),
  platform: z.enum(["ios", "android", "web"]),
  deviceName: z.string().optional(),
});

const sendNotificationSchema = z.object({
  tokens: z.array(z.string()).optional(),
  userId: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

const broadcastSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /api/notifications/register
 * Register a device for push notifications
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerTokenSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        details: parsed.error.errors,
      });
      return;
    }

    const { token, userId, platform, deviceName } = parsed.data;

    // Validate token format
    if (!isValidPushToken(token)) {
      res.status(400).json({
        error: "Invalid push token format",
      });
      return;
    }

    // Store token
    const pushToken: PushToken = {
      token,
      userId,
      platform,
      deviceName,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    pushTokens.set(token, pushToken);

    console.log(
      `[Notifications] Registered token for ${userId || "anonymous"} on ${platform}`,
    );

    res.json({
      success: true,
      message: "Push token registered",
    });
  } catch (error) {
    console.error("[Notifications] Registration error:", error);
    res.status(500).json({
      error: "Failed to register push token",
    });
  }
});

/**
 * DELETE /api/notifications/unregister
 * Unregister a device from push notifications
 */
router.delete("/unregister", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token required" });
      return;
    }

    pushTokens.delete(token);

    res.json({
      success: true,
      message: "Push token unregistered",
    });
  } catch (error) {
    console.error("[Notifications] Unregister error:", error);
    res.status(500).json({
      error: "Failed to unregister push token",
    });
  }
});

/**
 * POST /api/notifications/send
 * Send a push notification to specific tokens or user
 * (Admin/internal use)
 */
router.post("/send", async (req: Request, res: Response) => {
  try {
    const parsed = sendNotificationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        details: parsed.error.errors,
      });
      return;
    }

    const { tokens, userId, title, body, data } = parsed.data;

    let targetTokens: string[] = [];

    // If tokens provided directly, use them
    if (tokens && tokens.length > 0) {
      targetTokens = tokens;
    }
    // If userId provided, find their tokens
    else if (userId) {
      for (const [token, pushToken] of pushTokens) {
        if (pushToken.userId === userId) {
          targetTokens.push(token);
        }
      }
    }

    if (targetTokens.length === 0) {
      res.status(400).json({
        error: "No valid tokens found",
      });
      return;
    }

    const result = await sendPushNotifications(targetTokens, {
      title,
      body,
      data,
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[Notifications] Send error:", error);
    res.status(500).json({
      error: "Failed to send notification",
    });
  }
});

/**
 * POST /api/notifications/broadcast
 * Send a push notification to all registered devices
 * (Admin use - should be protected)
 */
router.post("/broadcast", async (req: Request, res: Response) => {
  try {
    const parsed = broadcastSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        details: parsed.error.errors,
      });
      return;
    }

    const { title, body, data } = parsed.data;

    const allTokens = Array.from(pushTokens.keys());

    if (allTokens.length === 0) {
      res.json({
        success: true,
        message: "No registered devices",
        result: { successful: 0, failed: 0, errors: [] },
      });
      return;
    }

    const result = await sendPushNotifications(allTokens, {
      title,
      body,
      data,
    });

    console.log(
      `[Notifications] Broadcast sent to ${allTokens.length} devices`,
    );

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[Notifications] Broadcast error:", error);
    res.status(500).json({
      error: "Failed to broadcast notification",
    });
  }
});

/**
 * POST /api/notifications/inactivity-check
 * Trigger inactivity reminders (called by cron job)
 * (Internal use - should be protected)
 */
router.post("/inactivity-check", async (req: Request, res: Response) => {
  try {
    // In production, query your database for:
    // 1. Users who haven't reflected in 3+ days
    // 2. Their notification settings (if they have inactivity reminders enabled)
    // 3. Their push tokens

    // For now, we'll just demonstrate the pattern
    const { daysSinceLastActivity = 3, tokens } = req.body;

    if (!tokens || tokens.length === 0) {
      res.json({
        success: true,
        message: "No tokens to notify",
      });
      return;
    }

    const result = await sendInactivityReminder(tokens, daysSinceLastActivity);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[Notifications] Inactivity check error:", error);
    res.status(500).json({
      error: "Failed to send inactivity reminders",
    });
  }
});

/**
 * GET /api/notifications/status
 * Get notification registration status for current user
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token required" });
      return;
    }

    const registered = pushTokens.has(token);
    const tokenData = pushTokens.get(token);

    res.json({
      registered,
      platform: tokenData?.platform,
      lastUsed: tokenData?.lastUsed,
    });
  } catch (error) {
    console.error("[Notifications] Status check error:", error);
    res.status(500).json({
      error: "Failed to check notification status",
    });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics (admin)
 */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const tokens = Array.from(pushTokens.values());

    const stats = {
      totalRegistered: tokens.length,
      byPlatform: {
        ios: tokens.filter((t) => t.platform === "ios").length,
        android: tokens.filter((t) => t.platform === "android").length,
        web: tokens.filter((t) => t.platform === "web").length,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("[Notifications] Stats error:", error);
    res.status(500).json({
      error: "Failed to get notification stats",
    });
  }
});

// =============================================================================
// HELPER: Get tokens for database integration
// =============================================================================

/**
 * Get all registered push tokens.
 *
 * Used by background jobs (e.g., inactivity reminders) to retrieve
 * all registered devices for batch notifications.
 *
 * @returns Array of all registered PushToken objects
 *
 * @remarks
 * In production, this should query the database instead of in-memory storage.
 */
export function getAllPushTokens(): PushToken[] {
  return Array.from(pushTokens.values());
}

/**
 * Get all push tokens registered to a specific user.
 *
 * A user may have multiple tokens if they use multiple devices.
 *
 * @param userId - The user ID to look up tokens for
 * @returns Array of token strings belonging to the user
 */
export function getTokensForUser(userId: string): string[] {
  const tokens: string[] = [];
  for (const [token, pushToken] of pushTokens) {
    if (pushToken.userId === userId) {
      tokens.push(token);
    }
  }
  return tokens;
}

/**
 * Update the lastUsed timestamp for a push token.
 *
 * Call this when a notification is successfully delivered or when
 * the user opens the app to track token activity.
 *
 * @param token - The push token to update
 */
export function updateTokenLastUsed(token: string): void {
  const existing = pushTokens.get(token);
  if (existing) {
    existing.lastUsed = new Date();
    pushTokens.set(token, existing);
  }
}

export default router;
