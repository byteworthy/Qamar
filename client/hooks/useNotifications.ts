/**
 * useNotifications Hook for Noor
 *
 * Provides notification functionality to React components
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  scheduleStreakReminder,
  cancelStreakReminder,
  loadNotificationSettings,
  saveNotificationSettings,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  areNotificationsEnabled,
  type NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/lib/notifications";
import { rescheduleAllNotifications } from "@/services/notifications";

export interface UseNotificationsReturn {
  // State
  isEnabled: boolean;
  isLoading: boolean;
  pushToken: string | null;
  settings: NotificationSettings;

  // Actions
  requestPermissions: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  scheduleStreakReminder: (streak: number) => Promise<void>;
  cancelStreakReminder: () => Promise<void>;

  // Last notification (for deep linking)
  lastNotification: Notifications.NotificationResponse | null;
}

/**
 * Hook to manage push notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [lastNotification, setLastNotification] =
    useState<Notifications.NotificationResponse | null>(null);

  // Refs for listeners
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Initialize notifications on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        // Check if notifications are enabled
        const enabled = await areNotificationsEnabled();
        setIsEnabled(enabled);

        // Load saved settings
        const savedSettings = await loadNotificationSettings();
        setSettings(savedSettings);

        // If enabled, register for push notifications
        if (enabled) {
          const token = await registerForPushNotifications();
          setPushToken(token);

          // Schedule daily reminder if enabled
          if (savedSettings.dailyReminderEnabled) {
            await scheduleDailyReminder(
              savedSettings.dailyReminderHour,
              savedSettings.dailyReminderMinute,
            );
          }
        }

        // Check if app was opened from a notification
        const lastResponse = await getLastNotificationResponse();
        if (lastResponse) {
          setLastNotification(lastResponse);
        }
      } catch (error) {
        console.error("[useNotifications] Init error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log("[useNotifications] Notification received:", notification);
        // You could update state or show an in-app alert here
      },
    );

    // Listener for when user taps on a notification
    responseListener.current = addNotificationResponseListener((response) => {
      console.log("[useNotifications] Notification tapped:", response);
      setLastNotification(response);

      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      if (data?.navigateTo) {
        // Navigation would be handled by the component using this hook
        console.log("[useNotifications] Navigate to:", data.navigateTo);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Re-check permissions and reschedule when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (state: AppStateStatus) => {
        if (state === "active") {
          const enabled = await areNotificationsEnabled();
          setIsEnabled(enabled);

          // Reschedule prayer notifications for current location/timezone
          if (enabled) {
            rescheduleAllNotifications().catch((err) =>
              console.error("[useNotifications] Reschedule error:", err),
            );
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setIsEnabled(true);

        // Schedule daily reminder with current settings
        if (settings.dailyReminderEnabled) {
          await scheduleDailyReminder(
            settings.dailyReminderHour,
            settings.dailyReminderMinute,
          );
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("[useNotifications] Request permissions error:", error);
      return false;
    }
  }, [settings]);

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>): Promise<void> => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        await saveNotificationSettings(updatedSettings);
      } catch (error) {
        console.error("[useNotifications] Update settings error:", error);
      }
    },
    [settings],
  );

  // Schedule streak reminder
  const handleScheduleStreakReminder = useCallback(
    async (streak: number): Promise<void> => {
      if (settings.streakRemindersEnabled && isEnabled) {
        await scheduleStreakReminder(streak);
      }
    },
    [settings.streakRemindersEnabled, isEnabled],
  );

  // Cancel streak reminder
  const handleCancelStreakReminder = useCallback(async (): Promise<void> => {
    await cancelStreakReminder();
  }, []);

  return {
    isEnabled,
    isLoading,
    pushToken,
    settings,
    requestPermissions,
    updateSettings,
    scheduleStreakReminder: handleScheduleStreakReminder,
    cancelStreakReminder: handleCancelStreakReminder,
    lastNotification,
  };
}

/**
 * Hook to handle notification-based navigation
 * Call this in your root navigator
 */
export function useNotificationNavigation(
  navigate: (screen: string, params?: object) => void,
) {
  const { lastNotification } = useNotifications();

  useEffect(() => {
    if (lastNotification) {
      const data = lastNotification.notification.request.content.data;

      if (data?.navigateTo) {
        navigate(data.navigateTo as string, data.params as object | undefined);
      } else if (data?.type === "prayer_reminder") {
        navigate("PrayerTimes");
      } else if (data?.type === "daily_reflection") {
        navigate("ThoughtCapture");
      } else if (data?.type === "daily_reminder") {
        navigate("ThoughtCapture");
      } else if (data?.type === "streak_reminder") {
        navigate("ThoughtCapture");
      } else if (data?.type === "weekly_insights") {
        navigate("Insights");
      }
    }
  }, [lastNotification, navigate]);
}
