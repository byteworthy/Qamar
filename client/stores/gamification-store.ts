/**
 * Gamification Store — Streaks, Badges & Milestones
 *
 * Tracks daily activity streaks, earned badges, and milestones.
 * Persisted via AsyncStorage. Separate from app-state to keep concerns clean.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// TYPES
// =============================================================================

export type ActivityType =
  | "quran_read"
  | "flashcard_reviewed"
  | "prayer_logged"
  | "reflection_submitted"
  | "daily_noor_completed"
  | "dhikr_completed"
  | "hadith_read"
  | "tutor_session"
  | "pronunciation_practice"
  | "translation_used"
  | "hifz_review_completed"
  | "tafsir_viewed"
  | "verse_discussion"
  | "dua_searched"
  | "study_plan_task_completed";

export type BadgeId =
  | "first_light"
  | "seeker"
  | "steadfast"
  | "hafiz_in_training"
  | "word_builder"
  | "word_scholar"
  | "reflective_soul"
  | "juz_champion"
  | "ramadan_warrior"
  | "early_bird"
  | "night_owl"
  | "dhikr_devotee";

export type StreakStatus = "active" | "endangered" | "broken" | "paused";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null; // ISO date or null if not yet earned
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  activities: ActivityType[];
}

export interface WeeklySummaryData {
  versesRead: number;
  flashcardsReviewed: number;
  reflectionsCompleted: number;
  streakLength: number;
  previousWeek: {
    versesRead: number;
    flashcardsReviewed: number;
    reflectionsCompleted: number;
  };
}

export interface GamificationState {
  // Streak
  currentStreak: number;
  longestStreak: number;
  streakStatus: StreakStatus;
  lastActivityDate: string | null; // YYYY-MM-DD
  streakPaused: boolean; // menstruation/illness pause

  // Daily tracking
  todayActivities: ActivityType[];
  todayDate: string | null; // YYYY-MM-DD

  // Stats counters (cumulative)
  totalSurahsRead: number;
  totalVocabMastered: number;
  totalReflections: number;
  totalJuzCompleted: number;
  totalRamadanFasted: number;

  // Badges
  badges: Badge[];

  // Weekly summary
  lastWeeklySummaryShown: string | null; // ISO date
  weeklyStats: WeeklySummaryData | null;

  // New milestone to celebrate (shown once then cleared)
  pendingMilestone: BadgeId | null;

  // Actions
  recordActivity: (activity: ActivityType) => void;
  checkAndUpdateStreak: () => void;
  toggleStreakPause: () => void;
  incrementStat: (stat: "totalSurahsRead" | "totalVocabMastered" | "totalReflections" | "totalJuzCompleted" | "totalRamadanFasted", amount?: number) => void;
  clearPendingMilestone: () => void;
  setWeeklyStats: (stats: WeeklySummaryData) => void;
  markWeeklySummaryShown: () => void;
  resetGamification: () => void;
}

// =============================================================================
// BADGE DEFINITIONS
// =============================================================================

export const BADGE_DEFINITIONS: Badge[] = [
  { id: "first_light", name: "First Light", description: "Complete your first Daily Noor", icon: "sunrise", earnedAt: null },
  { id: "seeker", name: "Seeker", description: "Maintain a 7-day streak", icon: "compass", earnedAt: null },
  { id: "steadfast", name: "Steadfast", description: "Maintain a 30-day streak", icon: "shield", earnedAt: null },
  { id: "hafiz_in_training", name: "Hafiz in Training", description: "Read 5 complete surahs", icon: "book-open", earnedAt: null },
  { id: "word_builder", name: "Word Builder", description: "Master 50 Arabic vocabulary words", icon: "type", earnedAt: null },
  { id: "word_scholar", name: "Word Scholar", description: "Master 200 Arabic vocabulary words", icon: "award", earnedAt: null },
  { id: "reflective_soul", name: "Reflective Soul", description: "Complete 10 reflections", icon: "heart", earnedAt: null },
  { id: "juz_champion", name: "Juz Champion", description: "Complete reading a full Juz", icon: "star", earnedAt: null },
  { id: "ramadan_warrior", name: "Ramadan Warrior", description: "Fast all 30 days of Ramadan", icon: "moon", earnedAt: null },
  { id: "early_bird", name: "Early Bird", description: "Complete Daily Noor before Dhuhr 7 times", icon: "sun", earnedAt: null },
  { id: "night_owl", name: "Night Owl", description: "Complete a reflection after Isha 10 times", icon: "moon", earnedAt: null },
  { id: "dhikr_devotee", name: "Dhikr Devotee", description: "Complete dhikr practice 20 times", icon: "repeat", earnedAt: null },
];

// =============================================================================
// HELPERS
// =============================================================================

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function checkBadgeEarned(
  badgeId: BadgeId,
  state: GamificationState,
): boolean {
  const badge = state.badges.find((b) => b.id === badgeId);
  if (badge?.earnedAt) return false; // already earned

  switch (badgeId) {
    case "first_light":
      return state.todayActivities.includes("daily_noor_completed");
    case "seeker":
      return state.currentStreak >= 7;
    case "steadfast":
      return state.currentStreak >= 30;
    case "hafiz_in_training":
      return state.totalSurahsRead >= 5;
    case "word_builder":
      return state.totalVocabMastered >= 50;
    case "word_scholar":
      return state.totalVocabMastered >= 200;
    case "reflective_soul":
      return state.totalReflections >= 10;
    case "juz_champion":
      return state.totalJuzCompleted >= 1;
    case "ramadan_warrior":
      return state.totalRamadanFasted >= 30;
    default:
      return false;
  }
}

// =============================================================================
// STORE
// =============================================================================

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStreak: 0,
      longestStreak: 0,
      streakStatus: "broken" as StreakStatus,
      lastActivityDate: null,
      streakPaused: false,

      todayActivities: [],
      todayDate: null,

      totalSurahsRead: 0,
      totalVocabMastered: 0,
      totalReflections: 0,
      totalJuzCompleted: 0,
      totalRamadanFasted: 0,

      badges: BADGE_DEFINITIONS.map((b) => ({ ...b })),

      lastWeeklySummaryShown: null,
      weeklyStats: null,
      pendingMilestone: null,

      // Actions
      recordActivity: (activity) =>
        set((state) => {
          const today = getToday();

          // Reset today's activities if it's a new day
          const activities =
            state.todayDate === today
              ? [...state.todayActivities]
              : [];

          // Don't double-count same activity type today
          if (!activities.includes(activity)) {
            activities.push(activity);
          }

          const newState = {
            ...state,
            todayActivities: activities,
            todayDate: today,
          };

          // Update streak
          if (state.lastActivityDate !== today && !state.streakPaused) {
            const yesterday = getYesterday();
            let newStreak: number;
            let newStatus: StreakStatus;

            if (state.lastActivityDate === yesterday || state.lastActivityDate === null) {
              // Continuing streak or first activity
              newStreak = state.currentStreak + 1;
              newStatus = "active";
            } else if (state.streakStatus === "endangered") {
              // Was endangered, activity saves it
              newStreak = state.currentStreak;
              newStatus = "active";
            } else {
              // Streak broken, start fresh
              newStreak = 1;
              newStatus = "active";
            }

            const newLongest = Math.max(state.longestStreak, newStreak);

            Object.assign(newState, {
              currentStreak: newStreak,
              longestStreak: newLongest,
              streakStatus: newStatus,
              lastActivityDate: today,
            });
          } else if (state.lastActivityDate !== today && state.streakPaused) {
            // Paused — don't change streak, just mark activity
            Object.assign(newState, {
              lastActivityDate: today,
            });
          }

          // Check badges
          let pendingMilestone: BadgeId | null = null;
          const updatedBadges = newState.badges.map((badge) => {
            if (badge.earnedAt) return badge;
            if (checkBadgeEarned(badge.id, newState as GamificationState)) {
              pendingMilestone = badge.id;
              return { ...badge, earnedAt: new Date().toISOString() };
            }
            return badge;
          });

          return {
            ...newState,
            badges: updatedBadges,
            pendingMilestone: pendingMilestone ?? state.pendingMilestone,
          };
        }),

      checkAndUpdateStreak: () =>
        set((state) => {
          if (state.streakPaused) return state;

          const today = getToday();
          const yesterday = getYesterday();

          if (state.lastActivityDate === today) {
            // Already active today
            return state;
          }

          if (state.lastActivityDate === yesterday) {
            // No activity today yet — streak is endangered (grace period)
            return { ...state, streakStatus: "endangered" as StreakStatus };
          }

          // More than 1 day missed — break streak
          if (state.currentStreak > 0) {
            return {
              ...state,
              streakStatus: "broken" as StreakStatus,
              currentStreak: 0,
            };
          }

          return state;
        }),

      toggleStreakPause: () =>
        set((state) => ({
          streakPaused: !state.streakPaused,
          streakStatus: !state.streakPaused ? "paused" : state.currentStreak > 0 ? "active" : "broken",
        })),

      incrementStat: (stat, amount = 1) =>
        set((state) => {
          const newValue = state[stat] + amount;
          const newState = { ...state, [stat]: newValue };

          // Check badges after stat increment
          let pendingMilestone: BadgeId | null = null;
          const updatedBadges = state.badges.map((badge) => {
            if (badge.earnedAt) return badge;
            if (checkBadgeEarned(badge.id, newState as GamificationState)) {
              pendingMilestone = badge.id;
              return { ...badge, earnedAt: new Date().toISOString() };
            }
            return badge;
          });

          return {
            [stat]: newValue,
            badges: updatedBadges,
            pendingMilestone: pendingMilestone ?? state.pendingMilestone,
          };
        }),

      clearPendingMilestone: () => set({ pendingMilestone: null }),

      setWeeklyStats: (stats) => set({ weeklyStats: stats }),

      markWeeklySummaryShown: () =>
        set({ lastWeeklySummaryShown: new Date().toISOString() }),

      resetGamification: () =>
        set({
          currentStreak: 0,
          longestStreak: 0,
          streakStatus: "broken" as StreakStatus,
          lastActivityDate: null,
          streakPaused: false,
          todayActivities: [],
          todayDate: null,
          totalSurahsRead: 0,
          totalVocabMastered: 0,
          totalReflections: 0,
          totalJuzCompleted: 0,
          totalRamadanFasted: 0,
          badges: BADGE_DEFINITIONS.map((b) => ({ ...b })),
          lastWeeklySummaryShown: null,
          weeklyStats: null,
          pendingMilestone: null,
        }),
    }),
    {
      name: "noor-gamification",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectCurrentStreak = (state: GamificationState) => state.currentStreak;
export const selectStreakStatus = (state: GamificationState) => state.streakStatus;
export const selectBadges = (state: GamificationState) => state.badges;
export const selectEarnedBadges = (state: GamificationState) =>
  state.badges.filter((b) => b.earnedAt !== null);
export const selectPendingMilestone = (state: GamificationState) => state.pendingMilestone;
export const selectStreakPaused = (state: GamificationState) => state.streakPaused;
