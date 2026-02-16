/**
 * Speech Provider Interfaces
 *
 * Strategy pattern types for TTS and STT providers. Allows swapping
 * the underlying speech engine (expo-speech, cloud API, etc.) without
 * changing consumer code.
 */

// =============================================================================
// TTS (Text-to-Speech)
// =============================================================================

export interface TTSOptions {
  language?: string; // Default 'ar' for Arabic
  rate?: number; // 0.5 to 2.0, default 0.8 for Arabic clarity
  pitch?: number; // 0.5 to 2.0, default 1.0
  volume?: number; // 0.0 to 1.0, default 1.0
}

export interface TTSProvider {
  speak(text: string, options?: TTSOptions): Promise<void>;
  stop(): Promise<void>;
  isSpeaking(): Promise<boolean>;
}

// =============================================================================
// STT (Speech-to-Text) — reserved for future use
// =============================================================================

export interface STTOptions {
  language?: string; // Default 'ar-SA'
  continuous?: boolean;
}

export interface STTProvider {
  startListening(options?: STTOptions): Promise<void>;
  stopListening(): Promise<void>;
  isListening(): boolean;
  onResult(callback: (transcript: string) => void): void;
  onError(callback: (error: string) => void): void;
}
