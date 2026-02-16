import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TafsirKeyTerm {
  arabic: string;
  transliteration: string;
  root: string;
  meaning: string;
}

export interface TafsirData {
  context: string;
  keyTerms: TafsirKeyTerm[];
  scholarlyViews: string;
  crossReferences: string[];
  practicalTakeaway: string;
}

interface TafsirCacheState {
  cache: Record<string, TafsirData>; // key: "surah:verse"
  setTafsir: (surahNumber: number, verseNumber: number, data: TafsirData) => void;
  getTafsir: (surahNumber: number, verseNumber: number) => TafsirData | null;
}

export const useTafsirCache = create<TafsirCacheState>()(
  persist(
    (set, get) => ({
      cache: {},

      setTafsir: (surahNumber, verseNumber, data) => {
        const key = `${surahNumber}:${verseNumber}`;
        set((state) => ({
          cache: { ...state.cache, [key]: data },
        }));
      },

      getTafsir: (surahNumber, verseNumber) => {
        const key = `${surahNumber}:${verseNumber}`;
        return get().cache[key] ?? null;
      },
    }),
    {
      name: 'noor-tafsir-cache',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
