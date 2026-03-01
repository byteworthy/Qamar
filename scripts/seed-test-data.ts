/**
 * Seed Test Data Script
 *
 * Seeds the database with initial Quran metadata for testing purposes.
 * Run with: tsx scripts/seed-test-data.ts
 */

import { db } from "../server/db";
import {
  quranMetadata,
  userProgress,
  prayerPreferences,
} from "../shared/schema";
import { defaultLogger } from "../server/utils/logger";

/**
 * Initial 5 Surahs for testing
 */
const testSurahs = [
  {
    surahNumber: 1,
    nameArabic: "الفاتحة",
    nameEnglish: "Al-Fatiha",
    versesCount: 7,
    revelationPlace: "Makkah",
    orderInRevelation: 5,
  },
  {
    surahNumber: 2,
    nameArabic: "البقرة",
    nameEnglish: "Al-Baqarah",
    versesCount: 286,
    revelationPlace: "Madinah",
    orderInRevelation: 87,
  },
  {
    surahNumber: 3,
    nameArabic: "آل عمران",
    nameEnglish: "Ali 'Imran",
    versesCount: 200,
    revelationPlace: "Madinah",
    orderInRevelation: 89,
  },
  {
    surahNumber: 4,
    nameArabic: "النساء",
    nameEnglish: "An-Nisa",
    versesCount: 176,
    revelationPlace: "Madinah",
    orderInRevelation: 92,
  },
  {
    surahNumber: 5,
    nameArabic: "المائدة",
    nameEnglish: "Al-Ma'idah",
    versesCount: 120,
    revelationPlace: "Madinah",
    orderInRevelation: 112,
  },
];

/**
 * Full list of all 114 Surahs (for complete seeding)
 */
const allSurahs = [
  ...testSurahs,
  {
    surahNumber: 6,
    nameArabic: "الأنعام",
    nameEnglish: "Al-An'am",
    versesCount: 165,
    revelationPlace: "Makkah",
    orderInRevelation: 55,
  },
  {
    surahNumber: 7,
    nameArabic: "الأعراف",
    nameEnglish: "Al-A'raf",
    versesCount: 206,
    revelationPlace: "Makkah",
    orderInRevelation: 39,
  },
  {
    surahNumber: 8,
    nameArabic: "الأنفال",
    nameEnglish: "Al-Anfal",
    versesCount: 75,
    revelationPlace: "Madinah",
    orderInRevelation: 88,
  },
  {
    surahNumber: 9,
    nameArabic: "التوبة",
    nameEnglish: "At-Tawbah",
    versesCount: 129,
    revelationPlace: "Madinah",
    orderInRevelation: 113,
  },
  {
    surahNumber: 10,
    nameArabic: "يونس",
    nameEnglish: "Yunus",
    versesCount: 109,
    revelationPlace: "Makkah",
    orderInRevelation: 51,
  },
  // Add more surahs as needed for comprehensive testing
];

/**
 * Seed the database with test data
 */
async function seedDatabase() {
  try {
    defaultLogger.info("[SEED] Starting database seeding...");

    // Check if data already exists
    const existingSurahs = await db.select().from(quranMetadata).limit(1);

    if (existingSurahs.length > 0) {
      defaultLogger.warn(
        "[SEED] Quran metadata already exists. Skipping seeding.",
      );
      defaultLogger.info(
        "[SEED] To re-seed, first truncate the quran_metadata table.",
      );
      return;
    }

    // Determine which set to use based on environment
    const surahsToSeed =
      process.env.SEED_MODE === "full" ? allSurahs : testSurahs;

    defaultLogger.info(`[SEED] Inserting ${surahsToSeed.length} surahs...`);

    // Insert Quran metadata
    await db.insert(quranMetadata).values(surahsToSeed);

    defaultLogger.info(
      `[SEED] ✅ Successfully inserted ${surahsToSeed.length} surahs`,
    );

    // Verify insertion
    const insertedCount = await db.select().from(quranMetadata);
    defaultLogger.info(
      `[SEED] Verification: ${insertedCount.length} surahs in database`,
    );

    defaultLogger.info("[SEED] ✅ Database seeding completed successfully!");
  } catch (error) {
    defaultLogger.error(
      "[SEED] ❌ Failed to seed database",
      error instanceof Error ? error : new Error(String(error)),
    );
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
