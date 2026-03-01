import { z } from "zod";

/**
 * Validation schemas for Prayer API endpoints
 *
 * Validates calculation methods, madhab preferences,
 * location data, and notification settings.
 */

/**
 * Valid calculation methods for prayer times
 * Matches the adhan-js library options
 */
export const CALCULATION_METHODS = [
  "MWL", // Muslim World League
  "ISNA", // Islamic Society of North America
  "Egypt", // Egyptian General Authority of Survey
  "Makkah", // Umm al-Qura University, Makkah
  "Karachi", // University of Islamic Sciences, Karachi
  "Tehran", // Institute of Geophysics, University of Tehran
  "Jafari", // Shia Ithna-Ashari, Leva Institute, Qum
  "Singapore", // Majlis Ugama Islam Singapura
  "Turkey", // Diyanet Isleri Baskanligi, Turkey
  "Dubai", // The Gulf Region
  "Kuwait", // Kuwait
  "Qatar", // Qatar
  "MoonsightingCommittee", // Moonsighting Committee Worldwide
] as const;

export const MADHAB_OPTIONS = ["Hanafi", "Maliki", "Shafi", "Hanbali"] as const;

/**
 * Schema for PUT /api/prayer/preferences request body
 */
export const updatePreferencesSchema = z
  .object({
    calculationMethod: z.enum(CALCULATION_METHODS).optional(),
    madhab: z.enum(MADHAB_OPTIONS).optional(),
    notificationsEnabled: z.boolean().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string().max(200).trim().optional(),
  })
  .strict();

/**
 * Schema for POST /api/prayer/track request body
 */
export const trackPrayerSchema = z
  .object({
    prayerName: z.enum(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]),
    onTime: z.boolean(),
  })
  .strict();

// Export types
export type UpdatePreferencesBody = z.infer<typeof updatePreferencesSchema>;
export type TrackPrayerBody = z.infer<typeof trackPrayerSchema>;
