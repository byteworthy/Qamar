/**
 * Speech-to-Text Service
 *
 * Wraps @react-native-voice/voice for on-device speech recognition. Provides
 * a singleton service with subscribe/emit pattern (matching QuranAudioService)
 * for reactive state updates. Supports partial and final transcripts.
 *
 * NOTE: Requires a dev build (not Expo Go) since @react-native-voice/voice
 * uses native modules.
 *
 * Default language: 'ar-SA' (Arabic - Saudi Arabia) for Quran recitation input.
 */

import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";

// =============================================================================
// TYPES
// =============================================================================

export interface STTState {
  isListening: boolean;
  transcript: string;
  partialTranscript: string;
  error: string | null;
}

export type STTListener = (state: STTState) => void;

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_LANGUAGE = "ar-SA";

const INITIAL_STATE: STTState = {
  isListening: false,
  transcript: "",
  partialTranscript: "",
  error: null,
};

// =============================================================================
// SERVICE
// =============================================================================

class STTService {
  private listeners: Set<STTListener> = new Set();
  private state: STTState = { ...INITIAL_STATE };
  private initialized = false;

  // ---------------------------------------------------------------------------
  // Listener management
  // ---------------------------------------------------------------------------

  subscribe(listener: STTListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    const snapshot = { ...this.state };
    this.listeners.forEach((fn) => fn(snapshot));
  }

  private updateState(partial: Partial<STTState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  // ---------------------------------------------------------------------------
  // Voice event initialization
  // ---------------------------------------------------------------------------

  private initVoice(): void {
    if (this.initialized) return;

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const results = e.value;
      if (results && results.length > 0) {
        this.updateState({ transcript: results[0], partialTranscript: "" });
      }
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const results = e.value;
      if (results && results.length > 0) {
        this.updateState({ partialTranscript: results[0] });
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      this.updateState({
        error: e.error?.message ?? "Speech recognition error",
        isListening: false,
      });
    };

    Voice.onSpeechEnd = () => {
      this.updateState({ isListening: false });
    };

    this.initialized = true;
  }

  // ---------------------------------------------------------------------------
  // Listening controls
  // ---------------------------------------------------------------------------

  async startListening(language: string = DEFAULT_LANGUAGE): Promise<void> {
    this.initVoice();
    this.updateState({
      transcript: "",
      partialTranscript: "",
      error: null,
      isListening: true,
    });
    await Voice.start(language);
  }

  async stopListening(): Promise<void> {
    await Voice.stop();
    this.updateState({ isListening: false });
  }

  // ---------------------------------------------------------------------------
  // State access
  // ---------------------------------------------------------------------------

  getState(): STTState {
    return { ...this.state };
  }

  reset(): void {
    this.updateState({ ...INITIAL_STATE });
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  async destroy(): Promise<void> {
    await Voice.destroy();
    Voice.onSpeechResults = undefined as unknown as (
      e: SpeechResultsEvent,
    ) => void;
    Voice.onSpeechPartialResults = undefined as unknown as (
      e: SpeechResultsEvent,
    ) => void;
    Voice.onSpeechError = undefined as unknown as (e: SpeechErrorEvent) => void;
    Voice.onSpeechEnd = undefined as unknown as () => void;
    this.initialized = false;
    this.state = { ...INITIAL_STATE };
    this.listeners.clear();
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: STTService | null = null;

export function getSTTService(): STTService {
  if (!instance) {
    instance = new STTService();
  }
  return instance;
}
