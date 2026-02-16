/**
 * Example of how the React Native app would use the offline database
 * This demonstrates the typical queries the app will make
 */
import Database from "better-sqlite3";
import path from "path";

const NOOR_PROJECT_PATH = "../../";
const TEST_DB_PATH = path.join(
  NOOR_PROJECT_PATH,
  "scripts/test-offline.db",
);

const db = new Database(TEST_DB_PATH, { readonly: true });

console.log("\n" + "=".repeat(60));
console.log("OFFLINE DATABASE - APP USAGE EXAMPLES");
console.log("=".repeat(60) + "\n");

// ============================================================================
// Example 1: Browse Surahs (Home Screen / Quran Tab)
// ============================================================================
console.log("1. Browse Surahs (for Quran browser)");
console.log("-".repeat(60));

const allSurahs = db.prepare(`
  SELECT surah_number, name_arabic, name_english, verses_count, revelation_place
  FROM surahs
  ORDER BY surah_number
  LIMIT 5
`).all();

allSurahs.forEach(surah => {
  console.log(`${surah.surah_number}. ${surah.name_english} (${surah.name_arabic})`);
  console.log(`   ${surah.verses_count} verses • ${surah.revelation_place}`);
});
console.log("...(109 more surahs)\n");

// ============================================================================
// Example 2: Read a Surah (Surah Reader Screen)
// ============================================================================
console.log("2. Read Surah Al-Fatiha (Surah Reader)");
console.log("-".repeat(60));

const surahInfo = db.prepare(`
  SELECT * FROM surahs WHERE surah_number = 1
`).get();
console.log(`${surahInfo.name_english} (${surahInfo.name_arabic})`);
console.log(`${surahInfo.verses_count} verses\n`);

const verses = db.prepare(`
  SELECT verse_number, arabic_text, translation_en
  FROM verses
  WHERE surah_number = 1
  ORDER BY verse_number
`).all();

verses.forEach(verse => {
  console.log(`[${verse.verse_number}] ${verse.arabic_text}`);
  console.log(`     ${verse.translation_en}\n`);
});

// ============================================================================
// Example 3: Search Quran (Search Screen)
// ============================================================================
console.log("3. Search Quran for 'guidance'");
console.log("-".repeat(60));

const searchResults = db.prepare(`
  SELECT v.surah_number, v.verse_number, v.translation_en, s.name_english
  FROM verses v
  INNER JOIN verses_fts fts ON v.id = fts.rowid
  INNER JOIN surahs s ON v.surah_number = s.surah_number
  WHERE verses_fts MATCH 'guidance'
  ORDER BY v.surah_number, v.verse_number
  LIMIT 5
`).all();

console.log(`Found ${searchResults.length} results (showing first 5):\n`);
searchResults.forEach(result => {
  console.log(`${result.name_english} ${result.surah_number}:${result.verse_number}`);
  console.log(`"${result.translation_en.substring(0, 100)}..."\n`);
});

// ============================================================================
// Example 4: Get Verses by Juz (Quran Navigation)
// ============================================================================
console.log("4. Get first 3 verses from Juz 1");
console.log("-".repeat(60));

const juzVerses = db.prepare(`
  SELECT v.surah_number, v.verse_number, s.name_english, v.arabic_text
  FROM verses v
  INNER JOIN surahs s ON v.surah_number = s.surah_number
  WHERE v.juz_number = 1
  ORDER BY v.surah_number, v.verse_number
  LIMIT 3
`).all();

juzVerses.forEach(verse => {
  console.log(`${verse.name_english} ${verse.surah_number}:${verse.verse_number}`);
  console.log(`${verse.arabic_text}\n`);
});

// ============================================================================
// Example 5: Vocabulary Learning (Vocabulary Tab)
// ============================================================================
console.log("5. Top 10 Most Frequent Quranic Words");
console.log("-".repeat(60));

const topWords = db.prepare(`
  SELECT arabic_word, transliteration, translation_en, quran_frequency
  FROM vocabulary
  ORDER BY quran_frequency DESC
  LIMIT 10
`).all();

topWords.forEach((word, index) => {
  console.log(`${index + 1}. ${word.arabic_word} (${word.transliteration})`);
  console.log(`   ${word.translation_en} • Appears ${word.quran_frequency} times\n`);
});

// ============================================================================
// Example 6: Get Verses by Page (Mushaf Mode)
// ============================================================================
console.log("6. Verses on Page 1 (Mushaf-style reading)");
console.log("-".repeat(60));

const pageVerses = db.prepare(`
  SELECT COUNT(*) as count, MIN(surah_number) as first_surah, MAX(surah_number) as last_surah
  FROM verses
  WHERE page_number = 1
`).get();

console.log(`Page 1 contains ${pageVerses.count} verses`);
console.log(`From Surah ${pageVerses.first_surah} to ${pageVerses.last_surah}\n`);

// ============================================================================
// Example 7: Statistics (Dashboard)
// ============================================================================
console.log("7. Database Statistics (for app dashboard)");
console.log("-".repeat(60));

const stats = {
  totalSurahs: db.prepare("SELECT COUNT(*) as count FROM surahs").get().count,
  totalVerses: db.prepare("SELECT COUNT(*) as count FROM verses").get().count,
  totalWords: db.prepare("SELECT COUNT(*) as count FROM vocabulary").get().count,
  meccanSurahs: db.prepare("SELECT COUNT(*) as count FROM surahs WHERE revelation_place = 'Makkah'").get().count,
  medinanSurahs: db.prepare("SELECT COUNT(*) as count FROM surahs WHERE revelation_place = 'Madinah'").get().count,
};

console.log(`Total Surahs: ${stats.totalSurahs}`);
console.log(`Total Verses: ${stats.totalVerses}`);
console.log(`Vocabulary Words: ${stats.totalWords}`);
console.log(`Meccan Surahs: ${stats.meccanSurahs}`);
console.log(`Medinan Surahs: ${stats.medinanSurahs}\n`);

// ============================================================================
// Example 8: Bookmark/Reading Progress (User Features)
// ============================================================================
console.log("8. Continue Reading from Last Position");
console.log("-".repeat(60));

// Simulate user's last reading position: Surah 2, Verse 150
const lastPosition = { surahNumber: 2, verseNumber: 150 };

const continueReading = db.prepare(`
  SELECT v.*, s.name_english, s.name_arabic
  FROM verses v
  INNER JOIN surahs s ON v.surah_number = s.surah_number
  WHERE v.surah_number = ? AND v.verse_number >= ?
  ORDER BY v.verse_number
  LIMIT 3
`).all(lastPosition.surahNumber, lastPosition.verseNumber);

console.log(`Continuing from ${continueReading[0].name_english} ${lastPosition.surahNumber}:${lastPosition.verseNumber}\n`);
continueReading.forEach(verse => {
  console.log(`[${verse.verse_number}] ${verse.arabic_text}`);
  console.log(`     ${verse.translation_en.substring(0, 80)}...\n`);
});

db.close();

console.log("=".repeat(60));
console.log("✅ All example queries executed successfully!");
console.log("=".repeat(60) + "\n");
