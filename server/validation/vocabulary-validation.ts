import { z } from "zod";

/**
 * Validation schemas for Vocabulary API endpoints
 *
 * Validates vocabulary queries including category filtering,
 * difficulty level filtering, and text search.
 */

/**
 * Schema for GET /api/vocabulary (main endpoint with filters)
 */
export const getVocabularySchema = z
  .object({
    category: z.string().min(1).trim().optional(),
    difficulty: z.coerce.number().int().min(1).max(5).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  })
  .strict();

/**
 * Schema for GET /api/vocabulary (by category)
 */
export const getVocabularyByCategorySchema = z
  .object({
    category: z.string().min(1).trim(),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  })
  .strict();

/**
 * Schema for GET /api/vocabulary (by difficulty)
 */
export const getVocabularyByDifficultySchema = z
  .object({
    difficulty: z.coerce.number().int().min(1).max(5),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().int().min(0).default(0).optional(),
  })
  .strict();

/**
 * Schema for GET /api/vocabulary/search
 */
export const searchVocabularySchema = z
  .object({
    q: z.string().min(1).trim(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  })
  .strict();

// Export types
export type GetVocabularyQuery = z.infer<typeof getVocabularySchema>;
export type GetVocabularyByCategoryQuery = z.infer<
  typeof getVocabularyByCategorySchema
>;
export type GetVocabularyByDifficultyQuery = z.infer<
  typeof getVocabularyByDifficultySchema
>;
export type SearchVocabularyQuery = z.infer<typeof searchVocabularySchema>;
