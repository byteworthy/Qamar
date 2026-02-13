import { z } from "zod";
import {
  pgTable,
  text,
  timestamp,
  serial,
  jsonb,
  integer,
  index,
  foreignKey,
  real,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("free"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const processedStripeEvents = pgTable("processed_stripe_events", {
  eventId: text("event_id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    thought: text("thought").notNull(),
    distortions: jsonb("distortions").notNull().$type<string[]>(),
    reframe: text("reframe").notNull(),
    intention: text("intention").notNull(),
    practice: text("practice").notNull(),
    keyAssumption: text("key_assumption"),
    detectedState: text("detected_state"),
    anchor: text("anchor"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Foreign key to users table with cascade delete
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_fk",
    }).onDelete("cascade"),
    // Index on userId for fast history queries
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    // Index on createdAt for sorting
    createdAtIdx: index("sessions_created_at_idx").on(table.createdAt),
  }),
);

export const insightSummaries = pgTable(
  "insight_summaries",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    summary: text("summary").notNull(),
    reflectionCount: integer("reflection_count").notNull(),
    generatedAt: timestamp("generated_at").defaultNow(),
  },
  (table) => ({
    // Foreign key to users table with cascade delete
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "insight_summaries_user_fk",
    }).onDelete("cascade"),
    // Index on userId for fast queries
    userIdIdx: index("insight_summaries_user_id_idx").on(table.userId),
  }),
);

export const assumptionLibrary = pgTable(
  "assumption_library",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    assumptionLabel: text("assumption_label").notNull(),
    count: integer("count").default(1),
    lastSeenAt: timestamp("last_seen_at").defaultNow(),
  },
  (table) => ({
    // Foreign key to users table with cascade delete
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "assumption_library_user_fk",
    }).onDelete("cascade"),
    // Index on userId for fast queries
    userIdIdx: index("assumption_library_user_id_idx").on(table.userId),
  }),
);

// ============================================================================
// ISLAMIC FEATURES TABLES (Noor-AI Integration)
// ============================================================================

// Quran metadata (surah information - reference data, not user-specific)
export const quranMetadata = pgTable(
  "quran_metadata",
  {
    id: serial("id").primaryKey(),
    surahNumber: integer("surah_number").notNull().unique(),
    nameArabic: text("name_arabic").notNull(),
    nameEnglish: text("name_english").notNull(),
    versesCount: integer("verses_count").notNull(),
    revelationPlace: text("revelation_place").notNull(), // "Makkah" or "Madinah"
    orderInRevelation: integer("order_in_revelation"),
  },
  (table) => ({
    // Index on surah number for fast lookups
    surahNumberIdx: index("quran_metadata_surah_number_idx").on(table.surahNumber),
  }),
);

// User Quran bookmarks (encrypted notes for privacy)
export const quranBookmarks = pgTable(
  "quran_bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    surahNumber: integer("surah_number").notNull(),
    verseNumber: integer("verse_number").notNull(),
    note: text("note"), // Will be encrypted before storage
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "quran_bookmarks_user_fk",
    }).onDelete("cascade"),
    // Composite index for user + verse lookups
    userIdIdx: index("quran_bookmarks_user_id_idx").on(table.userId),
    surahVerseIdx: index("quran_bookmarks_surah_verse_idx").on(
      table.surahNumber,
      table.verseNumber,
    ),
  }),
);

// Prayer time preferences (encrypted location data)
export const prayerPreferences = pgTable(
  "prayer_preferences",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    calculationMethod: text("calculation_method").notNull().default("MWL"), // MWL, ISNA, Egypt, Makkah, Karachi, etc.
    madhab: text("madhab").default("Shafi"), // Hanafi, Maliki, Shafi, Hanbali
    notificationsEnabled: boolean("notifications_enabled").default(true),
    latitude: real("latitude"), // Encrypted in storage
    longitude: real("longitude"), // Encrypted in storage
    locationName: text("location_name"),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "prayer_preferences_user_fk",
    }).onDelete("cascade"),
  }),
);

// Arabic flashcard progress (FSRS spaced repetition algorithm)
export const arabicFlashcards = pgTable(
  "arabic_flashcards",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    wordId: text("word_id").notNull(), // References local SQLite vocabulary
    difficulty: real("difficulty").notNull().default(0), // FSRS difficulty parameter
    stability: real("stability").notNull().default(0), // FSRS stability parameter
    lastReview: timestamp("last_review"),
    nextReview: timestamp("next_review"),
    reviewCount: integer("review_count").default(0),
    state: text("state").notNull().default("new"), // new, learning, review, relearning
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "arabic_flashcards_user_fk",
    }).onDelete("cascade"),
    // Composite index for user + word lookups
    userWordIdx: index("arabic_flashcards_user_word_idx").on(
      table.userId,
      table.wordId,
    ),
    // Index on nextReview for due card queries
    nextReviewIdx: index("arabic_flashcards_next_review_idx").on(
      table.nextReview,
    ),
  }),
);

// User progress tracking (aggregated stats for all Islamic features)
export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    quranVersesRead: integer("quran_verses_read").default(0),
    arabicWordsLearned: integer("arabic_words_learned").default(0),
    prayerTimesChecked: integer("prayer_times_checked").default(0),
    reflectionSessionsCompleted: integer("reflection_sessions_completed").default(0),
    streakDays: integer("streak_days").default(0),
    lastActiveDate: timestamp("last_active_date").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_progress_user_fk",
    }).onDelete("cascade"),
    // Index on lastActiveDate for streak calculations
    lastActiveDateIdx: index("user_progress_last_active_date_idx").on(
      table.lastActiveDate,
    ),
  }),
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;
export type QuranMetadata = typeof quranMetadata.$inferSelect;
export type InsertQuranMetadata = typeof quranMetadata.$inferInsert;
export type QuranBookmark = typeof quranBookmarks.$inferSelect;
export type InsertQuranBookmark = typeof quranBookmarks.$inferInsert;
export type PrayerPreference = typeof prayerPreferences.$inferSelect;
export type InsertPrayerPreference = typeof prayerPreferences.$inferInsert;
export type ArabicFlashcard = typeof arabicFlashcards.$inferSelect;
export type InsertArabicFlashcard = typeof arabicFlashcards.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export const sessionSchema = z.object({
  thought: z.string(),
  distortions: z.array(z.string()),
  reframe: z.string(),
  intention: z.string(),
  practice: z.string(),
  timestamp: z.number(),
});

export type SessionLocal = z.infer<typeof sessionSchema>;
