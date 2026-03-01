/**
 * useTajweed Hook
 *
 * Fetches and caches tajweed-annotated verse data per surah from the
 * Quran.Foundation API (`uthmani_tajweed` field). Parses the HTML
 * response into renderable TajweedSegment arrays keyed by verse number.
 */

import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  parseTajweedHtml,
  type TajweedSegment,
} from "@/services/tajweedParser";

// ============================================================================
// TYPES
// ============================================================================

interface UseTajweedResult {
  verses: Map<number, TajweedSegment[]>;
  isLoading: boolean;
  error: string | null;
}

interface QuranFoundationVerse {
  verse_key: string;
  text_uthmani_tajweed: string;
}

interface QuranFoundationResponse {
  verses: QuranFoundationVerse[];
  pagination?: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = "https://api.quran.foundation/api/v4";
const CACHE_KEY_PREFIX = "noor:tajweed:";
const PER_PAGE = 50;

// ============================================================================
// HELPERS
// ============================================================================

function buildCacheKey(surahNumber: number): string {
  return `${CACHE_KEY_PREFIX}${surahNumber}`;
}

/**
 * Parse a verse_key like "2:255" into its verse number.
 */
function parseVerseNumber(verseKey: string): number {
  const parts = verseKey.split(":");
  return parseInt(parts[1], 10);
}

/**
 * Fetch all pages of tajweed data for a surah from Quran.Foundation.
 * The API paginates responses, so we fetch until there are no more pages.
 */
async function fetchAllTajweedPages(
  surahNumber: number,
): Promise<QuranFoundationVerse[]> {
  const allVerses: QuranFoundationVerse[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const url =
      `${API_BASE}/quran/verses/uthmani_tajweed` +
      `?chapter_number=${surahNumber}` +
      `&per_page=${PER_PAGE}` +
      `&page=${page}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Quran.Foundation API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: QuranFoundationResponse = await response.json();
    allVerses.push(...data.verses);

    if (data.pagination?.next_page != null) {
      page = data.pagination.next_page;
    } else {
      hasMorePages = false;
    }
  }

  return allVerses;
}

// ============================================================================
// HOOK
// ============================================================================

export function useTajweed(surahNumber: number): UseTajweedResult {
  const [verses, setVerses] = useState<Map<number, TajweedSegment[]>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track the current surah to avoid stale updates on rapid navigation
  const currentSurahRef = useRef(surahNumber);

  useEffect(() => {
    currentSurahRef.current = surahNumber;

    if (surahNumber < 1 || surahNumber > 114) {
      setIsLoading(false);
      setError("Invalid surah number");
      return;
    }

    let cancelled = false;

    async function loadTajweed(): Promise<void> {
      setIsLoading(true);
      setError(null);

      // 1. Try loading from AsyncStorage cache
      const cacheKey = buildCacheKey(surahNumber);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached && !cancelled) {
        const parsed = buildVerseMap(
          JSON.parse(cached) as QuranFoundationVerse[],
        );
        setVerses(parsed);
        setIsLoading(false);
        return;
      }

      // 2. Fetch from API
      const apiVerses = await fetchAllTajweedPages(surahNumber);

      if (cancelled) return;

      // 3. Cache the raw response
      await AsyncStorage.setItem(cacheKey, JSON.stringify(apiVerses));

      // 4. Parse and set state
      const parsed = buildVerseMap(apiVerses);
      setVerses(parsed);
      setIsLoading(false);
    }

    loadTajweed().catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  return { verses, isLoading, error };
}

// ============================================================================
// INTERNAL
// ============================================================================

/**
 * Build a Map<verseNumber, TajweedSegment[]> from raw API verses.
 */
function buildVerseMap(
  apiVerses: QuranFoundationVerse[],
): Map<number, TajweedSegment[]> {
  const map = new Map<number, TajweedSegment[]>();

  for (const verse of apiVerses) {
    const verseNumber = parseVerseNumber(verse.verse_key);
    const segments = parseTajweedHtml(verse.text_uthmani_tajweed);
    map.set(verseNumber, segments);
  }

  return map;
}
