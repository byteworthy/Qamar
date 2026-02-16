/**
 * Word-by-Word Quran Audio Service
 *
 * Manages audio playback for individual words in Quran verses.
 * Uses Quran.com CDN for word-level audio files.
 *
 * CDN URL pattern: https://audio.qurancdn.com/wbw/{SSS}_{AAA}_{WWW}.mp3
 * Where SSS = 3-digit surah (zero-padded), AAA = 3-digit ayah (zero-padded),
 * WWW = 3-digit word index (1-based, zero-padded).
 *
 * Follows the same singleton + listener pattern as quranAudio.ts.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';

// =============================================================================
// TYPES
// =============================================================================

export interface WordAudioState {
  isPlaying: boolean;
  currentWordIndex: number;
  totalWords: number;
  isLoading: boolean;
  error: string | null;
}

export type WordAudioListener = (state: WordAudioState) => void;

// =============================================================================
// CONSTANTS
// =============================================================================

const CDN_BASE = 'https://audio.qurancdn.com/wbw';
const PRELOAD_AHEAD = 3;

// =============================================================================
// HELPERS
// =============================================================================

function padThree(n: number): string {
  return String(n).padStart(3, '0');
}

function buildWordUrl(
  surahNumber: number,
  verseNumber: number,
  wordIndex: number
): string {
  return `${CDN_BASE}/${padThree(surahNumber)}_${padThree(verseNumber)}_${padThree(wordIndex)}.mp3`;
}

// =============================================================================
// AUDIO SERVICE SINGLETON
// =============================================================================

class WordByWordAudioService {
  private sound: Audio.Sound | null = null;
  private listeners: Set<WordAudioListener> = new Set();
  private preloadedSounds: Map<number, Audio.Sound> = new Map();
  private stopRequested: boolean = false;

  private state: WordAudioState = {
    isPlaying: false,
    currentWordIndex: 0,
    totalWords: 0,
    isLoading: false,
    error: null,
  };

  // ---------------------------------------------------------------------------
  // Listener management
  // ---------------------------------------------------------------------------

  subscribe(listener: WordAudioListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    const snapshot = { ...this.state };
    this.listeners.forEach((fn) => fn(snapshot));
  }

  private updateState(partial: Partial<WordAudioState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  getState(): WordAudioState {
    return { ...this.state };
  }

  // ---------------------------------------------------------------------------
  // Preloading
  // ---------------------------------------------------------------------------

  async preloadWords(
    surahNumber: number,
    verseNumber: number,
    wordCount: number
  ): Promise<void> {
    await this.configureAudioMode();

    const loadPromises: Promise<void>[] = [];

    for (let i = 1; i <= wordCount; i++) {
      if (this.preloadedSounds.has(i)) continue;

      const uri = buildWordUrl(surahNumber, verseNumber, i);
      const loadOne = async (): Promise<void> => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: false }
          );
          this.preloadedSounds.set(i, sound);
        } catch {
          // Non-critical: word will be loaded on demand during playback
          if (__DEV__) {
            console.warn(`WordByWordAudio: failed to preload word ${i}`);
          }
        }
      };
      loadPromises.push(loadOne());
    }

    await Promise.all(loadPromises);
  }

  private async preloadRange(
    surahNumber: number,
    verseNumber: number,
    startIndex: number,
    wordCount: number
  ): Promise<void> {
    const end = Math.min(startIndex + PRELOAD_AHEAD, wordCount);

    for (let i = startIndex; i <= end; i++) {
      if (this.preloadedSounds.has(i)) continue;

      const uri = buildWordUrl(surahNumber, verseNumber, i);
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        this.preloadedSounds.set(i, sound);
      } catch {
        // Non-critical
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Playback controls
  // ---------------------------------------------------------------------------

  async playWord(
    surahNumber: number,
    verseNumber: number,
    wordIndex: number
  ): Promise<void> {
    this.updateState({
      isLoading: true,
      error: null,
      currentWordIndex: wordIndex,
    });

    try {
      await this.unloadCurrentSound();
      await this.configureAudioMode();

      // Use preloaded sound if available, otherwise load fresh
      const preloaded = this.preloadedSounds.get(wordIndex);
      if (preloaded) {
        this.sound = preloaded;
        this.preloadedSounds.delete(wordIndex);
        await this.sound.setPositionAsync(0);
        this.sound.setOnPlaybackStatusUpdate(this.onPlaybackStatus);
        await this.sound.playAsync();
      } else {
        const uri = buildWordUrl(surahNumber, verseNumber, wordIndex);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          this.onPlaybackStatus
        );
        this.sound = sound;
      }

      this.updateState({ isLoading: false, isPlaying: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to play word audio';
      this.updateState({ isLoading: false, error: message, isPlaying: false });
    }
  }

  async playAllWords(
    surahNumber: number,
    verseNumber: number,
    wordCount: number
  ): Promise<void> {
    this.stopRequested = false;
    this.updateState({
      isPlaying: true,
      isLoading: true,
      totalWords: wordCount,
      currentWordIndex: 1,
      error: null,
    });

    await this.configureAudioMode();

    // Kick off preloading the first few words
    this.preloadRange(surahNumber, verseNumber, 1, wordCount);

    for (let i = 1; i <= wordCount; i++) {
      if (this.stopRequested) break;

      this.updateState({ currentWordIndex: i });

      // Preload upcoming words while current plays
      if (i + 1 <= wordCount) {
        this.preloadRange(surahNumber, verseNumber, i + 1, wordCount);
      }

      try {
        await this.playWordAndWait(surahNumber, verseNumber, i);
      } catch (err) {
        if (this.stopRequested) break;
        const message =
          err instanceof Error ? err.message : 'Failed to play word audio';
        this.updateState({ error: message, isPlaying: false, isLoading: false });
        return;
      }
    }

    if (!this.stopRequested) {
      this.updateState({
        isPlaying: false,
        isLoading: false,
        currentWordIndex: 0,
      });
    }
  }

  async stop(): Promise<void> {
    this.stopRequested = true;

    try {
      await this.unloadCurrentSound();
    } catch (err) {
      if (__DEV__) console.error('WordByWordAudio: stop error', err);
    }

    await this.clearPreloadedSounds();

    this.updateState({
      isPlaying: false,
      isLoading: false,
      currentWordIndex: 0,
      totalWords: 0,
      error: null,
    });
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async configureAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  }

  private async unloadCurrentSound(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
    } catch {
      // Sound may already be unloaded
    }
    this.sound = null;
  }

  private async clearPreloadedSounds(): Promise<void> {
    const unloadPromises: Promise<void>[] = [];
    for (const [, sound] of this.preloadedSounds) {
      unloadPromises.push(
        sound.unloadAsync().then(
          () => {},
          () => {}
        )
      );
    }
    await Promise.all(unloadPromises);
    this.preloadedSounds.clear();
  }

  private async playWordAndWait(
    surahNumber: number,
    verseNumber: number,
    wordIndex: number
  ): Promise<void> {
    await this.unloadCurrentSound();

    const onFinish = new Promise<void>((resolve, reject) => {
      const statusCallback = (status: AVPlaybackStatus): void => {
        if (!status.isLoaded) {
          if (status.error) reject(new Error(status.error));
          return;
        }
        if (status.didJustFinish) {
          resolve();
        }
      };

      // Use preloaded sound if available
      const preloaded = this.preloadedSounds.get(wordIndex);
      if (preloaded) {
        this.sound = preloaded;
        this.preloadedSounds.delete(wordIndex);
        this.sound.setPositionAsync(0).then(() => {
          this.sound!.setOnPlaybackStatusUpdate(statusCallback);
          this.updateState({ isLoading: false });
          this.sound!.playAsync().catch(reject);
        }).catch(reject);
      } else {
        const uri = buildWordUrl(surahNumber, verseNumber, wordIndex);
        Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          statusCallback
        ).then(({ sound }) => {
          this.sound = sound;
          this.updateState({ isLoading: false });
        }).catch(reject);
      }
    });

    await onFinish;
  }

  private onPlaybackStatus = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) {
      if (status.error) {
        this.updateState({
          error: `Playback error: ${status.error}`,
          isPlaying: false,
          isLoading: false,
        });
      }
      return;
    }

    this.updateState({ isPlaying: status.isPlaying });
  };

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  async destroy(): Promise<void> {
    await this.stop();
    this.listeners.clear();
  }
}

// Singleton instance
let instance: WordByWordAudioService | null = null;

export function getWordByWordAudioService(): WordByWordAudioService {
  if (!instance) {
    instance = new WordByWordAudioService();
  }
  return instance;
}
