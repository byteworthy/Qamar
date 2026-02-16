import { useState } from 'react';
import { useGamification } from '@/stores/gamification-store';

interface Dua {
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  occasion: string;
  category: string;
}

interface DuaRecommendationResponse {
  duas: Dua[];
  remainingQuota: number;
}

export function useDuaRecommender() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const { recordActivity } = useGamification();

  const recommend = async (situation: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/duas/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ situation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dua recommendations');
      }

      const data: DuaRecommendationResponse = await response.json();

      setDuas(data.duas);
      setRemainingQuota(data.remainingQuota);

      // Record gamification activity if duas found
      if (data.duas.length > 0) {
        recordActivity('dua_searched');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setDuas([]);
      setRemainingQuota(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommend,
    isLoading,
    error,
    duas,
    remainingQuota,
  };
}
