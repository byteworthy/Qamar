/**
 * Quran Audio Recitation Service
 *
 * Manages audio playback for Quran recitations with support for multiple reciters,
 * verse-level navigation, and auto-advance. Uses expo-av for playback.
 *
 * Audio sources use the free Al Quran Cloud API (no API key needed).
 * Per-verse audio URLs: https://cdn.islamic.network/quran/audio/128/{reciterEdition}/{globalVerseNumber}.mp3
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================================
// TYPES
// =============================================================================

export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  edition: string; // alquran.cloud edition identifier
}

export interface VerseAudio {
  surahNumber: number;
  verseNumber: number;
  globalVerseNumber: number; // 1-6236
  audioUrl: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  currentSurah: number | null;
  currentVerse: number | null;
  duration: number;
  position: number;
  reciterId: string;
  error: string | null;
}

export type PlaybackListener = (state: PlaybackState) => void;

// =============================================================================
// CONSTANTS
// =============================================================================

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    nameArabic: 'مشاري راشد العفاسي',
    edition: 'ar.alafasy',
  },
  {
    id: 'sudais',
    name: 'Abdul Rahman Al-Sudais',
    nameArabic: 'عبدالرحمن السديس',
    edition: 'ar.abdurrahmaansudais',
  },
  {
    id: 'shuraim',
    name: "Sa'ud ash-Shuraim",
    nameArabic: 'سعود الشريم',
    edition: 'ar.saaborshuraym',
  },
];

const DEFAULT_RECITER_ID = 'alafasy';
const RECITER_STORAGE_KEY = 'noor:preferred-reciter';
const API_BASE = 'https://api.alquran.cloud/v1';

// =============================================================================
// AUDIO SERVICE SINGLETON
// =============================================================================

class QuranAudioService {
  private sound: Audio.Sound | null = null;
  private listeners: Set<PlaybackListener> = new Set();
  private verseList: VerseAudio[] = [];
  private currentIndex: number = -1;
  private autoAdvance: boolean = true;

  private state: PlaybackState = {
    isPlaying: false,
    isLoading: false,
    currentSurah: null,
    currentVerse: null,
    duration: 0,
    position: 0,
    reciterId: DEFAULT_RECITER_ID,
    error: null,
  };

  // Audio URL cache: edition -> surahNumber -> VerseAudio[]
  private audioCache = new Map<string, Map<number, VerseAudio[]>>();

  // -------------------------------------------------------------------------
  // Listener management
  // -------------------------------------------------------------------------

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = { ...this.state };
    this.listeners.forEach((fn) => fn(snapshot));
  }

  private updateState(partial: Partial<PlaybackState>) {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  // -------------------------------------------------------------------------
  // Reciter management
  // -------------------------------------------------------------------------

  getReciter(): Reciter {
    return RECITERS.find((r) => r.id === this.state.reciterId) ?? RECITERS[0];
  }

  async loadSavedReciter(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(RECITER_STORAGE_KEY);
      if (saved && RECITERS.some((r) => r.id === saved)) {
        this.updateState({ reciterId: saved });
      }
    } catch {
      // Silently fall back to default
    }
  }

  async setReciter(reciterId: string): Promise<void> {
    const reciter = RECITERS.find((r) => r.id === reciterId);
    if (!reciter) return;

    const wasPlaying = this.state.isPlaying;
    const currentSurah = this.state.currentSurah;
    const currentVerse = this.state.currentVerse;

    // Stop current playback
    await this.stop();

    this.updateState({ reciterId });

    try {
      await AsyncStorage.setItem(RECITER_STORAGE_KEY, reciterId);
    } catch {
      // Non-critical
    }

    // If was playing, restart with new reciter
    if (wasPlaying && currentSurah && currentVerse) {
      await this.playVerse(currentSurah, currentVerse);
    }
  }

  // -------------------------------------------------------------------------
  // Audio URL fetching
  // -------------------------------------------------------------------------

  private async fetchVerseAudioUrls(
    surahNumber: number,
    edition: string
  ): Promise<VerseAudio[]> {
    // Check cache
    const editionCache = this.audioCache.get(edition);
    if (editionCache) {
      const cached = editionCache.get(surahNumber);
      if (cached) return cached;
    }

    const url = `${API_BASE}/surah/${surahNumber}/${edition}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio URLs: ${response.status}`);
    }

    const json = await response.json();
    if (json.code !== 200 || json.status !== 'OK') {
      throw new Error(`API error: ${json.status}`);
    }

    const ayahs: { number: number; numberInSurah: number; audio: string }[] =
      json.data.ayahs;

    const verses: VerseAudio[] = ayahs.map((a) => ({
      surahNumber,
      verseNumber: a.numberInSurah,
      globalVerseNumber: a.number,
      audioUrl: a.audio,
    }));

    // Store in cache
    if (!this.audioCache.has(edition)) {
      this.audioCache.set(edition, new Map());
    }
    this.audioCache.get(edition)!.set(surahNumber, verses);

    return verses;
  }

  // -------------------------------------------------------------------------
  // Playback controls
  // -------------------------------------------------------------------------

  async playSurah(surahNumber: number, startVerse: number = 1): Promise<void> {
    const reciter = this.getReciter();

    this.updateState({ isLoading: true, error: null, currentSurah: surahNumber });

    try {
      this.verseList = await this.fetchVerseAudioUrls(surahNumber, reciter.edition);
      const startIndex = this.verseList.findIndex(
        (v) => v.verseNumber === startVerse
      );
      this.currentIndex = startIndex >= 0 ? startIndex : 0;
      await this.loadAndPlay(this.currentIndex);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load audio';
      this.updateState({ isLoading: false, error: message });
    }
  }

  async playVerse(surahNumber: number, verseNumber: number): Promise<void> {
    await this.playSurah(surahNumber, verseNumber);
  }

  async pause(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (err) {
      if (__DEV__) console.error('QuranAudio: pause error', err);
    }
  }

  async resume(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (err) {
      if (__DEV__) console.error('QuranAudio: resume error', err);
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (err) {
      if (__DEV__) console.error('QuranAudio: stop error', err);
    }

    this.verseList = [];
    this.currentIndex = -1;
    this.updateState({
      isPlaying: false,
      isLoading: false,
      currentSurah: null,
      currentVerse: null,
      duration: 0,
      position: 0,
      error: null,
    });
  }

  async nextVerse(): Promise<void> {
    if (this.currentIndex < this.verseList.length - 1) {
      this.currentIndex++;
      await this.loadAndPlay(this.currentIndex);
    } else {
      // End of surah
      await this.stop();
    }
  }

  async previousVerse(): Promise<void> {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.loadAndPlay(this.currentIndex);
    } else if (this.currentIndex === 0) {
      // Restart current verse
      await this.loadAndPlay(0);
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (err) {
      if (__DEV__) console.error('QuranAudio: seek error', err);
    }
  }

  setAutoAdvance(enabled: boolean): void {
    this.autoAdvance = enabled;
  }

  getState(): PlaybackState {
    return { ...this.state };
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private async loadAndPlay(index: number): Promise<void> {
    const verse = this.verseList[index];
    if (!verse) return;

    this.updateState({
      isLoading: true,
      error: null,
      currentVerse: verse.verseNumber,
      currentSurah: verse.surahNumber,
    });

    try {
      // Unload previous
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: verse.audioUrl },
        { shouldPlay: true },
        this.onPlaybackStatus
      );

      this.sound = sound;
      this.updateState({ isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to play verse';
      this.updateState({ isLoading: false, error: message, isPlaying: false });
    }
  }

  private onPlaybackStatus = (status: AVPlaybackStatus) => {
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

    this.updateState({
      isPlaying: status.isPlaying,
      position: status.positionMillis,
      duration: status.durationMillis ?? 0,
    });

    // Auto-advance when verse finishes
    if (status.didJustFinish && !status.isLooping && this.autoAdvance) {
      this.nextVerse();
    }
  };

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  async destroy(): Promise<void> {
    await this.stop();
    this.listeners.clear();
    this.audioCache.clear();
  }
}

// Singleton instance
let instance: QuranAudioService | null = null;

export function getQuranAudioService(): QuranAudioService {
  if (!instance) {
    instance = new QuranAudioService();
  }
  return instance;
}
