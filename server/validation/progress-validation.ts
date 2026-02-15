import { z } from 'zod';

/**
 * Validation schemas for Progress Tracking API endpoints
 *
 * Validates progress updates and streak tracking.
 */

/**
 * Schema for POST /api/progress/track request body
 */
export const trackProgressSchema = z.object({
  type: z.enum([
    'quran_verse_read',
    'arabic_word_learned',
    'prayer_time_checked',
    'reflection_completed',
  ]),
  count: z.number().int().min(1).max(1000).optional().default(1),
}).strict();

// Export types
export type TrackProgressBody = z.infer<typeof trackProgressSchema>;
