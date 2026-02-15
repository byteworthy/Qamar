/**
 * useQuranData Hook Tests
 *
 * Tests all Quran data hooks including:
 * - useQuranSurahs returns mock data
 * - useQuranVerses with surahId
 * - useQuranSearch
 * - Bookmark mutations
 *
 * Test Coverage Target: >80%
 */

import { renderHook } from '@testing-library/react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useQuranSurahs,
  useQuranVerses,
  useQuranSearch,
  useQuranBookmarks,
  useCreateBookmark,
  useDeleteBookmark,
} from '../useQuranData';

// The setup.ts already mocks @tanstack/react-query with useQuery as jest.fn()
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;

// We need useMutation to be a jest.fn - override the mock for this test file
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn((options: any) => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    _options: options, // Store options so we can test them
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Re-import after mock override
const { useMutation } = require('@tanstack/react-query');
const mockUseMutation = useMutation as jest.MockedFunction<any>;
const mockInvalidateQueries = jest.fn();

describe('useQuranData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
  });

  describe('useQuranSurahs', () => {
    it('should call useQuery with correct query key', () => {
      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      renderHook(() => useQuranSurahs());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['quran', 'surahs'],
        })
      );
    });

    it('should return surah data when loaded', () => {
      const mockSurahs = [
        {
          id: 1,
          name: '\u0627\u0644\u0641\u0627\u062A\u062D\u0629',
          transliteration: 'Al-Fatihah',
          translation: 'The Opening',
          numberOfVerses: 7,
          revelationPlace: 'Makkah',
        },
      ];
      mockUseQuery.mockReturnValue({
        data: mockSurahs,
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useQuranSurahs());

      expect(result.current.data).toEqual(mockSurahs);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return loading state initially', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { result } = renderHook(() => useQuranSurahs());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should return error when fetch fails', () => {
      const mockError = new Error('Network error');
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      } as any);

      const { result } = renderHook(() => useQuranSurahs());

      expect(result.current.error).toBe(mockError);
    });

    it('should set staleTime to 1 hour', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranSurahs());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 1000 * 60 * 60,
        })
      );
    });
  });

  describe('useQuranVerses', () => {
    it('should call useQuery with correct query key for surahId', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranVerses(1));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['quran', 'verses', 1],
        })
      );
    });

    it('should return verses for a specific surah', () => {
      const mockVerses = [
        {
          id: 1,
          surahId: 1,
          verseNumber: 1,
          textArabic: 'test arabic',
          textEnglish: 'In the name of Allah',
        },
      ];
      mockUseQuery.mockReturnValue({
        data: mockVerses,
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useQuranVerses(1));

      expect(result.current.data).toEqual(mockVerses);
    });

    it('should be disabled when surahId is 0', () => {
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, error: null } as any);

      renderHook(() => useQuranVerses(0));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should be enabled when surahId is positive', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranVerses(5));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });
  });

  describe('useQuranSearch', () => {
    it('should call useQuery with correct query key', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranSearch('Allah'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['quran', 'search', 'Allah'],
        })
      );
    });

    it('should be disabled when query is empty', () => {
      mockUseQuery.mockReturnValue({ data: undefined, isLoading: false, error: null } as any);

      renderHook(() => useQuranSearch(''));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should be enabled when query has content', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranSearch('mercy'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });

    it('should return search results', () => {
      const mockResults = [
        {
          id: 1,
          surahId: 1,
          verseNumber: 1,
          textArabic: 'test',
          textEnglish: 'In the name of Allah',
        },
      ];
      mockUseQuery.mockReturnValue({
        data: mockResults,
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useQuranSearch('Allah'));

      expect(result.current.data).toEqual(mockResults);
    });

    it('should set staleTime to 5 minutes', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranSearch('test'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 1000 * 60 * 5,
        })
      );
    });
  });

  describe('useCreateBookmark', () => {
    it('should call useMutation with mutationFn and onSuccess', () => {
      renderHook(() => useCreateBookmark());

      expect(mockUseMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          mutationFn: expect.any(Function),
          onSuccess: expect.any(Function),
        })
      );
    });

    it('should invalidate bookmarks query on success', () => {
      renderHook(() => useCreateBookmark());

      // Get the onSuccess callback from the mock call
      const options = mockUseMutation.mock.calls[0][0];
      options.onSuccess();

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['quran', 'bookmarks'],
      });
    });
  });

  describe('useDeleteBookmark', () => {
    it('should call useMutation with mutationFn and onSuccess', () => {
      renderHook(() => useDeleteBookmark());

      expect(mockUseMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          mutationFn: expect.any(Function),
          onSuccess: expect.any(Function),
        })
      );
    });

    it('should invalidate bookmarks query on success', () => {
      renderHook(() => useDeleteBookmark());

      const options = mockUseMutation.mock.calls[0][0];
      options.onSuccess();

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['quran', 'bookmarks'],
      });
    });
  });

  describe('useQuranBookmarks', () => {
    it('should call useQuery with correct query key', () => {
      mockUseQuery.mockReturnValue({ data: [], isLoading: false, error: null } as any);

      renderHook(() => useQuranBookmarks());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['quran', 'bookmarks'],
        })
      );
    });

    it('should return bookmarks data', () => {
      const mockBookmarks = [
        { id: 'bk-1', surahId: 1, verseNumber: 1, createdAt: '2026-01-01T00:00:00Z' },
      ];
      mockUseQuery.mockReturnValue({
        data: mockBookmarks,
        isLoading: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useQuranBookmarks());

      expect(result.current.data).toEqual(mockBookmarks);
    });
  });
});
