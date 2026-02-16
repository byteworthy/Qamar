/**
 * Hifz Store Tests
 *
 * Tests for Zustand store managing Hifz (Quran memorization) state with AsyncStorage persistence.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHifzStore } from '../hifz-store';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Hifz Store', () => {
  beforeEach(async () => {
    // Clear store and AsyncStorage before each test
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { result } = renderHook(() => useHifzStore());
    await act(async () => {
      result.current.reset();
    });
  });

  describe('Store Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useHifzStore());

      expect(result.current.memorizedVerses.size).toBe(0);
      expect(result.current.juzProgress).toHaveLength(30);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lastSyncedAt).toBeNull();
    });

    it('should initialize all 30 juz with not_started status', () => {
      const { result } = renderHook(() => useHifzStore());

      result.current.juzProgress.forEach((juz, index) => {
        expect(juz.juzNumber).toBe(index + 1);
        expect(juz.status).toBe('not_started');
        expect(juz.memorizedVerses).toBe(0);
      });
    });
  });

  describe('markVerseAsMemorized', () => {
    it('should add verse to memorizedVerses Map', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
      });

      expect(result.current.memorizedVerses.size).toBe(1);
      const verse = result.current.memorizedVerses.get('1:1');
      expect(verse).toBeDefined();
      expect(verse?.surahNumber).toBe(1);
      expect(verse?.verseNumber).toBe(1);
      expect(verse?.fsrsState.state).toBe('new');
    });

    it('should update lastSyncedAt timestamp', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(2, 5);
      });

      expect(result.current.lastSyncedAt).not.toBeNull();
      expect(new Date(result.current.lastSyncedAt!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should update juz progress for the relevant juz', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1); // Juz 1
      });

      const juz1 = result.current.getJuzProgress(1);
      expect(juz1.status).toBe('in_progress');
      expect(juz1.memorizedVerses).toBe(1);
    });

    it('should not duplicate verses if called multiple times', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.markVerseAsMemorized(1, 1);
      });

      expect(result.current.memorizedVerses.size).toBe(1);
    });
  });

  describe('updateAfterRecitation', () => {
    it('should update FSRS state with "good" rating', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
      });

      const initialState = result.current.memorizedVerses.get('1:1')!;
      const initialReviewCount = initialState.fsrsState.reviewCount;

      act(() => {
        result.current.updateAfterRecitation(1, 1, 'good', []);
      });

      const updatedState = result.current.memorizedVerses.get('1:1')!;
      expect(updatedState.fsrsState.reviewCount).toBe(initialReviewCount + 1);
      expect(updatedState.lastReviewedAt).not.toBeNull();
      expect(updatedState.fsrsState.stability).toBeGreaterThan(0);
    });

    it('should update FSRS state to "relearning" with "again" rating', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.updateAfterRecitation(1, 1, 'good', []);
        result.current.updateAfterRecitation(1, 1, 'again', ['mistake']);
      });

      const state = result.current.memorizedVerses.get('1:1')!;
      expect(state.fsrsState.state).toBe('relearning');
      expect(state.mistakeCount).toBeGreaterThan(0);
    });

    it('should increment mistakeCount when mistakes provided', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.updateAfterRecitation(1, 1, 'hard', ['word1', 'word2']);
      });

      const state = result.current.memorizedVerses.get('1:1')!;
      expect(state.mistakeCount).toBe(1);
      expect(state.lastMistakes).toEqual(['word1', 'word2']);
    });

    it('should keep only last 5 mistakes', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.updateAfterRecitation(1, 1, 'hard', ['m1']);
        result.current.updateAfterRecitation(1, 1, 'hard', ['m2']);
        result.current.updateAfterRecitation(1, 1, 'hard', ['m3']);
        result.current.updateAfterRecitation(1, 1, 'hard', ['m4']);
        result.current.updateAfterRecitation(1, 1, 'hard', ['m5']);
        result.current.updateAfterRecitation(1, 1, 'hard', ['m6']);
      });

      const state = result.current.memorizedVerses.get('1:1')!;
      expect(state.lastMistakes).toHaveLength(1);
      expect(state.lastMistakes).toEqual(['m6']);
    });

    it('should handle verse not found gracefully', () => {
      const { result } = renderHook(() => useHifzStore());

      expect(() => {
        act(() => {
          result.current.updateAfterRecitation(99, 99, 'good', []);
        });
      }).not.toThrow();
    });
  });

  describe('getVerseState', () => {
    it('should return verse state if exists', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
      });

      const state = result.current.getVerseState(1, 1);
      expect(state).toBeDefined();
      expect(state?.surahNumber).toBe(1);
      expect(state?.verseNumber).toBe(1);
    });

    it('should return undefined if verse not found', () => {
      const { result } = renderHook(() => useHifzStore());

      const state = result.current.getVerseState(99, 99);
      expect(state).toBeUndefined();
    });
  });

  describe('getReviewQueue', () => {
    it('should return empty array when no verses are due', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
      });

      const queue = result.current.getReviewQueue();
      expect(queue).toEqual([]);
    });

    it('should return due verses sorted by days overdue', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.markVerseAsMemorized(1, 2);
        result.current.markVerseAsMemorized(1, 3);
      });

      // Force verses to be overdue by manipulating nextReviewDate
      act(() => {
        const verse1 = result.current.memorizedVerses.get('1:1')!;
        const verse2 = result.current.memorizedVerses.get('1:2')!;
        const verse3 = result.current.memorizedVerses.get('1:3')!;

        result.current.memorizedVerses.set('1:1', {
          ...verse1,
          nextReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
        result.current.memorizedVerses.set('1:2', {
          ...verse2,
          nextReviewDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        });
        result.current.memorizedVerses.set('1:3', {
          ...verse3,
          nextReviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Future
        });
      });

      const queue = result.current.getReviewQueue();
      expect(queue).toHaveLength(2);
      expect(queue[0].verseNumber).toBe(1); // Most overdue (3 days)
      expect(queue[1].verseNumber).toBe(2); // Less overdue (1 day)
    });
  });

  describe('getDueVerseCount', () => {
    it('should return 0 when no verses are due', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
      });

      expect(result.current.getDueVerseCount()).toBe(0);
    });

    it('should count due verses correctly', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.markVerseAsMemorized(1, 2);
      });

      // Force verses to be overdue
      act(() => {
        const verse1 = result.current.memorizedVerses.get('1:1')!;
        result.current.memorizedVerses.set('1:1', {
          ...verse1,
          nextReviewDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        });
      });

      expect(result.current.getDueVerseCount()).toBe(1);
    });
  });

  describe('getJuzProgress', () => {
    it('should return correct juz progress', () => {
      const { result } = renderHook(() => useHifzStore());

      const juz1 = result.current.getJuzProgress(1);
      expect(juz1.juzNumber).toBe(1);
      expect(juz1.status).toBe('not_started');
    });

    it('should throw error for invalid juz number', () => {
      const { result } = renderHook(() => useHifzStore());

      expect(() => result.current.getJuzProgress(0)).toThrow();
      expect(() => result.current.getJuzProgress(31)).toThrow();
    });
  });

  describe('calculateJuzProgress', () => {
    it('should update juz status to in_progress when verses memorized', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1); // Juz 1
      });

      const juz1 = result.current.getJuzProgress(1);
      expect(juz1.status).toBe('in_progress');
      expect(juz1.memorizedVerses).toBe(1);
    });

    it('should count memorized verses per juz correctly', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1); // Juz 1
        result.current.markVerseAsMemorized(1, 2); // Juz 1
        result.current.markVerseAsMemorized(2, 1); // Juz 1
      });

      const juz1 = result.current.getJuzProgress(1);
      expect(juz1.memorizedVerses).toBe(3);
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      const { result } = renderHook(() => useHifzStore());

      act(() => {
        result.current.markVerseAsMemorized(1, 1);
        result.current.markVerseAsMemorized(1, 2);
      });

      expect(result.current.memorizedVerses.size).toBe(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.memorizedVerses.size).toBe(0);
      expect(result.current.lastSyncedAt).toBeNull();
    });
  });

  describe('Persistence', () => {
    it('should persist memorizedVerses to AsyncStorage', async () => {
      const { result } = renderHook(() => useHifzStore());

      await act(async () => {
        result.current.markVerseAsMemorized(1, 1);
        // Allow persist middleware to write
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should restore state from AsyncStorage', async () => {
      const mockState = {
        state: {
          memorizedVerses: [['1:1', {
            surahNumber: 1,
            verseNumber: 1,
            memorizedAt: '2026-02-16T00:00:00.000Z',
            lastReviewedAt: null,
            nextReviewDate: '2026-02-17T00:00:00.000Z',
            fsrsState: {
              difficulty: 0.5,
              stability: 0,
              reviewCount: 0,
              state: 'new',
            },
            mistakeCount: 0,
            lastMistakes: [],
          }]],
          juzProgress: Array.from({ length: 30 }, (_, i) => ({
            juzNumber: i + 1,
            totalVerses: 0,
            memorizedVerses: i === 0 ? 1 : 0,
            status: i === 0 ? 'in_progress' : 'not_started',
          })),
          lastSyncedAt: '2026-02-16T00:00:00.000Z',
        },
        version: 0,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockState));

      const { result } = renderHook(() => useHifzStore());

      await waitFor(() => {
        expect(result.current.memorizedVerses.size).toBe(1);
      });

      const verse = result.current.getVerseState(1, 1);
      expect(verse).toBeDefined();
      expect(verse?.surahNumber).toBe(1);
    });
  });
});
