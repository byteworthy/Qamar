/**
 * Quran Audio Hook
 *
 * Wraps the QuranAudioService singleton as a React hook with reactive state.
 * Provides verse-level playback controls, reciter selection, and auto-scroll
 * integration for the VerseReaderScreen.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getQuranAudioService,
  PlaybackState,
  RECITERS,
  Reciter,
} from "../services/quranAudio";

export { RECITERS, type Reciter } from "../services/quranAudio";

export interface QuranAudioHook {
  // State
  isPlaying: boolean;
  isLoading: boolean;
  currentVerse: number | null;
  currentSurah: number | null;
  duration: number;
  position: number;
  reciter: Reciter;
  error: string | null;

  // Controls
  playSurah: (surahNumber: number, startVerse?: number) => Promise<void>;
  playVerse: (surahNumber: number, verseNumber: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;
  nextVerse: () => Promise<void>;
  previousVerse: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  setReciter: (reciterId: string) => Promise<void>;
  setAutoAdvance: (enabled: boolean) => void;
}

export function useQuranAudio(): QuranAudioHook {
  const service = getQuranAudioService();
  const [state, setState] = useState<PlaybackState>(service.getState());
  const mountedRef = useRef(true);

  // Subscribe to service state changes
  useEffect(() => {
    mountedRef.current = true;

    // Load saved reciter preference on first mount
    service.loadSavedReciter();

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

  const playSurah = useCallback(
    async (surahNumber: number, startVerse: number = 1) => {
      await service.playSurah(surahNumber, startVerse);
    },
    [],
  );

  const playVerse = useCallback(
    async (surahNumber: number, verseNumber: number) => {
      await service.playVerse(surahNumber, verseNumber);
    },
    [],
  );

  const pause = useCallback(async () => {
    await service.pause();
  }, []);

  const resume = useCallback(async () => {
    await service.resume();
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      await service.pause();
    } else if (state.position > 0 && state.currentSurah) {
      await service.resume();
    }
  }, [state.isPlaying, state.position, state.currentSurah]);

  const stop = useCallback(async () => {
    await service.stop();
  }, []);

  const nextVerse = useCallback(async () => {
    await service.nextVerse();
  }, []);

  const previousVerse = useCallback(async () => {
    await service.previousVerse();
  }, []);

  const seekTo = useCallback(async (positionMillis: number) => {
    await service.seekTo(positionMillis);
  }, []);

  const setReciter = useCallback(async (reciterId: string) => {
    await service.setReciter(reciterId);
  }, []);

  const setAutoAdvance = useCallback((enabled: boolean) => {
    service.setAutoAdvance(enabled);
  }, []);

  const reciter = RECITERS.find((r) => r.id === state.reciterId) ?? RECITERS[0];

  return {
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    currentVerse: state.currentVerse,
    currentSurah: state.currentSurah,
    duration: state.duration,
    position: state.position,
    reciter,
    error: state.error,

    playSurah,
    playVerse,
    pause,
    resume,
    togglePlayPause,
    stop,
    nextVerse,
    previousVerse,
    seekTo,
    setReciter,
    setAutoAdvance,
  };
}
