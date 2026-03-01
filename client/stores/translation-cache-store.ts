/**
 * Translation Cache Store
 *
 * Persists online translations in AsyncStorage so they're available offline.
 * LRU eviction at 5000 entries to keep storage bounded.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// TYPES
// =============================================================================

export interface CachedTranslation {
  sourceText: string;
  translatedText: string;
  from: string;
  to: string;
  transliteration: string | null;
  cachedAt: number;
}

interface TranslationCacheState {
  cache: Record<string, CachedTranslation>;
  addToCache: (entry: Omit<CachedTranslation, "cachedAt">) => void;
  lookupCache: (
    text: string,
    from: string,
    to: string,
  ) => CachedTranslation | null;
  clearCache: () => void;
  getCacheSize: () => number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_CACHE_ENTRIES = 5000;

// =============================================================================
// HELPERS
// =============================================================================

function makeCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text.toLowerCase().trim()}`;
}

/** Evict oldest entries to stay within limit */
function evictOldest(
  cache: Record<string, CachedTranslation>,
): Record<string, CachedTranslation> {
  const entries = Object.entries(cache);
  if (entries.length <= MAX_CACHE_ENTRIES) return cache;

  entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
  const toRemove = entries.length - MAX_CACHE_ENTRIES;
  const remaining = entries.slice(toRemove);
  return Object.fromEntries(remaining);
}

// =============================================================================
// STORE
// =============================================================================

export const useTranslationCache = create<TranslationCacheState>()(
  persist(
    (set, get) => ({
      cache: {},

      addToCache: (entry) => {
        const key = makeCacheKey(entry.sourceText, entry.from, entry.to);
        set((state) => {
          const updated = {
            ...state.cache,
            [key]: { ...entry, cachedAt: Date.now() },
          };
          return { cache: evictOldest(updated) };
        });
      },

      lookupCache: (text, from, to) => {
        const key = makeCacheKey(text, from, to);
        return get().cache[key] ?? null;
      },

      clearCache: () => set({ cache: {} }),

      getCacheSize: () => Object.keys(get().cache).length,
    }),
    {
      name: "noor-translation-cache",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
