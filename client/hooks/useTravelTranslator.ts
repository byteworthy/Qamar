/**
 * useTravelTranslator Hook
 *
 * Combines phrasebook + translation cache + online API for hybrid offline translation.
 * Priority: phrasebook match → cache hit → online (then cache result).
 */

import { useState, useCallback, useMemo } from "react";
import { apiRequest } from "@/lib/query-client";
import { useTranslationCache } from "@/stores/translation-cache-store";
import { useTravelFavorites } from "@/stores/travel-favorites-store";
import {
  TRAVEL_PHRASES,
  TRAVEL_CATEGORIES,
  getPhrasesByCategory,
  searchPhrases as searchPhrasebook,
  type TravelCategory,
  type TravelPhrase,
  type TravelCategoryInfo,
} from "@/data/travel-phrasebook";
import * as Sentry from "@sentry/react-native";

// =============================================================================
// TYPES
// =============================================================================

export type SourceLanguage = "en" | "es";

export interface FreeformResult {
  translatedText: string;
  transliteration: string | null;
  isOffline: boolean;
  source: string;
}

export interface TravelTranslatorHook {
  // Language
  sourceLang: SourceLanguage;
  setSourceLang: (lang: SourceLanguage) => void;
  isArabicToSource: boolean;
  toggleDirection: () => void;

  // Phrasebook
  categories: TravelCategoryInfo[];
  getPhrases: (category: TravelCategory) => TravelPhrase[];
  searchPhrases: (query: string) => TravelPhrase[];

  // Free-form translation
  freeformText: string;
  setFreeformText: (text: string) => void;
  translateFreeform: () => Promise<void>;
  isTranslating: boolean;
  freeformResult: FreeformResult | null;
  error: string | null;
  clearFreeform: () => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavoritePhrases: () => TravelPhrase[];

  // Cache stats
  cachedTranslationCount: number;
}

// =============================================================================
// HOOK
// =============================================================================

export function useTravelTranslator(): TravelTranslatorHook {
  const [sourceLang, setSourceLang] = useState<SourceLanguage>("en");
  const [isArabicToSource, setIsArabicToSource] = useState(false);
  const [freeformText, setFreeformText] = useState("");
  const [freeformResult, setFreeformResult] = useState<FreeformResult | null>(
    null,
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addToCache, lookupCache, getCacheSize } = useTranslationCache();
  const { favorites, toggleFavorite, isFavorite } = useTravelFavorites();

  // ====================================================================
  // Language direction
  // ====================================================================

  const toggleDirection = useCallback(() => {
    setIsArabicToSource((prev) => !prev);
    setFreeformResult(null);
    setError(null);
  }, []);

  // ====================================================================
  // Phrasebook
  // ====================================================================

  const categories = TRAVEL_CATEGORIES;

  const getPhrases = useCallback(
    (category: TravelCategory) => getPhrasesByCategory(category),
    [],
  );

  const searchPhrases = useCallback(
    (query: string) => searchPhrasebook(query, sourceLang),
    [sourceLang],
  );

  // ====================================================================
  // Free-form translation
  // ====================================================================

  const translateFreeform = useCallback(async () => {
    const trimmed = freeformText.trim();
    if (!trimmed) return;

    setIsTranslating(true);
    setError(null);
    setFreeformResult(null);

    const from = isArabicToSource ? "ar" : sourceLang;
    const to = isArabicToSource ? sourceLang : "ar";

    try {
      // 1. Check phrasebook for exact match
      const sourcePhrases = TRAVEL_PHRASES;
      const lowerTrimmed = trimmed.toLowerCase();
      const phraseMatch = sourcePhrases.find((p) => {
        if (isArabicToSource) {
          return (
            p.ar === trimmed || p.transliteration.toLowerCase() === lowerTrimmed
          );
        }
        const sourceText = sourceLang === "en" ? p.en : p.es;
        return sourceText.toLowerCase() === lowerTrimmed;
      });

      if (phraseMatch) {
        const translated = isArabicToSource
          ? sourceLang === "en"
            ? phraseMatch.en
            : phraseMatch.es
          : phraseMatch.ar;
        setFreeformResult({
          translatedText: translated,
          transliteration: isArabicToSource
            ? null
            : phraseMatch.transliteration,
          isOffline: true,
          source: "phrasebook",
        });
        return;
      }

      // 2. Check cache
      const cached = lookupCache(trimmed, from, to);
      if (cached) {
        setFreeformResult({
          translatedText: cached.translatedText,
          transliteration: cached.transliteration,
          isOffline: true,
          source: "cache",
        });
        return;
      }

      // 3. Online API
      await Sentry.startSpan(
        { name: "travel-translate", op: "api.request" },
        async () => {
          const response = await apiRequest("POST", "/api/translate", {
            text: trimmed,
            from,
            to,
          });

          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment.");
          }
          if (!response.ok) {
            throw new Error("Translation failed. Please try again.");
          }

          const data = await response.json();

          // Cache for offline reuse
          addToCache({
            sourceText: trimmed,
            translatedText: data.translatedText,
            from,
            to,
            transliteration: data.transliteration ?? null,
          });

          setFreeformResult({
            translatedText: data.translatedText,
            transliteration: data.transliteration ?? null,
            isOffline: false,
            source: data.source,
          });
        },
      );
    } catch (err: any) {
      const message =
        err?.message ||
        "Translation unavailable offline. Connect to the internet to translate new text.";
      setError(message);
      Sentry.captureException(err);
    } finally {
      setIsTranslating(false);
    }
  }, [freeformText, sourceLang, isArabicToSource, lookupCache, addToCache]);

  const clearFreeform = useCallback(() => {
    setFreeformText("");
    setFreeformResult(null);
    setError(null);
  }, []);

  // ====================================================================
  // Favorites
  // ====================================================================

  const getFavoritePhrases = useCallback(() => {
    return TRAVEL_PHRASES.filter((p) => favorites.includes(p.id));
  }, [favorites]);

  // ====================================================================
  // Cache stats
  // ====================================================================

  const cachedTranslationCount = useMemo(() => getCacheSize(), [getCacheSize]);

  return {
    sourceLang,
    setSourceLang,
    isArabicToSource,
    toggleDirection,
    categories,
    getPhrases,
    searchPhrases,
    freeformText,
    setFreeformText,
    translateFreeform,
    isTranslating,
    freeformResult,
    error,
    clearFreeform,
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoritePhrases,
    cachedTranslationCount,
  };
}
