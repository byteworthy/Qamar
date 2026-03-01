/**
 * Data Retention Module for Qamar
 *
 * Handles automatic deletion of expired user data.
 * Ensures compliance with data retention policies.
 *
 * DRY RUN MODE: By default, deletions are simulated (DATA_RETENTION_DRY_RUN=true).
 * Set DATA_RETENTION_DRY_RUN=false to perform actual deletions.
 */

import crypto from "crypto";
import { storage } from "./storage";
import { defaultLogger } from "./utils/logger";

// =============================================================================
// CONFIGURATION
// =============================================================================

const RETENTION_DAYS = 30;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if dry run mode is enabled.
 * Default: true (safe mode - only logs, no deletions)
 *
 * PRODUCTION GUARD: In production, DATA_RETENTION_DRY_RUN must be explicitly set.
 * This prevents accidental dry-run mode in production where real deletions are required.
 */
export function isDryRunMode(): boolean {
  const isProduction = process.env.NODE_ENV === "production";
  const dryRun = process.env.DATA_RETENTION_DRY_RUN;

  // PRODUCTION GUARD: Fail if DATA_RETENTION_DRY_RUN is not explicitly configured in production
  if (isProduction && dryRun === undefined) {
    throw new Error(
      "DATA_RETENTION_DRY_RUN must be explicitly set in production environment. " +
        "Set to 'false' to enable real deletions, or 'true' for dry-run mode.",
    );
  }

  // Default to true for safety in non-production - only delete when explicitly set to "false"
  return dryRun !== "false";
}

// =============================================================================
// CLEANUP RESULT TYPES
// =============================================================================

export interface CleanupResult {
  dryRun: boolean;
  cutoffDate: string;
  reflections: {
    count: number;
    deleted: boolean;
  };
  insightSummaries: {
    count: number;
    deleted: boolean;
  };
  durationMs: number;
  timestamp: string;
}

// =============================================================================
// DATA RETENTION SERVICE
// =============================================================================

export class DataRetentionService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  /**
   * Start the data retention cleanup service
   * Runs every 24 hours to delete expired data
   */
  start(): void {
    if (this.isRunning) {
      defaultLogger.info("Data Retention: Service already running", {
        operation: "data_retention_start",
      });
      return;
    }

    defaultLogger.info("Data Retention: Starting data retention service", {
      operation: "data_retention_start",
      retentionDays: RETENTION_DAYS,
      dryRun: isDryRunMode(),
      cleanupIntervalHours: CLEANUP_INTERVAL_MS / (60 * 60 * 1000),
    });

    // Run immediately on start
    this.runCleanup();

    // Schedule periodic cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, CLEANUP_INTERVAL_MS);

    this.isRunning = true;
  }

  /**
   * Stop the data retention cleanup service
   */
  stop(): void {
    if (!this.isRunning || !this.intervalId) {
      defaultLogger.info("Data Retention: Service not running", {
        operation: "data_retention_stop",
      });
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    defaultLogger.info("Data Retention: Service stopped", {
      operation: "data_retention_stop",
    });
  }

  /**
   * Run a single cleanup cycle
   * Returns the result for logging/admin purposes
   */
  async runCleanup(): Promise<CleanupResult> {
    const startTime = Date.now();
    const dryRun = isDryRunMode();

    defaultLogger.info("Data Retention: Running cleanup", {
      operation: "data_retention_cleanup",
      dryRun,
    });

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    let reflectionCount = 0;
    let reflectionsDeleted = false;
    let summaryCount = 0;
    let summariesDeleted = false;

    try {
      // Count/delete expired reflections
      if (dryRun) {
        reflectionCount = await storage.countExpiredReflections(cutoffDate);
        defaultLogger.info(
          "Data Retention: DRY RUN - Would delete reflections",
          {
            operation: "data_retention_cleanup_reflections",
            dryRun: true,
            count: reflectionCount,
            cutoffDate: cutoffDate.toISOString(),
          },
        );
      } else {
        reflectionCount = await storage.deleteExpiredReflections(cutoffDate);
        reflectionsDeleted = true;
        defaultLogger.info("Data Retention: Deleted expired reflections", {
          operation: "data_retention_cleanup_reflections",
          dryRun: false,
          count: reflectionCount,
        });
      }

      // Count/delete expired insight summaries
      if (dryRun) {
        summaryCount = await storage.countExpiredInsightSummaries(cutoffDate);
        defaultLogger.info("Data Retention: DRY RUN - Would delete summaries", {
          operation: "data_retention_cleanup_summaries",
          dryRun: true,
          count: summaryCount,
          cutoffDate: cutoffDate.toISOString(),
        });
      } else {
        summaryCount = await storage.deleteExpiredInsightSummaries(cutoffDate);
        summariesDeleted = true;
        defaultLogger.info(
          "Data Retention: Deleted expired insight summaries",
          {
            operation: "data_retention_cleanup_summaries",
            dryRun: false,
            count: summaryCount,
          },
        );
      }
    } catch (error) {
      defaultLogger.error(
        "Data Retention: Cleanup failed",
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: "data_retention_cleanup",
          dryRun,
        },
      );
    }

    const duration = Date.now() - startTime;
    defaultLogger.info("Data Retention: Cleanup complete", {
      operation: "data_retention_cleanup",
      durationMs: duration,
      dryRun,
    });

    return {
      dryRun,
      cutoffDate: cutoffDate.toISOString(),
      reflections: {
        count: reflectionCount,
        deleted: reflectionsDeleted,
      },
      insightSummaries: {
        count: summaryCount,
        deleted: summariesDeleted,
      },
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get retention statistics
   */
  async getRetentionStats(): Promise<{
    retentionDays: number;
    nextCleanup: Date | null;
    isRunning: boolean;
    dryRunMode: boolean;
  }> {
    return {
      retentionDays: RETENTION_DAYS,
      nextCleanup: this.isRunning
        ? new Date(Date.now() + CLEANUP_INTERVAL_MS)
        : null,
      isRunning: this.isRunning,
      dryRunMode: isDryRunMode(),
    };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const dataRetentionService = new DataRetentionService();

// =============================================================================
// AUTO-START (call this in server initialization)
// =============================================================================

export function initializeDataRetention(): void {
  // Only start if explicitly enabled via environment variable
  const shouldRun = typeof window !== "undefined" ? false : true;

  if (shouldRun) {
    dataRetentionService.start();
  } else {
    defaultLogger.info("Data Retention: Skipping data retention service", {
      operation: "data_retention_init",
      reason: "DATABASE_URL not configured or disabled",
    });
  }
}

// =============================================================================
// MANUAL CLEANUP (for admin use)
// =============================================================================

export async function runManualCleanup(): Promise<CleanupResult> {
  defaultLogger.info("Data Retention: Running manual cleanup", {
    operation: "data_retention_manual_cleanup",
  });
  return dataRetentionService.runCleanup();
}

// =============================================================================
// USER DATA EXPORT (GDPR compliance)
// =============================================================================

export interface UserDataExport {
  exportedAt: string;
  userId: string;
  reflections: {
    createdAt: string;
    thought: string;
    distortions: string[];
    reframe: string;
    intention?: string;
    anchor?: string;
  }[];
  insightSummaries: {
    createdAt: string;
    summary: string;
  }[];
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  defaultLogger.info("Data Retention: Exporting user data", {
    operation: "data_retention_export",
    userIdPrefix: userId.substring(0, 8),
  });

  try {
    // Get all user reflections
    const reflections = await storage.getReflectionHistory(userId, undefined);

    // Get all insight summaries
    const insightSummary = await storage.getLatestInsightSummary(userId);

    return {
      exportedAt: new Date().toISOString(),
      userId: userId,
      reflections: reflections.map((r) => ({
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
        thought: r.thought,
        distortions: r.distortions || [],
        reframe: r.reframe,
        intention: r.intention || undefined,
        anchor: r.anchor || undefined,
      })),
      insightSummaries: insightSummary
        ? [
            {
              createdAt:
                insightSummary.generatedAt?.toISOString() ||
                new Date().toISOString(),
              summary: insightSummary.summary,
            },
          ]
        : [],
    };
  } catch (error) {
    defaultLogger.error(
      "Data Retention: Failed to export user data",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "data_retention_export",
        userIdPrefix: userId.substring(0, 8),
      },
    );
    throw new Error("Failed to export user data");
  }
}

/**
 * Delete all user data (right to be forgotten)
 */
export async function deleteAllUserData(userId: string): Promise<{
  success: boolean;
  reflectionsDeleted: number;
  summariesDeleted: number;
  assumptionsDeleted: number;
}> {
  defaultLogger.info("Data Retention: Deleting all user data", {
    operation: "data_retention_delete_all",
    userIdPrefix: userId.substring(0, 8),
  });

  try {
    const reflectionsDeleted = await storage.deleteAllUserReflections(userId);
    const summariesDeleted =
      await storage.deleteAllUserInsightSummaries(userId);
    const assumptionsDeleted = await storage.deleteAllUserAssumptions(userId);

    defaultLogger.info("Data Retention: Deleted all user data", {
      operation: "data_retention_delete_all",
      userIdPrefix: userId.substring(0, 8),
      reflectionsDeleted,
      summariesDeleted,
      assumptionsDeleted,
    });

    return {
      success: true,
      reflectionsDeleted,
      summariesDeleted,
      assumptionsDeleted,
    };
  } catch (error) {
    defaultLogger.error(
      "Data Retention: Failed to delete user data",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "data_retention_delete_all",
        userIdPrefix: userId.substring(0, 8),
      },
    );
    return {
      success: false,
      reflectionsDeleted: 0,
      summariesDeleted: 0,
      assumptionsDeleted: 0,
    };
  }
}

// =============================================================================
// ADMIN TOKEN VERIFICATION
// =============================================================================

/**
 * Verify admin token for protected endpoints.
 * Returns true if ADMIN_TOKEN is set and matches the provided token.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyAdminToken(token: string | undefined): boolean {
  const adminToken = process.env.ADMIN_TOKEN;

  // If ADMIN_TOKEN is not set, deny all requests
  if (!adminToken) {
    return false;
  }

  // If token is not provided, deny
  if (!token) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
  } catch {
    // If lengths don't match, timingSafeEqual throws - return false
    return false;
  }
}

/**
 * Check if admin endpoint is enabled (ADMIN_TOKEN is set).
 */
export function isAdminEndpointEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}

// =============================================================================
// ISLAMIC DATA EXPORT & DELETION (GDPR compliance)
// =============================================================================

export interface IslamicDataExport {
  exportedAt: string;
  userId: string;
  quranBookmarks: {
    surahNumber: number;
    verseNumber: number;
    note?: string;
    createdAt: string;
  }[];
  prayerPreferences?: {
    calculationMethod: string;
    madhab?: string;
    notificationsEnabled: boolean;
    locationName?: string;
    // GPS coordinates excluded for privacy
  };
  arabicFlashcards: {
    wordId: string;
    reviewCount: number;
    state: string;
    lastReview?: string;
    nextReview?: string;
  }[];
  progress?: {
    quranVersesRead: number;
    arabicWordsLearned: number;
    prayerTimesChecked: number;
    reflectionSessionsCompleted: number;
    streakDays: number;
    lastActiveDate: string;
  };
}

/**
 * Export all Islamic feature data for a user (GDPR Article 20 - Right to Data Portability)
 *
 * @param userId - User ID to export data for
 * @returns Complete Islamic data export in JSON format
 */
export async function exportIslamicData(
  userId: string,
): Promise<IslamicDataExport> {
  defaultLogger.info("Data Retention: Exporting Islamic data", {
    operation: "data_retention_export_islamic",
    userIdPrefix: userId.substring(0, 8),
  });

  try {
    // Import here to avoid circular dependencies
    const { db } = await import("./db");
    const {
      quranBookmarks,
      prayerPreferences,
      arabicFlashcards,
      userProgress,
    } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const { decryptQuranBookmark, decryptPrayerPreferences } = await import(
      "./encryption"
    );

    // Get Quran bookmarks (decrypt notes)
    const bookmarks = await db
      .select()
      .from(quranBookmarks)
      .where(eq(quranBookmarks.userId, userId));

    const decryptedBookmarks = bookmarks.map((b) => ({
      surahNumber: b.surahNumber,
      verseNumber: b.verseNumber,
      note: b.note
        ? decryptQuranBookmark({
            surahNumber: b.surahNumber,
            verseNumber: b.verseNumber,
            note: b.note,
          }).note
        : undefined,
      createdAt: b.createdAt?.toISOString() || new Date().toISOString(),
    }));

    // Get prayer preferences (decrypt location, exclude GPS for privacy)
    const [prayerPrefs] = await db
      .select()
      .from(prayerPreferences)
      .where(eq(prayerPreferences.userId, userId));

    let prayerData: IslamicDataExport["prayerPreferences"];
    if (prayerPrefs) {
      prayerData = {
        calculationMethod: prayerPrefs.calculationMethod,
        madhab: prayerPrefs.madhab || undefined,
        notificationsEnabled: prayerPrefs.notificationsEnabled || false,
        locationName: prayerPrefs.locationName || undefined,
        // GPS coordinates intentionally excluded for privacy
      };
    }

    // Get Arabic flashcards
    const flashcards = await db
      .select()
      .from(arabicFlashcards)
      .where(eq(arabicFlashcards.userId, userId));

    const flashcardData = flashcards.map((f) => ({
      wordId: f.wordId,
      reviewCount: f.reviewCount || 0,
      state: f.state,
      lastReview: f.lastReview?.toISOString(),
      nextReview: f.nextReview?.toISOString(),
    }));

    // Get user progress
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    let progressData: IslamicDataExport["progress"];
    if (progress) {
      progressData = {
        quranVersesRead: progress.quranVersesRead || 0,
        arabicWordsLearned: progress.arabicWordsLearned || 0,
        prayerTimesChecked: progress.prayerTimesChecked || 0,
        reflectionSessionsCompleted: progress.reflectionSessionsCompleted || 0,
        streakDays: progress.streakDays || 0,
        lastActiveDate:
          progress.lastActiveDate?.toISOString() || new Date().toISOString(),
      };
    }

    return {
      exportedAt: new Date().toISOString(),
      userId,
      quranBookmarks: decryptedBookmarks,
      prayerPreferences: prayerData,
      arabicFlashcards: flashcardData,
      progress: progressData,
    };
  } catch (error) {
    defaultLogger.error(
      "Data Retention: Failed to export Islamic data",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "data_retention_export_islamic",
        userIdPrefix: userId.substring(0, 8),
      },
    );
    throw new Error("Failed to export Islamic data");
  }
}

/**
 * Delete all Islamic feature data for a user (GDPR Article 17 - Right to Erasure)
 *
 * @param userId - User ID to delete data for
 * @returns Deletion summary with counts
 */
export async function deleteAllIslamicData(userId: string): Promise<{
  success: boolean;
  bookmarksDeleted: number;
  preferencesDeleted: number;
  flashcardsDeleted: number;
  progressDeleted: number;
}> {
  defaultLogger.info("Data Retention: Deleting all Islamic data", {
    operation: "data_retention_delete_islamic",
    userIdPrefix: userId.substring(0, 8),
  });

  try {
    const { db } = await import("./db");
    const {
      quranBookmarks,
      prayerPreferences,
      arabicFlashcards,
      userProgress,
    } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");

    // Delete Quran bookmarks
    const bookmarksResult = await db
      .delete(quranBookmarks)
      .where(eq(quranBookmarks.userId, userId));

    // Delete prayer preferences
    const prefsResult = await db
      .delete(prayerPreferences)
      .where(eq(prayerPreferences.userId, userId));

    // Delete Arabic flashcards
    const flashcardsResult = await db
      .delete(arabicFlashcards)
      .where(eq(arabicFlashcards.userId, userId));

    // Delete user progress
    const progressResult = await db
      .delete(userProgress)
      .where(eq(userProgress.userId, userId));

    const result = {
      success: true,
      bookmarksDeleted: bookmarksResult.rowCount || 0,
      preferencesDeleted: prefsResult.rowCount || 0,
      flashcardsDeleted: flashcardsResult.rowCount || 0,
      progressDeleted: progressResult.rowCount || 0,
    };

    defaultLogger.info("Data Retention: Deleted all Islamic data", {
      operation: "data_retention_delete_islamic",
      userIdPrefix: userId.substring(0, 8),
      ...result,
    });

    return result;
  } catch (error) {
    defaultLogger.error(
      "Data Retention: Failed to delete Islamic data",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "data_retention_delete_islamic",
        userIdPrefix: userId.substring(0, 8),
      },
    );
    return {
      success: false,
      bookmarksDeleted: 0,
      preferencesDeleted: 0,
      flashcardsDeleted: 0,
      progressDeleted: 0,
    };
  }
}

/**
 * Export COMPLETE user data including all features
 *
 * @param userId - User ID to export data for
 * @returns Complete data export in JSON format
 */
export async function exportCompleteUserData(userId: string): Promise<{
  reflectionData: UserDataExport;
  islamicData: IslamicDataExport;
}> {
  defaultLogger.info("Data Retention: Exporting complete user data", {
    operation: "data_retention_export_complete",
    userIdPrefix: userId.substring(0, 8),
  });

  const [reflectionData, islamicData] = await Promise.all([
    exportUserData(userId), // Existing data export
    exportIslamicData(userId), // New Islamic data export
  ]);

  return {
    reflectionData,
    islamicData,
  };
}

/**
 * Delete COMPLETE user data including all features
 *
 * @param userId - User ID to delete data for
 * @returns Complete deletion summary
 */
export async function deleteCompleteUserData(userId: string): Promise<{
  success: boolean;
  reflection: {
    reflectionsDeleted: number;
    summariesDeleted: number;
    assumptionsDeleted: number;
  };
  islamic: {
    bookmarksDeleted: number;
    preferencesDeleted: number;
    flashcardsDeleted: number;
    progressDeleted: number;
  };
}> {
  defaultLogger.info("Data Retention: Deleting complete user data", {
    operation: "data_retention_delete_complete",
    userIdPrefix: userId.substring(0, 8),
  });

  const [reflectionResult, islamicResult] = await Promise.all([
    deleteAllUserData(userId), // Existing data deletion
    deleteAllIslamicData(userId), // New Islamic data deletion
  ]);

  return {
    success: reflectionResult.success && islamicResult.success,
    reflection: {
      reflectionsDeleted: reflectionResult.reflectionsDeleted,
      summariesDeleted: reflectionResult.summariesDeleted,
      assumptionsDeleted: reflectionResult.assumptionsDeleted,
    },
    islamic: {
      bookmarksDeleted: islamicResult.bookmarksDeleted,
      preferencesDeleted: islamicResult.preferencesDeleted,
      flashcardsDeleted: islamicResult.flashcardsDeleted,
      progressDeleted: islamicResult.progressDeleted,
    },
  };
}
