/**
 * Prayer Preferences API Routes
 *
 * Provides endpoints for managing user prayer preferences including:
 * - Calculation method selection
 * - Madhab preference
 * - Location data for prayer time calculation
 * - Notification settings
 *
 * Security:
 * - All endpoints require authentication
 * - Location data is stored as-is (encryption handled at DB level if needed)
 * - User can only access their own preferences
 */

import type { Express, Request, Response } from "express";
import { db } from "../db";
import { prayerPreferences, userProgress } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error-handler";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import {
  updatePreferencesSchema,
  trackPrayerSchema,
} from "../validation/prayer-validation";

export function registerPrayerRoutes(app: Express): void {
  /**
   * GET /api/prayer/preferences
   *
   * Fetch prayer preferences for the authenticated user.
   * Returns default values if no preferences have been set yet.
   *
   * Auth: Required
   *
   * Response: 200 OK
   * {
   *   preferences: {
   *     calculationMethod: string,
   *     madhab: string,
   *     notificationsEnabled: boolean,
   *     latitude: number | null,
   *     longitude: number | null,
   *     locationName: string | null,
   *     updatedAt: string
   *   }
   * }
   */
  app.get(
    "/api/prayer/preferences",
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth!.userId;

      const [prefs] = await db
        .select()
        .from(prayerPreferences)
        .where(eq(prayerPreferences.userId, userId));

      if (!prefs) {
        // Return defaults if no preferences set
        return res.json({
          preferences: {
            calculationMethod: "MWL",
            madhab: "Shafi",
            notificationsEnabled: true,
            latitude: null,
            longitude: null,
            locationName: null,
            updatedAt: null,
          },
        });
      }

      return res.json({
        preferences: {
          calculationMethod: prefs.calculationMethod,
          madhab: prefs.madhab,
          notificationsEnabled: prefs.notificationsEnabled,
          latitude: prefs.latitude,
          longitude: prefs.longitude,
          locationName: prefs.locationName,
          updatedAt: prefs.updatedAt,
        },
      });
    }),
  );

  /**
   * PUT /api/prayer/preferences
   *
   * Update prayer preferences for the authenticated user.
   * Creates preferences if they don't exist (upsert).
   *
   * Auth: Required
   *
   * Body (all fields optional):
   * {
   *   calculationMethod?: string,
   *   madhab?: string,
   *   notificationsEnabled?: boolean,
   *   latitude?: number,
   *   longitude?: number,
   *   locationName?: string
   * }
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   preferences: { ... }
   * }
   */
  app.put(
    "/api/prayer/preferences",
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth!.userId;

      // Validate body
      const validationResult = updatePreferencesSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid preference data",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const data = validationResult.data;

      // Upsert preferences
      const [updated] = await db
        .insert(prayerPreferences)
        .values({
          userId,
          calculationMethod: data.calculationMethod || "MWL",
          madhab: data.madhab || "Shafi",
          notificationsEnabled: data.notificationsEnabled ?? true,
          latitude: data.latitude,
          longitude: data.longitude,
          locationName: data.locationName,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: prayerPreferences.userId,
          set: {
            ...(data.calculationMethod && {
              calculationMethod: data.calculationMethod,
            }),
            ...(data.madhab && { madhab: data.madhab }),
            ...(data.notificationsEnabled !== undefined && {
              notificationsEnabled: data.notificationsEnabled,
            }),
            ...(data.latitude !== undefined && { latitude: data.latitude }),
            ...(data.longitude !== undefined && { longitude: data.longitude }),
            ...(data.locationName !== undefined && {
              locationName: data.locationName,
            }),
            updatedAt: new Date(),
          },
        })
        .returning();

      req.logger?.info("Updated prayer preferences", {
        userId,
        calculationMethod: updated.calculationMethod,
      });

      return res.json({
        success: true,
        preferences: {
          calculationMethod: updated.calculationMethod,
          madhab: updated.madhab,
          notificationsEnabled: updated.notificationsEnabled,
          latitude: updated.latitude,
          longitude: updated.longitude,
          locationName: updated.locationName,
          updatedAt: updated.updatedAt,
        },
      });
    }),
  );

  /**
   * POST /api/prayer/track
   *
   * Track that a user checked or completed a prayer.
   * Updates the user's prayer_times_checked progress counter.
   *
   * Auth: Required
   *
   * Body:
   * {
   *   prayerName: "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha",
   *   onTime: boolean
   * }
   *
   * Response: 200 OK
   * { success: true }
   */
  app.post(
    "/api/prayer/track",
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const userId = req.auth!.userId;

      const validationResult = trackPrayerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid tracking data",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      // Update prayer check count in user progress
      await db
        .insert(userProgress)
        .values({
          userId,
          prayerTimesChecked: 1,
          lastActiveDate: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProgress.userId,
          set: {
            prayerTimesChecked: sql`${userProgress.prayerTimesChecked} + 1`,
            lastActiveDate: new Date(),
            updatedAt: new Date(),
          },
        });

      req.logger?.info("Tracked prayer", {
        userId,
        prayerName: validationResult.data.prayerName,
        onTime: validationResult.data.onTime,
      });

      return res.json({ success: true });
    }),
  );
}
