/**
 * Noor-AI Data Migration Script
 *
 * This script extracts Quran, Hadith, and vocabulary data from the
 * Noor-AI Flutter app's SQLite databases and converts them to JSON
 * seed files for the React Native app.
 *
 * Source databases:
 * - noor_ai_seed.db (Quran verses, Hadiths)
 * - noor_ai_vocabulary.db (Arabic vocabulary)
 *
 * Output:
 * - shared/seed-data/surahs.json
 * - shared/seed-data/verses.json
 * - shared/seed-data/hadiths.json
 * - shared/seed-data/vocabulary.json
 *
 * Usage:
 * ```bash
 * # Install better-sqlite3 for Node.js SQLite access
 * npm install --save-dev better-sqlite3 @types/better-sqlite3
 *
 * # Run the migration
 * npx tsx scripts/migrate-noor-ai-data.ts
 * ```
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// =============================================================================
// CONFIGURATION
// =============================================================================

const NOOR_AI_PROJECT_PATH = "C:/Coding Projects - ByteWorthy/Noor-AI";
const NOOR_CBT_PROJECT_PATH = "C:/Coding Projects - ByteWorthy/Noor-CBT";

const SOURCE_DB_PATH = path.join(
  NOOR_AI_PROJECT_PATH,
  "assets/data/noor_ai_seed.db",
);
const VOCAB_DB_PATH = path.join(
  NOOR_AI_PROJECT_PATH,
  "assets/data/noor_ai_vocabulary.db",
);
const OUTPUT_DIR = path.join(NOOR_CBT_PROJECT_PATH, "shared/seed-data");

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface SurahRow {
  id: number;
  number: number;
  nameArabic: string;
  nameEnglish: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface VerseRow {
  id: number;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  translationEn: string;
  translationUr?: string;
  transliteration?: string;
  juzNumber?: number;
  pageNumber?: number;
  hizbQuarter?: number;
  audioUrl?: string;
}

interface HadithRow {
  id: number;
  collection: string;
  book: string;
  hadithNumber: number;
  arabicText: string;
  translationEn: string;
  narrator: string;
  grade: string;
}

interface VocabularyRow {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  root?: string;
  quranFrequency?: number;
  deckId?: string;
}

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created output directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Extract Surahs from Noor-AI database
 */
function extractSurahs(db: Database.Database): SurahRow[] {
  console.log("Extracting Surahs...");

  const query = db.prepare(`
    SELECT
      id,
      number,
      name_arabic as nameArabic,
      name_english as nameEnglish,
      revelation_type as revelationType,
      number_of_ayahs as numberOfAyahs
    FROM surahs
    ORDER BY number
  `);

  const surahs = query.all() as SurahRow[];
  console.log(`✓ Extracted ${surahs.length} surahs`);

  return surahs;
}

/**
 * Extract Verses from Noor-AI database
 */
function extractVerses(db: Database.Database): VerseRow[] {
  console.log("Extracting Verses (this may take a moment)...");

  const query = db.prepare(`
    SELECT
      id,
      surah_number as surahNumber,
      verse_number as verseNumber,
      arabic_text as arabicText,
      translation_en as translationEn,
      translation_ur as translationUr,
      transliteration,
      juz_number as juzNumber,
      page_number as pageNumber,
      hizb_quarter as hizbQuarter,
      audio_url as audioUrl
    FROM verses
    ORDER BY surah_number, verse_number
  `);

  const verses = query.all() as VerseRow[];
  console.log(`✓ Extracted ${verses.length} verses`);

  return verses;
}

/**
 * Extract Hadiths from Noor-AI database
 */
function extractHadiths(db: Database.Database): HadithRow[] {
  console.log("Extracting Hadiths...");

  // Check if hadiths table exists
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='hadiths'",
    )
    .get();

  if (!tableExists) {
    console.log("⚠ Hadiths table not found, skipping...");
    return [];
  }

  const query = db.prepare(`
    SELECT
      id,
      collection,
      book,
      hadith_number as hadithNumber,
      arabic_text as arabicText,
      translation_en as translationEn,
      narrator,
      grade
    FROM hadiths
    WHERE grade = 'sahih'
    ORDER BY collection, book, hadith_number
    LIMIT 500
  `);

  const hadiths = query.all() as HadithRow[];
  console.log(`✓ Extracted ${hadiths.length} Sahih hadiths`);

  return hadiths;
}

/**
 * Extract Vocabulary from Noor-AI vocabulary database
 */
function extractVocabulary(db: Database.Database): VocabularyRow[] {
  console.log("Extracting Vocabulary...");

  // Check if vocabulary_words table exists
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='vocabulary_words'",
    )
    .get();

  if (!tableExists) {
    console.log("⚠ Vocabulary table not found, skipping...");
    return [];
  }

  const query = db.prepare(`
    SELECT
      id,
      arabic,
      transliteration,
      meaning,
      root,
      quran_frequency as quranFrequency,
      deck_id as deckId
    FROM vocabulary_words
    ORDER BY quran_frequency DESC
    LIMIT 1000
  `);

  const vocabulary = query.all() as VocabularyRow[];
  console.log(`✓ Extracted ${vocabulary.length} vocabulary words`);

  return vocabulary;
}

/**
 * Write JSON file with pretty formatting
 */
function writeJsonFile(filename: string, data: unknown): void {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✓ Wrote ${filename}`);
}

/**
 * Validate extracted data
 */
function validateData(
  surahs: SurahRow[],
  verses: VerseRow[],
  hadiths: HadithRow[],
  vocabulary: VocabularyRow[],
): void {
  console.log("\nValidating extracted data...");

  // Validate surahs count
  if (surahs.length !== 114) {
    throw new Error(
      `Expected 114 surahs, got ${surahs.length}. Data may be incomplete.`,
    );
  }

  // Validate verses count (Quran has 6,236 verses)
  if (verses.length < 6000 || verses.length > 6300) {
    throw new Error(
      `Expected ~6,236 verses, got ${verses.length}. Data may be incomplete.`,
    );
  }

  // Validate surah numbering
  const surahNumbers = surahs.map((s) => s.number);
  for (let i = 1; i <= 114; i++) {
    if (!surahNumbers.includes(i)) {
      throw new Error(`Missing surah number ${i}`);
    }
  }

  // Validate verse integrity (check a known verse)
  const fatiha1 = verses.find(
    (v) => v.surahNumber === 1 && v.verseNumber === 1,
  );
  if (!fatiha1 || !fatiha1.arabicText.includes("بِسْمِ اللَّهِ")) {
    throw new Error("Failed to find Al-Fatiha 1:1. Data may be corrupted.");
  }

  console.log("✓ All validation checks passed");
}

/**
 * Generate migration summary
 */
function generateSummary(
  surahs: SurahRow[],
  verses: VerseRow[],
  hadiths: HadithRow[],
  vocabulary: VocabularyRow[],
): void {
  const summary = {
    migrationDate: new Date().toISOString(),
    sourceDatabase: SOURCE_DB_PATH,
    outputDirectory: OUTPUT_DIR,
    statistics: {
      surahs: surahs.length,
      verses: verses.length,
      hadiths: hadiths.length,
      vocabulary: vocabulary.length,
      totalSize: `${Math.round((JSON.stringify([surahs, verses, hadiths, vocabulary]).length / 1024 / 1024) * 100) / 100} MB`,
    },
    dataIntegrity: {
      surahsComplete: surahs.length === 114,
      versesComplete: verses.length >= 6000 && verses.length <= 6300,
      hadithsPresent: hadiths.length > 0,
      vocabularyPresent: vocabulary.length > 0,
    },
  };

  writeJsonFile("migration-summary.json", summary);

  console.log("\n" + "=".repeat(60));
  console.log("MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`Surahs:     ${summary.statistics.surahs}`);
  console.log(`Verses:     ${summary.statistics.verses}`);
  console.log(`Hadiths:    ${summary.statistics.hadiths}`);
  console.log(`Vocabulary: ${summary.statistics.vocabulary}`);
  console.log(`Total Size: ${summary.statistics.totalSize}`);
  console.log("=".repeat(60) + "\n");
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("NOOR-AI DATA MIGRATION");
  console.log("=".repeat(60) + "\n");

  try {
    // Ensure output directory exists
    ensureOutputDirectory();

    // Open source databases
    console.log("Opening source databases...");
    if (!fs.existsSync(SOURCE_DB_PATH)) {
      throw new Error(`Source database not found: ${SOURCE_DB_PATH}`);
    }

    const seedDb = new Database(SOURCE_DB_PATH, { readonly: true });
    console.log(`✓ Opened: ${SOURCE_DB_PATH}`);

    let vocabDb: Database.Database | null = null;
    if (fs.existsSync(VOCAB_DB_PATH)) {
      vocabDb = new Database(VOCAB_DB_PATH, { readonly: true });
      console.log(`✓ Opened: ${VOCAB_DB_PATH}`);
    } else {
      console.log(`⚠ Vocabulary database not found: ${VOCAB_DB_PATH}`);
    }

    console.log("");

    // Extract data
    const surahs = extractSurahs(seedDb);
    const verses = extractVerses(seedDb);
    const hadiths = extractHadiths(seedDb);
    const vocabulary = vocabDb ? extractVocabulary(vocabDb) : [];

    // Validate data
    validateData(surahs, verses, hadiths, vocabulary);

    // Write output files
    console.log("\nWriting output files...");
    writeJsonFile("surahs.json", surahs);
    writeJsonFile("verses.json", verses);
    if (hadiths.length > 0) {
      writeJsonFile("hadiths.json", hadiths);
    }
    if (vocabulary.length > 0) {
      writeJsonFile("vocabulary.json", vocabulary);
    }

    // Generate summary
    generateSummary(surahs, verses, hadiths, vocabulary);

    // Close databases
    seedDb.close();
    if (vocabDb) {
      vocabDb.close();
    }

    console.log("✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
main();
