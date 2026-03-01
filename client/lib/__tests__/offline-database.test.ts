/**
 * Offline Database Tests
 *
 * Tests the MockOfflineDatabase (in-memory SQLite wrapper) covering:
 * - CRUD operations for surahs, verses, hadiths, vocabulary
 * - Upsert behavior (insert vs update)
 * - Search functionality
 * - Metadata queries
 * - Edge cases: empty results, duplicate inserts, boundary values
 */

import {
  getOfflineDatabase,
  initializeOfflineDatabase,
  resetOfflineDatabase,
  type OfflineDatabase,
} from "../offline-database";
import type {
  Surah,
  Verse,
  Hadith,
  VocabularyWord,
} from "../../../shared/offline-schema";

describe("OfflineDatabase", () => {
  let db: OfflineDatabase;

  beforeEach(async () => {
    await resetOfflineDatabase();
    db = await initializeOfflineDatabase();
  });

  afterEach(async () => {
    await resetOfflineDatabase();
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================

  describe("initialization", () => {
    it("should report ready after initialization", () => {
      expect(db.isReady()).toBe(true);
    });

    it("should report not ready after close", async () => {
      await db.close();
      expect(db.isReady()).toBe(false);
    });

    it("should return the same singleton instance", () => {
      const db2 = getOfflineDatabase();
      expect(db2).toBe(db);
    });

    it("should not re-initialize if already ready", async () => {
      const db2 = await initializeOfflineDatabase();
      expect(db2).toBe(db);
      expect(db2.isReady()).toBe(true);
    });
  });

  // ==========================================================================
  // Surah Operations
  // ==========================================================================

  describe("surahs", () => {
    it("should return all pre-seeded surahs sorted by surah_number", async () => {
      const surahs = await db.getAllSurahs();
      expect(surahs.length).toBeGreaterThanOrEqual(5);

      for (let i = 1; i < surahs.length; i++) {
        expect(surahs[i].surah_number).toBeGreaterThan(
          surahs[i - 1].surah_number,
        );
      }
    });

    it("should get a surah by number", async () => {
      const surah = await db.getSurah(1);
      expect(surah).not.toBeNull();
      expect(surah!.name_english).toBe("The Opening");
      expect(surah!.name_arabic).toBe("الفاتحة");
      expect(surah!.verses_count).toBe(7);
    });

    it("should return null for non-existent surah", async () => {
      const surah = await db.getSurah(999);
      expect(surah).toBeNull();
    });

    it("should upsert a new surah", async () => {
      const newSurah: Surah = {
        id: 100,
        surah_number: 3,
        name_arabic: "آل عمران",
        name_english: "The Family of Imran",
        name_transliteration: "Ali 'Imran",
        verses_count: 200,
        revelation_place: "Madinah",
      };
      await db.upsertSurahs([newSurah]);

      const fetched = await db.getSurah(3);
      expect(fetched).not.toBeNull();
      expect(fetched!.name_english).toBe("The Family of Imran");
    });

    it("should update an existing surah on upsert", async () => {
      const updated: Surah = {
        id: 1,
        surah_number: 1,
        name_arabic: "الفاتحة",
        name_english: "The Opening (Updated)",
        name_transliteration: "Al-Fatihah",
        verses_count: 7,
        revelation_place: "Makkah",
      };
      await db.upsertSurahs([updated]);

      const fetched = await db.getSurah(1);
      expect(fetched!.name_english).toBe("The Opening (Updated)");
    });

    it("should handle bulk upsert with mix of new and existing", async () => {
      const countBefore = await db.getRowCount("surahs");
      await db.upsertSurahs([
        {
          id: 1,
          surah_number: 1,
          name_arabic: "الفاتحة",
          name_english: "Updated",
          name_transliteration: "Al-Fatihah",
          verses_count: 7,
          revelation_place: "Makkah",
        },
        {
          id: 99,
          surah_number: 99,
          name_arabic: "الزلزلة",
          name_english: "The Earthquake",
          name_transliteration: "Az-Zalzalah",
          verses_count: 8,
          revelation_place: "Madinah",
        },
      ]);
      const countAfter = await db.getRowCount("surahs");
      expect(countAfter).toBe(countBefore + 1);
    });
  });

  // ==========================================================================
  // Verse Operations
  // ==========================================================================

  describe("verses", () => {
    it("should get all verses for a surah in order", async () => {
      const verses = await db.getVersesBySurah(1);
      expect(verses.length).toBe(7);

      for (let i = 1; i < verses.length; i++) {
        expect(verses[i].verse_number).toBeGreaterThan(
          verses[i - 1].verse_number,
        );
      }
    });

    it("should return empty array for surah with no verses", async () => {
      const verses = await db.getVersesBySurah(2);
      expect(verses).toEqual([]);
    });

    it("should get a specific verse", async () => {
      const verse = await db.getVerse(1, 1);
      expect(verse).not.toBeNull();
      expect(verse!.arabic_text).toContain("بِسْمِ");
      expect(verse!.translation_en).toContain("name of Allah");
    });

    it("should return null for non-existent verse", async () => {
      const verse = await db.getVerse(1, 999);
      expect(verse).toBeNull();
    });

    it("should search verses by English translation", async () => {
      const results = await db.searchVerses("praise");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].translation_en.toLowerCase()).toContain("praise");
    });

    it("should search verses by Arabic text", async () => {
      const results = await db.searchVerses("بِسْمِ");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it("should return empty for search with no matches", async () => {
      const results = await db.searchVerses("xyznonexistent");
      expect(results).toEqual([]);
    });

    it("should upsert new verses", async () => {
      const newVerse: Verse = {
        id: 100,
        surah_number: 2,
        verse_number: 1,
        arabic_text: "الم",
        translation_en: "Alif, Lam, Meem.",
        juz_number: 1,
        page_number: 2,
      };
      await db.upsertVerses([newVerse]);

      const fetched = await db.getVerse(2, 1);
      expect(fetched).not.toBeNull();
      expect(fetched!.arabic_text).toBe("الم");
    });

    it("should update existing verse on upsert (matched by surah+verse number)", async () => {
      await db.upsertVerses([
        {
          id: 1,
          surah_number: 1,
          verse_number: 1,
          arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          translation_en:
            "In the name of God, the Most Gracious, the Most Merciful.",
          juz_number: 1,
          page_number: 1,
        },
      ]);

      const fetched = await db.getVerse(1, 1);
      expect(fetched!.translation_en).toContain("God");
    });
  });

  // ==========================================================================
  // Hadith Operations
  // ==========================================================================

  describe("hadiths", () => {
    it("should get hadiths by collection", async () => {
      const hadiths = await db.getHadithsByCollection("bukhari");
      expect(hadiths.length).toBe(2);
      hadiths.forEach((h) => expect(h.collection).toBe("bukhari"));
    });

    it("should filter hadiths by grade", async () => {
      const sahih = await db.getHadithsByCollection("bukhari", "sahih");
      expect(sahih.length).toBe(2);
      sahih.forEach((h) => expect(h.grade).toBe("sahih"));
    });

    it("should return empty for non-existent collection", async () => {
      const hadiths = await db.getHadithsByCollection("nonexistent");
      expect(hadiths).toEqual([]);
    });

    it("should get a hadith by ID", async () => {
      const hadith = await db.getHadith(1);
      expect(hadith).not.toBeNull();
      expect(hadith!.narrator).toBe("Umar ibn al-Khattab");
      expect(hadith!.translation_en).toContain("intentions");
    });

    it("should return null for non-existent hadith ID", async () => {
      const hadith = await db.getHadith(999);
      expect(hadith).toBeNull();
    });

    it("should upsert new hadith", async () => {
      const newHadith: Hadith = {
        id: 100,
        collection: "bukhari",
        book_number: 2,
        hadith_number: 10,
        narrator: "Abu Hurairah",
        arabic_text: "المسلم من سلم المسلمون من لسانه ويده",
        translation_en:
          "A Muslim is one from whose tongue and hand other Muslims are safe.",
        grade: "sahih",
      };
      await db.upsertHadiths([newHadith]);

      const hadiths = await db.getHadithsByCollection("bukhari");
      expect(hadiths.length).toBe(3);
    });

    it("should update existing hadith on upsert (matched by collection+book+hadith number)", async () => {
      await db.upsertHadiths([
        {
          id: 1,
          collection: "bukhari",
          book_number: 1,
          hadith_number: 1,
          narrator: "Umar ibn al-Khattab",
          arabic_text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
          translation_en: "Deeds are judged by intentions (updated).",
          grade: "sahih",
        },
      ]);

      const hadith = await db.getHadith(1);
      expect(hadith!.translation_en).toContain("updated");
    });
  });

  // ==========================================================================
  // Vocabulary Operations
  // ==========================================================================

  describe("vocabulary", () => {
    it("should get vocabulary by category sorted by difficulty then frequency", async () => {
      const words = await db.getVocabularyByCategory("quran_common");
      expect(words.length).toBeGreaterThanOrEqual(3);

      // Should be sorted by difficulty_level ascending, then quran_frequency descending
      for (let i = 1; i < words.length; i++) {
        if (words[i].difficulty_level === words[i - 1].difficulty_level) {
          expect(words[i].quran_frequency).toBeLessThanOrEqual(
            words[i - 1].quran_frequency,
          );
        } else {
          expect(words[i].difficulty_level).toBeGreaterThanOrEqual(
            words[i - 1].difficulty_level,
          );
        }
      }
    });

    it("should return empty for non-existent category", async () => {
      const words = await db.getVocabularyByCategory("nonexistent");
      expect(words).toEqual([]);
    });

    it("should get vocabulary by difficulty level sorted by frequency desc", async () => {
      const words = await db.getVocabularyByDifficulty(1);
      expect(words.length).toBeGreaterThanOrEqual(3);

      for (let i = 1; i < words.length; i++) {
        expect(words[i].quran_frequency).toBeLessThanOrEqual(
          words[i - 1].quran_frequency,
        );
      }
    });

    it("should upsert new vocabulary word", async () => {
      const newWord: VocabularyWord = {
        id: "v99",
        arabic_word: "جَنَّة",
        transliteration: "jannah",
        translation_en: "Paradise",
        root: "ج-ن-ن",
        category: "quran_common",
        difficulty_level: 2,
        quran_frequency: 147,
      };
      await db.upsertVocabulary([newWord]);

      const words = await db.getVocabularyByCategory("quran_common");
      const found = words.find((w) => w.id === "v99");
      expect(found).toBeDefined();
      expect(found!.translation_en).toBe("Paradise");
    });

    it("should update existing vocabulary word on upsert (matched by id)", async () => {
      await db.upsertVocabulary([
        {
          id: "v1",
          arabic_word: "بِسْمِ",
          transliteration: "bismi",
          translation_en: "In the name of (updated)",
          root: "س-م-و",
          category: "quran_common",
          difficulty_level: 1,
          quran_frequency: 114,
        },
      ]);

      const words = await db.getVocabularyByCategory("quran_common");
      const found = words.find((w) => w.id === "v1");
      expect(found!.translation_en).toContain("updated");
    });
  });

  // ==========================================================================
  // Metadata
  // ==========================================================================

  describe("metadata", () => {
    it("should return correct row counts per table", async () => {
      expect(await db.getRowCount("surahs")).toBe(5);
      expect(await db.getRowCount("verses")).toBe(11);
      expect(await db.getRowCount("hadiths")).toBe(3);
      expect(await db.getRowCount("vocabulary")).toBe(5);
    });

    it("should return 0 for unknown table", async () => {
      expect(await db.getRowCount("nonexistent")).toBe(0);
    });

    it("should return a timestamp for getLastModified", async () => {
      const ts = await db.getLastModified("surahs");
      expect(ts).not.toBeNull();
      expect(typeof ts).toBe("number");
    });

    it("should reflect row count changes after upsert", async () => {
      const before = await db.getRowCount("surahs");
      await db.upsertSurahs([
        {
          id: 50,
          surah_number: 50,
          name_arabic: "ق",
          name_english: "Qaf",
          name_transliteration: "Qaf",
          verses_count: 45,
          revelation_place: "Makkah",
        },
      ]);
      const after = await db.getRowCount("surahs");
      expect(after).toBe(before + 1);
    });
  });
});
