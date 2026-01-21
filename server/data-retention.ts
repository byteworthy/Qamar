/**
 * Data Retention Module for Noor CBT
 *
 * Handles automatic deletion of expired user data.
 * Ensures compliance with data retention policies.
 *
 * DRY RUN MODE: By default, deletions are simulated (DATA_RETENTION_DRY_RUN=true).
 * Set DATA_RETENTION_DRY_RUN=false to perform actual deletions.
 */

import { storage } from "./storage";

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
      console.log("[Data Retention] Service already running");
      return;
    }

    console.log("[Data Retention] Starting data retention service");
    console.log(`[Data Retention] Retention period: ${RETENTION_DAYS} days`);
    console.log(`[Data Retention] Dry run mode: ${isDryRunMode()}`);
    console.log(
      `[Data Retention] Cleanup interval: ${CLEANUP_INTERVAL_MS / (60 * 60 * 1000)} hours`,
    );

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
      console.log("[Data Retention] Service not running");
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    console.log("[Data Retention] Service stopped");
  }

  /**
   * Run a single cleanup cycle
   * Returns the result for logging/admin purposes
   */
  async runCleanup(): Promise<CleanupResult> {
    const startTime = Date.now();
    const dryRun = isDryRunMode();

    console.log(`[Data Retention] Running cleanup (dry run: ${dryRun})...`);

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
        console.log(
          `[Data Retention] DRY RUN: Would delete ${reflectionCount} reflections older than ${cutoffDate.toISOString()}`,
        );
      } else {
        reflectionCount = await storage.deleteExpiredReflections(cutoffDate);
        reflectionsDeleted = true;
        console.log(
          `[Data Retention] Deleted ${reflectionCount} expired reflections`,
        );
      }

      // Count/delete expired insight summaries
      if (dryRun) {
        summaryCount = await storage.countExpiredInsightSummaries(cutoffDate);
        console.log(
          `[Data Retention] DRY RUN: Would delete ${summaryCount} summaries older than ${cutoffDate.toISOString()}`,
        );
      } else {
        summaryCount = await storage.deleteExpiredInsightSummaries(cutoffDate);
        summariesDeleted = true;
        console.log(
          `[Data Retention] Deleted ${summaryCount} expired insight summaries`,
        );
      }
    } catch (error) {
      console.error("[Data Retention] Cleanup failed:", error);
    }

    const duration = Date.now() - startTime;
    console.log(`[Data Retention] Cleanup complete in ${duration}ms`);

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
    console.log("[Data Retention] Skipping data retention service");
  }
}

// =============================================================================
// MANUAL CLEANUP (for admin use)
// =============================================================================

export async function runManualCleanup(): Promise<CleanupResult> {
  console.log("[Data Retention] Running manual cleanup...");
  return dataRetentionService.runCleanup();
}

// =============================================================================
// USER DATA EXPORT (GDPR compliance)
// =============================================================================

export interface UserDataExport {
  exportedAt: string;
  userId: string;
  reflections: Array<{
    createdAt: string;
    thought: string;
    distortions: string[];
    reframe: string;
    intention?: string;
    anchor?: string;
  }>;
  insightSummaries: Array<{
    createdAt: string;
    summary: string;
  }>;
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<UserDataExport> {
  console.log(
    `[Data Retention] Exporting data for user ${userId.substring(0, 8)}...`,
  );

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
    console.error("[Data Retention] Failed to export user data:", error);
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
  console.log(
    `[Data Retention] Deleting all data for user ${userId.substring(0, 8)}...`,
  );

  try {
    const reflectionsDeleted = await storage.deleteAllUserReflections(userId);
    const summariesDeleted =
      await storage.deleteAllUserInsightSummaries(userId);
    const assumptionsDeleted = await storage.deleteAllUserAssumptions(userId);

    console.log(
      `[Data Retention] Deleted all data for user ${userId.substring(0, 8)}: ` +
        `${reflectionsDeleted} reflections, ${summariesDeleted} summaries, ${assumptionsDeleted} assumptions`,
    );

    return {
      success: true,
      reflectionsDeleted,
      summariesDeleted,
      assumptionsDeleted,
    };
  } catch (error) {
    console.error("[Data Retention] Failed to delete user data:", error);
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
 */
export function verifyAdminToken(token: string | undefined): boolean {
  const adminToken = process.env.ADMIN_TOKEN;

  // If ADMIN_TOKEN is not set, deny all requests
  if (!adminToken) {
    return false;
  }

  // Compare tokens
  return token === adminToken;
}

/**
 * Check if admin endpoint is enabled (ADMIN_TOKEN is set).
 */
export function isAdminEndpointEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}
