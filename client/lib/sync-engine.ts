/**
 * Sync Engine - Offline-first synchronization for Islamic content
 *
 * Handles:
 * - Tracking last sync timestamps per content type
 * - Queuing mutations made while offline
 * - Replaying queued mutations when connectivity returns
 * - Conflict resolution: server wins for Islamic content, client wins for user data
 *
 * Uses AsyncStorage for sync metadata persistence.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOfflineDatabase } from "./offline-database";
import type { Surah, Verse, Hadith, VocabularyWord } from "../../shared/offline-schema";

// ============================================================================
// MOCK FLAG - mirrors the pattern in useQuranData.ts
// ============================================================================

const USE_MOCK_DATA = false;

// ============================================================================
// TYPES
// ============================================================================

export type ContentType = "surahs" | "verses" | "hadiths" | "vocabulary";
export type UserDataType = "bookmarks" | "reflections" | "progress";

/** A queued mutation to replay when back online */
export interface QueuedMutation {
  id: string;
  timestamp: number;
  type: "create" | "update" | "delete";
  entity: UserDataType;
  payload: Record<string, unknown>;
  retryCount: number;
}

/** Conflict resolution strategy */
export type ConflictStrategy = "server_wins" | "client_wins";

/** Sync status for a content type */
export interface SyncStatus {
  contentType: string;
  lastSyncTimestamp: number | null;
  itemCount: number;
  error?: string;
}

/** Result of a sync operation */
export interface SyncResult {
  success: boolean;
  contentTypes: SyncStatus[];
  mutationsReplayed: number;
  mutationsFailed: number;
  errors: string[];
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  SYNC_TIMESTAMPS: "noor:sync:timestamps",
  MUTATION_QUEUE: "noor:sync:mutation_queue",
  SYNC_IN_PROGRESS: "noor:sync:in_progress",
} as const;

// ============================================================================
// SYNC ENGINE
// ============================================================================

class SyncEngine {
  private listeners: Array<(status: SyncResult) => void> = [];

  // --------------------------------------------------------------------------
  // Sync timestamp management
  // --------------------------------------------------------------------------

  /** Get the last sync timestamp for a content type */
  async getLastSync(contentType: string): Promise<number | null> {
    const timestamps = await this.loadTimestamps();
    return timestamps[contentType] ?? null;
  }

  /** Update the last sync timestamp for a content type */
  async setLastSync(contentType: string, timestamp: number): Promise<void> {
    const timestamps = await this.loadTimestamps();
    timestamps[contentType] = timestamp;
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_TIMESTAMPS, JSON.stringify(timestamps));
  }

  /** Check if a content type needs syncing (stale after 24 hours) */
  async needsSync(contentType: string, maxAgeMs = 24 * 60 * 60 * 1000): Promise<boolean> {
    const lastSync = await this.getLastSync(contentType);
    if (lastSync === null) return true;
    return Date.now() - lastSync > maxAgeMs;
  }

  // --------------------------------------------------------------------------
  // Mutation queue (for offline writes)
  // --------------------------------------------------------------------------

  /** Add a mutation to the offline queue */
  async queueMutation(
    type: QueuedMutation["type"],
    entity: UserDataType,
    payload: Record<string, unknown>
  ): Promise<void> {
    const queue = await this.loadQueue();
    const mutation: QueuedMutation = {
      id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      type,
      entity,
      payload,
      retryCount: 0,
    };
    queue.push(mutation);
    await this.saveQueue(queue);
  }

  /** Get all pending mutations */
  async getPendingMutations(): Promise<QueuedMutation[]> {
    return this.loadQueue();
  }

  /** Get count of pending mutations */
  async getPendingCount(): Promise<number> {
    const queue = await this.loadQueue();
    return queue.length;
  }

  /** Remove a mutation from the queue (after successful replay) */
  async removeMutation(mutationId: string): Promise<void> {
    const queue = await this.loadQueue();
    const filtered = queue.filter((m) => m.id !== mutationId);
    await this.saveQueue(filtered);
  }

  /** Clear the entire mutation queue */
  async clearQueue(): Promise<void> {
    await this.saveQueue([]);
  }

  // --------------------------------------------------------------------------
  // Sync operations
  // --------------------------------------------------------------------------

  /**
   * Full sync: download Islamic content and replay queued mutations.
   * Islamic content uses server-wins; user data uses client-wins.
   */
  async performFullSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      contentTypes: [],
      mutationsReplayed: 0,
      mutationsFailed: 0,
      errors: [],
    };

    // Prevent concurrent syncs
    const inProgress = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_IN_PROGRESS);
    if (inProgress === "true") {
      return { ...result, success: false, errors: ["Sync already in progress"] };
    }

    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_IN_PROGRESS, "true");

    try {
      // 1. Sync Islamic content (server wins)
      const contentResults = await Promise.allSettled([
        this.syncContent("surahs"),
        this.syncContent("verses"),
        this.syncContent("hadiths"),
        this.syncContent("vocabulary"),
      ]);

      for (const r of contentResults) {
        if (r.status === "fulfilled") {
          result.contentTypes.push(r.value);
        } else {
          result.errors.push(r.reason?.message ?? "Unknown sync error");
          result.success = false;
        }
      }

      // 2. Replay queued mutations (client wins for user data)
      const replayResult = await this.replayMutations();
      result.mutationsReplayed = replayResult.replayed;
      result.mutationsFailed = replayResult.failed;
      if (replayResult.failed > 0) {
        result.errors.push(`${replayResult.failed} mutations failed to replay`);
      }

      // Notify listeners
      this.notifyListeners(result);
    } finally {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_IN_PROGRESS, "false");
    }

    return result;
  }

  /**
   * Sync a single content type from server to local database.
   * Uses server-wins strategy: server data always overwrites local.
   */
  async syncContent(contentType: ContentType): Promise<SyncStatus> {
    const db = getOfflineDatabase();
    const lastSync = await this.getLastSync(contentType);
    const status: SyncStatus = { contentType, lastSyncTimestamp: lastSync, itemCount: 0 };

    try {
      if (USE_MOCK_DATA) {
        // In mock mode, simulate a successful sync with no new data
        await new Promise((resolve) => setTimeout(resolve, 200));
        status.itemCount = await db.getRowCount(contentType);
      } else {
        // Real implementation: fetch from API with lastSync as cursor
        const sinceParam = lastSync ? `?since=${lastSync}` : "";
        const response = await fetch(`/api/offline/${contentType}${sinceParam}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // Server wins: upsert all received data
        switch (contentType) {
          case "surahs":
            await db.upsertSurahs(data as Surah[]);
            break;
          case "verses":
            await db.upsertVerses(data as Verse[]);
            break;
          case "hadiths":
            await db.upsertHadiths(data as Hadith[]);
            break;
          case "vocabulary":
            await db.upsertVocabulary(data as VocabularyWord[]);
            break;
        }

        status.itemCount = await db.getRowCount(contentType);
      }

      const now = Date.now();
      await this.setLastSync(contentType, now);
      status.lastSyncTimestamp = now;
    } catch (error: any) {
      status.error = error?.message ?? "Sync failed";
    }

    return status;
  }

  /**
   * Replay all queued mutations against the server.
   * Uses client-wins strategy for user data: local changes take priority.
   */
  async replayMutations(): Promise<{ replayed: number; failed: number }> {
    const queue = await this.loadQueue();
    let replayed = 0;
    let failed = 0;

    // Process in chronological order
    const sorted = [...queue].sort((a, b) => a.timestamp - b.timestamp);

    for (const mutation of sorted) {
      try {
        if (USE_MOCK_DATA) {
          // Simulate successful replay
          await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
          await this.replaySingleMutation(mutation);
        }

        await this.removeMutation(mutation.id);
        replayed++;
      } catch {
        // Increment retry count; keep in queue if under max retries
        mutation.retryCount++;
        if (mutation.retryCount >= 3) {
          await this.removeMutation(mutation.id);
          failed++;
        }
        // Otherwise it stays in queue for next sync
      }
    }

    return { replayed, failed };
  }

  // --------------------------------------------------------------------------
  // Conflict resolution
  // --------------------------------------------------------------------------

  /**
   * Determine the conflict resolution strategy for a given entity type.
   * Islamic content (Quran, Hadith, vocabulary) -> server wins
   * User data (bookmarks, reflections, progress) -> client wins
   */
  getConflictStrategy(entity: string): ConflictStrategy {
    const serverWinsEntities = ["surahs", "verses", "hadiths", "vocabulary", "conversation_scenarios"];
    return serverWinsEntities.includes(entity) ? "server_wins" : "client_wins";
  }

  // --------------------------------------------------------------------------
  // Event listeners
  // --------------------------------------------------------------------------

  /** Subscribe to sync completion events */
  onSyncComplete(listener: (result: SyncResult) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------

  private async loadTimestamps(): Promise<Record<string, number>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_TIMESTAMPS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private async loadQueue(): Promise<QueuedMutation[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.MUTATION_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private async saveQueue(queue: QueuedMutation[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(queue));
  }

  private async replaySingleMutation(mutation: QueuedMutation): Promise<void> {
    const methodMap: Record<string, string> = {
      create: "POST",
      update: "PUT",
      delete: "DELETE",
    };
    const method = methodMap[mutation.type] ?? "POST";
    const response = await fetch(`/api/${mutation.entity}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "DELETE" ? JSON.stringify(mutation.payload) : undefined,
    });
    if (!response.ok) {
      throw new Error(`Replay failed: HTTP ${response.status}`);
    }
  }

  private notifyListeners(result: SyncResult): void {
    for (const listener of this.listeners) {
      try {
        listener(result);
      } catch {
        // Swallow listener errors
      }
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let engineInstance: SyncEngine | null = null;

export function getSyncEngine(): SyncEngine {
  if (!engineInstance) {
    engineInstance = new SyncEngine();
  }
  return engineInstance;
}

export { SyncEngine };
