/**
 * Push Notification System for Qamar
 *
 * Handles both local scheduled notifications (daily reminders)
 * and server-triggered push notifications (inactivity nudges, etc.)
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { secureStorage, SECURE_KEYS } from "./secure-storage";

// Storage keys - using secure storage for push tokens
const PUSH_TOKEN_KEY = SECURE_KEYS.PUSH_TOKEN;
const NOTIFICATION_SETTINGS_KEY = SECURE_KEYS.NOTIFICATION_SETTINGS;

// =============================================================================
// NOTIFICATION SETTINGS
// =============================================================================

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  streakRemindersEnabled: boolean;
  inactivityRemindersEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: true,
  dailyReminderHour: 20, // 8 PM default
  dailyReminderMinute: 0,
  streakRemindersEnabled: true,
  inactivityRemindersEnabled: true,
};

// =============================================================================
// NOTIFICATION HANDLER CONFIGURATION
// =============================================================================

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// =============================================================================
// ISLAMIC-THEMED NOTIFICATION MESSAGES
// =============================================================================

export const NOTIFICATION_MESSAGES = {
  dailyReminder: [
    {
      title: "Salaam 🌙",
      body: "A moment of stillness is waiting for you.",
    },
    {
      title: "Qamar",
      body: "What's weighing on your heart today?",
    },
    {
      title: "Evening Check-in",
      body: "Process your day with intention.",
    },
    {
      title: "💚",
      body: "Small reflections, lasting clarity.",
    },
    {
      title: "Bismillah",
      body: "Begin your reflection journey.",
    },
    {
      title: "✨",
      body: "Alhamdulillah for another day. How are you?",
    },
    {
      title: "Qamar",
      body: "Your thoughts deserve attention.",
    },
    {
      title: "Evening Reflection",
      body: "Take 5 minutes to untangle your thoughts.",
    },
  ],
  streakReminder: [
    {
      title: "🔥 Streak Alert",
      body: "Your streak is at risk. Reflect now to keep it going.",
    },
    {
      title: "Don't break your streak!",
      body: "A quick reflection keeps your momentum.",
    },
    {
      title: "Qamar",
      body: "Your {streak}-day streak is waiting for you.",
    },
  ],
  inactivity: [
    {
      title: "Salaam 🌙",
      body: "It's been a few days. Your thoughts matter.",
    },
    {
      title: "We miss you",
      body: "Your reflection practice is ready when you are.",
    },
    {
      title: "Qamar",
      body: "Small steps, sincere intentions. Come back when ready.",
    },
    {
      title: "💚",
      body: "Checking in - how are you holding up?",
    },
  ],
  completion: [
    {
      title: "MashaAllah ✨",
      body: "Reflection complete. May it bring you peace.",
    },
    {
      title: "Barakallah",
      body: "Another step on your journey. Well done.",
    },
  ],
};

// =============================================================================
// PUSH TOKEN REGISTRATION
// =============================================================================

/**
 * Register device for push notifications and obtain an Expo push token.
 *
 * This function:
 * 1. Checks if running on a physical device (required for push)
 * 2. Requests notification permissions if not already granted
 * 3. Retrieves an Expo push token
 * 4. Sets up Android notification channels
 * 5. Stores the token locally for later use
 *
 * @returns Promise resolving to the Expo push token string, or null if unavailable/denied
 *
 * @example
 * ```ts
 * const token = await registerForPushNotifications();
 * if (token) {
 *   await syncPushTokenWithServer(token, API_URL);
 * }
 * ```
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.log("[Notifications] Push notifications require a physical device");
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission denied");
      return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    const token = tokenData.data;

    // Store token securely (Keychain/Keystore)
    await secureStorage.setItem(PUSH_TOKEN_KEY, token);

    // Set up Android notification channel
    if (Platform.OS === "android") {
      await setupAndroidChannels();
    }

    return token;
  } catch (error) {
    console.error("[Notifications] Registration error:", error);
    return null;
  }
}

/**
 * Set up Android notification channels for different notification types
 */
async function setupAndroidChannels() {
  // Default channel for daily reminders
  await Notifications.setNotificationChannelAsync("daily-reminders", {
    name: "Daily Reminders",
    description: "Evening reflection reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4fd1a8",
    sound: "default",
  });

  // Streak alerts
  await Notifications.setNotificationChannelAsync("streak-alerts", {
    name: "Streak Alerts",
    description: "Notifications to protect your reflection streak",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#c9a855",
    sound: "default",
  });

  // Prayer time reminders
  await Notifications.setNotificationChannelAsync("prayer-reminders", {
    name: "Prayer Reminders",
    description: "Notifications before each prayer time",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#3a5a5a",
    sound: "default",
  });

  // General notifications
  await Notifications.setNotificationChannelAsync("general", {
    name: "General",
    description: "General notifications from Qamar",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
  });
}

/**
 * Retrieve the locally stored push token from AsyncStorage.
 *
 * @returns Promise resolving to the stored token string, or null if not found
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await secureStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

// =============================================================================
// LOCAL SCHEDULED NOTIFICATIONS
// =============================================================================

/**
 * Schedule a daily local notification reminder for reflection.
 *
 * Cancels any existing daily reminders before scheduling a new one.
 * Uses a randomly selected message from the dailyReminder templates.
 *
 * @param hour - Hour of day (0-23) to trigger notification. Defaults to 20 (8 PM)
 * @param minute - Minute of hour (0-59) to trigger notification. Defaults to 0
 * @returns Promise resolving to the notification identifier, or null on failure
 */
export async function scheduleDailyReminder(
  hour: number = 20,
  minute: number = 0,
): Promise<string | null> {
  try {
    // Cancel existing daily reminders first
    await cancelDailyReminder();

    // Pick a random message
    const messages = NOTIFICATION_MESSAGES.dailyReminder;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: randomMessage.title,
        body: randomMessage.body,
        sound: true,
        data: { type: "daily_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(
      `[Notifications] Daily reminder scheduled for ${hour}:${minute.toString().padStart(2, "0")}`,
    );
    return identifier;
  } catch (error) {
    console.error("[Notifications] Failed to schedule daily reminder:", error);
    return null;
  }
}

/**
 * Cancel all scheduled daily reminder notifications.
 *
 * @returns Promise that resolves when all daily reminders are cancelled
 */
export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === "daily_reminder") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }
}

/**
 * Schedule a streak protection reminder notification.
 *
 * Called when a user has an active streak but hasn't completed
 * their reflection for the day. Scheduled for 9 PM by default.
 *
 * @param currentStreak - The user's current streak count (used in message)
 * @returns Promise resolving to the notification identifier, or null on failure
 */
export async function scheduleStreakReminder(
  currentStreak: number,
): Promise<string | null> {
  try {
    // Cancel existing streak reminders
    await cancelStreakReminder();

    // Schedule for 9 PM if they haven't reflected
    const messages = NOTIFICATION_MESSAGES.streakReminder;
    let randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Replace {streak} placeholder
    randomMessage = {
      title: randomMessage.title.replace("{streak}", currentStreak.toString()),
      body: randomMessage.body.replace("{streak}", currentStreak.toString()),
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: randomMessage.title,
        body: randomMessage.body,
        sound: true,
        data: { type: "streak_reminder", streak: currentStreak },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21, // 9 PM
        minute: 0,
      },
    });

    console.log("[Notifications] Streak reminder scheduled");
    return identifier;
  } catch (error) {
    console.error("[Notifications] Failed to schedule streak reminder:", error);
    return null;
  }
}

/**
 * Cancel all scheduled streak reminder notifications.
 *
 * Should be called when the user completes a reflection to prevent
 * unnecessary reminder notifications.
 *
 * @returns Promise that resolves when all streak reminders are cancelled
 */
export async function cancelStreakReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduled) {
    if (notification.content.data?.type === "streak_reminder") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }
}

// =============================================================================
// NOTIFICATION SETTINGS MANAGEMENT
// =============================================================================

/**
 * Save notification settings to local storage and apply them.
 *
 * Automatically schedules or cancels the daily reminder based on settings.
 *
 * @param settings - The notification settings to save
 * @returns Promise that resolves when settings are saved and applied
 */
export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  try {
    await secureStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(settings),
    );

    // Apply settings
    if (settings.dailyReminderEnabled) {
      await scheduleDailyReminder(
        settings.dailyReminderHour,
        settings.dailyReminderMinute,
      );
    } else {
      await cancelDailyReminder();
    }

    if (__DEV__) {
      console.log("[Notifications] Settings saved:", settings);
    }
  } catch (error) {
    console.error("[Notifications] Failed to save settings:", error);
  }
}

/**
 * Load notification settings from local storage.
 *
 * @returns Promise resolving to stored settings, or defaults if not found
 */
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await secureStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Return defaults on error
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

// =============================================================================
// SERVER SYNC
// =============================================================================

/**
 * Send push token to the backend server for server-triggered notifications.
 *
 * This enables the server to send push notifications for events like
 * inactivity reminders, weekly insights, and feature announcements.
 *
 * @param token - The Expo push token to register
 * @param apiBaseUrl - Base URL of the API server
 * @param userId - Optional user ID to associate with the token
 * @returns Promise resolving to true if sync succeeded, false otherwise
 */
export async function syncPushTokenWithServer(
  token: string,
  apiBaseUrl: string,
  userId?: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/notifications/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        userId,
        platform: Platform.OS,
        deviceName: Device.deviceName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    console.log("[Notifications] Token synced with server");
    return true;
  } catch (error) {
    console.error("[Notifications] Failed to sync token with server:", error);
    return false;
  }
}

// =============================================================================
// NOTIFICATION LISTENERS
// =============================================================================

/**
 * Add a listener for notifications received while the app is in the foreground.
 *
 * @param handler - Callback function invoked when a notification is received
 * @returns Subscription object that can be used to remove the listener
 */
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void,
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Add a listener for notification responses (when user taps a notification).
 *
 * Use this to handle navigation or actions when the user interacts
 * with a notification.
 *
 * @param handler - Callback function invoked when user responds to a notification
 * @returns Subscription object that can be used to remove the listener
 */
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Get the last notification response if the app was opened from a notification.
 *
 * Useful for handling deep links or navigation on app cold start.
 *
 * @returns Promise resolving to the last notification response, or null if none
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

// =============================================================================
// UTILITY
// =============================================================================

/**
 * Request notification permissions without registering for push notifications.
 *
 * Useful for prompting permission before actually setting up push tokens.
 *
 * @returns Promise resolving to true if permission granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Check if notification permissions are currently enabled.
 *
 * @returns Promise resolving to true if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Get all currently scheduled notifications.
 *
 * Useful for debugging or displaying scheduled reminders to the user.
 *
 * @returns Promise resolving to array of scheduled notification requests
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Cancel all scheduled local notifications.
 *
 * @returns Promise that resolves when all notifications are cancelled
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set the app badge count (iOS only).
 *
 * @param count - Number to display on the app icon badge
 * @returns Promise that resolves when badge is set
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// =============================================================================
// PRAYER TIME NOTIFICATIONS
// =============================================================================

const PRAYER_MESSAGES: Record<string, { title: string; body: string }> = {
  Fajr: { title: "Fajr", body: "Rise with light. Fajr is calling." },
  Dhuhr: { title: "Dhuhr", body: "Pause and reconnect. Dhuhr time." },
  Asr: { title: "Asr", body: "The afternoon prayer awaits." },
  Maghrib: { title: "Maghrib", body: "As the sun sets, turn to Allah." },
  Isha: { title: "Isha", body: "End your day in remembrance. Isha time." },
};

/**
 * Schedule notifications for daily prayers.
 *
 * @param prayers - Array of { name, time } where time is an ISO string
 * @param minutesBefore - Minutes before prayer time to notify (default 5)
 * @param enabledPrayers - Optional map of prayer name to enabled boolean. If omitted, all prayers are scheduled.
 */
export async function schedulePrayerReminders(
  prayers: { name: string; time: string }[],
  minutesBefore: number = 5,
  enabledPrayers?: Record<string, boolean>,
): Promise<void> {
  // Cancel existing prayer reminders
  await cancelPrayerReminders();

  const now = Date.now();

  for (const prayer of prayers) {
    // Skip if this specific prayer is disabled
    if (enabledPrayers && enabledPrayers[prayer.name] === false) continue;

    const prayerTime = new Date(prayer.time).getTime();
    const notifyAt = prayerTime - minutesBefore * 60 * 1000;

    // Only schedule if the notification time is in the future
    if (notifyAt <= now) continue;

    const msg = PRAYER_MESSAGES[prayer.name] || {
      title: prayer.name,
      body: `Time for ${prayer.name} prayer.`,
    };

    const formattedTime = new Date(prayer.time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: minutesBefore > 0 ? `${msg.body} (${formattedTime})` : msg.body,
          sound: true,
          data: {
            type: "prayer_reminder",
            prayer: prayer.name,
            navigateTo: "PrayerTimes",
          },
          ...(Platform.OS === "android" && { channelId: "prayer-reminders" }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(notifyAt),
        },
      });
    } catch (error) {
      console.error(
        `[Notifications] Failed to schedule ${prayer.name}:`,
        error,
      );
    }
  }
}

/**
 * Schedule a daily reflection reminder at a specific time.
 * Uses the "daily-reminders" Android channel.
 *
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param message - Optional custom message
 */
export async function scheduleDailyReflectionReminder(
  hour: number = 20,
  minute: number = 0,
  message?: { title: string; body: string },
): Promise<string | null> {
  try {
    // Cancel existing reflection reminders
    await cancelDailyReflectionReminder();

    const content = message || {
      title: "Daily Reflection",
      body: "A moment of stillness is waiting for you.",
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        data: {
          type: "daily_reflection",
          navigateTo: "ThoughtCapture",
        },
        ...(Platform.OS === "android" && { channelId: "daily-reminders" }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(
      `[Notifications] Daily reflection scheduled for ${hour}:${minute.toString().padStart(2, "0")}`,
    );
    return identifier;
  } catch (error) {
    console.error("[Notifications] Failed to schedule reflection:", error);
    return null;
  }
}

/**
 * Cancel all scheduled daily reflection reminder notifications.
 */
export async function cancelDailyReflectionReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === "daily_reflection") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }
}

/**
 * Cancel all scheduled prayer reminder notifications.
 */
export async function cancelPrayerReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === "prayer_reminder") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }
}
