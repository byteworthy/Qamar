/**
 * Vocabulary API Routes
 *
 * Provides endpoints for fetching Arabic vocabulary words including:
 * - Filtering by category
 * - Filtering by difficulty level
 * - Searching by text (Arabic or English)
 * - Retrieving distinct categories
 *
 * Security:
 * - All endpoints are public (reference data)
 * - Pagination enforced to prevent large responses
 */

import type { Express, Request, Response } from "express";
import { db } from "../db";
import { vocabularyWords } from "@shared/schema";
import { eq, sql, or, ilike, desc } from "drizzle-orm";
import { asyncHandler } from "../middleware/error-handler";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import {
  getVocabularySchema,
  searchVocabularySchema,
} from "../validation/vocabulary-validation";

export function registerVocabularyRoutes(app: Express): void {
  /**
   * GET /api/vocabulary
   *
   * Fetch vocabulary words with optional filters.
   * Supports filtering by category and/or difficulty level.
   *
   * Auth: Not required (public reference data)
   *
   * Query params:
   * - category?: string - Filter by category name
   * - difficulty?: number (1-5) - Filter by difficulty level
   * - limit?: number (1-100, default 50) - Number of results
   * - offset?: number (default 0) - Pagination offset
   *
   * Response: 200 OK
   * {
   *   words: [
   *     {
   *       id: number,
   *       arabic: string,
   *       english: string,
   *       transliteration: string,
   *       category: string,
   *       difficulty: number,
   *       audioUrl: string | null,
   *       exampleSentence: string | null
   *     }
   *   ],
   *   total: number,
   *   limit: number,
   *   offset: number
   * }
   */
  app.get(
    "/api/vocabulary",
    asyncHandler(async (req: Request, res: Response) => {
      // Validate query params
      const validationResult = getVocabularySchema.safeParse(req.query);
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

      const {
        category,
        difficulty,
        limit = 50,
        offset = 0,
      } = validationResult.data;

      // Build WHERE conditions
      const conditions = [];
      if (category) {
        conditions.push(eq(vocabularyWords.category, category));
      }
      if (difficulty !== undefined) {
        conditions.push(eq(vocabularyWords.difficulty, difficulty));
      }

      // Query with filters
      const words = await db
        .select({
          id: vocabularyWords.id,
          arabic: vocabularyWords.arabic,
          english: vocabularyWords.english,
          transliteration: vocabularyWords.transliteration,
          category: vocabularyWords.category,
          difficulty: vocabularyWords.difficulty,
          audioUrl: vocabularyWords.audioUrl,
          exampleSentence: vocabularyWords.exampleSentence,
        })
        .from(vocabularyWords)
        .where(
          conditions.length > 0
            ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
            : undefined,
        )
        .orderBy(vocabularyWords.difficulty, vocabularyWords.category)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(vocabularyWords)
        .where(
          conditions.length > 0
            ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
            : undefined,
        );

      req.logger?.info("Fetched vocabulary words", {
        category,
        difficulty,
        count: words.length,
        total: countResult.count,
      });

      return res.json({
        words,
        total: countResult.count,
        limit,
        offset,
      });
    }),
  );

  /**
   * GET /api/vocabulary/categories
   *
   * Fetch list of distinct vocabulary categories.
   *
   * Auth: Not required (public reference data)
   *
   * Response: 200 OK
   * {
   *   categories: ["greetings", "prayer", "family", ...]
   * }
   */
  app.get(
    "/api/vocabulary/categories",
    asyncHandler(async (req: Request, res: Response) => {
      const categories = await db
        .selectDistinct({ category: vocabularyWords.category })
        .from(vocabularyWords)
        .orderBy(vocabularyWords.category);

      req.logger?.info("Fetched vocabulary categories", {
        count: categories.length,
      });

      return res.json({
        categories: categories.map((c) => c.category),
      });
    }),
  );

  /**
   * GET /api/vocabulary/search
   *
   * Search vocabulary words by text (searches both Arabic and English fields).
   *
   * Auth: Not required (public reference data)
   *
   * Query params:
   * - q: string (required, min 1 char) - Search term
   * - limit?: number (1-100, default 20) - Number of results
   *
   * Response: 200 OK
   * {
   *   words: [...],
   *   total: number,
   *   query: string
   * }
   */
  app.get(
    "/api/vocabulary/search",
    asyncHandler(async (req: Request, res: Response) => {
      // Validate query params
      const validationResult = searchVocabularySchema.safeParse(req.query);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid search parameters",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { q, limit = 20 } = validationResult.data;
      const searchTerm = `%${q}%`;

      // Search in both Arabic and English fields
      const words = await db
        .select({
          id: vocabularyWords.id,
          arabic: vocabularyWords.arabic,
          english: vocabularyWords.english,
          transliteration: vocabularyWords.transliteration,
          category: vocabularyWords.category,
          difficulty: vocabularyWords.difficulty,
          audioUrl: vocabularyWords.audioUrl,
          exampleSentence: vocabularyWords.exampleSentence,
        })
        .from(vocabularyWords)
        .where(
          or(
            ilike(vocabularyWords.arabic, searchTerm),
            ilike(vocabularyWords.english, searchTerm),
            ilike(vocabularyWords.transliteration, searchTerm),
          ),
        )
        .orderBy(vocabularyWords.difficulty)
        .limit(limit);

      req.logger?.info("Searched vocabulary", {
        query: q,
        resultsCount: words.length,
      });

      return res.json({
        words,
        total: words.length,
        query: q,
      });
    }),
  );
}
