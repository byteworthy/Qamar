/**
 * Word-by-Word Audio Hook
 *
 * Wraps the WordByWordAudioService singleton as a React hook with reactive state.
 * Provides word-level playback controls and current-word tracking for highlighting.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getWordByWordAudioService,
  WordAudioState,
} from '../services/wordByWordAudio';

export interface WordByWordAudioHook {
  isPlaying: boolean;
  currentWordIndex: number;
  totalWords: number;
  isLoading: boolean;
  error: string | null;
  playAll: (
    surahNumber: number,
    verseNumber: number,
    wordCount: number
  ) => Promise<void>;
  playWord: (
    surahNumber: number,
    verseNumber: number,
    wordIndex: number
  ) => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
}

export function useWordByWordAudio(): WordByWordAudioHook {
  const service = getWordByWordAudioService();
  const [state, setState] = useState<WordAudioState>(service.getState());
  const mountedRef = useRef(true);

  // Subscribe to service state changes
  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = service.subscribe((newState) => {
      if (mountedRef.current) {
        setState(newState);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const playAll = useCallback(
    async (surahNumber: number, verseNumber: number, wordCount: number) => {
      await service.playAllWords(surahNumber, verseNumber, wordCount);
    },
    []
  );

  const playWord = useCallback(
    async (surahNumber: number, verseNumber: number, wordIndex: number) => {
      await service.playWord(surahNumber, verseNumber, wordIndex);
    },
    []
  );

  const stop = useCallback(async () => {
    await service.stop();
  }, []);

  const reset = useCallback(() => {
    service.stop();
  }, []);

  return {
    isPlaying: state.isPlaying,
    currentWordIndex: state.currentWordIndex,
    totalWords: state.totalWords,
    isLoading: state.isLoading,
    error: state.error,
    playAll,
    playWord,
    stop,
    reset,
  };
}
