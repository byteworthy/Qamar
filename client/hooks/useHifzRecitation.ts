/**
 * useHifzRecitation Hook
 *
 * Manages the full recitation flow: record → transcribe (STT) → check → rate → update store
 */

import { useState, useCallback } from "react";
import { useHifzStore } from "../stores/hifz-store";
import { checkRecitation } from "../services/hifz/recitation-checker";
import type { RecitationResult } from "../../shared/types/hifz";

// =============================================================================
// TYPES
// =============================================================================

export interface UseHifzRecitationReturn {
  // State
  isRecording: boolean;
  isProcessing: boolean;
  transcription: string | null;
  result: RecitationResult | null;
  error: string | null;

  // Actions
  startRecitation: () => Promise<void>;
  stopRecitation: () => Promise<void>;
  rateAndSave: (rating: "again" | "hard" | "good" | "easy") => void;
  reset: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for managing Hifz recitation flow
 *
 * @param surahNumber - Surah number (1-114)
 * @param verseNumber - Verse number within the surah
 */
export function useHifzRecitation(
  surahNumber: number,
  verseNumber: number,
): UseHifzRecitationReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [result, setResult] = useState<RecitationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { updateAfterRecitation } = useHifzStore();

  // ============================================================
  // Start Recording
  // ============================================================

  const startRecitation = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      setTranscription(null);
      setIsRecording(true);

      // TODO: Integrate with actual recording/STT service
      // For now, this is a placeholder that will be implemented
      // when the RecitationScreen is built
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recording",
      );
      setIsRecording(false);
    }
  }, []);

  // ============================================================
  // Stop Recording & Process
  // ============================================================

  const stopRecitation = useCallback(async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      // TODO: Integrate with actual STT service
      // Placeholder: Simulate STT transcription
      const mockTranscription = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
      const mockExpectedText = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

      setTranscription(mockTranscription);

      // Check recitation accuracy
      const recitationResult = checkRecitation(
        surahNumber,
        verseNumber,
        mockExpectedText,
        mockTranscription,
      );

      setResult(recitationResult);
      setIsProcessing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process recitation",
      );
      setIsProcessing(false);
    }
  }, [surahNumber, verseNumber]);

  // ============================================================
  // Rate & Save to Store
  // ============================================================

  const rateAndSave = useCallback(
    (rating: "again" | "hard" | "good" | "easy") => {
      if (!result) {
        console.warn("Cannot rate: no recitation result available");
        return;
      }

      // Extract mistakes from word results
      const mistakes = result.wordResults
        .filter((w: { isCorrect: boolean; actual: string }) => !w.isCorrect)
        .map((w: { actual: string }) => w.actual);

      // Update store with rating and mistakes
      updateAfterRecitation(surahNumber, verseNumber, rating, mistakes);
    },
    [result, updateAfterRecitation, surahNumber, verseNumber],
  );

  // ============================================================
  // Reset State
  // ============================================================

  const reset = useCallback(() => {
    setIsRecording(false);
    setIsProcessing(false);
    setTranscription(null);
    setResult(null);
    setError(null);
  }, []);

  // ============================================================
  // Return
  // ============================================================

  return {
    isRecording,
    isProcessing,
    transcription,
    result,
    error,
    startRecitation,
    stopRecitation,
    rateAndSave,
    reset,
  };
}
