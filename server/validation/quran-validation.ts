import { z } from 'zod';

/**
 * Validation schemas for Quran API endpoints
 *
 * Provides comprehensive input validation for:
 * - Surah queries (1-114 valid range)
 * - Verse queries with pagination
 * - Full-text search with filters
 * - Bookmark creation with encrypted notes
 */

/**
 * Schema for GET /api/quran/surahs query parameters
 */
export const getSurahsSchema = z.object({
  // Optional filter by revelation place
  revelationPlace: z.enum(['Makkah', 'Madinah']).optional(),
}).strict();

/**
 * Schema for GET /api/quran/verses/:surahId query parameters
 */
export const getVersesSchema = z.object({
  // Surah number (1-114)
  surahId: z.coerce
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be at least 1')
    .max(114, 'Surah number must be at most 114'),

  // Optional pagination
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(50),
}).strict();

/**
 * Schema for GET /api/quran/search query parameters
 */
export const searchVersesSchema = z.object({
  // Search query (required, min 2 characters)
  q: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(500, 'Search query cannot exceed 500 characters')
    .trim(),

  // Optional filter by surah
  surahId: z.coerce
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be at least 1')
    .max(114, 'Surah number must be at most 114')
    .optional(),

  // Optional pagination
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .optional()
    .default(20),
}).strict();

/**
 * Schema for POST /api/quran/bookmarks request body
 */
export const createBookmarkSchema = z.object({
  // Surah number (1-114)
  surahNumber: z.number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be at least 1')
    .max(114, 'Surah number must be at most 114'),

  // Verse number (validated against surah's verse count in route handler)
  verseNumber: z.number()
    .int('Verse number must be an integer')
    .min(1, 'Verse number must be at least 1'),

  // Optional note (will be encrypted)
  note: z.string()
    .max(1000, 'Note cannot exceed 1000 characters')
    .trim()
    .optional(),
}).strict();

/**
 * Schema for GET /api/quran/bookmarks query parameters
 */
export const getBookmarksSchema = z.object({
  // Optional filter by surah
  surahNumber: z.coerce
    .number()
    .int('Surah number must be an integer')
    .min(1, 'Surah number must be at least 1')
    .max(114, 'Surah number must be at most 114')
    .optional(),

  // Optional pagination
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(50),
}).strict();

/**
 * Schema for DELETE /api/quran/bookmarks/:id params
 */
export const deleteBookmarkSchema = z.object({
  id: z.coerce
    .number()
    .int('Bookmark ID must be an integer')
    .positive('Bookmark ID must be positive'),
}).strict();

// Export types for use in route handlers
export type GetSurahsQuery = z.infer<typeof getSurahsSchema>;
export type GetVersesParams = z.infer<typeof getVersesSchema>;
export type SearchVersesQuery = z.infer<typeof searchVersesSchema>;
export type CreateBookmarkBody = z.infer<typeof createBookmarkSchema>;
export type GetBookmarksQuery = z.infer<typeof getBookmarksSchema>;
export type DeleteBookmarkParams = z.infer<typeof deleteBookmarkSchema>;
