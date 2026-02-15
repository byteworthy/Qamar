/**
 * Prayer Notification Scheduling Service
 *
 * Orchestrates prayer notification scheduling by combining:
 * - Prayer time calculations (from prayerTimes service)
 * - User preferences (from Zustand store)
 * - Notification scheduling (from lib/notifications)
 *
 * This service is the single entry point for rescheduling prayer notifications.
 * Call `reschedulePrayerNotifications()` whenever:
 * - The app comes to the foreground
 * - The user changes notification preferences
 * - Location changes
 * - Timezone changes
 */

import {
  schedulePrayerReminders,
  cancelPrayerReminders,
  scheduleDailyReflectionReminder,
  cancelDailyReflectionReminder,
  areNotificationsEnabled,
} from "@/lib/notifications";
import { calculatePrayerTimes } from "@/services/prayerTimes";
import { useAppState } from "@/stores/app-state";
import type { PrayerNotificationPreferences } from "@/stores/app-state";

/**
 * Reschedule all prayer notifications based on current store state.
 * Recalculates prayer times for today and tomorrow, then schedules
 * notifications for all future prayer times.
 *
 * Safe to call repeatedly -- cancels existing notifications first.
 */
export async function reschedulePrayerNotifications(): Promise<void> {
  const state = useAppState.getState();
  const { prayer } = state;

  if (!prayer.notificationsEnabled || !prayer.userLocation) {
    await cancelPrayerReminders();
    return;
  }

  const permissionsGranted = await areNotificationsEnabled();
  if (!permissionsGranted) return;

  const prefs = prayer.notificationPreferences;
  const { latitude, longitude } = prayer.userLocation;
  const method = prayer.calculationMethod;
  const madhab = prayer.asrCalculation === "Hanafi" ? "Hanafi" : "Shafi";

  // Calculate for today
  const todayTimes = calculatePrayerTimes(latitude, longitude, new Date(), method, madhab);

  // Calculate for tomorrow (expo-notifications DATE triggers need future dates)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = calculatePrayerTimes(latitude, longitude, tomorrow, method, madhab);

  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  // Build combined prayer array for today + tomorrow
  const allPrayers: Array<{ name: string; time: string }> = [];

  for (const name of prayerNames) {
    const key = name.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
    allPrayers.push({ name, time: todayTimes[key].toISOString() });
    allPrayers.push({ name, time: tomorrowTimes[key].toISOString() });
  }

  await schedulePrayerReminders(allPrayers, prefs.reminderOffset, prefs.perPrayer);

  if (__DEV__) {
    console.log("[PrayerNotifications] Rescheduled for", prayer.userLocation.city || "current location");
  }
}

/**
 * Reschedule the daily reflection reminder based on store preferences.
 */
export async function rescheduleDailyReflection(): Promise<void> {
  const state = useAppState.getState();
  const prefs = state.prayer.notificationPreferences;

  if (!state.prayer.notificationsEnabled || !prefs.dailyReflectionEnabled) {
    await cancelDailyReflectionReminder();
    return;
  }

  const permissionsGranted = await areNotificationsEnabled();
  if (!permissionsGranted) return;

  await scheduleDailyReflectionReminder(
    prefs.dailyReflectionHour,
    prefs.dailyReflectionMinute,
  );
}

/**
 * Reschedule everything: prayer notifications + daily reflection.
 * Call this on app foreground or after preference changes.
 */
export async function rescheduleAllNotifications(): Promise<void> {
  await Promise.all([
    reschedulePrayerNotifications(),
    rescheduleDailyReflection(),
  ]);
}
