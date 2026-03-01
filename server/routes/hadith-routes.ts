import type { Express, Request, Response } from "express";
import { db } from "../db";
import { hadithCollections, hadiths } from "@shared/schema";
import { eq, like, or, sql, and } from "drizzle-orm";
import { asyncHandler } from "../middleware/error-handler";
import { cacheMiddleware, CACHE_TTL } from "../middleware/cache";
import {
  getHadithsByCollectionSchema,
  searchHadithsSchema,
  getHadithByIdSchema,
} from "../validation/hadith-validation";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";

/**
 * Hadith API Routes
 *
 * Provides endpoints for:
 * - Fetching hadith collections metadata
 * - Fetching hadiths by collection with optional grade filtering
 * - Full-text search across hadith texts (Arabic and English)
 * - Daily hadith (deterministic based on current date)
 * - Individual hadith lookup by ID
 *
 * Security:
 * - All endpoints are public (reference data)
 * - Input validation on all endpoints
 *
 * Performance:
 * - Caching for read-only reference data
 * - Pagination for large result sets
 *
 * IMPORTANT: Routes are registered in order of specificity to avoid conflicts.
 * Specific routes (collections, search, daily, detail) must come before
 * the parameterized route (:collectionId).
 */
export function registerHadithRoutes(app: Express): void {
  /**
   * GET /api/hadith/collections
   *
   * Fetch all hadith collections with metadata.
   * Cached for 24 hours (reference data rarely changes).
   *
   * Response: 200 OK
   * {
   *   collections: Array<{
   *     id: string,
   *     name: string,
   *     nameArabic: string,
   *     compiler: string,
   *     description: string,
   *     totalHadiths: number
   *   }>,
   *   total: number
   * }
   */
  app.get(
    "/api/hadith/collections",
    cacheMiddleware(CACHE_TTL.ONE_DAY),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      const collections = await db
        .select()
        .from(hadithCollections)
        .orderBy(hadithCollections.id);

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched hadith collections", {
        count: collections.length,
        durationMs: duration,
      });

      return res.json({
        collections,
        total: collections.length,
      });
    }),
  );

  /**
   * GET /api/hadith/search
   *
   * Full-text search for hadiths across all collections.
   * Searches in both Arabic and English text fields.
   * Cached for 1 hour.
   *
   * Query params:
   * - q (required): Search query (min 2 chars)
   * - limit (optional): Results per page (default: 20, max: 50)
   * - offset (optional): Starting position (default: 0)
   *
   * Response: 200 OK
   * {
   *   results: Array<{ id, collectionId, bookNumber, hadithNumber, narrator, textArabic, textEnglish, grade }>,
   *   pagination: { limit, offset, total, hasMore }
   * }
   */
  app.get(
    "/api/hadith/search",
    cacheMiddleware(CACHE_TTL.ONE_HOUR),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate query params
      const validationResult = searchHadithsSchema.safeParse(req.query);
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

      const { q, limit, offset } = validationResult.data;

      // Search in both Arabic and English text fields
      const searchPattern = `%${q}%`;
      const results = await db
        .select()
        .from(hadiths)
        .where(
          or(
            like(hadiths.textEnglish, searchPattern),
            like(hadiths.textArabic, searchPattern),
            like(hadiths.narrator, searchPattern),
          ),
        )
        .orderBy(hadiths.collectionId, hadiths.hadithNumber)
        .limit(limit)
        .offset(offset);

      // Count total results
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(hadiths)
        .where(
          or(
            like(hadiths.textEnglish, searchPattern),
            like(hadiths.textArabic, searchPattern),
            like(hadiths.narrator, searchPattern),
          ),
        );

      const duration = Date.now() - startTime;

      req.logger?.info("Searched hadiths", {
        query: q,
        limit,
        offset,
        count: results.length,
        total: count,
        durationMs: duration,
      });

      return res.json({
        results,
        pagination: {
          limit,
          offset,
          total: count,
          hasMore: offset + limit < count,
        },
      });
    }),
  );

  /**
   * GET /api/hadith/daily
   *
   * Return a deterministic "daily hadith" based on the current date.
   * Uses a hash of the current date to select from all hadiths.
   * Cached for 1 hour.
   *
   * Response: 200 OK
   * {
   *   hadith: { id, collectionId, bookNumber, hadithNumber, narrator, textArabic, textEnglish, grade, chapter, reference },
   *   date: string (ISO 8601)
   * }
   */
  app.get(
    "/api/hadith/daily",
    cacheMiddleware(CACHE_TTL.ONE_HOUR),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Get total count of hadiths
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(hadiths);

      if (count === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            createErrorResponse(
              HTTP_STATUS.NOT_FOUND,
              ERROR_CODES.NOT_FOUND,
              req.id,
              "No hadiths available",
            ),
          );
      }

      // Calculate deterministic offset based on current date
      const now = new Date();
      const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD

      // Simple hash function for date string
      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        hash = (hash << 5) - hash + dateString.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }

      // Use absolute value and modulo to get a valid offset
      const offset = Math.abs(hash) % count;

      // Fetch the hadith at the calculated offset
      const [hadith] = await db
        .select()
        .from(hadiths)
        .orderBy(hadiths.id)
        .limit(1)
        .offset(offset);

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched daily hadith", {
        date: dateString,
        hadithId: hadith.id,
        offset,
        durationMs: duration,
      });

      return res.json({
        hadith,
        date: dateString,
      });
    }),
  );

  /**
   * GET /api/hadith/detail/:id
   *
   * Fetch a single hadith by its ID.
   * Cached for 24 hours (reference data).
   *
   * Path params:
   * - id: Hadith ID (e.g., "bukhari-1", "muslim-55")
   *
   * Response: 200 OK
   * {
   *   hadith: { id, collectionId, bookNumber, hadithNumber, narrator, textArabic, textEnglish, grade, chapter, reference }
   * }
   */
  app.get(
    "/api/hadith/detail/:id",
    cacheMiddleware(
      CACHE_TTL.ONE_DAY,
      (req) => `cache:hadith:detail:${req.params.id}`,
    ),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate params
      const validationResult = getHadithByIdSchema.safeParse(req.params);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid hadith ID",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { id } = validationResult.data;

      // Fetch hadith
      const [hadith] = await db
        .select()
        .from(hadiths)
        .where(eq(hadiths.id, id));

      if (!hadith) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            createErrorResponse(
              HTTP_STATUS.NOT_FOUND,
              ERROR_CODES.NOT_FOUND,
              req.id,
              `Hadith '${id}' not found`,
            ),
          );
      }

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched hadith by ID", {
        hadithId: id,
        collectionId: hadith.collectionId,
        durationMs: duration,
      });

      return res.json({
        hadith,
      });
    }),
  );

  /**
   * GET /api/hadith/:collectionId
   *
   * IMPORTANT: This route must be registered LAST to avoid conflicts with
   * /api/hadith/collections, /api/hadith/search, /api/hadith/daily, /api/hadith/detail/:id
   *
   * Fetch hadiths for a specific collection with optional grade filtering.
   * Cached for 24 hours (reference data).
   *
   * Path params:
   * - collectionId: Collection ID (e.g., "bukhari", "muslim")
   *
   * Query params:
   * - grade (optional): Filter by authenticity grade ("Sahih", "Hasan", "Da'if")
   * - limit (optional): Results per page (default: 50, max: 100)
   * - offset (optional): Starting position (default: 0)
   *
   * Response: 200 OK
   * {
   *   collection: { id, name, nameArabic, compiler, description, totalHadiths },
   *   hadiths: Array<{ id, bookNumber, hadithNumber, narrator, textArabic, textEnglish, grade, chapter, reference }>,
   *   pagination: { limit, offset, total, hasMore }
   * }
   */
  app.get(
    "/api/hadith/:collectionId",
    cacheMiddleware(
      CACHE_TTL.ONE_DAY,
      (req) =>
        `cache:hadith:collection:${req.params.collectionId}:${req.query.grade || "all"}:${req.query.offset || 0}`,
    ),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate params and query
      const validationResult = getHadithsByCollectionSchema.safeParse({
        collectionId: req.params.collectionId,
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

      const { collectionId, grade, limit, offset } = validationResult.data;

      // Fetch collection metadata
      const [collection] = await db
        .select()
        .from(hadithCollections)
        .where(eq(hadithCollections.id, collectionId));

      if (!collection) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(
            createErrorResponse(
              HTTP_STATUS.NOT_FOUND,
              ERROR_CODES.NOT_FOUND,
              req.id,
              `Collection '${collectionId}' not found`,
            ),
          );
      }

      // Build where clause
      const whereClause = grade
        ? and(eq(hadiths.collectionId, collectionId), eq(hadiths.grade, grade))
        : eq(hadiths.collectionId, collectionId);

      // Fetch hadiths with pagination
      const hadithList = await db
        .select()
        .from(hadiths)
        .where(whereClause)
        .orderBy(hadiths.hadithNumber)
        .limit(limit)
        .offset(offset);

      // Count total hadiths
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(hadiths)
        .where(whereClause);

      const duration = Date.now() - startTime;

      req.logger?.info("Fetched hadiths for collection", {
        collectionId,
        grade,
        limit,
        offset,
        count: hadithList.length,
        total: count,
        durationMs: duration,
      });

      return res.json({
        collection,
        hadiths: hadithList,
        pagination: {
          limit,
          offset,
          total: count,
          hasMore: offset + limit < count,
        },
      });
    }),
  );
}
