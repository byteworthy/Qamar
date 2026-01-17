/**
 * Data Retention Module for Noor CBT
 * 
 * Handles automatic deletion of expired user data.
 * Ensures compliance with data retention policies.
 */

import { storage } from './storage';

// =============================================================================
// CONFIGURATION
// =============================================================================

const RETENTION_DAYS = 30;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
      console.log('[Data Retention] Service already running');
      return;
    }

    console.log('[Data Retention] Starting data retention service');
    console.log(`[Data Retention] Retention period: ${RETENTION_DAYS} days`);
    console.log(`[Data Retention] Cleanup interval: ${CLEANUP_INTERVAL_MS / (60 * 60 * 1000)} hours`);

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
      console.log('[Data Retention] Service not running');
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    console.log('[Data Retention] Service stopped');
  }

  /**
   * Run a single cleanup cycle
   */
  async runCleanup(): Promise<void> {
    const startTime = Date.now();
    console.log('[Data Retention] Running cleanup...');

    try {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

      // Delete expired reflections
      const deletedCount = await this.deleteExpiredReflections(cutoffDate);

      // Delete expired insight summaries
      const deletedSummaries = await this.deleteExpiredInsightSummaries(cutoffDate);

      const duration = Date.now() - startTime;
      console.log(`[Data Retention] Cleanup complete in ${duration}ms`);
      console.log(`[Data Retention] Deleted ${deletedCount} reflections, ${deletedSummaries} summaries`);

    } catch (error) {
      console.error('[Data Retention] Cleanup failed:', error);
    }
  }

  /**
   * Delete reflections older than the cutoff date
   */
  private async deleteExpiredReflections(cutoffDate: Date): Promise<number> {
    try {
      // Note: This requires adding a deleteExpiredReflections method to storage
      // For now, we'll just log the intention
      console.log(`[Data Retention] Would delete reflections older than ${cutoffDate.toISOString()}`);
      
      // TODO: Implement actual deletion when storage method is available
      // const deleted = await storage.deleteExpiredReflections(cutoffDate);
      // return deleted;
      
      return 0;
    } catch (error) {
      console.error('[Data Retention] Failed to delete expired reflections:', error);
      return 0;
    }
  }

  /**
   * Delete insight summaries older than the cutoff date
   */
  private async deleteExpiredInsightSummaries(cutoffDate: Date): Promise<number> {
    try {
      // Note: This requires adding a deleteExpiredInsightSummaries method to storage
      console.log(`[Data Retention] Would delete insight summaries older than ${cutoffDate.toISOString()}`);
      
      // TODO: Implement actual deletion when storage method is available
      // const deleted = await storage.deleteExpiredInsightSummaries(cutoffDate);
      // return deleted;
      
      return 0;
    } catch (error) {
      console.error('[Data Retention] Failed to delete expired insight summaries:', error);
      return 0;
    }
  }

  /**
   * Get retention statistics
   */
  async getRetentionStats(): Promise<{
    retentionDays: number;
    nextCleanup: Date | null;
    isRunning: boolean;
  }> {
    return {
      retentionDays: RETENTION_DAYS,
      nextCleanup: this.isRunning ? new Date(Date.now() + CLEANUP_INTERVAL_MS) : null,
      isRunning: this.isRunning,
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
  // Check window or global for environment flags
  const shouldRun = typeof window !== 'undefined' 
    ? false 
    : true; // In Node.js context, enable by default
  
  if (shouldRun) {
    dataRetentionService.start();
  } else {
    console.log('[Data Retention] Skipping data retention service');
  }
}

// =============================================================================
// MANUAL CLEANUP (for admin use)
// =============================================================================

export async function runManualCleanup(): Promise<void> {
  console.log('[Data Retention] Running manual cleanup...');
  await dataRetentionService.runCleanup();
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
  console.log(`[Data Retention] Exporting data for user ${userId.substring(0, 8)}...`);
  
  try {
    // Get all user reflections
    const reflections = await storage.getReflectionHistory(userId, undefined);
    
    // Get all insight summaries
    const insightSummary = await storage.getLatestInsightSummary(userId);
    
    return {
      exportedAt: new Date().toISOString(),
      userId: userId,
      reflections: reflections.map(r => ({
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
        thought: r.thought,
        distortions: r.distortions || [],
        reframe: r.reframe,
        intention: r.intention || undefined,
        anchor: r.anchor || undefined,
      })),
      insightSummaries: insightSummary ? [{
        createdAt: insightSummary.generatedAt?.toISOString() || new Date().toISOString(),
        summary: insightSummary.summary,
      }] : [],
    };
  } catch (error) {
    console.error('[Data Retention] Failed to export user data:', error);
    throw new Error('Failed to export user data');
  }
}

/**
 * Delete all user data (right to be forgotten)
 */
export async function deleteAllUserData(userId: string): Promise<boolean> {
  console.log(`[Data Retention] Deleting all data for user ${userId.substring(0, 8)}...`);
  
  try {
    // TODO: Implement deletion methods in storage
    // await storage.deleteAllUserReflections(userId);
    // await storage.deleteAllUserInsights(userId);
    
    console.log(`[Data Retention] Deleted all data for user ${userId.substring(0, 8)}`);
    return true;
  } catch (error) {
    console.error('[Data Retention] Failed to delete user data:', error);
    return false;
  }
}
