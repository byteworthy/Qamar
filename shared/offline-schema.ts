/**
 * SQLite Schema for Offline Islamic Content
 *
 * This schema defines the structure for locally stored Quran, Hadith,
 * and Arabic learning data. Designed for React Native apps using
 * expo-sqlite or similar SQLite implementations.
 *
 * Data source: Migrated from Qamar-AI Flutter app (noor_ai_seed.db)
 * Total size: ~3.4MB (6,236 verses + Hadith + vocabulary)
 */

// ============================================================================
// TABLE DEFINITIONS
// ============================================================================

/**
 * SQL for creating the Surahs (Quran chapters) table
 */
export const CREATE_SURAHS_TABLE = `
  CREATE TABLE IF NOT EXISTS surahs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_number INTEGER NOT NULL UNIQUE CHECK(surah_number BETWEEN 1 AND 114),
    name_arabic TEXT NOT NULL,
    name_english TEXT NOT NULL,
    name_transliteration TEXT,
    verses_count INTEGER NOT NULL CHECK(verses_count >= 1),
    revelation_place TEXT NOT NULL CHECK(revelation_place IN ('Makkah', 'Madinah'))
  );
`;

/**
 * SQL for creating the Verses (Quran ayahs) table
 * Contains full Quran text in Arabic with English and Urdu translations
 */
export const CREATE_VERSES_TABLE = `
  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surah_number INTEGER NOT NULL CHECK(surah_number BETWEEN 1 AND 114),
    verse_number INTEGER NOT NULL CHECK(verse_number >= 1),
    arabic_text TEXT NOT NULL,
    translation_en TEXT NOT NULL,
    translation_ur TEXT,
    transliteration TEXT,
    juz_number INTEGER CHECK(juz_number BETWEEN 1 AND 30),
    page_number INTEGER CHECK(page_number BETWEEN 1 AND 604),
    hizb_quarter INTEGER CHECK(hizb_quarter BETWEEN 1 AND 240),
    audio_url TEXT,
    UNIQUE(surah_number, verse_number),
    FOREIGN KEY (surah_number) REFERENCES surahs(surah_number)
  );
`;

/**
 * SQL for creating FTS5 virtual table for full-text search
 * FTS5 provides 10x faster search compared to LIKE queries
 */
export const CREATE_VERSES_FTS_TABLE = `
  CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
    arabic_text,
    translation_en,
    surah_number UNINDEXED,
    verse_number UNINDEXED,
    content='verses',
    content_rowid='id'
  );
`;

/**
 * Triggers to keep FTS5 table synchronized with verses table
 */
export const CREATE_FTS_TRIGGERS = `
  -- Trigger for INSERT
  CREATE TRIGGER IF NOT EXISTS verses_ai AFTER INSERT ON verses BEGIN
    INSERT INTO verses_fts(rowid, arabic_text, translation_en, surah_number, verse_number)
    VALUES (new.id, new.arabic_text, new.translation_en, new.surah_number, new.verse_number);
  END;

  -- Trigger for UPDATE
  CREATE TRIGGER IF NOT EXISTS verses_au AFTER UPDATE ON verses BEGIN
    UPDATE verses_fts
    SET arabic_text = new.arabic_text,
        translation_en = new.translation_en,
        surah_number = new.surah_number,
        verse_number = new.verse_number
    WHERE rowid = new.id;
  END;

  -- Trigger for DELETE
  CREATE TRIGGER IF NOT EXISTS verses_ad AFTER DELETE ON verses BEGIN
    DELETE FROM verses_fts WHERE rowid = old.id;
  END;
`;

/**
 * SQL for creating the Hadiths table
 * Contains authenticated Hadith from major collections
 */
export const CREATE_HADITHS_TABLE = `
  CREATE TABLE IF NOT EXISTS hadiths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection TEXT NOT NULL CHECK(collection IN (
      'bukhari', 'muslim', 'abudawud', 'tirmidhi',
      'nasai', 'ibnmajah', 'malik', 'ahmad', 'darimi'
    )),
    book_number INTEGER,
    hadith_number INTEGER,
    narrator TEXT,
    arabic_text TEXT NOT NULL,
    translation_en TEXT NOT NULL,
    grade TEXT CHECK(grade IN ('sahih', 'hasan', 'daif', 'mawdu')),
    UNIQUE(collection, book_number, hadith_number)
  );
`;

/**
 * SQL for creating the Vocabulary table
 * Contains Arabic words for learning with translations
 */
export const CREATE_VOCABULARY_TABLE = `
  CREATE TABLE IF NOT EXISTS vocabulary (
    id TEXT PRIMARY KEY,
    arabic_word TEXT NOT NULL,
    transliteration TEXT NOT NULL,
    translation_en TEXT NOT NULL,
    root TEXT,
    category TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK(difficulty_level BETWEEN 1 AND 5),
    quran_frequency INTEGER DEFAULT 0
  );
`;

/**
 * SQL for creating the Conversation Scenarios table
 * Contains guided Arabic learning dialogues
 */
export const CREATE_CONVERSATION_SCENARIOS_TABLE = `
  CREATE TABLE IF NOT EXISTS conversation_scenarios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    dialogues_json TEXT NOT NULL,
    audio_url TEXT
  );
`;

/**
 * SQL for creating the Flashcard Progress table
 * Stores FSRS spaced repetition state for learning cards
 */
export const CREATE_FLASHCARD_PROGRESS_TABLE = `
  CREATE TABLE IF NOT EXISTS flashcard_progress (
    id TEXT PRIMARY KEY,
    card_type TEXT NOT NULL CHECK(card_type IN ('alphabet', 'vocabulary', 'phrase')),
    card_ref_id TEXT NOT NULL,
    difficulty REAL NOT NULL DEFAULT 0.3,
    stability REAL NOT NULL DEFAULT 1.0,
    next_review TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'new' CHECK(state IN ('new', 'learning', 'review', 'relearning')),
    review_count INTEGER NOT NULL DEFAULT 0,
    last_review TEXT,
    UNIQUE(card_type, card_ref_id)
  );
`;

// ============================================================================
// INDEXES FOR PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Indexes for faster queries on commonly accessed columns
 */
export const CREATE_INDEXES = `
  -- Verses table indexes
  CREATE INDEX IF NOT EXISTS idx_verses_surah_number ON verses(surah_number);
  CREATE INDEX IF NOT EXISTS idx_verses_juz_number ON verses(juz_number);
  CREATE INDEX IF NOT EXISTS idx_verses_page_number ON verses(page_number);

  -- Hadiths table indexes
  CREATE INDEX IF NOT EXISTS idx_hadiths_collection ON hadiths(collection);
  CREATE INDEX IF NOT EXISTS idx_hadiths_grade ON hadiths(grade);
  CREATE INDEX IF NOT EXISTS idx_hadiths_collection_grade ON hadiths(collection, grade);

  -- Vocabulary table indexes
  CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON vocabulary(difficulty_level);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_frequency ON vocabulary(quran_frequency DESC);

  -- Flashcard progress indexes
  CREATE INDEX IF NOT EXISTS idx_flashcard_state ON flashcard_progress(state);
  CREATE INDEX IF NOT EXISTS idx_flashcard_next_review ON flashcard_progress(next_review);
`;

// ============================================================================
// INITIALIZATION SCRIPT
// ============================================================================

/**
 * Complete initialization script for setting up the offline database
 * Run this when creating the database for the first time
 */
export const INIT_OFFLINE_DATABASE = [
  CREATE_SURAHS_TABLE,
  CREATE_VERSES_TABLE,
  CREATE_VERSES_FTS_TABLE,
  CREATE_FTS_TRIGGERS,
  CREATE_HADITHS_TABLE,
  CREATE_VOCABULARY_TABLE,
  CREATE_CONVERSATION_SCENARIOS_TABLE,
  CREATE_FLASHCARD_PROGRESS_TABLE,
  CREATE_INDEXES,
  // Enable foreign key constraints
  "PRAGMA foreign_keys = ON;",
];

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export interface Surah {
  id: number;
  surah_number: number;
  name_arabic: string;
  name_english: string;
  name_transliteration?: string;
  verses_count: number;
  revelation_place: "Makkah" | "Madinah";
}

export interface Verse {
  id: number;
  surah_number: number;
  verse_number: number;
  arabic_text: string;
  translation_en: string;
  translation_ur?: string;
  transliteration?: string;
  juz_number?: number;
  page_number?: number;
  hizb_quarter?: number;
  audio_url?: string;
}

export interface Hadith {
  id: number;
  collection:
    | "bukhari"
    | "muslim"
    | "abudawud"
    | "tirmidhi"
    | "nasai"
    | "ibnmajah"
    | "malik"
    | "ahmad"
    | "darimi";
  book_number?: number;
  hadith_number?: number;
  narrator?: string;
  arabic_text: string;
  translation_en: string;
  grade?: "sahih" | "hasan" | "daif" | "mawdu";
}

export interface VocabularyWord {
  id: string;
  arabic_word: string;
  transliteration: string;
  translation_en: string;
  root?: string;
  category?: string;
  difficulty_level: number;
  quran_frequency: number;
}

export interface ConversationScenario {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category?: string;
  dialogues_json: string; // JSON array of dialogue turns
  audio_url?: string;
}

export interface FlashcardProgress {
  id: string;
  card_type: "alphabet" | "vocabulary" | "phrase";
  card_ref_id: string;
  difficulty: number;
  stability: number;
  next_review: string;
  state: "new" | "learning" | "review" | "relearning";
  review_count: number;
  last_review?: string;
}

export interface DialogueTurn {
  speaker: "user" | "noor";
  arabic: string;
  transliteration: string;
  translation: string;
  audio_url?: string;
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * SQL query to search verses using FTS5 (full-text search)
 *
 * @param searchTerm - The search term (can be Arabic or English)
 * @returns SQL query string with ? placeholder for searchTerm
 *
 * @example
 * ```typescript
 * db.getAllAsync(SEARCH_VERSES_FTS, [searchTerm])
 * ```
 */
export const SEARCH_VERSES_FTS = `
  SELECT v.* FROM verses v
  INNER JOIN verses_fts fts ON v.id = fts.rowid
  WHERE verses_fts MATCH ?
  ORDER BY v.surah_number, v.verse_number
  LIMIT 50;
`;

/**
 * SQL query to get all verses in a surah
 */
export const GET_VERSES_BY_SURAH = `
  SELECT * FROM verses
  WHERE surah_number = ?
  ORDER BY verse_number;
`;

/**
 * SQL query to get a specific verse
 */
export const GET_VERSE = `
  SELECT * FROM verses
  WHERE surah_number = ? AND verse_number = ?
  LIMIT 1;
`;

/**
 * SQL query to get all surahs
 */
export const GET_ALL_SURAHS = `
  SELECT * FROM surahs
  ORDER BY surah_number;
`;

/**
 * SQL query to get Sahih hadiths from a collection
 */
export const GET_SAHIH_HADITHS_BY_COLLECTION = `
  SELECT * FROM hadiths
  WHERE collection = ? AND grade = 'sahih'
  ORDER BY book_number, hadith_number
  LIMIT 50;
`;

/**
 * SQL query to get vocabulary by category
 */
export const GET_VOCABULARY_BY_CATEGORY = `
  SELECT * FROM vocabulary
  WHERE category = ?
  ORDER BY difficulty_level, quran_frequency DESC;
`;

/**
 * SQL query to get conversation scenarios by difficulty
 */
export const GET_SCENARIOS_BY_DIFFICULTY = `
  SELECT * FROM conversation_scenarios
  WHERE difficulty = ?
  ORDER BY title;
`;
