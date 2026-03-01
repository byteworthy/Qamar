/**
 * useTranslation Hook
 *
 * Manages Arabic ↔ English translation state with TTS and AI explanation.
 */

import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/query-client";
import * as Sentry from "@sentry/react-native";

export type TranslationDirection = "en-ar" | "ar-en";

export interface TranslationResult {
  translatedText: string;
  transliteration: string | null;
  source: string;
}

export interface TranslationHook {
  // State
  inputText: string;
  direction: TranslationDirection;
  result: TranslationResult | null;
  explanation: string | null;
  isTranslating: boolean;
  isExplaining: boolean;
  error: string | null;
  remainingQuota: number | null;
  // Actions
  setInputText: (text: string) => void;
  toggleDirection: () => void;
  translate: () => Promise<void>;
  explain: () => Promise<void>;
  clear: () => void;
}

export function useTranslation(): TranslationHook {
  const [inputText, setInputText] = useState("");
  const [direction, setDirection] = useState<TranslationDirection>("en-ar");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === "en-ar" ? "ar-en" : "en-ar"));
    setResult(null);
    setExplanation(null);
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setInputText("");
    setResult(null);
    setExplanation(null);
    setError(null);
    setIsTranslating(false);
    setIsExplaining(false);
  }, []);

  const translate = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setIsTranslating(true);
    setError(null);
    setResult(null);
    setExplanation(null);

    try {
      await Sentry.startSpan(
        { name: "translate", op: "api.request" },
        async () => {
          const [from, to] = direction.split("-") as [string, string];
          const response = await apiRequest("POST", "/api/translate", {
            text: trimmed,
            from,
            to,
          });

          if (response.status === 429) {
            throw new Error(
              "Too many requests. Please wait a moment and try again.",
            );
          }
          if (response.status === 403) {
            throw new Error(
              "Translation quota exceeded. Please try again tomorrow.",
            );
          }
          if (!response.ok) {
            throw new Error("Translation failed. Please try again.");
          }

          const data = await response.json();
          setResult({
            translatedText: data.translatedText,
            transliteration: data.transliteration ?? null,
            source: data.source,
          });
        },
      );
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";
      setError(message);
      Sentry.captureException(err);
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, direction]);

  const explain = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setIsExplaining(true);
    setError(null);
    setExplanation(null);

    try {
      await Sentry.startSpan(
        { name: "translate.explain", op: "api.request" },
        async () => {
          const language = direction === "en-ar" ? "en" : "ar";
          const response = await apiRequest("POST", "/api/translate/explain", {
            text: trimmed,
            language,
          });

          if (response.status === 429) {
            throw new Error(
              "Too many requests. Please wait a moment and try again.",
            );
          }
          if (response.status === 403) {
            throw new Error(
              "Daily explanation quota exceeded. Come back tomorrow for more free explanations.",
            );
          }
          if (!response.ok) {
            throw new Error("Explanation failed. Please try again.");
          }

          const data = await response.json();
          setExplanation(data.explanation);
          if (data.remainingQuota !== undefined) {
            setRemainingQuota(data.remainingQuota);
          }
        },
      );
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";
      setError(message);
      Sentry.captureException(err);
    } finally {
      setIsExplaining(false);
    }
  }, [inputText, direction]);

  return {
    inputText,
    direction,
    result,
    explanation,
    isTranslating,
    isExplaining,
    error,
    remainingQuota,
    setInputText,
    toggleDirection,
    translate,
    explain,
    clear,
  };
}
