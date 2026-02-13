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

const NOOR_CBT_PROJECT_PATH = "C:/Coding Projects - ByteWorthy/Noor-CBT";
const SEED_DATA_DIR = path.join(NOOR_CBT_PROJECT_PATH, "shared/seed-data");
const TEST_DB_PATH = path.join(
  NOOR_CBT_PROJECT_PATH,
  "scripts/test-offline.db",
);

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
function loadSeedData<T>(filename: string): T[] {
  const filepath = path.join(SEED_DATA_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠ Seed data file not found: ${filename}`);
    return [];
  }

  const data = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(data) as T[];
}

/**
 * Seed Surahs table
 */
function seedSurahs(db: Database.Database, surahs: Surah[]): void {
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

  const insertMany = db.transaction((surahs: Surah[]) => {
    for (const surah of surahs) {
      insert.run(
        surah.surah_number,
        surah.name_arabic,
        surah.name_english,
        surah.name_transliteration || null,
        surah.verses_count,
        surah.revelation_place,
      );
    }
  });

  insertMany(surahs);
  console.log(`✓ Seeded ${surahs.length} surahs`);
}

/**
 * Seed Verses table (in batches for better performance)
 */
function seedVerses(db: Database.Database, verses: Verse[]): void {
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

    const insertBatch = db.transaction((batch: Verse[]) => {
      for (const verse of batch) {
        insert.run(
          verse.surah_number,
          verse.verse_number,
          verse.arabic_text,
          verse.translation_en,
          verse.translation_ur || null,
          verse.transliteration || null,
          verse.juz_number || null,
          verse.page_number || null,
          verse.hizb_quarter || null,
          verse.audio_url || null,
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
 * Seed Hadiths table
 */
function seedHadiths(db: Database.Database, hadiths: Hadith[]): void {
  if (hadiths.length === 0) {
    console.log("⚠ No hadiths to seed");
    return;
  }

  console.log("Seeding Hadiths...");

  const insert = db.prepare(`
    INSERT INTO hadiths (
      collection,
      book_number,
      hadith_number,
      narrator,
      arabic_text,
      translation_en,
      grade
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((hadiths: Hadith[]) => {
    for (const hadith of hadiths) {
      insert.run(
        hadith.collection,
        hadith.book_number || null,
        hadith.hadith_number || null,
        hadith.narrator || null,
        hadith.arabic_text,
        hadith.translation_en,
        hadith.grade || null,
      );
    }
  });

  insertMany(hadiths);
  console.log(`✓ Seeded ${hadiths.length} hadiths`);
}

/**
 * Seed Vocabulary table
 */
function seedVocabulary(
  db: Database.Database,
  vocabulary: VocabularyWord[],
): void {
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

  const insertMany = db.transaction((vocabulary: VocabularyWord[]) => {
    for (const word of vocabulary) {
      insert.run(
        word.id,
        word.arabic_word,
        word.transliteration,
        word.translation_en,
        word.root || null,
        word.category || null,
        word.difficulty_level || 1,
        word.quran_frequency || 0,
      );
    }
  });

  insertMany(vocabulary);
  console.log(`✓ Seeded ${vocabulary.length} vocabulary words`);
}

/**
 * Verify database integrity after seeding
 */
function verifyDatabase(db: Database.Database): void {
  console.log("\nVerifying database integrity...");

  // Check surahs count
  const surahCount = db.prepare("SELECT COUNT(*) as count FROM surahs").get() as {
    count: number;
  };
  if (surahCount.count !== 114) {
    throw new Error(
      `Expected 114 surahs, found ${surahCount.count}. Seeding failed.`,
    );
  }
  console.log(`✓ Surahs: ${surahCount.count}`);

  // Check verses count
  const verseCount = db.prepare("SELECT COUNT(*) as count FROM verses").get() as {
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

  // Test FTS5 search
  const searchResult = db.prepare(`
    SELECT COUNT(*) as count
    FROM verses v
    INNER JOIN verses_fts fts ON v.id = fts.rowid
    WHERE verses_fts MATCH 'الله'
  `).get() as { count: number };
  if (searchResult.count === 0) {
    throw new Error("FTS5 search test failed. Search returned no results.");
  }
  console.log(`✓ FTS5 Search: Working (${searchResult.count} results for 'الله')`);

  // Check hadiths (optional)
  const hadithCount = db.prepare("SELECT COUNT(*) as count FROM hadiths").get() as {
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

export async function seedOfflineDatabase(db: Database.Database): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("OFFLINE DATABASE SEEDING");
  console.log("=".repeat(60) + "\n");

  try {
    // Initialize schema
    initializeSchema(db);

    // Load seed data
    console.log("\nLoading seed data...");
    const surahs = loadSeedData<Surah>("surahs.json");
    const verses = loadSeedData<Verse>("verses.json");
    const hadiths = loadSeedData<Hadith>("hadiths.json");
    const vocabulary = loadSeedData<VocabularyWord>("vocabulary.json");
    console.log("✓ Seed data loaded\n");

    // Seed tables
    seedSurahs(db, surahs);
    seedVerses(db, verses);
    populateFTS(db);
    seedHadiths(db, hadiths);
    seedVocabulary(db, vocabulary);

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
