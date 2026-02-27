/**
 * Travel Favorites Store
 *
 * Persists favorite travel phrase IDs in AsyncStorage.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// TYPES
// =============================================================================

interface TravelFavoritesState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

// =============================================================================
// STORE
// =============================================================================

export const useTravelFavorites = create<TravelFavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (id) => {
        set((state) => {
          const exists = state.favorites.includes(id);
          return {
            favorites: exists
              ? state.favorites.filter((f) => f !== id)
              : [...state.favorites, id],
          };
        });
      },

      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: "noor-travel-favorites",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
