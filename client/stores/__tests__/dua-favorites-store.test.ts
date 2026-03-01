/**
 * Dua Favorites Store Tests
 *
 * Tests for Zustand store managing dua favorites with AsyncStorage persistence.
 */

import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDuaFavorites, DuaFavorite } from "../dua-favorites-store";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe("Dua Favorites Store", () => {
  const mockDua = {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي",
    transliteration: "Rabbi ishrah li sadri",
    translation: "My Lord, expand for me my breast",
    source: "Quran 20:25",
  };

  const mockDua2 = {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
    transliteration: "Rabbana atina fid-dunya hasanah",
    translation: "Our Lord, give us in this world good",
    source: "Quran 2:201",
  };

  beforeEach(async () => {
    // Clear store and AsyncStorage before each test
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { result } = renderHook(() => useDuaFavorites());
    await act(async () => {
      // Reset state by setting favorites to empty array
      result.current.favorites.forEach((fav) => {
        result.current.removeFavorite(fav.id);
      });
    });
  });

  describe("Store Initialization", () => {
    it("should initialize with empty favorites array", () => {
      const { result } = renderHook(() => useDuaFavorites());
      expect(result.current.favorites).toEqual([]);
    });

    it("should have all required methods", () => {
      const { result } = renderHook(() => useDuaFavorites());
      expect(typeof result.current.addFavorite).toBe("function");
      expect(typeof result.current.removeFavorite).toBe("function");
      expect(typeof result.current.getFavorites).toBe("function");
      expect(typeof result.current.isFavorite).toBe("function");
    });
  });

  describe("addFavorite", () => {
    it("should add a dua to favorites with id and timestamp", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
      });

      expect(result.current.favorites).toHaveLength(1);
      const favorite = result.current.favorites[0];
      expect(favorite.id).toBeDefined();
      expect(favorite.savedAt).toBeDefined();
      expect(favorite.arabic).toBe(mockDua.arabic);
      expect(favorite.transliteration).toBe(mockDua.transliteration);
      expect(favorite.translation).toBe(mockDua.translation);
      expect(favorite.source).toBe(mockDua.source);
    });

    it("should generate unique ids for each favorite", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
        result.current.addFavorite(mockDua2);
      });

      expect(result.current.favorites).toHaveLength(2);
      const [fav1, fav2] = result.current.favorites;
      expect(fav1.id).not.toBe(fav2.id);
    });

    it("should add multiple duas to favorites", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
        result.current.addFavorite(mockDua2);
      });

      expect(result.current.favorites).toHaveLength(2);
    });

    it("should set savedAt timestamp when adding favorite", () => {
      const { result } = renderHook(() => useDuaFavorites());
      const beforeTime = Date.now();

      act(() => {
        result.current.addFavorite(mockDua);
      });

      const afterTime = Date.now();
      const favorite = result.current.favorites[0];
      expect(favorite.savedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(favorite.savedAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("removeFavorite", () => {
    it("should remove a dua from favorites by id", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
      });

      const favoriteId = result.current.favorites[0].id;

      act(() => {
        result.current.removeFavorite(favoriteId);
      });

      expect(result.current.favorites).toHaveLength(0);
    });

    it("should only remove the specified favorite", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
        result.current.addFavorite(mockDua2);
      });

      const favoriteId = result.current.favorites[0].id;

      act(() => {
        result.current.removeFavorite(favoriteId);
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].arabic).toBe(mockDua2.arabic);
    });

    it("should do nothing if id does not exist", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
      });

      act(() => {
        result.current.removeFavorite("non-existent-id");
      });

      expect(result.current.favorites).toHaveLength(1);
    });
  });

  describe("getFavorites", () => {
    it("should return empty array when no favorites", () => {
      const { result } = renderHook(() => useDuaFavorites());
      expect(result.current.getFavorites()).toEqual([]);
    });

    it("should return all favorites", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
        result.current.addFavorite(mockDua2);
      });

      const favorites = result.current.getFavorites();
      expect(favorites).toHaveLength(2);
    });

    it("should return favorites sorted by savedAt descending (newest first)", async () => {
      const { result } = renderHook(() => useDuaFavorites());

      // Add first favorite
      await act(async () => {
        result.current.addFavorite(mockDua);
        // Wait a bit to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Add second favorite
      await act(async () => {
        result.current.addFavorite(mockDua2);
      });

      const favorites = result.current.getFavorites();
      expect(favorites).toHaveLength(2);
      expect(favorites[0].arabic).toBe(mockDua2.arabic); // Most recent first
      expect(favorites[1].arabic).toBe(mockDua.arabic);
      expect(favorites[0].savedAt).toBeGreaterThan(favorites[1].savedAt);
    });
  });

  describe("isFavorite", () => {
    it("should return false when favorites is empty", () => {
      const { result } = renderHook(() => useDuaFavorites());
      expect(result.current.isFavorite("any-id")).toBe(false);
    });

    it("should return true for existing favorite id", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
      });

      const favoriteId = result.current.favorites[0].id;
      expect(result.current.isFavorite(favoriteId)).toBe(true);
    });

    it("should return false for non-existing favorite id", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
      });

      expect(result.current.isFavorite("non-existent-id")).toBe(false);
    });

    it("should return false after favorite is removed", () => {
      const { result } = renderHook(() => useDuaFavorites());

      act(() => {
        result.current.addFavorite(mockDua);
      });

      const favoriteId = result.current.favorites[0].id;
      expect(result.current.isFavorite(favoriteId)).toBe(true);

      act(() => {
        result.current.removeFavorite(favoriteId);
      });

      expect(result.current.isFavorite(favoriteId)).toBe(false);
    });
  });

  describe("AsyncStorage Persistence", () => {
    it("should persist favorites to AsyncStorage when added", async () => {
      const { result } = renderHook(() => useDuaFavorites());

      await act(async () => {
        result.current.addFavorite(mockDua);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          "noor-dua-favorites",
          expect.stringContaining(mockDua.arabic),
        );
      });
    });

    it("should persist favorites to AsyncStorage when removed", async () => {
      const { result } = renderHook(() => useDuaFavorites());

      await act(async () => {
        result.current.addFavorite(mockDua);
      });

      const favoriteId = result.current.favorites[0].id;

      await act(async () => {
        result.current.removeFavorite(favoriteId);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });
  });
});
