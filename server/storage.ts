import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Database row type for count queries
 */
interface CountRow {
  count: string | number;
}

/**
 * Type guard to validate CountRow structure
 */
function isCountRow(row: unknown): row is CountRow {
  return (
    typeof row === "object" &&
    row !== null &&
    "count" in row &&
    (typeof (row as CountRow).count === "string" ||
      typeof (row as CountRow).count === "number")
  );
}

/**
 * Type guard to validate SessionRow structure
 */
function isSessionRow(row: unknown): row is SessionRow {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.id === "number" &&
    typeof r.user_id === "string" &&
    typeof r.thought === "string" &&
    Array.isArray(r.distortions) &&
    typeof r.reframe === "string" &&
    typeof r.intention === "string" &&
    typeof r.practice === "string" &&
    r.created_at instanceof Date
  );
}

/**
 * Type guard to validate InsightSummaryRow structure
 */
function isInsightSummaryRow(row: unknown): row is InsightSummaryRow {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.summary === "string" &&
    typeof r.reflection_count === "number" &&
    r.generated_at instanceof Date
  );
}

/**
 * Type guard to validate AssumptionRow structure
 */
function isAssumptionRow(row: unknown): row is AssumptionRow {
  if (typeof row !== "object" || row === null) return false;
  const r = row as Record<string, unknown>;
  return (
    typeof r.assumption_label === "string" &&
    typeof r.count === "number" &&
    r.last_seen_at instanceof Date
  );
}

/**
 * Database row type for sessions table
 */
interface SessionRow {
  id: number;
  user_id: string;
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
  key_assumption: string | null;
  detected_state: string | null;
  anchor: string | null;
  created_at: Date;
}

/**
 * Database row type for insight_summaries table
 */
interface InsightSummaryRow {
  summary: string;
  reflection_count: number;
  generated_at: Date;
}

/**
 * Database row type for assumption_library table
 */
interface AssumptionRow {
  assumption_label: string;
  count: number;
  last_seen_at: Date;
}

/**
 * Represents a single reflection session stored in the database
 */
export interface SessionRecord {
  id: string;
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
  keyAssumption?: string;
  detectedState?: string;
  anchor?: string;
  userId: string;
  createdAt: Date;
}

export interface InsightSummary {
  summary: string;
  reflectionCount: number;
  generatedAt: Date;
}

export interface AssumptionEntry {
  assumptionLabel: string;
  count: number;
  lastSeenAt: Date;
}

export class Storage {
  async getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getOrCreateUser(userId: string, email?: string) {
    let [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          id: userId,
          email: email || null,
          subscriptionStatus: "free",
        })
        .returning();
    }

    return user;
  }

  /**
   * Get the number of reflections created today for a user
   * @param userId - The user's ID
   * @returns The count of reflections created today
   */
  async getTodayReflectionCount(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM sessions
      WHERE user_id = ${userId}
      AND DATE(created_at) = CURRENT_DATE
    `);
    const row = result.rows[0];
    if (!row || !isCountRow(row)) {
      return 0;
    }
    return parseInt(String(row.count || "0"), 10);
  }

  /**
   * Get reflection history for a user
   * @param userId - The user's ID
   * @param limit - Optional limit on number of records to return
   * @returns Array of session records ordered by creation date (newest first)
   */
  async getReflectionHistory(
    userId: string,
    limit?: number,
  ): Promise<SessionRecord[]> {
    const query = limit
      ? sql`SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`
      : sql`SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY created_at DESC`;

    const result = await db.execute(query);
    const records: SessionRecord[] = [];
    for (const row of result.rows) {
      if (isSessionRow(row)) {
        records.push({
          id: String(row.id),
          thought: row.thought,
          distortions: row.distortions,
          reframe: row.reframe,
          intention: row.intention,
          practice: row.practice,
          keyAssumption: row.key_assumption ?? undefined,
          detectedState: row.detected_state ?? undefined,
          anchor: row.anchor ?? undefined,
          userId: row.user_id,
          createdAt: row.created_at,
        });
      }
    }
    return records;
  }

  async saveReflection(
    userId: string,
    data: {
      thought: string;
      distortions: string[];
      reframe: string;
      intention: string;
      practice: string;
      keyAssumption?: string;
      detectedState?: string;
      anchor?: string;
    },
  ): Promise<void> {
    await db.execute(sql`
      INSERT INTO sessions (user_id, thought, distortions, reframe, intention, practice, key_assumption, detected_state, anchor)
      VALUES (${userId}, ${data.thought}, ${JSON.stringify(data.distortions)}, ${data.reframe}, ${data.intention}, ${data.practice}, ${data.keyAssumption || null}, ${data.detectedState || null}, ${data.anchor || null})
    `);

    if (data.keyAssumption) {
      await this.updateAssumptionLibrary(userId, data.keyAssumption);
    }
  }

  /**
   * Get the most recent reflections for a user
   * @param userId - The user's ID
   * @param count - Number of recent reflections to retrieve (default: 15)
   * @returns Array of session records ordered by creation date (newest first)
   */
  async getRecentReflections(
    userId: string,
    count: number = 15,
  ): Promise<SessionRecord[]> {
    const result = await db.execute(sql`
      SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${count}
    `);
    const records: SessionRecord[] = [];
    for (const row of result.rows) {
      if (isSessionRow(row)) {
        records.push({
          id: String(row.id),
          thought: row.thought,
          distortions: row.distortions,
          reframe: row.reframe,
          intention: row.intention,
          practice: row.practice,
          keyAssumption: row.key_assumption ?? undefined,
          detectedState: row.detected_state ?? undefined,
          anchor: row.anchor ?? undefined,
          userId: row.user_id,
          createdAt: row.created_at,
        });
      }
    }
    return records;
  }

  /**
   * Get the total number of reflections for a user
   * @param userId - The user's ID
   * @returns Total count of all reflections for the user
   */
  async getReflectionCount(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM sessions WHERE user_id = ${userId}
    `);
    const row = result.rows[0];
    if (!row || !isCountRow(row)) {
      return 0;
    }
    return parseInt(String(row.count || "0"), 10);
  }

  /**
   * Get the most recent insight summary for a user
   * @param userId - The user's ID
   * @returns The latest insight summary or null if none exists
   */
  async getLatestInsightSummary(
    userId: string,
  ): Promise<InsightSummary | null> {
    const result = await db.execute(sql`
      SELECT * FROM insight_summaries WHERE user_id = ${userId} ORDER BY generated_at DESC LIMIT 1
    `);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    if (!isInsightSummaryRow(row)) {
      return null;
    }
    return {
      summary: row.summary,
      reflectionCount: row.reflection_count,
      generatedAt: row.generated_at,
    };
  }

  async saveInsightSummary(
    userId: string,
    summary: string,
    reflectionCount: number,
  ): Promise<void> {
    await db.execute(sql`
      INSERT INTO insight_summaries (user_id, summary, reflection_count)
      VALUES (${userId}, ${summary}, ${reflectionCount})
    `);
  }

  async updateAssumptionLibrary(
    userId: string,
    assumption: string,
  ): Promise<void> {
    const existing = await db.execute(sql`
      SELECT * FROM assumption_library WHERE user_id = ${userId} AND assumption_label = ${assumption}
    `);

    if (existing.rows.length > 0) {
      await db.execute(sql`
        UPDATE assumption_library SET count = count + 1, last_seen_at = NOW()
        WHERE user_id = ${userId} AND assumption_label = ${assumption}
      `);
    } else {
      await db.execute(sql`
        INSERT INTO assumption_library (user_id, assumption_label, count, last_seen_at)
        VALUES (${userId}, ${assumption}, 1, NOW())
      `);
    }
  }

  /**
   * Get all tracked assumptions for a user
   * @param userId - The user's ID
   * @returns Array of assumption entries ordered by frequency and recency
   */
  async getAssumptionLibrary(userId: string): Promise<AssumptionEntry[]> {
    const result = await db.execute(sql`
      SELECT * FROM assumption_library WHERE user_id = ${userId} ORDER BY count DESC, last_seen_at DESC
    `);
    const entries: AssumptionEntry[] = [];
    for (const row of result.rows) {
      if (isAssumptionRow(row)) {
        entries.push({
          assumptionLabel: row.assumption_label,
          count: row.count,
          lastSeenAt: row.last_seen_at,
        });
      }
    }
    return entries;
  }

  // ==========================================================================
  // DATA RETENTION METHODS
  // ==========================================================================

  /**
   * Count reflections older than the cutoff date (for dry run mode).
   */
  async countExpiredReflections(cutoffDate: Date): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM sessions
      WHERE created_at < ${cutoffDate.toISOString()}
    `);
    const row = result.rows[0];
    if (!row || !isCountRow(row)) {
      return 0;
    }
    return parseInt(String(row.count || "0"), 10);
  }

  /**
   * Delete reflections older than the cutoff date.
   * Returns the number of deleted rows.
   */
  async deleteExpiredReflections(cutoffDate: Date): Promise<number> {
    const result = await db.execute(sql`
      DELETE FROM sessions 
      WHERE created_at < ${cutoffDate.toISOString()}
    `);
    return result.rowCount || 0;
  }

  /**
   * Count insight summaries older than the cutoff date (for dry run mode).
   */
  async countExpiredInsightSummaries(cutoffDate: Date): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM insight_summaries
      WHERE generated_at < ${cutoffDate.toISOString()}
    `);
    const row = result.rows[0];
    if (!row || !isCountRow(row)) {
      return 0;
    }
    return parseInt(String(row.count || "0"), 10);
  }

  /**
   * Delete insight summaries older than the cutoff date.
   * Returns the number of deleted rows.
   */
  async deleteExpiredInsightSummaries(cutoffDate: Date): Promise<number> {
    const result = await db.execute(sql`
      DELETE FROM insight_summaries 
      WHERE generated_at < ${cutoffDate.toISOString()}
    `);
    return result.rowCount || 0;
  }

  /**
   * Delete a single reflection by ID (must belong to the user).
   * Returns the number of deleted rows (0 or 1).
   */
  async deleteReflection(userId: string, sessionId: number): Promise<number> {
    const result = await db.execute(sql`
      DELETE FROM sessions
      WHERE id = ${sessionId} AND user_id = ${userId}
    `);
    return result.rowCount || 0;
  }

  /**
   * Delete all reflections for a specific user (GDPR right to be forgotten).
   */
  async deleteAllUserReflections(userId: string): Promise<number> {
    const result = await db.execute(sql`
      DELETE FROM sessions WHERE user_id = ${userId}
    `);
    return result.rowCount || 0;
  }

  /**
   * Delete all insight summaries for a specific user (GDPR right to be forgotten).
   */
  async deleteAllUserInsightSummaries(userId: string): Promise<number> {
    const result = await db.execute(sql`
      DELETE FROM insight_summaries WHERE user_id = ${userId}
    `);
    return result.rowCount || 0;
  }

  /**
   * Delete all assumptions for a specific user (GDPR right to be forgotten).
   */
  async deleteAllUserAssumptions(userId: string): Promise<number> {
    const result = await db.execute(sql`
      DELETE FROM assumption_library WHERE user_id = ${userId}
    `);
    return result.rowCount || 0;
  }
}

export const storage = new Storage();
