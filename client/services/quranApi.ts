/**
 * Al Quran Cloud API Client
 *
 * Free API with no authentication or rate limits.
 * Docs: https://alquran.cloud/api
 *
 * Used when USE_MOCK_DATA is false in useQuranData.ts
 */

import type { Surah, Verse } from '../hooks/useQuranData';

const BASE_URL = 'https://api.alquran.cloud/v1';

// In-memory cache for API responses (Quran data never changes)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function cachedFetch<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      if (json.code !== 200 || json.status !== 'OK') {
        throw new Error(`API returned error: ${json.status}`);
      }
      cache.set(url, { data: json.data, timestamp: Date.now() });
      return json.data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

// --------------------------------------------------------------------------
// API response types (raw from alquran.cloud)
// --------------------------------------------------------------------------

interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surah?: ApiSurah;
}

interface ApiSurahFull {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: ApiAyah[];
}

interface ApiSearchMatch {
  number: number;
  text: string;
  numberInSurah: number;
  surah: ApiSurah;
}

interface ApiSearchResult {
  count: number;
  matches: ApiSearchMatch[];
}

// --------------------------------------------------------------------------
// Mappers
// --------------------------------------------------------------------------

function mapSurah(raw: ApiSurah): Surah {
  return {
    id: raw.number,
    name: raw.name,
    transliteration: raw.englishName,
    translation: raw.englishNameTranslation,
    numberOfVerses: raw.numberOfAyahs,
    revelationPlace: raw.revelationType === 'Meccan' ? 'Makkah' : 'Madinah',
  };
}

function mapAyah(raw: ApiAyah, surahId: number, englishText?: string): Verse {
  return {
    id: raw.number,
    surahId,
    verseNumber: raw.numberInSurah,
    textArabic: raw.text,
    textEnglish: englishText ?? raw.text,
  };
}

// --------------------------------------------------------------------------
// Public API functions
// --------------------------------------------------------------------------

/**
 * Fetch metadata for all 114 surahs.
 */
export async function fetchAllSurahs(): Promise<Surah[]> {
  const data = await cachedFetch<ApiSurah[]>(`${BASE_URL}/surah`);
  return data.map(mapSurah);
}

/**
 * Fetch a complete surah with Arabic text and English translation.
 * Uses two parallel requests for Arabic (quran-uthmani) and English (en.asad).
 */
export async function fetchSurah(
  number: number,
  edition: string = 'en.asad'
): Promise<{ surah: Surah; verses: Verse[] }> {
  const [arabicData, englishData] = await Promise.all([
    cachedFetch<ApiSurahFull>(`${BASE_URL}/surah/${number}/quran-uthmani`),
    cachedFetch<ApiSurahFull>(`${BASE_URL}/surah/${number}/${edition}`),
  ]);

  const surah = mapSurah(arabicData);
  const verses: Verse[] = arabicData.ayahs.map((ayah, i) =>
    mapAyah(ayah, number, englishData.ayahs[i]?.text)
  );

  return { surah, verses };
}

/**
 * Search verses across all surahs (English).
 */
export async function searchQuran(keyword: string): Promise<Verse[]> {
  const data = await cachedFetch<ApiSearchResult>(
    `${BASE_URL}/search/${encodeURIComponent(keyword)}/all/en`
  );
  return data.matches.map((m) => ({
    id: m.number,
    surahId: m.surah.number,
    verseNumber: m.numberInSurah,
    textArabic: '', // Search endpoint only returns the searched edition text
    textEnglish: m.text,
  }));
}

/**
 * Get audio recitation URL for a surah (Mishary Rashid Alafasy).
 * Returns the edition endpoint that contains audio URLs.
 */
export function getAudioUrl(surahNumber: number): string {
  return `${BASE_URL}/surah/${surahNumber}/ar.alafasy`;
}

/**
 * Fetch audio data for a surah (Mishary Alafasy).
 * Returns per-ayah audio URLs.
 */
export async function fetchSurahAudio(
  surahNumber: number
): Promise<{ surahName: string; ayahs: { number: number; audioUrl: string }[] }> {
  const data = await cachedFetch<{
    name: string;
    ayahs: { number: number; numberInSurah: number; audio: string }[];
  }>(`${BASE_URL}/surah/${surahNumber}/ar.alafasy`);

  return {
    surahName: data.name,
    ayahs: data.ayahs.map((a) => ({
      number: a.numberInSurah,
      audioUrl: a.audio,
    })),
  };
}

/**
 * Clear the in-memory cache (useful for testing or forced refresh).
 */
export function clearQuranCache(): void {
  cache.clear();
}
