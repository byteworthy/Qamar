/**
 * Offline-First React Query Hooks
 *
 * Strategy: local SQLite first, API fallback, background sync on reconnect.
 * Follows the same hook pattern as useQuranData.ts.
 */

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppState } from "../stores/app-state";
import {
  getOfflineDatabase,
  initializeOfflineDatabase,
} from "../lib/offline-database";
import { getSyncEngine } from "../lib/sync-engine";
import type {
  Surah,
  Verse,
  Hadith,
  VocabularyWord,
} from "../../shared/offline-schema";

// ============================================================================
// DATABASE INITIALIZATION HOOK
// ============================================================================

/**
 * Initializes the offline database. Call once at app root.
 * Returns { isReady, error }.
 */
export function useOfflineDatabase() {
  const {
    data: isReady,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["offline", "init"],
    queryFn: async () => {
      await initializeOfflineDatabase();
      return true;
    },
    staleTime: Infinity,
    retry: 2,
  });

  return { isReady: isReady ?? false, isLoading, error };
}

// ============================================================================
// QURAN HOOKS (offline-first)
// ============================================================================

/**
 * Fetch all surahs, local-first with API fallback.
 */
export function useOfflineQuranSurahs() {
  return useQuery<Surah[]>({
    queryKey: ["offline", "surahs"],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        const local = await db.getAllSurahs();
        if (local.length > 0) return local;
      }
      // Fallback: fetch from API and cache locally
      const response = await fetch("/api/quran/surahs");
      if (!response.ok) throw new Error("Failed to fetch surahs");
      const surahs: Surah[] = await response.json();
      if (db.isReady()) {
        await db.upsertSurahs(surahs);
      }
      return surahs;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch verses for a surah, local-first with API fallback.
 */
export function useOfflineQuranVerses(surahNumber: number) {
  return useQuery<Verse[]>({
    queryKey: ["offline", "verses", surahNumber],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        const local = await db.getVersesBySurah(surahNumber);
        if (local.length > 0) return local;
      }
      const response = await fetch(`/api/quran/verses/${surahNumber}`);
      if (!response.ok) throw new Error("Failed to fetch verses");
      const verses: Verse[] = await response.json();
      if (db.isReady()) {
        await db.upsertVerses(verses);
      }
      return verses;
    },
    enabled: surahNumber > 0,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Search verses using FTS5 locally, with API fallback.
 */
export function useOfflineQuranSearch(query: string) {
  return useQuery<Verse[]>({
    queryKey: ["offline", "search", query],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        return db.searchVerses(query);
      }
      const response = await fetch(
        `/api/quran/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) throw new Error("Failed to search verses");
      return response.json();
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/** Combined Quran export */
export const useOfflineQuran = {
  useSurahs: useOfflineQuranSurahs,
  useVerses: useOfflineQuranVerses,
  useSearch: useOfflineQuranSearch,
};

// ============================================================================
// HADITH HOOKS (offline-first)
// ============================================================================

/**
 * Fetch hadiths by collection, local-first.
 */
export function useOfflineHadithByCollection(
  collection: string,
  grade?: string,
) {
  return useQuery<Hadith[]>({
    queryKey: ["offline", "hadiths", collection, grade],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        const local = await db.getHadithsByCollection(collection, grade);
        if (local.length > 0) return local;
      }
      const params = new URLSearchParams({ collection });
      if (grade) params.set("grade", grade);
      const response = await fetch(`/api/hadiths?${params}`);
      if (!response.ok) throw new Error("Failed to fetch hadiths");
      const hadiths: Hadith[] = await response.json();
      if (db.isReady()) {
        await db.upsertHadiths(hadiths);
      }
      return hadiths;
    },
    enabled: collection.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetch a single hadith by ID, local-first.
 */
export function useOfflineHadithById(id: number) {
  return useQuery<Hadith | null>({
    queryKey: ["offline", "hadith", id],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        const local = await db.getHadith(id);
        if (local) return local;
      }
      const response = await fetch(`/api/hadiths/${id}`);
      if (!response.ok) throw new Error("Failed to fetch hadith");
      return response.json();
    },
    enabled: id > 0,
    staleTime: 1000 * 60 * 60,
  });
}

/** Combined Hadith export */
export const useOfflineHadith = {
  useByCollection: useOfflineHadithByCollection,
  useById: useOfflineHadithById,
};

// ============================================================================
// VOCABULARY HOOKS (offline-first)
// ============================================================================

/**
 * Fetch vocabulary by category, local-first.
 */
export function useOfflineVocabularyByCategory(category: string) {
  return useQuery<VocabularyWord[]>({
    queryKey: ["offline", "vocabulary", "category", category],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        const local = await db.getVocabularyByCategory(category);
        if (local.length > 0) return local;
      }
      const response = await fetch(
        `/api/vocabulary?category=${encodeURIComponent(category)}`,
      );
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      const words: VocabularyWord[] = await response.json();
      if (db.isReady()) {
        await db.upsertVocabulary(words);
      }
      return words;
    },
    enabled: category.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Fetch vocabulary by difficulty level, local-first.
 */
export function useOfflineVocabularyByDifficulty(level: number) {
  return useQuery<VocabularyWord[]>({
    queryKey: ["offline", "vocabulary", "difficulty", level],
    queryFn: async () => {
      const db = getOfflineDatabase();
      if (db.isReady()) {
        const local = await db.getVocabularyByDifficulty(level);
        if (local.length > 0) return local;
      }
      const response = await fetch(`/api/vocabulary?difficulty=${level}`);
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      const words: VocabularyWord[] = await response.json();
      if (db.isReady()) {
        await db.upsertVocabulary(words);
      }
      return words;
    },
    enabled: level >= 1 && level <= 5,
    staleTime: 1000 * 60 * 60,
  });
}

/** Combined Vocabulary export */
export const useOfflineVocabulary = {
  useByCategory: useOfflineVocabularyByCategory,
  useByDifficulty: useOfflineVocabularyByDifficulty,
};

// ============================================================================
// SYNC HOOKS
// ============================================================================

/**
 * Hook that triggers background sync when connectivity changes.
 * Integrates with the Zustand offline state slice.
 */
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const setOfflineStatus = useAppState((s) => s.setOfflineStatus);
  const setSyncTimestamp = useAppState((s) => s.setSyncTimestamp);
  const setPendingSyncCount = useAppState((s) => s.setPendingSyncCount);
  const setSyncInProgress = useAppState((s) => s.setSyncInProgress);

  const performSync = useCallback(async () => {
    const engine = getSyncEngine();
    setSyncInProgress(true);

    try {
      const result = await engine.performFullSync();
      if (result.success) {
        setSyncTimestamp(Date.now());
        setPendingSyncCount(0);
        // Invalidate offline queries so they refetch from updated local DB
        queryClient.invalidateQueries({ queryKey: ["offline"] });
      } else {
        const remaining = await engine.getPendingCount();
        setPendingSyncCount(remaining);
      }
    } finally {
      setSyncInProgress(false);
    }
  }, [queryClient, setSyncTimestamp, setPendingSyncCount, setSyncInProgress]);

  // Listen for connectivity changes (NetInfo not imported to keep deps light)
  useEffect(() => {
    // On mount, check pending mutations
    const engine = getSyncEngine();
    engine.getPendingCount().then(setPendingSyncCount);

    // Subscribe to sync engine events
    const unsubscribe = engine.onSyncComplete((result) => {
      if (result.success) {
        setSyncTimestamp(Date.now());
      }
    });

    return unsubscribe;
  }, [setPendingSyncCount, setSyncTimestamp]);

  return { performSync };
}

/**
 * Mutation hook that queues writes when offline.
 * Uses client-wins conflict resolution for user data.
 */
export function useOfflineMutation<TPayload extends Record<string, unknown>>(
  entity: "bookmarks" | "reflections" | "progress",
  type: "create" | "update" | "delete",
) {
  const queryClient = useQueryClient();
  const isOffline = useAppState((s) => s.offline.isOffline);
  const setPendingSyncCount = useAppState((s) => s.setPendingSyncCount);

  return useMutation({
    mutationFn: async (payload: TPayload) => {
      if (isOffline) {
        // Queue for later replay
        const engine = getSyncEngine();
        await engine.queueMutation(type, entity, payload);
        const count = await engine.getPendingCount();
        setPendingSyncCount(count);
        return payload; // Optimistic return
      }

      // Online: send directly
      const methodMap = { create: "POST", update: "PUT", delete: "DELETE" };
      const response = await fetch(`/api/${entity}`, {
        method: methodMap[type],
        headers: { "Content-Type": "application/json" },
        body: type !== "delete" ? JSON.stringify(payload) : undefined,
      });
      if (!response.ok) throw new Error(`Failed to ${type} ${entity}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}
