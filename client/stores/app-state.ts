/**
 * App State Store - Client-Side UI State Management
 *
 * This store manages UI state that is NOT tied to server data:
 * - Quran reading position (current surah/verse)
 * - User preferences (translation, prayer method, theme, font size)
 * - Offline mode status
 *
 * For server-synced data (bookmarks, reflections), use TanStack Query.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// TYPES
// =============================================================================

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface QuranState {
  currentSurah: number | null;
  currentVerse: number | null;
  selectedTranslation: string; // ISO language code: 'en', 'ar', 'ur', 'fr'
  textSize: "small" | "medium" | "large" | "xlarge";
  showTransliteration: boolean;
  autoScroll: boolean;
}

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type ReminderOffset = 0 | 5 | 10 | 15 | 30;

export interface PrayerNotificationPreferences {
  /** Per-prayer notification toggles */
  perPrayer: Record<PrayerName, boolean>;
  /** Minutes before prayer time to send notification */
  reminderOffset: ReminderOffset;
  /** Daily reflection/learning reminder */
  dailyReflectionEnabled: boolean;
  dailyReflectionHour: number;
  dailyReflectionMinute: number;
}

export interface PrayerState {
  userLocation: Location | null;
  calculationMethod: string; // MWL, ISNA, Egypt, Makkah, Karachi, Tehran, Jafari
  asrCalculation: "Standard" | "Hanafi";
  highLatitudeRule: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle";
  notificationsEnabled: boolean;
  notificationMinutesBefore: number; // 0, 5, 10, 15, 30
  notificationPreferences: PrayerNotificationPreferences;
}

export interface ArabicState {
  currentLevel: number; // 1-5
  dailyGoal: number; // cards per day
  reviewsCompleted: number; // reset daily
  lastReviewDate: string | null; // ISO date string
}

export interface UIState {
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface OfflineState {
  isOffline: boolean;
  lastSyncTimestamp: number | null;
  pendingSyncCount: number;
  syncInProgress: boolean;
}

export interface AppState {
  // State slices
  quran: QuranState;
  prayer: PrayerState;
  arabic: ArabicState;
  ui: UIState;
  offline: OfflineState;

  // Quran actions
  setCurrentSurah: (surahId: number) => void;
  setCurrentVerse: (verseId: number) => void;
  setSelectedTranslation: (translation: string) => void;
  setQuranTextSize: (size: "small" | "medium" | "large" | "xlarge") => void;
  toggleTransliteration: () => void;
  toggleAutoScroll: () => void;
  resetQuranPosition: () => void;

  // Prayer actions
  setUserLocation: (location: Location) => void;
  setCalculationMethod: (method: string) => void;
  setAsrCalculation: (calculation: "Standard" | "Hanafi") => void;
  setHighLatitudeRule: (
    rule: "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle",
  ) => void;
  togglePrayerNotifications: () => void;
  setNotificationMinutesBefore: (minutes: number) => void;
  togglePrayerNotification: (prayer: PrayerName) => void;
  setReminderOffset: (offset: ReminderOffset) => void;
  toggleDailyReflection: () => void;
  setDailyReflectionTime: (hour: number, minute: number) => void;
  setNotificationPreferences: (
    prefs: Partial<PrayerNotificationPreferences>,
  ) => void;

  // Arabic actions
  setCurrentLevel: (level: number) => void;
  setDailyGoal: (goal: number) => void;
  incrementReviewsCompleted: () => void;
  resetDailyProgress: () => void;

  // UI actions
  setTheme: (theme: "light" | "dark" | "auto") => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;

  // Offline actions
  setOfflineStatus: (isOffline: boolean) => void;
  setSyncTimestamp: (timestamp: number) => void;
  setPendingSyncCount: (count: number) => void;
  setSyncInProgress: (inProgress: boolean) => void;

  // Utility actions
  resetAllState: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialQuranState: QuranState = {
  currentSurah: null,
  currentVerse: null,
  selectedTranslation: "en",
  textSize: "medium",
  showTransliteration: false,
  autoScroll: false,
};

const initialPrayerState: PrayerState = {
  userLocation: null,
  calculationMethod: "MWL", // Muslim World League
  asrCalculation: "Standard",
  highLatitudeRule: "MiddleOfTheNight",
  notificationsEnabled: false,
  notificationMinutesBefore: 0,
  notificationPreferences: {
    perPrayer: {
      Fajr: true,
      Dhuhr: true,
      Asr: true,
      Maghrib: true,
      Isha: true,
    },
    reminderOffset: 5,
    dailyReflectionEnabled: false,
    dailyReflectionHour: 20,
    dailyReflectionMinute: 0,
  },
};

const initialArabicState: ArabicState = {
  currentLevel: 1,
  dailyGoal: 10,
  reviewsCompleted: 0,
  lastReviewDate: null,
};

const initialUIState: UIState = {
  theme: "auto",
  fontSize: "medium",
  reducedMotion: false,
  highContrast: false,
};

const initialOfflineState: OfflineState = {
  isOffline: false,
  lastSyncTimestamp: null,
  pendingSyncCount: 0,
  syncInProgress: false,
};

// =============================================================================
// ZUSTAND STORE
// =============================================================================

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      // State slices
      quran: initialQuranState,
      prayer: initialPrayerState,
      arabic: initialArabicState,
      ui: initialUIState,
      offline: initialOfflineState,

      // Quran actions
      setCurrentSurah: (surahId) =>
        set((state) => ({
          quran: { ...state.quran, currentSurah: surahId },
        })),

      setCurrentVerse: (verseId) =>
        set((state) => ({
          quran: { ...state.quran, currentVerse: verseId },
        })),

      setSelectedTranslation: (translation) =>
        set((state) => ({
          quran: { ...state.quran, selectedTranslation: translation },
        })),

      setQuranTextSize: (size) =>
        set((state) => ({
          quran: { ...state.quran, textSize: size },
        })),

      toggleTransliteration: () =>
        set((state) => ({
          quran: {
            ...state.quran,
            showTransliteration: !state.quran.showTransliteration,
          },
        })),

      toggleAutoScroll: () =>
        set((state) => ({
          quran: { ...state.quran, autoScroll: !state.quran.autoScroll },
        })),

      resetQuranPosition: () =>
        set((state) => ({
          quran: {
            ...state.quran,
            currentSurah: null,
            currentVerse: null,
          },
        })),

      // Prayer actions
      setUserLocation: (location) =>
        set((state) => ({
          prayer: { ...state.prayer, userLocation: location },
        })),

      setCalculationMethod: (method) =>
        set((state) => ({
          prayer: { ...state.prayer, calculationMethod: method },
        })),

      setAsrCalculation: (calculation) =>
        set((state) => ({
          prayer: { ...state.prayer, asrCalculation: calculation },
        })),

      setHighLatitudeRule: (rule) =>
        set((state) => ({
          prayer: { ...state.prayer, highLatitudeRule: rule },
        })),

      togglePrayerNotifications: () =>
        set((state) => ({
          prayer: {
            ...state.prayer,
            notificationsEnabled: !state.prayer.notificationsEnabled,
          },
        })),

      setNotificationMinutesBefore: (minutes) =>
        set((state) => ({
          prayer: { ...state.prayer, notificationMinutesBefore: minutes },
        })),

      togglePrayerNotification: (prayer) =>
        set((state) => ({
          prayer: {
            ...state.prayer,
            notificationPreferences: {
              ...state.prayer.notificationPreferences,
              perPrayer: {
                ...state.prayer.notificationPreferences.perPrayer,
                [prayer]:
                  !state.prayer.notificationPreferences.perPrayer[prayer],
              },
            },
          },
        })),

      setReminderOffset: (offset) =>
        set((state) => ({
          prayer: {
            ...state.prayer,
            notificationPreferences: {
              ...state.prayer.notificationPreferences,
              reminderOffset: offset,
            },
          },
        })),

      toggleDailyReflection: () =>
        set((state) => ({
          prayer: {
            ...state.prayer,
            notificationPreferences: {
              ...state.prayer.notificationPreferences,
              dailyReflectionEnabled:
                !state.prayer.notificationPreferences.dailyReflectionEnabled,
            },
          },
        })),

      setDailyReflectionTime: (hour, minute) =>
        set((state) => ({
          prayer: {
            ...state.prayer,
            notificationPreferences: {
              ...state.prayer.notificationPreferences,
              dailyReflectionHour: hour,
              dailyReflectionMinute: minute,
            },
          },
        })),

      setNotificationPreferences: (prefs) =>
        set((state) => ({
          prayer: {
            ...state.prayer,
            notificationPreferences: {
              ...state.prayer.notificationPreferences,
              ...prefs,
            },
          },
        })),

      // Arabic actions
      setCurrentLevel: (level) =>
        set((state) => ({
          arabic: { ...state.arabic, currentLevel: level },
        })),

      setDailyGoal: (goal) =>
        set((state) => ({
          arabic: { ...state.arabic, dailyGoal: goal },
        })),

      incrementReviewsCompleted: () =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const lastReview = state.arabic.lastReviewDate;

          // Reset count if it's a new day
          if (lastReview !== today) {
            return {
              arabic: {
                ...state.arabic,
                reviewsCompleted: 1,
                lastReviewDate: today,
              },
            };
          }

          return {
            arabic: {
              ...state.arabic,
              reviewsCompleted: state.arabic.reviewsCompleted + 1,
              lastReviewDate: today,
            },
          };
        }),

      resetDailyProgress: () =>
        set((state) => ({
          arabic: {
            ...state.arabic,
            reviewsCompleted: 0,
            lastReviewDate: new Date().toISOString().split("T")[0],
          },
        })),

      // UI actions
      setTheme: (theme) =>
        set((state) => ({
          ui: { ...state.ui, theme },
        })),

      setFontSize: (size) =>
        set((state) => ({
          ui: { ...state.ui, fontSize: size },
        })),

      toggleReducedMotion: () =>
        set((state) => ({
          ui: { ...state.ui, reducedMotion: !state.ui.reducedMotion },
        })),

      toggleHighContrast: () =>
        set((state) => ({
          ui: { ...state.ui, highContrast: !state.ui.highContrast },
        })),

      // Offline actions
      setOfflineStatus: (isOffline) =>
        set((state) => ({
          offline: { ...state.offline, isOffline },
        })),

      setSyncTimestamp: (timestamp) =>
        set((state) => ({
          offline: { ...state.offline, lastSyncTimestamp: timestamp },
        })),

      setPendingSyncCount: (count) =>
        set((state) => ({
          offline: { ...state.offline, pendingSyncCount: count },
        })),

      setSyncInProgress: (inProgress) =>
        set((state) => ({
          offline: { ...state.offline, syncInProgress: inProgress },
        })),

      // Utility actions
      resetAllState: () =>
        set({
          quran: initialQuranState,
          prayer: initialPrayerState,
          arabic: initialArabicState,
          ui: initialUIState,
          offline: initialOfflineState,
        }),
    }),
    {
      name: "noor-app-state", // unique name for AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist offline state (it's transient)
      partialize: (state) => ({
        quran: state.quran,
        prayer: state.prayer,
        arabic: state.arabic,
        ui: state.ui,
        // offline state is NOT persisted
      }),
    },
  ),
);

// =============================================================================
// SELECTORS (for performance optimization)
// =============================================================================

// Quran selectors
export const selectQuranState = (state: AppState) => state.quran;
export const selectCurrentSurah = (state: AppState) => state.quran.currentSurah;
export const selectCurrentVerse = (state: AppState) => state.quran.currentVerse;
export const selectSelectedTranslation = (state: AppState) =>
  state.quran.selectedTranslation;

// Prayer selectors
export const selectPrayerState = (state: AppState) => state.prayer;
export const selectUserLocation = (state: AppState) =>
  state.prayer.userLocation;
export const selectCalculationMethod = (state: AppState) =>
  state.prayer.calculationMethod;

// Arabic selectors
export const selectArabicState = (state: AppState) => state.arabic;
export const selectCurrentLevel = (state: AppState) =>
  state.arabic.currentLevel;
export const selectDailyProgress = (state: AppState) => ({
  completed: state.arabic.reviewsCompleted,
  goal: state.arabic.dailyGoal,
  percentage: Math.min(
    100,
    (state.arabic.reviewsCompleted / state.arabic.dailyGoal) * 100,
  ),
});

// UI selectors
export const selectUIState = (state: AppState) => state.ui;
export const selectTheme = (state: AppState) => state.ui.theme;
export const selectFontSize = (state: AppState) => state.ui.fontSize;

// Offline selectors
export const selectOfflineState = (state: AppState) => state.offline;
export const selectIsOffline = (state: AppState) => state.offline.isOffline;
export const selectSyncStatus = (state: AppState) => ({
  lastSync: state.offline.lastSyncTimestamp,
  pendingCount: state.offline.pendingSyncCount,
  inProgress: state.offline.syncInProgress,
});

// =============================================================================
// HOOKS (convenience wrappers)
// =============================================================================

/**
 * Hook to check if user has reached daily Arabic review goal
 */
export const useHasReachedDailyGoal = () => {
  return useAppState((state) => {
    const { reviewsCompleted, dailyGoal, lastReviewDate } = state.arabic;
    const today = new Date().toISOString().split("T")[0];

    // Reset if different day
    if (lastReviewDate !== today) {
      return false;
    }

    return reviewsCompleted >= dailyGoal;
  });
};

/**
 * Hook to check if sync is needed (offline changes or stale data)
 */
export const useNeedsSync = () => {
  return useAppState((state) => {
    const { pendingSyncCount, lastSyncTimestamp } = state.offline;

    // Has pending changes
    if (pendingSyncCount > 0) return true;

    // No sync timestamp (first launch)
    if (!lastSyncTimestamp) return true;

    // Sync older than 24 hours
    const hoursSinceSync = (Date.now() - lastSyncTimestamp) / (1000 * 60 * 60);
    return hoursSinceSync > 24;
  });
};
