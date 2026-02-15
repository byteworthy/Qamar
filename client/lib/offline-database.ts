/**
 * Offline Database - SQLite wrapper for local Islamic content
 *
 * Uses expo-sqlite when available, falls back to in-memory mock store.
 * Toggle USE_MOCK_DATA to switch between real SQLite and mock implementations.
 */

import {
  INIT_OFFLINE_DATABASE,
  SEARCH_VERSES_FTS,
  GET_VERSES_BY_SURAH,
  GET_VERSE,
  GET_ALL_SURAHS,
  GET_SAHIH_HADITHS_BY_COLLECTION,
  GET_VOCABULARY_BY_CATEGORY,
  type Surah,
  type Verse,
  type Hadith,
  type VocabularyWord,
} from "../../shared/offline-schema";

// ============================================================================
// MOCK DATA FLAG
// ============================================================================

const USE_MOCK_DATA = false;

// ============================================================================
// DATABASE INTERFACE
// ============================================================================

export interface OfflineDatabase {
  initialize(): Promise<void>;
  close(): Promise<void>;
  isReady(): boolean;

  // Surah operations
  getAllSurahs(): Promise<Surah[]>;
  getSurah(surahNumber: number): Promise<Surah | null>;
  upsertSurahs(surahs: Surah[]): Promise<void>;

  // Verse operations
  getVersesBySurah(surahNumber: number): Promise<Verse[]>;
  getVerse(surahNumber: number, verseNumber: number): Promise<Verse | null>;
  searchVerses(query: string): Promise<Verse[]>;
  upsertVerses(verses: Verse[]): Promise<void>;

  // Hadith operations
  getHadithsByCollection(collection: string, grade?: string): Promise<Hadith[]>;
  getHadith(id: number): Promise<Hadith | null>;
  upsertHadiths(hadiths: Hadith[]): Promise<void>;

  // Vocabulary operations
  getVocabularyByCategory(category: string): Promise<VocabularyWord[]>;
  getVocabularyByDifficulty(level: number): Promise<VocabularyWord[]>;
  upsertVocabulary(words: VocabularyWord[]): Promise<void>;

  // Metadata
  getRowCount(table: string): Promise<number>;
  getLastModified(table: string): Promise<number | null>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_SURAHS: Surah[] = [
  { id: 1, surah_number: 1, name_arabic: "الفاتحة", name_english: "The Opening", name_transliteration: "Al-Fatihah", verses_count: 7, revelation_place: "Makkah" },
  { id: 2, surah_number: 2, name_arabic: "البقرة", name_english: "The Cow", name_transliteration: "Al-Baqarah", verses_count: 286, revelation_place: "Madinah" },
  { id: 3, surah_number: 112, name_arabic: "الإخلاص", name_english: "The Sincerity", name_transliteration: "Al-Ikhlas", verses_count: 4, revelation_place: "Makkah" },
  { id: 4, surah_number: 113, name_arabic: "الفلق", name_english: "The Daybreak", name_transliteration: "Al-Falaq", verses_count: 5, revelation_place: "Makkah" },
  { id: 5, surah_number: 114, name_arabic: "الناس", name_english: "Mankind", name_transliteration: "An-Nas", verses_count: 6, revelation_place: "Makkah" },
];

const MOCK_VERSES: Verse[] = [
  { id: 1, surah_number: 1, verse_number: 1, arabic_text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation_en: "In the name of Allah, the Most Gracious, the Most Merciful.", juz_number: 1, page_number: 1 },
  { id: 2, surah_number: 1, verse_number: 2, arabic_text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation_en: "All praise is due to Allah, Lord of all the worlds.", juz_number: 1, page_number: 1 },
  { id: 3, surah_number: 1, verse_number: 3, arabic_text: "الرَّحْمَٰنِ الرَّحِيمِ", translation_en: "The Most Gracious, the Most Merciful.", juz_number: 1, page_number: 1 },
  { id: 4, surah_number: 1, verse_number: 4, arabic_text: "مَالِكِ يَوْمِ الدِّينِ", translation_en: "Master of the Day of Judgment.", juz_number: 1, page_number: 1 },
  { id: 5, surah_number: 1, verse_number: 5, arabic_text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation_en: "You alone we worship, and You alone we ask for help.", juz_number: 1, page_number: 1 },
  { id: 6, surah_number: 1, verse_number: 6, arabic_text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation_en: "Guide us on the Straight Path.", juz_number: 1, page_number: 1 },
  { id: 7, surah_number: 1, verse_number: 7, arabic_text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation_en: "The path of those You have blessed, not of those who have earned Your anger or those who are astray.", juz_number: 1, page_number: 1 },
  { id: 8, surah_number: 112, verse_number: 1, arabic_text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation_en: "Say, 'He is Allah—One and Indivisible;", juz_number: 30, page_number: 604 },
  { id: 9, surah_number: 112, verse_number: 2, arabic_text: "اللَّهُ الصَّمَدُ", translation_en: "Allah—the Sustainer needed by all.", juz_number: 30, page_number: 604 },
  { id: 10, surah_number: 112, verse_number: 3, arabic_text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation_en: "He has never had offspring, nor was He born.", juz_number: 30, page_number: 604 },
  { id: 11, surah_number: 112, verse_number: 4, arabic_text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation_en: "And there is none comparable to Him.'", juz_number: 30, page_number: 604 },
];

const MOCK_HADITHS: Hadith[] = [
  { id: 1, collection: "bukhari", book_number: 1, hadith_number: 1, narrator: "Umar ibn al-Khattab", arabic_text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation_en: "Actions are judged by intentions, and every person will get the reward according to what they intended.", grade: "sahih" },
  { id: 2, collection: "bukhari", book_number: 1, hadith_number: 2, narrator: "Aisha", arabic_text: "مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ", translation_en: "Whoever introduces something into this matter of ours that is not part of it, it is rejected.", grade: "sahih" },
  { id: 3, collection: "muslim", book_number: 1, hadith_number: 1, narrator: "Umar ibn al-Khattab", arabic_text: "بُنِيَ الإسلامُ على خمسٍ", translation_en: "Islam is built upon five pillars.", grade: "sahih" },
];

const MOCK_VOCABULARY: VocabularyWord[] = [
  { id: "v1", arabic_word: "بِسْمِ", transliteration: "bismi", translation_en: "In the name of", root: "س-م-و", category: "quran_common", difficulty_level: 1, quran_frequency: 114 },
  { id: "v2", arabic_word: "اللَّه", transliteration: "Allah", translation_en: "God", root: "أ-ل-ه", category: "quran_common", difficulty_level: 1, quran_frequency: 2699 },
  { id: "v3", arabic_word: "رَبّ", transliteration: "rabb", translation_en: "Lord", root: "ر-ب-ب", category: "quran_common", difficulty_level: 1, quran_frequency: 975 },
  { id: "v4", arabic_word: "كِتَاب", transliteration: "kitab", translation_en: "Book", root: "ك-ت-ب", category: "quran_common", difficulty_level: 2, quran_frequency: 319 },
  { id: "v5", arabic_word: "سَلَام", transliteration: "salam", translation_en: "Peace", root: "س-ل-م", category: "greetings", difficulty_level: 1, quran_frequency: 42 },
];

// ============================================================================
// MOCK DATABASE IMPLEMENTATION
// ============================================================================

class MockOfflineDatabase implements OfflineDatabase {
  private ready = false;
  private surahs: Surah[] = [...MOCK_SURAHS];
  private verses: Verse[] = [...MOCK_VERSES];
  private hadiths: Hadith[] = [...MOCK_HADITHS];
  private vocabulary: VocabularyWord[] = [...MOCK_VOCABULARY];

  async initialize(): Promise<void> {
    // Simulate database initialization delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.ready = true;
  }

  async close(): Promise<void> {
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }

  // -- Surahs --

  async getAllSurahs(): Promise<Surah[]> {
    await this.simulateDelay(50);
    return [...this.surahs].sort((a, b) => a.surah_number - b.surah_number);
  }

  async getSurah(surahNumber: number): Promise<Surah | null> {
    await this.simulateDelay(20);
    return this.surahs.find((s) => s.surah_number === surahNumber) ?? null;
  }

  async upsertSurahs(surahs: Surah[]): Promise<void> {
    await this.simulateDelay(50);
    for (const surah of surahs) {
      const idx = this.surahs.findIndex((s) => s.surah_number === surah.surah_number);
      if (idx >= 0) {
        this.surahs[idx] = surah;
      } else {
        this.surahs.push(surah);
      }
    }
  }

  // -- Verses --

  async getVersesBySurah(surahNumber: number): Promise<Verse[]> {
    await this.simulateDelay(80);
    return this.verses
      .filter((v) => v.surah_number === surahNumber)
      .sort((a, b) => a.verse_number - b.verse_number);
  }

  async getVerse(surahNumber: number, verseNumber: number): Promise<Verse | null> {
    await this.simulateDelay(20);
    return this.verses.find(
      (v) => v.surah_number === surahNumber && v.verse_number === verseNumber
    ) ?? null;
  }

  async searchVerses(query: string): Promise<Verse[]> {
    await this.simulateDelay(100);
    const q = query.toLowerCase();
    return this.verses.filter(
      (v) =>
        v.arabic_text.includes(query) ||
        v.translation_en.toLowerCase().includes(q)
    );
  }

  async upsertVerses(verses: Verse[]): Promise<void> {
    await this.simulateDelay(100);
    for (const verse of verses) {
      const idx = this.verses.findIndex(
        (v) => v.surah_number === verse.surah_number && v.verse_number === verse.verse_number
      );
      if (idx >= 0) {
        this.verses[idx] = verse;
      } else {
        this.verses.push(verse);
      }
    }
  }

  // -- Hadiths --

  async getHadithsByCollection(collection: string, grade?: string): Promise<Hadith[]> {
    await this.simulateDelay(80);
    return this.hadiths.filter(
      (h) => h.collection === collection && (!grade || h.grade === grade)
    );
  }

  async getHadith(id: number): Promise<Hadith | null> {
    await this.simulateDelay(20);
    return this.hadiths.find((h) => h.id === id) ?? null;
  }

  async upsertHadiths(hadiths: Hadith[]): Promise<void> {
    await this.simulateDelay(80);
    for (const hadith of hadiths) {
      const idx = this.hadiths.findIndex(
        (h) =>
          h.collection === hadith.collection &&
          h.book_number === hadith.book_number &&
          h.hadith_number === hadith.hadith_number
      );
      if (idx >= 0) {
        this.hadiths[idx] = hadith;
      } else {
        this.hadiths.push(hadith);
      }
    }
  }

  // -- Vocabulary --

  async getVocabularyByCategory(category: string): Promise<VocabularyWord[]> {
    await this.simulateDelay(50);
    return this.vocabulary
      .filter((w) => w.category === category)
      .sort((a, b) => a.difficulty_level - b.difficulty_level || b.quran_frequency - a.quran_frequency);
  }

  async getVocabularyByDifficulty(level: number): Promise<VocabularyWord[]> {
    await this.simulateDelay(50);
    return this.vocabulary
      .filter((w) => w.difficulty_level === level)
      .sort((a, b) => b.quran_frequency - a.quran_frequency);
  }

  async upsertVocabulary(words: VocabularyWord[]): Promise<void> {
    await this.simulateDelay(50);
    for (const word of words) {
      const idx = this.vocabulary.findIndex((w) => w.id === word.id);
      if (idx >= 0) {
        this.vocabulary[idx] = word;
      } else {
        this.vocabulary.push(word);
      }
    }
  }

  // -- Metadata --

  async getRowCount(table: string): Promise<number> {
    switch (table) {
      case "surahs": return this.surahs.length;
      case "verses": return this.verses.length;
      case "hadiths": return this.hadiths.length;
      case "vocabulary": return this.vocabulary.length;
      default: return 0;
    }
  }

  async getLastModified(_table: string): Promise<number | null> {
    return Date.now();
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// REAL SQLITE DATABASE IMPLEMENTATION (expo-sqlite)
// ============================================================================

class SQLiteOfflineDatabase implements OfflineDatabase {
  private db: any = null;
  private ready = false;

  async initialize(): Promise<void> {
    try {
      const SQLite = require("expo-sqlite");
      this.db = await SQLite.openDatabaseAsync("noor_offline.db");

      // Run all schema creation statements
      for (const sql of INIT_OFFLINE_DATABASE) {
        await this.db.execAsync(sql);
      }

      this.ready = true;
    } catch (error) {
      console.error("[OfflineDB] Failed to initialize SQLite:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
    this.ready = false;
  }

  isReady(): boolean {
    return this.ready;
  }

  // -- Surahs --

  async getAllSurahs(): Promise<Surah[]> {
    return this.db.getAllAsync(GET_ALL_SURAHS);
  }

  async getSurah(surahNumber: number): Promise<Surah | null> {
    const result = await this.db.getFirstAsync(
      "SELECT * FROM surahs WHERE surah_number = ? LIMIT 1",
      [surahNumber]
    );
    return result ?? null;
  }

  async upsertSurahs(surahs: Surah[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const s of surahs) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO surahs (surah_number, name_arabic, name_english, name_transliteration, verses_count, revelation_place)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [s.surah_number, s.name_arabic, s.name_english, s.name_transliteration ?? null, s.verses_count, s.revelation_place]
        );
      }
    });
  }

  // -- Verses --

  async getVersesBySurah(surahNumber: number): Promise<Verse[]> {
    return this.db.getAllAsync(GET_VERSES_BY_SURAH, [surahNumber]);
  }

  async getVerse(surahNumber: number, verseNumber: number): Promise<Verse | null> {
    const result = await this.db.getFirstAsync(GET_VERSE, [surahNumber, verseNumber]);
    return result ?? null;
  }

  async searchVerses(query: string): Promise<Verse[]> {
    return this.db.getAllAsync(SEARCH_VERSES_FTS, [query]);
  }

  async upsertVerses(verses: Verse[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const v of verses) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO verses (surah_number, verse_number, arabic_text, translation_en, translation_ur, transliteration, juz_number, page_number, hizb_quarter, audio_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [v.surah_number, v.verse_number, v.arabic_text, v.translation_en, v.translation_ur ?? null, v.transliteration ?? null, v.juz_number ?? null, v.page_number ?? null, v.hizb_quarter ?? null, v.audio_url ?? null]
        );
      }
    });
  }

  // -- Hadiths --

  async getHadithsByCollection(collection: string, grade?: string): Promise<Hadith[]> {
    if (grade) {
      return this.db.getAllAsync(GET_SAHIH_HADITHS_BY_COLLECTION.replace("grade = 'sahih'", "grade = ?"), [collection, grade]);
    }
    return this.db.getAllAsync(
      "SELECT * FROM hadiths WHERE collection = ? ORDER BY book_number, hadith_number LIMIT 50",
      [collection]
    );
  }

  async getHadith(id: number): Promise<Hadith | null> {
    const result = await this.db.getFirstAsync("SELECT * FROM hadiths WHERE id = ?", [id]);
    return result ?? null;
  }

  async upsertHadiths(hadiths: Hadith[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const h of hadiths) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO hadiths (collection, book_number, hadith_number, narrator, arabic_text, translation_en, grade)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [h.collection, h.book_number ?? null, h.hadith_number ?? null, h.narrator ?? null, h.arabic_text, h.translation_en, h.grade ?? null]
        );
      }
    });
  }

  // -- Vocabulary --

  async getVocabularyByCategory(category: string): Promise<VocabularyWord[]> {
    return this.db.getAllAsync(GET_VOCABULARY_BY_CATEGORY, [category]);
  }

  async getVocabularyByDifficulty(level: number): Promise<VocabularyWord[]> {
    return this.db.getAllAsync(
      "SELECT * FROM vocabulary WHERE difficulty_level = ? ORDER BY quran_frequency DESC",
      [level]
    );
  }

  async upsertVocabulary(words: VocabularyWord[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const w of words) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO vocabulary (id, arabic_word, transliteration, translation_en, root, category, difficulty_level, quran_frequency)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [w.id, w.arabic_word, w.transliteration, w.translation_en, w.root ?? null, w.category ?? null, w.difficulty_level, w.quran_frequency]
        );
      }
    });
  }

  // -- Metadata --

  async getRowCount(table: string): Promise<number> {
    const allowedTables = ["surahs", "verses", "hadiths", "vocabulary", "conversation_scenarios"];
    if (!allowedTables.includes(table)) return 0;
    const result = await this.db.getFirstAsync(`SELECT COUNT(*) as count FROM ${table}`);
    return result?.count ?? 0;
  }

  async getLastModified(_table: string): Promise<number | null> {
    // SQLite doesn't track this natively; sync engine handles timestamps
    return null;
  }
}

// ============================================================================
// SINGLETON + FACTORY
// ============================================================================

let instance: OfflineDatabase | null = null;

/**
 * Get the singleton offline database instance.
 * Uses mock implementation when USE_MOCK_DATA is true.
 */
export function getOfflineDatabase(): OfflineDatabase {
  if (!instance) {
    instance = USE_MOCK_DATA ? new MockOfflineDatabase() : new SQLiteOfflineDatabase();
  }
  return instance;
}

/**
 * Initialize the offline database. Safe to call multiple times.
 * If SQLite fails, falls back to mock database so the app still works.
 */
export async function initializeOfflineDatabase(): Promise<OfflineDatabase> {
  const db = getOfflineDatabase();
  if (!db.isReady()) {
    try {
      await db.initialize();
    } catch (error) {
      console.warn("[OfflineDB] SQLite init failed, falling back to mock database:", error);
      // Reset and fall back to mock so the app doesn't crash
      if (instance) {
        try { await instance.close(); } catch (_) { /* ignore */ }
        instance = null;
      }
      instance = new MockOfflineDatabase();
      await instance.initialize();
    }
  }
  return instance!;
}

/**
 * Reset the singleton (useful for testing).
 */
export async function resetOfflineDatabase(): Promise<void> {
  if (instance) {
    await instance.close();
    instance = null;
  }
}
