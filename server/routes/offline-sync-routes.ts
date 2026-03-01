import type { Express, Request, Response } from "express";
import { asyncHandler } from "../middleware/error-handler";
import { cacheMiddleware, CACHE_TTL } from "../middleware/cache";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import * as fs from "fs";
import * as path from "path";

// In-memory cache for seed data (loaded once on first request)
const dataCache: Record<string, unknown[]> = {};

const VALID_CONTENT_TYPES = [
  "surahs",
  "verses",
  "hadiths",
  "vocabulary",
  "scenarios",
] as const;
type ContentType = (typeof VALID_CONTENT_TYPES)[number];

/**
 * Map content type param to seed data filename
 */
const CONTENT_TYPE_TO_FILE: Record<ContentType, string> = {
  surahs: "surahs.json",
  verses: "verses.json",
  hadiths: "hadiths.json",
  vocabulary: "vocabulary.json",
  scenarios: "conversation_scenarios.json",
};

/**
 * Load seed data from JSON file, caching in memory after first load
 */
function loadSeedData(contentType: ContentType): unknown[] {
  if (dataCache[contentType]) {
    return dataCache[contentType];
  }

  const filename = CONTENT_TYPE_TO_FILE[contentType];
  const filePath = path.resolve(process.cwd(), "shared", "seed-data", filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed data file not found: ${filename}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  // Handle both array and object-with-array formats
  const data = Array.isArray(parsed)
    ? parsed
    : Object.values(parsed).find(Array.isArray) || [];
  dataCache[contentType] = data as unknown[];
  return dataCache[contentType];
}

/**
 * Offline Content Sync Routes
 *
 * Provides read-only endpoints for downloading static Islamic content
 * (Quran surahs/verses, hadiths, vocabulary, conversation scenarios)
 * for offline use in the mobile app.
 *
 * All endpoints are public (reference Islamic content, no auth required).
 */
export function registerOfflineSyncRoutes(app: Express): void {
  /**
   * GET /api/offline/:contentType
   *
   * Fetch full dataset for a given content type.
   * Cached for 24 hours (static reference data).
   *
   * Path params:
   * - contentType: 'surahs' | 'verses' | 'hadiths' | 'vocabulary' | 'scenarios'
   *
   * Query params:
   * - since (optional): ISO timestamp for incremental sync (currently returns full data)
   * - surah (optional, verses only): Filter verses by surah number
   *
   * Response: 200 OK
   * {
   *   contentType: string,
   *   data: Array<...>,
   *   total: number,
   *   timestamp: string (ISO 8601)
   * }
   */
  app.get(
    "/api/offline/:contentType",
    cacheMiddleware(
      CACHE_TTL.ONE_DAY,
      (req) =>
        `cache:offline:${req.params.contentType}:${req.query.surah || "all"}`,
    ),
    asyncHandler(async (req: Request, res: Response) => {
      const startTime = Date.now();
      const { contentType } = req.params;

      // Validate content type
      if (!VALID_CONTENT_TYPES.includes(contentType as ContentType)) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              `Invalid content type '${contentType}'. Must be one of: ${VALID_CONTENT_TYPES.join(", ")}`,
            ),
          );
      }

      const validType = contentType as ContentType;

      let data: unknown[];
      try {
        data = loadSeedData(validType);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        req.logger?.error("Failed to load seed data", {
          contentType,
          error: message,
        });
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            createErrorResponse(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              ERROR_CODES.INTERNAL_ERROR,
              req.id,
              "Failed to load content data",
            ),
          );
      }

      // For verses, optionally filter by surah number
      if (validType === "verses" && req.query.surah) {
        const surahNumber = parseInt(req.query.surah as string, 10);
        if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json(
              createErrorResponse(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.VALIDATION_FAILED,
                req.id,
                "Invalid surah number. Must be between 1 and 114.",
              ),
            );
        }
        data = data.filter(
          (v: unknown) =>
            (v as Record<string, unknown>).surah_number === surahNumber,
        );
      }

      const duration = Date.now() - startTime;

      req.logger?.info("Served offline content", {
        contentType: validType,
        surah: req.query.surah || null,
        count: data.length,
        durationMs: duration,
      });

      return res.json({
        contentType: validType,
        data,
        total: data.length,
        timestamp: new Date().toISOString(),
      });
    }),
  );
}
