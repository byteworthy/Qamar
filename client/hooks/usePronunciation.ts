/**
 * usePronunciation Hook
 *
 * Orchestrates the full pronunciation practice flow:
 * record -> transcribe -> submit to server -> display feedback.
 */

import { useState, useCallback, useRef } from "react";
import { useRecording } from "./useRecording";
import { useSTT } from "./useSTT";
import { apiRequest } from "@/lib/query-client";
import * as Sentry from "@sentry/react-native";

// ====================================================================
// Types
// ====================================================================

export interface WordResult {
  expected: string;
  transcribed: string;
  isCorrect: boolean;
}

export interface PronunciationFeedback {
  score: number;
  accuracy: number;
  wordResults: WordResult[];
  tips: string | null;
  remainingQuota: number;
}

export interface PronunciationHook {
  // State
  isRecording: boolean;
  isTranscribing: boolean;
  isSubmitting: boolean;
  transcript: string | null;
  partialTranscript: string;
  feedback: PronunciationFeedback | null;
  error: string | null;
  duration: number;
  // Actions
  startPractice: (language?: string) => Promise<void>;
  stopPractice: () => Promise<void>;
  submitForFeedback: (
    expectedText: string,
    surahNumber?: number,
    verseNumber?: number
  ) => Promise<void>;
  reset: () => void;
}

// ====================================================================
// Hook
// ====================================================================

export function usePronunciation(): PronunciationHook {
  const recording = useRecording();
  const stt = useSTT();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalTranscript, setFinalTranscript] = useState<string | null>(null);

  // Track whether we're in the process of stopping so we can await the
  // final transcript before allowing submission.
  const stoppingRef = useRef(false);

  // ------------------------------------------------------------------
  // startPractice
  // ------------------------------------------------------------------
  const startPractice = useCallback(
    async (language: string = "ar-SA") => {
      setError(null);
      setFeedback(null);
      setFinalTranscript(null);
      stoppingRef.current = false;

      try {
        // Start recording and speech-to-text simultaneously
        await Promise.all([
          recording.startRecording(),
          stt.startListening(language),
        ]);
      } catch (err: any) {
        const message =
          err?.message || "Failed to start recording. Check microphone permissions.";
        setError(message);
        Sentry.captureException(err, {
          tags: { feature: "pronunciation", action: "startPractice" },
        });
      }
    },
    [recording, stt]
  );

  // ------------------------------------------------------------------
  // stopPractice
  // ------------------------------------------------------------------
  const stopPractice = useCallback(async () => {
    stoppingRef.current = true;
    setError(null);

    try {
      // Stop both recording and STT. The STT hook should finalize its
      // transcript when stopListening resolves.
      await Promise.all([recording.stopRecording(), stt.stopListening()]);

      // Capture the final transcript from STT. If the full transcript
      // is empty, fall back to the partial transcript so the user can
      // still see what was captured.
      const transcript = stt.transcript || stt.partialTranscript || null;
      setFinalTranscript(transcript);
    } catch (err: any) {
      // Even if something went wrong, try to salvage partial results
      const partial = stt.transcript || stt.partialTranscript || null;
      setFinalTranscript(partial);

      const message =
        err?.message || "Failed to stop recording. Please try again.";
      setError(message);
      Sentry.captureException(err, {
        tags: { feature: "pronunciation", action: "stopPractice" },
      });
    } finally {
      stoppingRef.current = false;
    }
  }, [recording, stt]);

  // ------------------------------------------------------------------
  // submitForFeedback
  // ------------------------------------------------------------------
  const submitForFeedback = useCallback(
    async (
      expectedText: string,
      surahNumber?: number,
      verseNumber?: number
    ) => {
      const transcribedText = finalTranscript || stt.transcript;

      if (!transcribedText) {
        setError("No transcription available. Please record again.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await apiRequest(
          "POST",
          "/api/pronunciation/check",
          {
            expectedText,
            transcribedText,
            ...(surahNumber != null && { surahNumber }),
            ...(verseNumber != null && { verseNumber }),
          }
        );

        const data = await response.json();

        const parsedFeedback: PronunciationFeedback = {
          score: data.score ?? 0,
          accuracy: data.accuracy ?? 0,
          wordResults: Array.isArray(data.wordResults) ? data.wordResults : [],
          tips: data.tips ?? null,
          remainingQuota: data.remainingQuota ?? 0,
        };

        setFeedback(parsedFeedback);
      } catch (err: any) {
        const message =
          err?.message || "Failed to analyze pronunciation. Please try again.";
        setError(message);
        Sentry.captureException(err, {
          tags: { feature: "pronunciation", action: "submitForFeedback" },
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [finalTranscript, stt.transcript]
  );

  // ------------------------------------------------------------------
  // reset
  // ------------------------------------------------------------------
  const reset = useCallback(() => {
    recording.reset();
    stt.reset();
    setIsSubmitting(false);
    setFeedback(null);
    setError(null);
    setFinalTranscript(null);
    stoppingRef.current = false;
  }, [recording, stt]);

  // ------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------
  // Use finalTranscript once recording has stopped; otherwise surface
  // the live transcript from the STT hook.
  const transcript = finalTranscript ?? stt.transcript ?? null;
  const partialTranscript = stt.partialTranscript ?? "";

  return {
    // State
    isRecording: recording.isRecording,
    isTranscribing: stt.isListening,
    isSubmitting,
    transcript,
    partialTranscript,
    feedback,
    error: error || recording.error || stt.error || null,
    duration: recording.duration,

    // Actions
    startPractice,
    stopPractice,
    submitForFeedback,
    reset,
  };
}
