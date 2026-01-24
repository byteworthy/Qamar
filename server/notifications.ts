/**
 * Server-Side Push Notification Service for Noor
 *
 * Handles sending push notifications via Expo's Push API
 * for inactivity reminders, feature announcements, etc.
 */

import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// Create a new Expo SDK client
const expo = new Expo();

// =============================================================================
// TYPES
// =============================================================================

export interface PushToken {
  token: string;
  userId?: string;
  platform: "ios" | "android" | "web";
  deviceName?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: "default" | null;
  channelId?: string; // Android only
  priority?: "default" | "normal" | "high";
  ttl?: number; // Time to live in seconds
}

export interface SendResult {
  successful: number;
  failed: number;
  errors: string[];
}

// =============================================================================
// ISLAMIC-THEMED MESSAGE TEMPLATES
// =============================================================================

export const SERVER_NOTIFICATION_TEMPLATES = {
  inactivity3Day: [
    {
      title: "Salaam 🌙",
      body: "It's been a few days. Your thoughts matter.",
    },
    {
      title: "Noor",
      body: "We haven't seen you in a while. How are you holding up?",
    },
    {
      title: "💚",
      body: "Small steps, sincere intentions. Come back when ready.",
    },
  ],
  inactivity7Day: [
    {
      title: "Checking in",
      body: "A week has passed. Your reflection practice awaits.",
    },
    {
      title: "Noor misses you",
      body: "When you're ready, we're here.",
    },
  ],
  inactivity14Day: [
    {
      title: "You're not alone",
      body: "Whenever you need it, Noor is here to help you reflect.",
    },
  ],
  weeklyInsights: [
    {
      title: "Weekly Reflection ✨",
      body: "See what patterns emerged this week.",
    },
    {
      title: "Your Week in Review",
      body: "New insights are ready for you.",
    },
  ],
  featureAnnouncement: [
    {
      title: "New in Noor 🌟",
      body: "Discover new ways to reflect and grow.",
    },
  ],
  ramadanReminder: [
    {
      title: "Ramadan Mubarak 🌙",
      body: "A blessed month for reflection and renewal.",
    },
  ],
};

// =============================================================================
// PUSH NOTIFICATION SENDER
// =============================================================================

/**
 * Send push notifications to multiple devices using Expo's push service.
 *
 * This function handles:
 * - Token validation (filters out invalid Expo push tokens)
 * - Message chunking (Expo recommends max 100 per request)
 * - Error collection for monitoring
 *
 * @param tokens - Array of Expo push tokens to send notifications to
 * @param notification - The notification payload including title, body, and optional data
 * @returns Promise resolving to send results with success/failure counts and errors
 *
 * @example
 * ```ts
 * const result = await sendPushNotifications(
 *   ['ExponentPushToken[xxx]', 'ExponentPushToken[yyy]'],
 *   { title: 'Hello', body: 'World', data: { screen: 'Home' } }
 * );
 * console.log(`Sent: ${result.successful}, Failed: ${result.failed}`);
 * ```
 */
export async function sendPushNotifications(
  tokens: string[],
  notification: NotificationPayload,
): Promise<SendResult> {
  const result: SendResult = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  // Filter valid Expo push tokens
  const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));
  const invalidCount = tokens.length - validTokens.length;

  if (invalidCount > 0) {
    result.failed += invalidCount;
    result.errors.push(`${invalidCount} invalid Expo push tokens`);
  }

  if (validTokens.length === 0) {
    return result;
  }

  // Build messages
  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: notification.sound ?? "default",
    title: notification.title,
    body: notification.body,
    data: notification.data,
    badge: notification.badge,
    channelId: notification.channelId,
    priority: notification.priority ?? "high",
    ttl: notification.ttl,
  }));

  // Chunk messages (Expo recommends max 100 per request)
  const chunks = expo.chunkPushNotifications(messages);

  // Send all chunks
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

      // Process tickets
      for (const ticket of ticketChunk) {
        if (ticket.status === "ok") {
          result.successful++;
        } else {
          result.failed++;
          if (ticket.status === "error" && ticket.message) {
            result.errors.push(ticket.message);
          }
        }
      }
    } catch (error) {
      result.failed += chunk.length;
      result.errors.push(
        `Chunk send failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  console.log(
    `[Notifications] Sent: ${result.successful} successful, ${result.failed} failed`,
  );

  return result;
}

/**
 * Send a single push notification to one device.
 *
 * Convenience wrapper around {@link sendPushNotifications} for single-device use.
 *
 * @param token - Single Expo push token
 * @param notification - The notification payload
 * @returns Promise resolving to true if sent successfully, false otherwise
 */
export async function sendPushNotification(
  token: string,
  notification: NotificationPayload,
): Promise<boolean> {
  const result = await sendPushNotifications([token], notification);
  return result.successful > 0;
}

// =============================================================================
// TEMPLATED NOTIFICATIONS
// =============================================================================

/**
 * Send inactivity reminder notifications based on days since last activity.
 *
 * Selects appropriate message template based on inactivity duration:
 * - 3-6 days: gentle check-in messages
 * - 7-13 days: slightly more direct messages
 * - 14+ days: supportive return invitation
 *
 * @param tokens - Array of Expo push tokens
 * @param daysSinceLastActivity - Number of days since the user last used the app
 * @returns Promise resolving to send results
 */
export async function sendInactivityReminder(
  tokens: string[],
  daysSinceLastActivity: number,
): Promise<SendResult> {
  let templates: { title: string; body: string }[];

  if (daysSinceLastActivity >= 14) {
    templates = SERVER_NOTIFICATION_TEMPLATES.inactivity14Day;
  } else if (daysSinceLastActivity >= 7) {
    templates = SERVER_NOTIFICATION_TEMPLATES.inactivity7Day;
  } else {
    templates = SERVER_NOTIFICATION_TEMPLATES.inactivity3Day;
  }

  const template = templates[Math.floor(Math.random() * templates.length)];

  return sendPushNotifications(tokens, {
    title: template.title,
    body: template.body,
    data: { type: "inactivity_reminder", daysSinceLastActivity },
    channelId: "general",
  });
}

/**
 * Send weekly insights notification to prompt users to review their patterns.
 *
 * @param tokens - Array of Expo push tokens
 * @returns Promise resolving to send results
 */
export async function sendWeeklyInsightsNotification(
  tokens: string[],
): Promise<SendResult> {
  const templates = SERVER_NOTIFICATION_TEMPLATES.weeklyInsights;
  const template = templates[Math.floor(Math.random() * templates.length)];

  return sendPushNotifications(tokens, {
    title: template.title,
    body: template.body,
    data: { type: "weekly_insights", navigateTo: "Insights" },
    channelId: "general",
  });
}

/**
 * Send a feature announcement notification to users.
 *
 * @param tokens - Array of Expo push tokens
 * @param featureTitle - Title for the announcement notification
 * @param featureDescription - Body text describing the new feature
 * @returns Promise resolving to send results
 */
export async function sendFeatureAnnouncement(
  tokens: string[],
  featureTitle: string,
  featureDescription: string,
): Promise<SendResult> {
  return sendPushNotifications(tokens, {
    title: featureTitle,
    body: featureDescription,
    data: { type: "feature_announcement" },
    channelId: "general",
  });
}

/**
 * Send Ramadan-themed reminder notification.
 *
 * Intended for use during the Islamic holy month of Ramadan.
 *
 * @param tokens - Array of Expo push tokens
 * @returns Promise resolving to send results
 */
export async function sendRamadanReminder(
  tokens: string[],
): Promise<SendResult> {
  const templates = SERVER_NOTIFICATION_TEMPLATES.ramadanReminder;
  const template = templates[Math.floor(Math.random() * templates.length)];

  return sendPushNotifications(tokens, {
    title: template.title,
    body: template.body,
    data: { type: "ramadan_reminder" },
    channelId: "general",
  });
}

// =============================================================================
// RECEIPT HANDLING (for delivery confirmation)
// =============================================================================

/**
 * Check delivery receipts for previously sent notifications.
 *
 * Expo provides receipts that confirm whether notifications were delivered
 * to the push notification services (APNs/FCM). Call this after some time
 * has passed since sending (Expo recommends ~15 minutes).
 *
 * @param receiptIds - Array of receipt IDs returned from send operations
 * @returns Promise with delivery statistics and any errors encountered
 *
 * @remarks
 * If a receipt returns "DeviceNotRegistered", the token should be removed
 * from your database as it is no longer valid.
 */
export async function checkNotificationReceipts(
  receiptIds: string[],
): Promise<{ delivered: number; failed: number; errors: string[] }> {
  const result = { delivered: 0, failed: 0, errors: [] as string[] };

  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of receiptIdChunks) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

      for (const receiptId in receipts) {
        const receipt = receipts[receiptId];

        if (receipt.status === "ok") {
          result.delivered++;
        } else if (receipt.status === "error") {
          result.failed++;
          if (receipt.message) {
            result.errors.push(`${receiptId}: ${receipt.message}`);
          }

          // Handle specific error types
          if (receipt.details?.error === "DeviceNotRegistered") {
            // Token is no longer valid - should remove from database
            console.log(
              `[Notifications] Device not registered, should remove token: ${receiptId}`,
            );
          }
        }
      }
    } catch (error) {
      result.errors.push(
        `Receipt check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

// =============================================================================
// TOKEN VALIDATION
// =============================================================================

/**
 * Validate if a token is a valid Expo push token format.
 *
 * @param token - Token string to validate
 * @returns True if the token matches Expo push token format
 */
export function isValidPushToken(token: string): boolean {
  return Expo.isExpoPushToken(token);
}

/**
 * Filter a list of tokens to only include valid Expo push tokens.
 *
 * @param tokens - Array of token strings to filter
 * @returns Array containing only valid Expo push tokens
 */
export function filterValidTokens(tokens: string[]): string[] {
  return tokens.filter((token) => Expo.isExpoPushToken(token));
}
