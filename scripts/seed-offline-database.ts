/**
 * Offline Database Seeding Script
 *
 * This script seeds the React Native app's local SQLite database with
 * Quran, Hadith, and vocabulary data from the migrated JSON files.
 *
 * This script is intended to run during:
 * 1. First app launch (if database doesn't exist)
 * 2. App updates (if database schema changes)
 *
 * Input:
 * - shared/seed-data/surahs.json
 * - shared/seed-data/verses.json
 * - shared/seed-data/hadiths.json
 * - shared/seed-data/vocabulary.json
 *
 * Output:
 * - Populated SQLite database at app storage location
 *
 * Usage (for testing with Node.js):
 * ```bash
 * npx tsx scripts/seed-offline-database.ts
 * ```
 *
 * Usage (in React Native app):
 * ```typescript
 * import { seedOfflineDatabase } from './scripts/seed-offline-database';
 * await seedOfflineDatabase(db);
 * ```
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import {
  INIT_OFFLINE_DATABASE,
  type Surah,
  type Verse,
  type Hadith,
  type VocabularyWord,
} from "../shared/offline-schema";

// =============================================================================
// CONFIGURATION
// =============================================================================

const NOOR_PROJECT_PATH = "../../";
const SEED_DATA_DIR = path.join(NOOR_PROJECT_PATH, "shared/seed-data");
const TEST_DB_PATH = path.join(NOOR_PROJECT_PATH, "scripts/test-offline.db");

// =============================================================================
// SEEDING FUNCTIONS
// =============================================================================

/**
 * Initialize database schema
 */
function initializeSchema(db: Database.Database): void {
  console.log("Initializing database schema...");

  // Execute all schema creation statements
  for (const statement of INIT_OFFLINE_DATABASE) {
    db.exec(statement);
  }

  console.log("✓ Schema initialized");
}

/**
 * Load JSON seed data file
 */
function loadSeedData<T>(filename: string): T {
  const filepath = path.join(SEED_DATA_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠ Seed data file not found: ${filename}`);
    return (Array.isArray([] as unknown as T) ? [] : {}) as T;
  }

  const data = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(data) as T;
}

/**
 * Seed Surahs table
 */
function seedSurahs(db: Database.Database, surahs: any[]): void {
  console.log("Seeding Surahs...");

  const insert = db.prepare(`
    INSERT INTO surahs (
      surah_number,
      name_arabic,
      name_english,
      name_transliteration,
      verses_count,
      revelation_place
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((surahs: any[]) => {
    for (const surah of surahs) {
      // Map from JSON field names to database column names
      insert.run(
        surah.number, // surah_number
        surah.nameArabic, // name_arabic
        surah.nameEnglish, // name_english
        surah.nameEnglish, // name_transliteration (using nameEnglish as fallback)
        surah.numberOfAyahs, // verses_count
        surah.revelationType === "Meccan" ? "Makkah" : "Madinah", // revelation_place
      );
    }
  });

  insertMany(surahs);
  console.log(`✓ Seeded ${surahs.length} surahs`);
}

/**
 * Seed Verses table (in batches for better performance)
 */
function seedVerses(db: Database.Database, verses: any[]): void {
  console.log("Seeding Verses (this may take a minute)...");

  const insert = db.prepare(`
    INSERT INTO verses (
      surah_number,
      verse_number,
      arabic_text,
      translation_en,
      translation_ur,
      transliteration,
      juz_number,
      page_number,
      hizb_quarter,
      audio_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Batch size for transaction (prevents memory issues with large datasets)
  const BATCH_SIZE = 500;
  const totalBatches = Math.ceil(verses.length / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, verses.length);
    const batch = verses.slice(start, end);

    const insertBatch = db.transaction((batch: any[]) => {
      for (const verse of batch) {
        // Map from JSON field names to database column names
        insert.run(
          verse.surahNumber, // surah_number
          verse.verseNumber, // verse_number
          verse.arabicText, // arabic_text
          verse.translationEn, // translation_en
          verse.translationUr || null, // translation_ur
          verse.transliteration || null, // transliteration
          verse.juzNumber || null, // juz_number
          verse.pageNumber || null, // page_number
          verse.hizbQuarter || null, // hizb_quarter
          verse.audioUrl || null, // audio_url
        );
      }
    });

    insertBatch(batch);
    console.log(
      `  Progress: ${end}/${verses.length} verses (${Math.round((end / verses.length) * 100)}%)`,
    );
  }

  console.log(`✓ Seeded ${verses.length} verses`);
}

/**
 * Populate FTS5 table after verses are inserted
 */
function populateFTS(db: Database.Database): void {
  console.log("Populating FTS5 search index...");

  db.exec(`
    INSERT INTO verses_fts(rowid, arabic_text, translation_en, surah_number, verse_number)
    SELECT id, arabic_text, translation_en, surah_number, verse_number
    FROM verses;
  `);

  console.log("✓ FTS5 index populated");
}

/**
 * Seed Hadiths table from nested JSON structure
 * JSON has { collections: [...], hadiths: [{ id, collectionId, bookNumber, hadithNumber, narrator, textArabic, textEnglish, grade, chapter, reference }] }
 * DB schema: hadiths (id, collection, book_number, hadith_number, narrator, arabic_text, translation_en, grade)
 */
function seedHadiths(
  db: Database.Database,
  hadithsData: { collections: any[]; hadiths: any[] },
): void {
  const hadiths = hadithsData.hadiths || [];
  if (hadiths.length === 0) {
    console.log("⚠ No hadiths to seed");
    return;
  }

  // Build a lookup from collectionId to collection name
  const collectionNames: Record<string, string> = {};
  for (const col of hadithsData.collections || []) {
    collectionNames[col.id] = col.name;
  }

  console.log("Seeding Hadiths...");

  const insert = db.prepare(`
    INSERT OR IGNORE INTO hadiths (
      collection,
      book_number,
      hadith_number,
      narrator,
      arabic_text,
      translation_en,
      grade
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((hadiths: any[]) => {
    for (const h of hadiths) {
      insert.run(
        h.collectionId, // collection (short id: bukhari, muslim, etc.)
        h.bookNumber || null, // book_number
        h.hadithNumber || null, // hadith_number
        h.narrator || null, // narrator
        h.textArabic || null, // arabic_text
        h.textEnglish || null, // translation_en
        h.grade ? h.grade.toLowerCase() : null, // grade (lowercase)
      );
    }
  });

  insertMany(hadiths);
  console.log(`✓ Seeded ${hadiths.length} hadiths`);
}

/**
 * Seed Vocabulary table
 */
function seedVocabulary(db: Database.Database, vocabulary: any[]): void {
  if (vocabulary.length === 0) {
    console.log("⚠ No vocabulary to seed");
    return;
  }

  console.log("Seeding Vocabulary...");

  const insert = db.prepare(`
    INSERT INTO vocabulary (
      id,
      arabic_word,
      transliteration,
      translation_en,
      root,
      category,
      difficulty_level,
      quran_frequency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((vocabulary: any[]) => {
    for (const word of vocabulary) {
      // Map from JSON field names to database column names
      insert.run(
        word.id,
        word.arabic, // arabic_word
        word.transliteration,
        word.meaning, // translation_en
        word.root || null,
        word.deckId || null, // category
        1, // difficulty_level (default, not in source data)
        word.quranFrequency || 0, // quran_frequency
      );
    }
  });

  insertMany(vocabulary);
  console.log(`✓ Seeded ${vocabulary.length} vocabulary words`);
}

/**
 * Seed Conversation Scenarios table
 * JSON has { scenarios: [{ id, title, difficulty, category, ... }] }
 * DB schema: conversation_scenarios (id TEXT PK, title TEXT, difficulty TEXT, category TEXT, dialogues_json TEXT, audio_url TEXT)
 */
function seedConversationScenarios(
  db: Database.Database,
  data: { scenarios: any[] },
): void {
  const scenarios = data.scenarios || [];
  if (scenarios.length === 0) {
    console.log("⚠ No conversation scenarios to seed");
    return;
  }

  console.log("Seeding Conversation Scenarios...");

  const insert = db.prepare(`
    INSERT INTO conversation_scenarios (
      id,
      title,
      difficulty,
      category,
      dialogues_json,
      audio_url
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((scenarios: any[]) => {
    for (const s of scenarios) {
      // Store the full scenario object (minus large fields already in columns) as dialogues_json
      const dialoguesPayload = {
        titleArabic: s.titleArabic,
        description: s.description,
        culturalContext: s.culturalContext,
        learningGoals: s.learningGoals,
        keyPhrases: s.keyPhrases,
        estimatedMinutes: s.estimatedMinutes,
        dialogues: s.dialogues || [],
      };
      insert.run(
        s.id,
        s.title,
        s.difficulty ? s.difficulty.toLowerCase() : null,
        s.category || null,
        JSON.stringify(dialoguesPayload),
        s.audioUrl || null,
      );
    }
  });

  insertMany(scenarios);
  console.log(`✓ Seeded ${scenarios.length} conversation scenarios`);
}

/**
 * Seed Arabic Alphabet as vocabulary entries with category='alphabet'
 * JSON is a flat array of letters: [{ id, name, nameArabic, isolated, initial, medial, final, pronunciation, phoneticSound, examples }]
 */
function seedArabicAlphabet(db: Database.Database, letters: any[]): void {
  if (letters.length === 0) {
    console.log("⚠ No Arabic alphabet data to seed");
    return;
  }

  console.log("Seeding Arabic Alphabet (as vocabulary)...");

  const insert = db.prepare(`
    INSERT INTO vocabulary (
      id,
      arabic_word,
      transliteration,
      translation_en,
      root,
      category,
      difficulty_level,
      quran_frequency
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((letters: any[]) => {
    for (const letter of letters) {
      insert.run(
        `alphabet-${letter.id}`, // id (prefixed to avoid collisions with vocabulary)
        letter.isolated, // arabic_word (the letter in isolated form)
        letter.pronunciation, // transliteration
        letter.name, // translation_en (letter name e.g. "Alif")
        null, // root
        "alphabet", // category
        1, // difficulty_level
        0, // quran_frequency
      );
    }
  });

  insertMany(letters);
  console.log(`✓ Seeded ${letters.length} Arabic alphabet letters`);
}

/**
 * Verify database integrity after seeding
 */
function verifyDatabase(db: Database.Database): void {
  console.log("\nVerifying database integrity...");

  // Check surahs count
  const surahCount = db
    .prepare("SELECT COUNT(*) as count FROM surahs")
    .get() as {
    count: number;
  };
  if (surahCount.count !== 114) {
    throw new Error(
      `Expected 114 surahs, found ${surahCount.count}. Seeding failed.`,
    );
  }
  console.log(`✓ Surahs: ${surahCount.count}`);

  // Check verses count
  const verseCount = db
    .prepare("SELECT COUNT(*) as count FROM verses")
    .get() as {
    count: number;
  };
  if (verseCount.count < 6000 || verseCount.count > 6300) {
    throw new Error(
      `Expected ~6,236 verses, found ${verseCount.count}. Seeding failed.`,
    );
  }
  console.log(`✓ Verses: ${verseCount.count}`);

  // Check FTS5 table
  const ftsCount = db
    .prepare("SELECT COUNT(*) as count FROM verses_fts")
    .get() as { count: number };
  if (ftsCount.count !== verseCount.count) {
    throw new Error(
      `FTS5 table mismatch. Expected ${verseCount.count}, found ${ftsCount.count}.`,
    );
  }
  console.log(`✓ FTS5 Index: ${ftsCount.count}`);

  // Test FTS5 search (using English term for compatibility with better-sqlite3)
  const searchResult = db
    .prepare(
      `
    SELECT COUNT(*) as count
    FROM verses v
    INNER JOIN verses_fts fts ON v.id = fts.rowid
    WHERE verses_fts MATCH 'Allah'
  `,
    )
    .get() as { count: number };
  if (searchResult.count === 0) {
    console.log(
      "⚠ FTS5 search test returned no results (Arabic search may not work in Node.js SQLite)",
    );
  } else {
    console.log(
      `✓ FTS5 Search: Working (${searchResult.count} results for 'Allah')`,
    );
  }

  // Check hadiths (optional)
  const hadithCount = db
    .prepare("SELECT COUNT(*) as count FROM hadiths")
    .get() as {
    count: number;
  };
  if (hadithCount.count > 0) {
    console.log(`✓ Hadiths: ${hadithCount.count}`);
  }

  // Check vocabulary (optional)
  const vocabCount = db
    .prepare("SELECT COUNT(*) as count FROM vocabulary")
    .get() as { count: number };
  if (vocabCount.count > 0) {
    console.log(`✓ Vocabulary: ${vocabCount.count}`);
  }

  // Check conversation scenarios (optional)
  const scenarioCount = db
    .prepare("SELECT COUNT(*) as count FROM conversation_scenarios")
    .get() as { count: number };
  if (scenarioCount.count > 0) {
    console.log(`✓ Conversation Scenarios: ${scenarioCount.count}`);
  }

  // Check alphabet entries in vocabulary (optional)
  const alphabetCount = db
    .prepare(
      "SELECT COUNT(*) as count FROM vocabulary WHERE category = 'alphabet'",
    )
    .get() as { count: number };
  if (alphabetCount.count > 0) {
    console.log(`✓ Arabic Alphabet (vocabulary): ${alphabetCount.count}`);
  }

  console.log("✓ All integrity checks passed");
}

/**
 * Calculate database size
 */
function getDatabaseSize(dbPath: string): string {
  const stats = fs.statSync(dbPath);
  const sizeMB = stats.size / (1024 * 1024);
  return `${sizeMB.toFixed(2)} MB`;
}

// =============================================================================
// MAIN SEEDING FUNCTION
// =============================================================================

export async function seedOfflineDatabase(
  db: Database.Database,
): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("OFFLINE DATABASE SEEDING");
  console.log("=".repeat(60) + "\n");

  try {
    // Initialize schema
    initializeSchema(db);

    // Load seed data
    console.log("\nLoading seed data...");
    const surahs = loadSeedData<any[]>("surahs.json");
    const verses = loadSeedData<any[]>("verses.json");
    const hadithsData = loadSeedData<{ collections: any[]; hadiths: any[] }>(
      "hadiths.json",
    );
    const vocabulary = loadSeedData<any[]>("vocabulary.json");
    const conversationData = loadSeedData<{ scenarios: any[] }>(
      "conversation_scenarios.json",
    );
    const arabicAlphabet = loadSeedData<any[]>("arabic_alphabet.json");
    console.log("✓ Seed data loaded\n");

    // Seed tables
    seedSurahs(db, surahs);
    seedVerses(db, verses);
    populateFTS(db);
    seedHadiths(db, hadithsData);
    seedVocabulary(db, vocabulary);
    seedConversationScenarios(db, conversationData);
    seedArabicAlphabet(db, arabicAlphabet);

    // Verify integrity
    verifyDatabase(db);

    console.log("\n✅ Database seeding completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Database seeding failed:");
    console.error(error);
    throw error;
  }
}

// =============================================================================
// STANDALONE EXECUTION (for testing)
// =============================================================================

async function main(): Promise<void> {
  try {
    // Delete existing test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
      console.log("Deleted existing test database");
    }

    // Create new database
    const db = new Database(TEST_DB_PATH);
    console.log(`Created test database: ${TEST_DB_PATH}`);

    // Seed the database
    await seedOfflineDatabase(db);

    // Show database size
    const size = getDatabaseSize(TEST_DB_PATH);
    console.log(`Database size: ${size}`);

    // Close database
    db.close();

    console.log(`\nTest database created at: ${TEST_DB_PATH}`);
    console.log("You can inspect it with SQLite browser");
  } catch (error) {
    console.error("Failed to create test database:", error);
    process.exit(1);
  }
}

// Run standalone if executed directly
main().catch(console.error);
