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
  userId: string;
  createdAt: Date;
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
  }): Promise<void> {
    await db.execute(sql`
      INSERT INTO sessions (user_id, thought, distortions, reframe, intention, practice)
      VALUES (${userId}, ${data.thought}, ${JSON.stringify(data.distortions)}, ${data.reframe}, ${data.intention}, ${data.practice})
    `);
  }
}

export const storage = new Storage();
