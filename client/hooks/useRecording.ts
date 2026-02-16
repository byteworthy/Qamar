/**
 * Recording Hook
 *
 * Wraps the RecordingService singleton as a React hook with reactive state.
 * Follows the same subscribe/mountedRef pattern as useQuranAudio.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getRecordingService,
  RecordingState,
} from '../services/speech/recordingService';

// =============================================================================
// TYPES
// =============================================================================

export interface RecordingHook {
  isRecording: boolean;
  duration: number;
  audioUri: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  reset: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useRecording(): RecordingHook {
  const service = getRecordingService();
  const [state, setState] = useState<RecordingState>(service.getState());
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
    };
  }, []);

  const startRecording = useCallback(async () => {
    await service.startRecording();
  }, []);

  const stopRecording = useCallback(async () => {
    return await service.stopRecording();
  }, []);

  const reset = useCallback(() => {
    service.reset();
  }, []);

  return {
    isRecording: state.isRecording,
    duration: state.duration,
    audioUri: state.uri,
    error: state.error,
    startRecording,
    stopRecording,
    reset,
  };
}
