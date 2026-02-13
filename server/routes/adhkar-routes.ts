import type { Express, Request, Response } from 'express';
import { db } from '../db';
import { adhkar } from '@shared/schema';
import { eq, like, or, sql } from 'drizzle-orm';
import { asyncHandler } from '../middleware/error-handler';
import { cacheMiddleware, CACHE_TTL } from '../middleware/cache';
import {
  getAdhkarByCategorySchema,
  searchAdhkarSchema,
} from '../validation/adhkar-validation';
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from '../types/error-response';

/**
 * Adhkar API Routes
 *
 * Provides endpoints for:
 * - Fetching adhkar with optional category filtering
 * - Listing all distinct categories
 * - Full-text search across adhkar texts (translation and transliteration)
 * - Daily adhkar (deterministic based on current date)
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
 * Specific routes (categories, search, daily) must come before the parameterized route.
 */
export function registerAdhkarRoutes(app: Express): void {
  /**
   * GET /api/adhkar/categories
   *
   * Fetch all distinct category names.
   * Cached for 24 hours (reference data rarely changes).
   *
   * Response: 200 OK
   * {
   *   categories: Array<string>,
   *   total: number
   * }
   */
  app.get(
    '/api/adhkar/categories',
    cacheMiddleware(CACHE_TTL.ONE_DAY),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Get distinct categories
      const results = await db
        .selectDistinct({ category: adhkar.category })
        .from(adhkar)
        .orderBy(adhkar.category);

      const categories = results.map((r) => r.category);

      const duration = Date.now() - startTime;

      req.logger?.info('Fetched adhkar categories', {
        count: categories.length,
        durationMs: duration,
      });

      return res.json({
        categories,
        total: categories.length,
      });
    })
  );

  /**
   * GET /api/adhkar/search
   *
   * Full-text search for adhkar across translation and transliteration.
   * Cached for 1 hour.
   *
   * Query params:
   * - q (required): Search query (min 1 char)
   * - limit (optional): Results per page (default: 20, max: 50)
   * - offset (optional): Starting position (default: 0)
   *
   * Response: 200 OK
   * {
   *   results: Array<{ id, category, arabic, transliteration, translation, reference, repetitions, virtue }>,
   *   pagination: { limit, offset, total, hasMore }
   * }
   */
  app.get(
    '/api/adhkar/search',
    cacheMiddleware(CACHE_TTL.ONE_HOUR),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate query params
      const validationResult = searchAdhkarSchema.safeParse(req.query);
      if (!validationResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_FAILED,
            req.id,
            'Invalid query parameters',
            { validationErrors: validationResult.error.issues }
          )
        );
      }

      const { q, limit, offset } = validationResult.data;

      // Search in translation, transliteration, and arabic fields
      const searchPattern = `%${q}%`;
      const results = await db
        .select()
        .from(adhkar)
        .where(
          or(
            like(adhkar.translation, searchPattern),
            like(adhkar.transliteration, searchPattern),
            like(adhkar.arabic, searchPattern)
          )
        )
        .orderBy(adhkar.category, adhkar.id)
        .limit(limit)
        .offset(offset);

      // Count total results
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(adhkar)
        .where(
          or(
            like(adhkar.translation, searchPattern),
            like(adhkar.transliteration, searchPattern),
            like(adhkar.arabic, searchPattern)
          )
        );

      const duration = Date.now() - startTime;

      req.logger?.info('Searched adhkar', {
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
    })
  );

  /**
   * GET /api/adhkar/daily
   *
   * Return a deterministic "daily adhkar" selection based on the current date.
   * Uses a hash of the current date to select 3-5 adhkar items.
   * Cached for 1 hour.
   *
   * Response: 200 OK
   * {
   *   adhkar: Array<{ id, category, arabic, transliteration, translation, reference, repetitions, virtue }>,
   *   date: string (ISO 8601),
   *   count: number
   * }
   */
  app.get(
    '/api/adhkar/daily',
    cacheMiddleware(CACHE_TTL.ONE_HOUR),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Get total count of adhkar
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(adhkar);

      if (count === 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createErrorResponse(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            req.id,
            'No adhkar available'
          )
        );
      }

      // Calculate deterministic count and offset based on current date
      const now = new Date();
      const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD

      // Simple hash function for date string
      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }

      // Use absolute value to ensure positive
      const absHash = Math.abs(hash);

      // Determine count (3-5 items) based on date hash
      const dailyCount = 3 + (absHash % 3); // Results in 3, 4, or 5

      // Use different part of hash for offset
      const offset = absHash % Math.max(1, count - dailyCount + 1);

      // Fetch the adhkar at the calculated offset
      const dailyAdhkar = await db
        .select()
        .from(adhkar)
        .orderBy(adhkar.id)
        .limit(dailyCount)
        .offset(offset);

      const duration = Date.now() - startTime;

      req.logger?.info('Fetched daily adhkar', {
        date: dateString,
        count: dailyAdhkar.length,
        offset,
        durationMs: duration,
      });

      return res.json({
        adhkar: dailyAdhkar,
        date: dateString,
        count: dailyAdhkar.length,
      });
    })
  );

  /**
   * GET /api/adhkar
   *
   * Fetch all adhkar with optional category filtering.
   * Cached for 24 hours (reference data).
   *
   * Query params:
   * - category (optional): Filter by category
   * - limit (optional): Results per page (default: 50, max: 100)
   * - offset (optional): Starting position (default: 0)
   *
   * Response: 200 OK
   * {
   *   adhkar: Array<{ id, category, arabic, transliteration, translation, reference, repetitions, virtue }>,
   *   pagination: { limit, offset, total, hasMore }
   * }
   */
  app.get(
    '/api/adhkar',
    cacheMiddleware(
      CACHE_TTL.ONE_DAY,
      (req) => `cache:adhkar:${req.query.category || 'all'}:${req.query.offset || 0}`
    ),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();

      // Validate query params
      const validationResult = getAdhkarByCategorySchema.safeParse(req.query);
      if (!validationResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_FAILED,
            req.id,
            'Invalid query parameters',
            { validationErrors: validationResult.error.issues }
          )
        );
      }

      const { category, limit, offset } = validationResult.data;

      // Build query
      let query = db.select().from(adhkar);

      if (category) {
        query = query.where(eq(adhkar.category, category));
      }

      // Fetch adhkar with pagination
      const adhkarList = await query
        .orderBy(adhkar.category, adhkar.id)
        .limit(limit)
        .offset(offset);

      // Count total adhkar
      const countQuery = category
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(adhkar)
            .where(eq(adhkar.category, category))
        : db.select({ count: sql<number>`count(*)` }).from(adhkar);

      const [{ count }] = await countQuery;

      const duration = Date.now() - startTime;

      req.logger?.info('Fetched adhkar', {
        category: category || 'all',
        limit,
        offset,
        count: adhkarList.length,
        total: count,
        durationMs: duration,
      });

      return res.json({
        adhkar: adhkarList,
        pagination: {
          limit,
          offset,
          total: count,
          hasMore: offset + limit < count,
        },
      });
    })
  );
}
