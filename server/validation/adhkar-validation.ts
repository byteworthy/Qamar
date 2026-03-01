import { z } from "zod";

/**
 * Validation schemas for Adhkar API endpoints
 *
 * Provides comprehensive input validation for:
 * - Adhkar retrieval with optional category filtering
 * - Full-text search across adhkar texts (translation and transliteration)
 * - Category listing
 */

/**
 * Valid adhkar categories
 */
export const ADHKAR_CATEGORIES = [
  "morning",
  "evening",
  "after-prayer",
  "sleep",
  "protection",
  "travel",
  "eating",
  "general",
] as const;

/**
 * Schema for GET /api/adhkar query parameters
 */
export const getAdhkarByCategorySchema = z
  .object({
    // Optional filter by category
    category: z.enum(ADHKAR_CATEGORIES).optional(),

    // Optional pagination
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .optional()
      .default(50),

    offset: z.coerce
      .number()
      .int("Offset must be an integer")
      .min(0, "Offset must be at least 0")
      .optional()
      .default(0),
  })
  .strict();

/**
 * Schema for GET /api/adhkar/search query parameters
 */
export const searchAdhkarSchema = z
  .object({
    // Search query (required, min 1 character)
    q: z
      .string()
      .min(1, "Search query must be at least 1 character")
      .max(500, "Search query cannot exceed 500 characters")
      .trim(),

    // Optional pagination
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(50, "Limit cannot exceed 50")
      .optional()
      .default(20),

    offset: z.coerce
      .number()
      .int("Offset must be an integer")
      .min(0, "Offset must be at least 0")
      .optional()
      .default(0),
  })
  .strict();

// Export types for use in route handlers
export type GetAdhkarByCategoryParams = z.infer<
  typeof getAdhkarByCategorySchema
>;
export type SearchAdhkarQuery = z.infer<typeof searchAdhkarSchema>;
