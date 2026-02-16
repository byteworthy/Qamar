/**
 * Speech-to-Text Hook
 *
 * Wraps the STTService singleton as a React hook with reactive state.
 * Follows the same subscribe/mountedRef pattern as useQuranAudio.
 * Calls Voice.destroy() on unmount for clean resource release.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSTTService, STTState } from '../services/speech/sttService';

// =============================================================================
// TYPES
// =============================================================================

export interface STTHook {
  isListening: boolean;
  transcript: string;
  partialTranscript: string;
  error: string | null;
  startListening: (language?: string) => Promise<void>;
  stopListening: () => Promise<void>;
  reset: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useSTT(): STTHook {
  const service = getSTTService();
  const [state, setState] = useState<STTState>(service.getState());
  const mountedRef = useRef(true);

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
      service.destroy();
    };
  }, []);

  const startListening = useCallback(async (language?: string) => {
    await service.startListening(language);
  }, []);

  const stopListening = useCallback(async () => {
    await service.stopListening();
  }, []);

  const reset = useCallback(() => {
    service.reset();
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    partialTranscript: state.partialTranscript,
    error: state.error,
    startListening,
    stopListening,
    reset,
  };
}
