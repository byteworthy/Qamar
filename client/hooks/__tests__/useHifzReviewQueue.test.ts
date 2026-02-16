/**
 * useHifzReviewQueue Hook Tests
 *
 * Tests review queue for spaced repetition
 */

import { renderHook, act } from '@testing-library/react-native';
import { useHifzReviewQueue } from '../useHifzReviewQueue';
import { useHifzStore } from '../../stores/hifz-store';
import type { HifzVerseState } from '../../../shared/types/hifz';

// Mock dependencies
jest.mock('@/stores/hifz-store');

const mockUseHifzStore = useHifzStore as jest.MockedFunction<typeof useHifzStore>;

describe('useHifzReviewQueue', () => {
  const now = new Date('2026-02-16T12:00:00Z');
  const today = now.toISOString();
  const yesterday = new Date('2026-02-15T12:00:00Z').toISOString();
  const tomorrow = new Date('2026-02-17T12:00:00Z').toISOString();
  const threeDaysAgo = new Date('2026-02-13T12:00:00Z').toISOString();
  const fourDaysFromNow = new Date('2026-02-20T12:00:00Z').toISOString();
  const eightDaysFromNow = new Date('2026-02-24T12:00:00Z').toISOString();

  const mockDueVerses: HifzVerseState[] = [
    {
      surahNumber: 1,
      verseNumber: 1,
      memorizedAt: '2026-02-10T12:00:00Z',
      lastReviewedAt: '2026-02-14T12:00:00Z',
      nextReviewDate: yesterday, // Due yesterday (overdue)
      fsrsState: {
        difficulty: 0.5,
        stability: 1.0,
        reviewCount: 2,
        state: 'review',
      },
      mistakeCount: 0,
      lastMistakes: [],
    },
    {
      surahNumber: 1,
      verseNumber: 2,
      memorizedAt: '2026-02-12T12:00:00Z',
      lastReviewedAt: '2026-02-15T12:00:00Z',
      nextReviewDate: today, // Due today
      fsrsState: {
        difficulty: 0.6,
        stability: 0.8,
        reviewCount: 1,
        state: 'learning',
      },
      mistakeCount: 1,
      lastMistakes: ['mistake'],
    },
    {
      surahNumber: 1,
      verseNumber: 3,
      memorizedAt: '2026-02-11T12:00:00Z',
      lastReviewedAt: '2026-02-14T12:00:00Z',
      nextReviewDate: threeDaysAgo, // Due 3 days ago (very overdue)
      fsrsState: {
        difficulty: 0.7,
        stability: 0.5,
        reviewCount: 3,
        state: 'relearning',
      },
      mistakeCount: 2,
      lastMistakes: ['mistake1', 'mistake2'],
    },
  ];

  const mockUpcomingVerses: HifzVerseState[] = [
    {
      surahNumber: 2,
      verseNumber: 1,
      memorizedAt: '2026-02-14T12:00:00Z',
      lastReviewedAt: '2026-02-15T12:00:00Z',
      nextReviewDate: tomorrow, // Due tomorrow
      fsrsState: {
        difficulty: 0.4,
        stability: 2.0,
        reviewCount: 1,
        state: 'learning',
      },
      mistakeCount: 0,
      lastMistakes: [],
    },
    {
      surahNumber: 2,
      verseNumber: 2,
      memorizedAt: '2026-02-13T12:00:00Z',
      lastReviewedAt: '2026-02-14T12:00:00Z',
      nextReviewDate: fourDaysFromNow, // Due in 4 days (this week)
      fsrsState: {
        difficulty: 0.5,
        stability: 3.0,
        reviewCount: 2,
        state: 'review',
      },
      mistakeCount: 0,
      lastMistakes: [],
    },
    {
      surahNumber: 2,
      verseNumber: 3,
      memorizedAt: '2026-02-10T12:00:00Z',
      lastReviewedAt: '2026-02-12T12:00:00Z',
      nextReviewDate: eightDaysFromNow, // Due in 8 days (next week)
      fsrsState: {
        difficulty: 0.3,
        stability: 7.0,
        reviewCount: 3,
        state: 'review',
      },
      mistakeCount: 0,
      lastMistakes: [],
    },
  ];

  const mockGetReviewQueue = jest.fn();
  const mockGetDueVerseCount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(now);

    // Mock store
    mockUseHifzStore.mockReturnValue({
      getReviewQueue: mockGetReviewQueue,
      getDueVerseCount: mockGetDueVerseCount,
      memorizedVerses: new Map(),
      juzProgress: [],
      isLoading: false,
      lastSyncedAt: null,
      markVerseAsMemorized: jest.fn(),
      updateAfterRecitation: jest.fn(),
      getVerseState: jest.fn(),
      getJuzProgress: jest.fn(),
      calculateJuzProgress: jest.fn(),
      reset: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Review queue', () => {
    it('should return due verses from store', () => {
      mockGetReviewQueue.mockReturnValue(mockDueVerses);
      mockGetDueVerseCount.mockReturnValue(mockDueVerses.length);

      const { result } = renderHook(() => useHifzReviewQueue());

      expect(result.current.dueVerses).toEqual(mockDueVerses);
      expect(result.current.dueCount).toBe(3);
    });

    it('should handle empty review queue', () => {
      mockGetReviewQueue.mockReturnValue([]);
      mockGetDueVerseCount.mockReturnValue(0);

      const { result } = renderHook(() => useHifzReviewQueue());

      expect(result.current.dueVerses).toEqual([]);
      expect(result.current.dueCount).toBe(0);
    });
  });

  describe('Upcoming reviews', () => {
    it('should calculate upcoming reviews correctly', () => {
      // Mock store to return all verses (due + upcoming)
      const allVerses = [...mockDueVerses, ...mockUpcomingVerses];
      mockGetReviewQueue.mockReturnValue(mockDueVerses);
      mockGetDueVerseCount.mockReturnValue(mockDueVerses.length);

      // Mock the store's memorizedVerses Map
      const versesMap = new Map<string, HifzVerseState>();
      allVerses.forEach(v => {
        versesMap.set(`${v.surahNumber}:${v.verseNumber}`, v);
      });

      mockUseHifzStore.mockReturnValue({
        getReviewQueue: mockGetReviewQueue,
        getDueVerseCount: mockGetDueVerseCount,
        memorizedVerses: versesMap,
        juzProgress: [],
        isLoading: false,
        lastSyncedAt: null,
        markVerseAsMemorized: jest.fn(),
        updateAfterRecitation: jest.fn(),
        getVerseState: jest.fn(),
        getJuzProgress: jest.fn(),
        calculateJuzProgress: jest.fn(),
        reset: jest.fn(),
      } as any);

      const { result } = renderHook(() => useHifzReviewQueue());

      // Today: 3 due verses (yesterday, today, 3 days ago)
      expect(result.current.upcomingReviews.today).toBe(3);

      // Tomorrow: 1 verse due tomorrow
      expect(result.current.upcomingReviews.tomorrow).toBe(1);

      // This week: 1 verse due in 4 days (within 7 days from now)
      expect(result.current.upcomingReviews.thisWeek).toBe(1);
    });

    it('should handle no upcoming reviews', () => {
      mockGetReviewQueue.mockReturnValue([]);
      mockGetDueVerseCount.mockReturnValue(0);
      mockUseHifzStore.mockReturnValue({
        getReviewQueue: mockGetReviewQueue,
        getDueVerseCount: mockGetDueVerseCount,
        memorizedVerses: new Map(),
        juzProgress: [],
        isLoading: false,
        lastSyncedAt: null,
        markVerseAsMemorized: jest.fn(),
        updateAfterRecitation: jest.fn(),
        getVerseState: jest.fn(),
        getJuzProgress: jest.fn(),
        calculateJuzProgress: jest.fn(),
        reset: jest.fn(),
      } as any);

      const { result } = renderHook(() => useHifzReviewQueue());

      expect(result.current.upcomingReviews.today).toBe(0);
      expect(result.current.upcomingReviews.tomorrow).toBe(0);
      expect(result.current.upcomingReviews.thisWeek).toBe(0);
    });
  });

  describe('Refresh queue', () => {
    it('should trigger recalculation when refreshQueue is called', () => {
      mockGetReviewQueue.mockReturnValue(mockDueVerses);
      mockGetDueVerseCount.mockReturnValue(mockDueVerses.length);

      const { result } = renderHook(() => useHifzReviewQueue());

      const initialCount = result.current.dueCount;

      // Update mock to return different data
      mockGetReviewQueue.mockReturnValue([mockDueVerses[0]]);
      mockGetDueVerseCount.mockReturnValue(1);

      act(() => {
        result.current.refreshQueue();
      });

      // Should call store methods again
      expect(mockGetReviewQueue).toHaveBeenCalledTimes(2);
      expect(mockGetDueVerseCount).toHaveBeenCalledTimes(2);
    });
  });

  describe('Memoization', () => {
    it('should memoize calculations to avoid expensive recalculations', () => {
      const versesMap = new Map<string, HifzVerseState>();
      mockDueVerses.forEach(v => {
        versesMap.set(`${v.surahNumber}:${v.verseNumber}`, v);
      });

      mockGetReviewQueue.mockReturnValue(mockDueVerses);
      mockGetDueVerseCount.mockReturnValue(mockDueVerses.length);
      mockUseHifzStore.mockReturnValue({
        getReviewQueue: mockGetReviewQueue,
        getDueVerseCount: mockGetDueVerseCount,
        memorizedVerses: versesMap,
        juzProgress: [],
        isLoading: false,
        lastSyncedAt: null,
        markVerseAsMemorized: jest.fn(),
        updateAfterRecitation: jest.fn(),
        getVerseState: jest.fn(),
        getJuzProgress: jest.fn(),
        calculateJuzProgress: jest.fn(),
        reset: jest.fn(),
      } as any);

      const { result, rerender } = renderHook(() => useHifzReviewQueue());

      const firstUpcoming = result.current.upcomingReviews;

      // Re-render without changing data
      rerender();

      const secondUpcoming = result.current.upcomingReviews;

      // Should be same object reference (memoized)
      expect(firstUpcoming).toBe(secondUpcoming);
    });
  });
});
