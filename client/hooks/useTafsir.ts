import { useState } from 'react';
import { useTafsirCache, TafsirData } from '@/stores/tafsir-cache-store';

export function useTafsir() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getTafsir, setTafsir } = useTafsirCache();

  const fetchTafsir = async (
    surahNumber: number,
    verseNumber: number
  ): Promise<TafsirData | null> => {
    // Check cache first
    const cached = getTafsir(surahNumber, verseNumber);
    if (cached) {
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tafsir/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ surahNumber, verseNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tafsir');
      }

      const data = await response.json();

      // Remove remainingQuota before caching
      const { remainingQuota, ...tafsirData } = data;

      // Cache the result
      setTafsir(surahNumber, verseNumber, tafsirData as TafsirData);

      return tafsirData as TafsirData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchTafsir,
    isLoading,
    error,
    getCachedTafsir: getTafsir,
  };
}
