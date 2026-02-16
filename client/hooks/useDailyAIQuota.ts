/**
 * useDailyAIQuota Hook
 *
 * Tracks remaining free AI calls across tutor, pronunciation, and translation.
 * Stores quota locally and syncs from server responses. Resets at midnight.
 */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEntitlements } from './useEntitlements';

// =============================================================================
// CONSTANTS
// =============================================================================

const FREE_DAILY_LIMIT = 3;
const STORAGE_KEY = '@noor/ai_quota';

interface StoredQuota {
  date: string; // YYYY-MM-DD
  used: number;
}

// =============================================================================
// HOOK
// =============================================================================

export interface DailyAIQuotaHook {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
  updateFromServer: (remainingQuota: number) => void;
  increment: () => void;
}

export function useDailyAIQuota(): DailyAIQuotaHook {
  const { isPlusUser } = useEntitlements();
  const [used, setUsed] = useState(0);

  const todayKey = new Date().toISOString().slice(0, 10);

  // Sync from server response (server is source of truth)
  const updateFromServer = useCallback(
    (remainingQuota: number) => {
      if (isPlusUser) return;
      const serverUsed = FREE_DAILY_LIMIT - Math.max(0, remainingQuota);
      setUsed(Math.max(0, serverUsed));
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayKey, used: Math.max(0, serverUsed) }),
      ).catch(() => {});
    },
    [isPlusUser, todayKey],
  );

  // Optimistic local increment (before server confirms)
  const increment = useCallback(() => {
    if (isPlusUser) return;
    setUsed((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayKey, used: next }),
      ).catch(() => {});
      return next;
    });
  }, [isPlusUser, todayKey]);

  return {
    remaining: isPlusUser ? Infinity : Math.max(0, FREE_DAILY_LIMIT - used),
    limit: FREE_DAILY_LIMIT,
    isUnlimited: isPlusUser,
    updateFromServer,
    increment,
  };
}
