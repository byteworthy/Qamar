import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DuaFavorite {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  savedAt: number;
}

interface DuaFavoritesState {
  favorites: DuaFavorite[];
  addFavorite: (dua: Omit<DuaFavorite, "id" | "savedAt">) => void;
  removeFavorite: (id: string) => void;
  getFavorites: () => DuaFavorite[];
  isFavorite: (id: string) => boolean;
}

export const useDuaFavorites = create<DuaFavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (dua) => {
        const newFavorite: DuaFavorite = {
          ...dua,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          savedAt: Date.now(),
        };
        set((state) => ({
          favorites: [...state.favorites, newFavorite],
        }));
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== id),
        }));
      },

      getFavorites: () => {
        return get().favorites.sort((a, b) => b.savedAt - a.savedAt);
      },

      isFavorite: (id) => {
        return get().favorites.some((fav) => fav.id === id);
      },
    }),
    {
      name: "noor-dua-favorites",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
