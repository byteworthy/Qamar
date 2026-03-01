/**
 * Simple database verification script
 */
import Database from "better-sqlite3";
import path from "path";

const NOOR_PROJECT_PATH = "../../";
const TEST_DB_PATH = path.join(NOOR_PROJECT_PATH, "scripts/test-offline.db");

const db = new Database(TEST_DB_PATH);

console.log("\n=== Database Verification ===\n");

// Count records
const surahCount = db.prepare("SELECT COUNT(*) as count FROM surahs").get() as {
  count: number;
};
console.log(`Surahs: ${surahCount.count}`);

const verseCount = db.prepare("SELECT COUNT(*) as count FROM verses").get() as {
  count: number;
};
console.log(`Verses: ${verseCount.count}`);

const vocabCount = db
  .prepare("SELECT COUNT(*) as count FROM vocabulary")
  .get() as { count: number };
console.log(`Vocabulary: ${vocabCount.count}`);

// Sample queries
console.log("\n=== Sample Data ===\n");

const surah1 = db.prepare("SELECT * FROM surahs WHERE surah_number = 1").get();
console.log("Surah 1 (Al-Fatiha):", surah1);

const verse1_1 = db
  .prepare("SELECT * FROM verses WHERE surah_number = 1 AND verse_number = 1")
  .get();
console.log("\nVerse 1:1:", {
  arabic: verse1_1?.arabic_text?.substring(0, 50),
  english: verse1_1?.translation_en?.substring(0, 80),
});

const vocabSample = db.prepare("SELECT * FROM vocabulary LIMIT 3").all();
console.log("\nVocabulary sample:", vocabSample);

// FTS5 Search test
const searchResults = db
  .prepare(
    `
  SELECT COUNT(*) as count
  FROM verses v
  INNER JOIN verses_fts fts ON v.id = fts.rowid
  WHERE verses_fts MATCH 'merciful'
`,
  )
  .get() as { count: number };
console.log(`\nFTS5 search for 'merciful': ${searchResults.count} results`);

db.close();
console.log("\n✅ Verification complete\n");
