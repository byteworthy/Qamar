/**
 * User Progress API Routes
 *
 * Provides endpoints for tracking user progress across all features:
 * - Quran verses read
 * - Arabic words learned
 * - Prayer times checked
 * - Reflection sessions completed
 * - Streak tracking
 *
 * Security:
 * - All endpoints require authentication
 * - Users can only access their own progress data
 */

import type { Express, Request, Response } from 'express';
import { db } from '../db';
import { userProgress } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/error-handler';
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from '../types/error-response';
import { trackProgressSchema } from '../validation/progress-validation';

export function registerProgressRoutes(app: Express): void {
  /**
   * GET /api/progress
   *
   * Fetch progress summary for the authenticated user.
   * Returns all aggregated stats and current streak.
   *
   * Auth: Required
   *
   * Response: 200 OK
   * {
   *   progress: {
   *     quranVersesRead: number,
   *     arabicWordsLearned: number,
   *     prayerTimesChecked: number,
   *     reflectionSessionsCompleted: number,
   *     streakDays: number,
   *     lastActiveDate: string | null,
   *     updatedAt: string | null
   *   }
   * }
   */
  app.get(
    '/api/progress',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth!.userId;

      const [progress] = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      if (!progress) {
        // Return zero-state for new users
        return res.json({
          progress: {
            quranVersesRead: 0,
            arabicWordsLearned: 0,
            prayerTimesChecked: 0,
            reflectionSessionsCompleted: 0,
            streakDays: 0,
            lastActiveDate: null,
            updatedAt: null,
          },
        });
      }

      // Calculate streak: check if user was active yesterday or today
      const now = new Date();
      const lastActive = progress.lastActiveDate ? new Date(progress.lastActiveDate) : null;
      let streakDays = progress.streakDays || 0;

      if (lastActive) {
        const daysSinceActive = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        // If more than 1 day gap, reset streak
        if (daysSinceActive > 1) {
          streakDays = 0;
          // Update in database
          await db
            .update(userProgress)
            .set({ streakDays: 0, updatedAt: new Date() })
            .where(eq(userProgress.userId, userId));
        }
      }

      return res.json({
        progress: {
          quranVersesRead: progress.quranVersesRead || 0,
          arabicWordsLearned: progress.arabicWordsLearned || 0,
          prayerTimesChecked: progress.prayerTimesChecked || 0,
          reflectionSessionsCompleted: progress.reflectionSessionsCompleted || 0,
          streakDays,
          lastActiveDate: progress.lastActiveDate,
          updatedAt: progress.updatedAt,
        },
      });
    })
  );

  /**
   * POST /api/progress/track
   *
   * Track a progress event for the authenticated user.
   * Increments the appropriate counter and updates streak.
   *
   * Auth: Required
   *
   * Body:
   * {
   *   type: "quran_verse_read" | "arabic_word_learned" | "prayer_time_checked" | "reflection_completed",
   *   count?: number (default: 1)
   * }
   *
   * Response: 200 OK
   * { success: true, progress: { ... } }
   */
  app.post(
    '/api/progress/track',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth!.userId;

      const validationResult = trackProgressSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_FAILED,
            req.id,
            'Invalid tracking data',
            { validationErrors: validationResult.error.issues }
          )
        );
      }

      const { type, count } = validationResult.data;
      const now = new Date();

      // Map type to column
      const columnMap: Record<string, string> = {
        quran_verse_read: 'quranVersesRead',
        arabic_word_learned: 'arabicWordsLearned',
        prayer_time_checked: 'prayerTimesChecked',
        reflection_completed: 'reflectionSessionsCompleted',
      };

      const columnName = columnMap[type];

      // Calculate streak increment
      // Check if user was already active today
      const [existing] = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      let streakIncrement = 0;
      if (existing?.lastActiveDate) {
        const lastActive = new Date(existing.lastActiveDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastActiveDay = new Date(
          lastActive.getFullYear(),
          lastActive.getMonth(),
          lastActive.getDate()
        );

        const daysDiff = Math.floor(
          (today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Consecutive day - increment streak
          streakIncrement = 1;
        } else if (daysDiff > 1) {
          // Gap in streak - will be reset below
          streakIncrement = -(existing.streakDays || 0) + 1; // Reset to 1
        }
        // daysDiff === 0 means same day, no streak change
      } else {
        // First activity ever
        streakIncrement = 1;
      }

      // Build the set object for upsert
      const baseValues: Record<string, unknown> = {
        userId,
        lastActiveDate: now,
        updatedAt: now,
      };

      // Set initial values based on type
      if (type === 'quran_verse_read') baseValues.quranVersesRead = count;
      else if (type === 'arabic_word_learned') baseValues.arabicWordsLearned = count;
      else if (type === 'prayer_time_checked') baseValues.prayerTimesChecked = count;
      else if (type === 'reflection_completed') baseValues.reflectionSessionsCompleted = count;

      if (!existing) {
        baseValues.streakDays = 1;
      }

      // Upsert with column-specific increment
      const updateSet: Record<string, unknown> = {
        lastActiveDate: now,
        updatedAt: now,
      };

      // Increment the specific counter
      if (type === 'quran_verse_read') {
        updateSet.quranVersesRead = sql`${userProgress.quranVersesRead} + ${count}`;
      } else if (type === 'arabic_word_learned') {
        updateSet.arabicWordsLearned = sql`${userProgress.arabicWordsLearned} + ${count}`;
      } else if (type === 'prayer_time_checked') {
        updateSet.prayerTimesChecked = sql`${userProgress.prayerTimesChecked} + ${count}`;
      } else if (type === 'reflection_completed') {
        updateSet.reflectionSessionsCompleted = sql`${userProgress.reflectionSessionsCompleted} + ${count}`;
      }

      // Update streak
      if (streakIncrement !== 0) {
        updateSet.streakDays = sql`GREATEST(0, ${userProgress.streakDays} + ${streakIncrement})`;
      }

      await db
        .insert(userProgress)
        .values(baseValues as typeof userProgress.$inferInsert)
        .onConflictDoUpdate({
          target: userProgress.userId,
          set: updateSet,
        });

      // Fetch updated progress
      const [updated] = await db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId));

      req.logger?.info('Tracked progress', {
        userId,
        type,
        count,
      });

      return res.json({
        success: true,
        progress: updated ? {
          quranVersesRead: updated.quranVersesRead || 0,
          arabicWordsLearned: updated.arabicWordsLearned || 0,
          prayerTimesChecked: updated.prayerTimesChecked || 0,
          reflectionSessionsCompleted: updated.reflectionSessionsCompleted || 0,
          streakDays: updated.streakDays || 0,
          lastActiveDate: updated.lastActiveDate,
        } : null,
      });
    })
  );
}
