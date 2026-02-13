import { z } from 'zod';

/**
 * Validation schemas for Hadith API endpoints
 *
 * Provides comprehensive input validation for:
 * - Hadith collection queries
 * - Hadith retrieval by collection with optional grade filtering
 * - Full-text search across hadith texts
 * - Individual hadith lookup by ID
 */

/**
 * Valid hadith authenticity grades
 */
export const HADITH_GRADES = ['Sahih', 'Hasan', "Da'if"] as const;

/**
 * Schema for GET /api/hadith/collections/:collectionId query parameters
 */
export const getHadithsByCollectionSchema = z.object({
  // Collection ID from URL params
  collectionId: z.string()
    .min(1, 'Collection ID is required')
    .max(50, 'Collection ID cannot exceed 50 characters')
    .trim(),

  // Optional filter by grade
  grade: z.enum(HADITH_GRADES).optional(),

  // Optional pagination
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(50),

  offset: z.coerce
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be at least 0')
    .optional()
    .default(0),
}).strict();

/**
 * Schema for GET /api/hadith/search query parameters
 */
export const searchHadithsSchema = z.object({
  // Search query (required, min 2 characters)
  q: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(500, 'Search query cannot exceed 500 characters')
    .trim(),

  // Optional pagination
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .default(20),

  offset: z.coerce
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset must be at least 0')
    .optional()
    .default(0),
}).strict();

/**
 * Schema for GET /api/hadith/:id params
 */
export const getHadithByIdSchema = z.object({
  id: z.string()
    .min(1, 'Hadith ID is required')
    .max(100, 'Hadith ID cannot exceed 100 characters')
    .trim(),
}).strict();

// Export types for use in route handlers
export type GetHadithsByCollectionParams = z.infer<typeof getHadithsByCollectionSchema>;
export type SearchHadithsQuery = z.infer<typeof searchHadithsSchema>;
export type GetHadithByIdParams = z.infer<typeof getHadithByIdSchema>;
