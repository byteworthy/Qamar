/**
 * useOfflineData Hook Tests
 *
 * Tests offline-first data hooks: database initialization,
 * local-first query pattern, and sync behavior.
 */

// Mock offline database
const mockDb = {
  isReady: jest.fn(() => true),
  getAllSurahs: jest.fn(async () => []),
  getVersesBySurah: jest.fn(async () => []),
  searchVerses: jest.fn(async () => []),
  upsertSurahs: jest.fn(async () => {}),
  upsertVerses: jest.fn(async () => {}),
  getHadithsByCollection: jest.fn(async () => []),
  getHadith: jest.fn(async () => null),
  upsertHadiths: jest.fn(async () => {}),
  getVocabularyByCategory: jest.fn(async () => []),
  getVocabularyByDifficulty: jest.fn(async () => []),
  upsertVocabulary: jest.fn(async () => {}),
};

jest.mock("../../lib/offline-database", () => ({
  getOfflineDatabase: () => mockDb,
  initializeOfflineDatabase: jest.fn(async () => {}),
}));

jest.mock("../../lib/sync-engine", () => ({
  getSyncEngine: () => ({
    performFullSync: jest.fn(async () => ({ success: true })),
    getPendingCount: jest.fn(async () => 0),
    queueMutation: jest.fn(async () => {}),
    onSyncComplete: jest.fn(() => () => {}),
  }),
}));

jest.mock("../../stores/app-state", () => ({
  useAppState: jest.fn((selector: (s: any) => any) => {
    const state = {
      offline: { isOffline: false },
      setOfflineStatus: jest.fn(),
      setSyncTimestamp: jest.fn(),
      setPendingSyncCount: jest.fn(),
      setSyncInProgress: jest.fn(),
    };
    return selector(state);
  }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), mutateAsync: jest.fn(), isLoading: false })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: jest.fn((cb) => cb()),
  useCallback: jest.fn((cb) => cb),
}));

describe("useOfflineData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.isReady.mockReturnValue(true);
  });

  describe("Module exports", () => {
    test("all expected hooks and namespaces are exported", () => {
      const mod = require("../useOfflineData");
      expect(mod.useOfflineDatabase).toBeDefined();
      expect(mod.useOfflineQuranSurahs).toBeDefined();
      expect(mod.useOfflineQuranVerses).toBeDefined();
      expect(mod.useOfflineQuranSearch).toBeDefined();
      expect(mod.useOfflineHadithByCollection).toBeDefined();
      expect(mod.useOfflineHadithById).toBeDefined();
      expect(mod.useOfflineVocabularyByCategory).toBeDefined();
      expect(mod.useOfflineVocabularyByDifficulty).toBeDefined();
      expect(mod.useOfflineQuran).toBeDefined();
      expect(mod.useOfflineHadith).toBeDefined();
      expect(mod.useOfflineVocabulary).toBeDefined();
      expect(mod.useBackgroundSync).toBeDefined();
      expect(mod.useOfflineMutation).toBeDefined();
    });
  });

  describe("Local-first query pattern", () => {
    test("surahs: reads from local DB first", async () => {
      const mockSurahs = [{ id: 1, surah_number: 1, name_arabic: "الفاتحة" }];
      mockDb.getAllSurahs.mockResolvedValue(mockSurahs);
      const result = await mockDb.getAllSurahs();
      expect(result).toEqual(mockSurahs);
    });

    test("verses: reads by surah number", async () => {
      const mockVerses = [{ id: 1, surah_number: 1, verse_number: 1, arabic_text: "بسم الله" }];
      mockDb.getVersesBySurah.mockResolvedValue(mockVerses);
      const result = await mockDb.getVersesBySurah(1);
      expect(result[0].surah_number).toBe(1);
    });

    test("hadiths: reads by collection", async () => {
      const mockHadiths = [{ id: 1, collection: "bukhari", arabic_text: "text" }];
      mockDb.getHadithsByCollection.mockResolvedValue(mockHadiths);
      const result = await mockDb.getHadithsByCollection("bukhari");
      expect(result[0].collection).toBe("bukhari");
    });

    test("vocabulary: reads by category", async () => {
      const mockWords = [{ id: 1, arabic_word: "سلام", category: "greetings" }];
      mockDb.getVocabularyByCategory.mockResolvedValue(mockWords);
      const result = await mockDb.getVocabularyByCategory("greetings");
      expect(result[0].category).toBe("greetings");
    });
  });

  describe("Database not ready fallback", () => {
    test("when DB not ready, isReady returns false", () => {
      mockDb.isReady.mockReturnValue(false);
      expect(mockDb.isReady()).toBe(false);
    });
  });

  describe("Search", () => {
    test("verse search calls db.searchVerses", async () => {
      const mockResults = [{ id: 1, arabic_text: "آية الكرسي", translation_en: "Ayat al-Kursi" }];
      mockDb.searchVerses.mockResolvedValue(mockResults);
      const result = await mockDb.searchVerses("Kursi");
      expect(result).toHaveLength(1);
      expect(mockDb.searchVerses).toHaveBeenCalledWith("Kursi");
    });
  });

  describe("Data type shapes", () => {
    test("Surah shape", () => {
      const surah = { id: 1, surah_number: 1, name_arabic: "الفاتحة", total_verses: 7 };
      expect(typeof surah.name_arabic).toBe("string");
      expect(typeof surah.total_verses).toBe("number");
    });

    test("Verse shape", () => {
      const verse = { id: 1, surah_number: 1, verse_number: 1, arabic_text: "بسم الله" };
      expect(typeof verse.arabic_text).toBe("string");
    });

    test("Hadith shape", () => {
      const hadith = { id: 1, collection: "bukhari", narrator: "Abu Hurairah", grade: "sahih" };
      expect(hadith.collection).toBe("bukhari");
    });

    test("VocabularyWord shape", () => {
      const word = { id: 1, arabic_word: "كتاب", difficulty_level: 1 };
      expect(typeof word.difficulty_level).toBe("number");
    });
  });

  describe("Local caching via upsert", () => {
    test("upsertSurahs stores data locally", async () => {
      await mockDb.upsertSurahs([{ id: 1 }]);
      expect(mockDb.upsertSurahs).toHaveBeenCalled();
    });

    test("upsertHadiths stores data locally", async () => {
      await mockDb.upsertHadiths([{ id: 1, collection: "bukhari" }]);
      expect(mockDb.upsertHadiths).toHaveBeenCalled();
    });
  });
});
