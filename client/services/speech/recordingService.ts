/**
 * Recording Service
 *
 * Wraps expo-av Audio.Recording for audio capture. Provides a singleton service
 * with subscribe/emit pattern (matching QuranAudioService) for reactive state
 * updates. Manages microphone permissions, recording lifecycle, and duration tracking.
 */

import { Audio } from 'expo-av';

// =============================================================================
// TYPES
// =============================================================================

export interface RecordingState {
  isRecording: boolean;
  duration: number; // milliseconds
  uri: string | null;
  error: string | null;
}

export type RecordingListener = (state: RecordingState) => void;

// =============================================================================
// CONSTANTS
// =============================================================================

const DURATION_INTERVAL_MS = 250;

const INITIAL_STATE: RecordingState = {
  isRecording: false,
  duration: 0,
  uri: null,
  error: null,
};

// =============================================================================
// SERVICE
// =============================================================================

class RecordingService {
  private recording: Audio.Recording | null = null;
  private listeners: Set<RecordingListener> = new Set();
  private state: RecordingState = { ...INITIAL_STATE };
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private recordingStartTime: number = 0;

  // ---------------------------------------------------------------------------
  // Listener management
  // ---------------------------------------------------------------------------

  subscribe(listener: RecordingListener): () => void {
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

  private updateState(partial: Partial<RecordingState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  // ---------------------------------------------------------------------------
  // Recording controls
  // ---------------------------------------------------------------------------

  async startRecording(): Promise<void> {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      this.updateState({ error: 'Microphone permission denied' });
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    this.recording = recording;
    this.recordingStartTime = Date.now();

    this.updateState({
      isRecording: true,
      duration: 0,
      uri: null,
      error: null,
    });

    this.startDurationTimer();
  }

  async stopRecording(): Promise<string | null> {
    this.stopDurationTimer();

    if (!this.recording) {
      return null;
    }

    await this.recording.stopAndUnloadAsync();

    // Reset audio mode so playback works normally after recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const uri = this.recording.getURI();
    this.recording = null;

    this.updateState({
      isRecording: false,
      uri,
    });

    return uri;
  }

  // ---------------------------------------------------------------------------
  // State access
  // ---------------------------------------------------------------------------

  getState(): RecordingState {
    return { ...this.state };
  }

  reset(): void {
    this.updateState({ ...INITIAL_STATE });
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  async destroy(): Promise<void> {
    this.stopDurationTimer();

    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    }

    this.state = { ...INITIAL_STATE };
    this.listeners.clear();
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private startDurationTimer(): void {
    this.stopDurationTimer();
    this.durationInterval = setInterval(() => {
      const elapsed = Date.now() - this.recordingStartTime;
      this.updateState({ duration: elapsed });
    }, DURATION_INTERVAL_MS);
  }

  private stopDurationTimer(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let instance: RecordingService | null = null;

export function getRecordingService(): RecordingService {
  if (!instance) {
    instance = new RecordingService();
  }
  return instance;
}
