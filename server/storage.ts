import { db } from './db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

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
      [user] = await db.insert(users).values({
        id: userId,
        email: email || null,
        subscriptionStatus: 'free',
      }).returning();
    }
    
    return user;
  }

  async getTodayReflectionCount(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM sessions 
      WHERE user_id = ${userId} 
      AND DATE(created_at) = CURRENT_DATE
    `);
    return parseInt((result.rows[0] as any)?.count || '0', 10);
  }

  async getReflectionHistory(userId: string, limit?: number): Promise<SessionRecord[]> {
    const query = limit 
      ? sql`SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`
      : sql`SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY created_at DESC`;
    
    const result = await db.execute(query);
    return result.rows.map((row: any) => ({
      id: row.id,
      thought: row.thought,
      distortions: row.distortions,
      reframe: row.reframe,
      intention: row.intention,
      practice: row.practice,
      keyAssumption: row.key_assumption,
      detectedState: row.detected_state,
      anchor: row.anchor,
      userId: row.user_id,
      createdAt: row.created_at,
    }));
  }

  async saveReflection(userId: string, data: {
    thought: string;
    distortions: string[];
    reframe: string;
    intention: string;
    practice: string;
    keyAssumption?: string;
    detectedState?: string;
    anchor?: string;
  }): Promise<void> {
    await db.execute(sql`
      INSERT INTO sessions (user_id, thought, distortions, reframe, intention, practice, key_assumption, detected_state, anchor)
      VALUES (${userId}, ${data.thought}, ${JSON.stringify(data.distortions)}, ${data.reframe}, ${data.intention}, ${data.practice}, ${data.keyAssumption || null}, ${data.detectedState || null}, ${data.anchor || null})
    `);

    if (data.keyAssumption) {
      await this.updateAssumptionLibrary(userId, data.keyAssumption);
    }
  }

  async getRecentReflections(userId: string, count: number = 15): Promise<SessionRecord[]> {
    const result = await db.execute(sql`
      SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${count}
    `);
    return result.rows.map((row: any) => ({
      id: row.id,
      thought: row.thought,
      distortions: row.distortions,
      reframe: row.reframe,
      intention: row.intention,
      practice: row.practice,
      keyAssumption: row.key_assumption,
      detectedState: row.detected_state,
      anchor: row.anchor,
      userId: row.user_id,
      createdAt: row.created_at,
    }));
  }

  async getReflectionCount(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM sessions WHERE user_id = ${userId}
    `);
    return parseInt((result.rows[0] as any)?.count || '0', 10);
  }

  async getLatestInsightSummary(userId: string): Promise<InsightSummary | null> {
    const result = await db.execute(sql`
      SELECT * FROM insight_summaries WHERE user_id = ${userId} ORDER BY generated_at DESC LIMIT 1
    `);
    if (result.rows.length === 0) return null;
    const row = result.rows[0] as any;
    return {
      summary: row.summary,
      reflectionCount: row.reflection_count,
      generatedAt: row.generated_at,
    };
  }

  async saveInsightSummary(userId: string, summary: string, reflectionCount: number): Promise<void> {
    await db.execute(sql`
      INSERT INTO insight_summaries (user_id, summary, reflection_count)
      VALUES (${userId}, ${summary}, ${reflectionCount})
    `);
  }

  async updateAssumptionLibrary(userId: string, assumption: string): Promise<void> {
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

  async getAssumptionLibrary(userId: string): Promise<AssumptionEntry[]> {
    const result = await db.execute(sql`
      SELECT * FROM assumption_library WHERE user_id = ${userId} ORDER BY count DESC, last_seen_at DESC
    `);
    return result.rows.map((row: any) => ({
      assumptionLabel: row.assumption_label,
      count: row.count,
      lastSeenAt: row.last_seen_at,
    }));
  }
}

export const storage = new Storage();
