import type { Express, Request, Response } from "express";
import { db } from "../db";
import { quranMetadata, quranBookmarks } from "@shared/schema";
import { eq, and, like, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/error-handler";
import { cacheMiddleware, CACHE_TTL } from "../middleware/cache";
import {
  getSurahsSchema,
  getVersesSchema,
  searchVersesSchema,
  createBookmarkSchema,
  getBookmarksSchema,
  deleteBookmarkSchema,
} from "../validation/quran-validation";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import { encryptData, decryptData } from "../encryption";

/**
 * Quran API Routes
 *
 * Provides endpoints for:
 * - Fetching Quran metadata (surahs)
 * - Fetching verses by surah
 * - Full-text verse search
 * - User bookmarks (CRUD operations)
 *
 * Security:
 * - Bookmark notes are encrypted at rest
 * - Auth required for bookmark operations
 * - Input validation on all endpoints
 *
 * Performance:
 * - Caching for read-only data (surahs, verses)
 * - Pagination for large result sets
 */

/**
 * GET /api/quran/surahs
 *
 * Fetch all 114 surahs with metadata.
 * Cached for 24 hours (reference data rarely changes).
 *
 * Query params:
 * - revelationPlace (optional): Filter by "Makkah" or "Madinah"
 *
 * Response: 200 OK
 * {
 *   surahs: Array<{
 *     id: number,
 *     surahNumber: number,
 *     nameArabic: string,
 *     nameEnglish: string,
 *     versesCount: number,
 *     revelationPlace: string,
 *     orderInRevelation: number | null
 *   }>,
 *   total: number
 * }
 */
export function registerQuranRoutes(app: Express): void {
  app.get(
    "/api/quran/surahs",
    cacheMiddleware(CACHE_TTL.ONE_DAY),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate query params
      const validationResult = getSurahsSchema.safeParse(req.query);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid query parameters",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { revelationPlace } = validationResult.data;

      // Query database
      const whereClause = revelationPlace
        ? eq(quranMetadata.revelationPlace, revelationPlace)
        : undefined;

      const surahs = await db
        .select()
        .from(quranMetadata)
        .where(whereClause)
        .orderBy(quranMetadata.surahNumber);

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched surahs", {
        count: surahs.length,
        revelationPlace,
        durationMs: duration,
      });

      return res.json({
        surahs,
        total: surahs.length,
      });
    }),
  );

  /**
   * GET /api/quran/verses/:surahId
   *
   * Fetch verses for a specific surah.
   * Cached for 24 hours (reference data).
   *
   * Path params:
   * - surahId: Surah number (1-114)
   *
   * Query params:
   * - page (optional): Page number (default: 1)
   * - limit (optional): Results per page (default: 50, max: 100)
   *
   * NOTE: This endpoint returns verse metadata. The actual verse text
   * is stored client-side in SQLite for offline access.
   *
   * Response: 200 OK
   * {
   *   surah: { id, surahNumber, nameArabic, nameEnglish, versesCount, revelationPlace },
   *   verses: Array<{ verseNumber: number }>,
   *   pagination: { page, limit, total, totalPages }
   * }
   */
  app.get(
    "/api/quran/verses/:surahId",
    cacheMiddleware(
      CACHE_TTL.ONE_DAY,
      (req) => `cache:verses:${req.params.surahId}:${req.query.page || 1}`,
    ),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate params
      const validationResult = getVersesSchema.safeParse({
        surahId: req.params.surahId,
        ...req.query,
      });

      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid parameters",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { surahId, page, limit } = validationResult.data;

      // Fetch surah metadata
      const [surah] = await db
        .select()
        .from(quranMetadata)
        .where(eq(quranMetadata.surahNumber, surahId));

      if (!surah) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            createErrorResponse(
              HTTP_STATUS.NOT_FOUND,
              ERROR_CODES.NOT_FOUND,
              req.id,
              `Surah ${surahId} not found`,
            ),
          );
      }

      // Generate verse numbers for pagination
      const totalVerses = surah.versesCount;
      const offset = (page - 1) * limit;
      const verses = Array.from(
        { length: Math.min(limit, totalVerses - offset) },
        (_, i) => ({ verseNumber: offset + i + 1 }),
      );

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched verses", {
        surahId,
        page,
        limit,
        totalVerses,
        durationMs: duration,
      });

      return res.json({
        surah,
        verses,
        pagination: {
          page,
          limit,
          total: totalVerses,
          totalPages: Math.ceil(totalVerses / limit),
        },
      });
    }),
  );

  /**
   * GET /api/quran/search
   *
   * Full-text search for verses.
   * Cached for 1 hour (search queries may vary).
   *
   * Query params:
   * - q (required): Search query (min 2 chars)
   * - surahId (optional): Filter by surah number
   * - page (optional): Page number (default: 1)
   * - limit (optional): Results per page (default: 20, max: 50)
   *
   * NOTE: This is a placeholder endpoint. Full-text search will be
   * implemented client-side using SQLite FTS5 for offline capability.
   * Backend search will be added when verse text is migrated to PostgreSQL.
   *
   * Response: 200 OK
   * {
   *   results: Array<{ surahNumber, verseNumber, snippet }>,
   *   pagination: { page, limit, total, totalPages }
   * }
   */
  app.get(
    "/api/quran/search",
    cacheMiddleware(CACHE_TTL.ONE_HOUR),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate query params
      const validationResult = searchVersesSchema.safeParse(req.query);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid query parameters",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { q, surahId, page, limit } = validationResult.data;

      // Search is handled client-side using FTS5 in SQLite offline database
      // Verse text is not in PostgreSQL, so server search is not feasible
      const duration = Date.now() - startTime;

      req.logger?.info("Search request", {
        query: q,
        surahId,
        page,
        limit,
        durationMs: duration,
      });

      return res.json({
        results: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        message:
          "Verse text search will be available in the next release. Use client-side search for now.",
      });
    }),
  );

  /**
   * POST /api/quran/bookmarks
   *
   * Create a new bookmark for the authenticated user.
   * Notes are encrypted before storage.
   *
   * Auth: Required
   *
   * Body:
   * {
   *   surahNumber: number (1-114),
   *   verseNumber: number,
   *   note?: string (max 1000 chars)
   * }
   *
   * Response: 201 CREATED
   * {
   *   bookmark: { id, surahNumber, verseNumber, note, createdAt }
   * }
   */
  app.post(
    "/api/quran/bookmarks",
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate body
      const validationResult = createBookmarkSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid bookmark data",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { surahNumber, verseNumber, note } = validationResult.data;
      const userId = req.auth!.userId;

      // Verify surah exists and verse number is valid
      const [surah] = await db
        .select()
        .from(quranMetadata)
        .where(eq(quranMetadata.surahNumber, surahNumber));

      if (!surah) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            createErrorResponse(
              HTTP_STATUS.NOT_FOUND,
              ERROR_CODES.NOT_FOUND,
              req.id,
              `Surah ${surahNumber} not found`,
            ),
          );
      }

      if (verseNumber > surah.versesCount) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.INVALID_INPUT,
              req.id,
              `Verse ${verseNumber} exceeds surah ${surahNumber} verse count (${surah.versesCount})`,
            ),
          );
      }

      // Check for duplicate bookmark
      const [existingBookmark] = await db
        .select()
        .from(quranBookmarks)
        .where(
          and(
            eq(quranBookmarks.userId, userId),
            eq(quranBookmarks.surahNumber, surahNumber),
            eq(quranBookmarks.verseNumber, verseNumber),
          ),
        );

      if (existingBookmark) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .json(
            createErrorResponse(
              HTTP_STATUS.CONFLICT,
              ERROR_CODES.DUPLICATE_RESOURCE,
              req.id,
              "Bookmark already exists for this verse",
            ),
          );
      }

      // Encrypt note if provided
      let encryptedNote: string | null = null;
      if (note) {
        try {
          encryptedNote = encryptData(note);
        } catch (error) {
          req.logger?.error("Failed to encrypt bookmark note", error);
          return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json(
              createErrorResponse(
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
                ERROR_CODES.INTERNAL_ERROR,
                req.id,
                "Failed to secure bookmark data",
              ),
            );
        }
      }

      // Create bookmark
      const [bookmark] = await db
        .insert(quranBookmarks)
        .values({
          userId,
          surahNumber,
          verseNumber,
          note: encryptedNote,
        })
        .returning();

      // Decrypt note for response
      let decryptedNote: string | null = null;
      if (bookmark.note) {
        try {
          decryptedNote = decryptData(bookmark.note);
        } catch (error) {
          req.logger?.error("Failed to decrypt bookmark note", error);
        }
      }

      const duration = Date.now() - startTime;

      req.logger?.info("Created bookmark", {
        bookmarkId: bookmark.id,
        surahNumber,
        verseNumber,
        durationMs: duration,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        bookmark: {
          ...bookmark,
          note: decryptedNote,
        },
      });
    }),
  );

  /**
   * GET /api/quran/bookmarks
   *
   * Fetch bookmarks for the authenticated user.
   *
   * Auth: Required
   *
   * Query params:
   * - surahNumber (optional): Filter by surah
   * - page (optional): Page number (default: 1)
   * - limit (optional): Results per page (default: 50, max: 100)
   *
   * Response: 200 OK
   * {
   *   bookmarks: Array<{ id, surahNumber, verseNumber, note, createdAt }>,
   *   pagination: { page, limit, total, totalPages }
   * }
   */
  app.get(
    "/api/quran/bookmarks",
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate query params
      const validationResult = getBookmarksSchema.safeParse(req.query);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid query parameters",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { surahNumber, page, limit } = validationResult.data;
      const userId = req.auth!.userId;

      // Build where clause
      const whereClause = surahNumber
        ? and(
            eq(quranBookmarks.userId, userId),
            eq(quranBookmarks.surahNumber, surahNumber),
          )
        : eq(quranBookmarks.userId, userId);

      // Fetch bookmarks with pagination
      const offset = (page - 1) * limit;
      const bookmarks = await db
        .select()
        .from(quranBookmarks)
        .where(whereClause)
        .orderBy(quranBookmarks.createdAt)
        .limit(limit)
        .offset(offset);

      // Count total bookmarks
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(quranBookmarks)
        .where(whereClause);

      // Decrypt notes
      const decryptedBookmarks = bookmarks.map((bookmark) => {
        let decryptedNote: string | null = null;
        if (bookmark.note) {
          try {
            decryptedNote = decryptData(bookmark.note);
          } catch (error) {
            req.logger?.error("Failed to decrypt bookmark note", error, {
              bookmarkId: bookmark.id,
            });
          }
        }

        return {
          ...bookmark,
          note: decryptedNote,
        };
      });

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched bookmarks", {
        count: bookmarks.length,
        total: count,
        surahNumber,
        durationMs: duration,
      });

      return res.json({
        bookmarks: decryptedBookmarks,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    }),
  );

  /**
   * DELETE /api/quran/bookmarks/:id
   *
   * Delete a bookmark for the authenticated user.
   *
   * Auth: Required
   *
   * Path params:
   * - id: Bookmark ID
   *
   * Response: 204 NO CONTENT
   */
  app.delete(
    "/api/quran/bookmarks/:id",
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate params
      const validationResult = deleteBookmarkSchema.safeParse(req.params);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid bookmark ID",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { id } = validationResult.data;
      const userId = req.auth!.userId;

      // Check if bookmark exists and belongs to user
      const [bookmark] = await db
        .select()
        .from(quranBookmarks)
        .where(
          and(eq(quranBookmarks.id, id), eq(quranBookmarks.userId, userId)),
        );

      if (!bookmark) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            createErrorResponse(
              HTTP_STATUS.NOT_FOUND,
              ERROR_CODES.NOT_FOUND,
              req.id,
              "Bookmark not found or does not belong to you",
            ),
          );
      }

      // Delete bookmark
      await db.delete(quranBookmarks).where(eq(quranBookmarks.id, id));

      const duration = Date.now() - startTime;

      req.logger?.info("Deleted bookmark", {
        bookmarkId: id,
        durationMs: duration,
      });

      return res.status(HTTP_STATUS.NO_CONTENT).send();
    }),
  );
}
