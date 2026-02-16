/**
 * useTTS Hook
 *
 * React hook for text-to-speech playback. Wraps the TTSProvider singleton
 * with React state for loading, speaking, and error tracking.
 * Automatically stops speech on unmount.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import { getTTSProvider } from '@/services/speech/ttsService';
import type { TTSOptions } from '@/services/speech/types';

// =============================================================================
// TYPES
// =============================================================================

export interface UseTTSReturn {
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  stop: () => Promise<void>;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// HOOK
// =============================================================================

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const provider = getTTSProvider();

  // Track mounted state to avoid state updates after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      provider.stop();
    };
  }, [provider]);

  const speak = useCallback(
    async (text: string, options?: TTSOptions) => {
      if (!mountedRef.current) return;

      setIsLoading(true);
      setError(null);
      setIsSpeaking(false);

      try {
        // Speech has started once speak() is called; mark as speaking
        setIsLoading(false);
        setIsSpeaking(true);

        await provider.speak(text, options);

        // Speech completed naturally
        if (mountedRef.current) {
          setIsSpeaking(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          const message =
            err instanceof Error ? err.message : 'Speech playback failed';
          setError(message);
          setIsSpeaking(false);
          setIsLoading(false);
        }
      }
    },
    [provider]
  );

  const stop = useCallback(async () => {
    await provider.stop();
    if (mountedRef.current) {
      setIsSpeaking(false);
      setIsLoading(false);
    }
  }, [provider]);

  return { speak, stop, isSpeaking, isLoading, error };
}
