/**
 * Expo Speech TTS Provider
 *
 * Wraps expo-speech behind the TTSProvider interface for on-device
 * Arabic text-to-speech. Uses a singleton so all consumers share the
 * same playback state.
 */

import * as Speech from 'expo-speech';

import type { TTSProvider, TTSOptions } from './types';

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_LANGUAGE = 'ar';
const DEFAULT_RATE = 0.8; // Slower for Arabic clarity
const DEFAULT_PITCH = 1.0;
const DEFAULT_VOLUME = 1.0;

// =============================================================================
// PROVIDER IMPLEMENTATION
// =============================================================================

export class ExpoSpeechTTSProvider implements TTSProvider {
  async speak(text: string, options?: TTSOptions): Promise<void> {
    // Stop any in-progress speech before starting new utterance
    await this.stop();

    return new Promise<void>((resolve, reject) => {
      Speech.speak(text, {
        language: options?.language ?? DEFAULT_LANGUAGE,
        rate: options?.rate ?? DEFAULT_RATE,
        pitch: options?.pitch ?? DEFAULT_PITCH,
        volume: options?.volume ?? DEFAULT_VOLUME,
        onDone: () => resolve(),
        onError: (error) => reject(error),
        onStopped: () => resolve(),
      });
    });
  }

  async stop(): Promise<void> {
    await Speech.stop();
  }

  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: TTSProvider | null = null;

export function getTTSProvider(): TTSProvider {
  if (!instance) {
    instance = new ExpoSpeechTTSProvider();
  }
  return instance;
}
