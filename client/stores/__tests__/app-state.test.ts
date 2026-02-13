/**
 * Unit tests for Zustand App State Store
 */

import { renderHook, act } from "@testing-library/react-native";
import {
  useAppState,
  useHasReachedDailyGoal,
  useNeedsSync,
  selectDailyProgress,
} from "../app-state";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("AppState Store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useAppState());
    act(() => {
      result.current.resetAllState();
    });
  });

  describe("Quran State", () => {
    it("should set current surah", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setCurrentSurah(1);
      });

      expect(result.current.quran.currentSurah).toBe(1);
    });

    it("should set current verse", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setCurrentVerse(5);
      });

      expect(result.current.quran.currentVerse).toBe(5);
    });

    it("should change translation", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setSelectedTranslation("ur");
      });

      expect(result.current.quran.selectedTranslation).toBe("ur");
    });

    it("should toggle transliteration", () => {
      const { result } = renderHook(() => useAppState());

      const initialValue = result.current.quran.showTransliteration;

      act(() => {
        result.current.toggleTransliteration();
      });

      expect(result.current.quran.showTransliteration).toBe(!initialValue);
    });

    it("should reset Quran position", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setCurrentSurah(5);
        result.current.setCurrentVerse(10);
        result.current.resetQuranPosition();
      });

      expect(result.current.quran.currentSurah).toBeNull();
      expect(result.current.quran.currentVerse).toBeNull();
    });

    it("should change text size", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setQuranTextSize("xlarge");
      });

      expect(result.current.quran.textSize).toBe("xlarge");
    });
  });

  describe("Prayer State", () => {
    it("should set user location", () => {
      const { result } = renderHook(() => useAppState());

      const location = {
        latitude: 40.7128,
        longitude: -74.006,
        city: "New York",
        country: "USA",
      };

      act(() => {
        result.current.setUserLocation(location);
      });

      expect(result.current.prayer.userLocation).toEqual(location);
    });

    it("should change calculation method", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setCalculationMethod("ISNA");
      });

      expect(result.current.prayer.calculationMethod).toBe("ISNA");
    });

    it("should toggle prayer notifications", () => {
      const { result } = renderHook(() => useAppState());

      const initialValue = result.current.prayer.notificationsEnabled;

      act(() => {
        result.current.togglePrayerNotifications();
      });

      expect(result.current.prayer.notificationsEnabled).toBe(!initialValue);
    });

    it("should set notification minutes before", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setNotificationMinutesBefore(15);
      });

      expect(result.current.prayer.notificationMinutesBefore).toBe(15);
    });
  });

  describe("Arabic State", () => {
    it("should set current level", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setCurrentLevel(3);
      });

      expect(result.current.arabic.currentLevel).toBe(3);
    });

    it("should set daily goal", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setDailyGoal(20);
      });

      expect(result.current.arabic.dailyGoal).toBe(20);
    });

    it("should increment reviews completed", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.incrementReviewsCompleted();
      });

      expect(result.current.arabic.reviewsCompleted).toBe(1);
    });

    it("should reset daily progress on new day", () => {
      const { result } = renderHook(() => useAppState());

      // Set reviews for yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      act(() => {
        result.current.setDailyGoal(10);
        // Manually set state to simulate yesterday's progress
        useAppState.setState({
          arabic: {
            ...result.current.arabic,
            reviewsCompleted: 5,
            lastReviewDate: yesterday.toISOString().split("T")[0],
          },
        });
      });

      // Increment on new day should reset
      act(() => {
        result.current.incrementReviewsCompleted();
      });

      expect(result.current.arabic.reviewsCompleted).toBe(1);
      expect(result.current.arabic.lastReviewDate).toBe(
        new Date().toISOString().split("T")[0],
      );
    });

    it("should calculate daily progress percentage", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setDailyGoal(10);
        useAppState.setState({
          arabic: {
            ...result.current.arabic,
            reviewsCompleted: 5,
          },
        });
      });

      const progress = selectDailyProgress(result.current);
      expect(progress.percentage).toBe(50);
    });
  });

  describe("UI State", () => {
    it("should change theme", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.ui.theme).toBe("dark");
    });

    it("should change font size", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setFontSize("large");
      });

      expect(result.current.ui.fontSize).toBe("large");
    });

    it("should toggle reduced motion", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(result.current.ui.reducedMotion).toBe(true);
    });
  });

  describe("Offline State", () => {
    it("should set offline status", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setOfflineStatus(true);
      });

      expect(result.current.offline.isOffline).toBe(true);
    });

    it("should set sync timestamp", () => {
      const { result } = renderHook(() => useAppState());

      const timestamp = Date.now();

      act(() => {
        result.current.setSyncTimestamp(timestamp);
      });

      expect(result.current.offline.lastSyncTimestamp).toBe(timestamp);
    });

    it("should set pending sync count", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setPendingSyncCount(5);
      });

      expect(result.current.offline.pendingSyncCount).toBe(5);
    });

    it("should set sync in progress", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        result.current.setSyncInProgress(true);
      });

      expect(result.current.offline.syncInProgress).toBe(true);
    });
  });

  describe("Custom Hooks", () => {
    it("useHasReachedDailyGoal should return true when goal reached", () => {
      const { result: storeResult } = renderHook(() => useAppState());

      act(() => {
        storeResult.current.setDailyGoal(10);
        useAppState.setState({
          arabic: {
            ...storeResult.current.arabic,
            reviewsCompleted: 10,
            lastReviewDate: new Date().toISOString().split("T")[0],
          },
        });
      });

      const { result: goalResult } = renderHook(() => useHasReachedDailyGoal());
      expect(goalResult.current).toBe(true);
    });

    it("useNeedsSync should return true when no sync timestamp", () => {
      const { result: storeResult } = renderHook(() => useAppState());

      act(() => {
        storeResult.current.setSyncTimestamp(null as any);
      });

      const { result: syncResult } = renderHook(() => useNeedsSync());
      expect(syncResult.current).toBe(true);
    });

    it("useNeedsSync should return true when sync older than 24 hours", () => {
      const { result: storeResult } = renderHook(() => useAppState());

      const yesterday = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago

      act(() => {
        storeResult.current.setSyncTimestamp(yesterday);
      });

      const { result: syncResult } = renderHook(() => useNeedsSync());
      expect(syncResult.current).toBe(true);
    });

    it("useNeedsSync should return true when pending changes exist", () => {
      const { result: storeResult } = renderHook(() => useAppState());

      act(() => {
        storeResult.current.setSyncTimestamp(Date.now());
        storeResult.current.setPendingSyncCount(3);
      });

      const { result: syncResult } = renderHook(() => useNeedsSync());
      expect(syncResult.current).toBe(true);
    });
  });

  describe("Reset State", () => {
    it("should reset all state to initial values", () => {
      const { result } = renderHook(() => useAppState());

      act(() => {
        // Change all state
        result.current.setCurrentSurah(5);
        result.current.setUserLocation({
          latitude: 40,
          longitude: -74,
        });
        result.current.setCurrentLevel(3);
        result.current.setTheme("dark");
        result.current.setOfflineStatus(true);

        // Reset
        result.current.resetAllState();
      });

      // Check all state is reset
      expect(result.current.quran.currentSurah).toBeNull();
      expect(result.current.prayer.userLocation).toBeNull();
      expect(result.current.arabic.currentLevel).toBe(1);
      expect(result.current.ui.theme).toBe("auto");
      expect(result.current.offline.isOffline).toBe(false);
    });
  });
});
