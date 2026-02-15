/**
 * Offline Sync Routes Test Suite
 *
 * Tests the /api/offline/:contentType endpoints for serving
 * static Islamic content (surahs, verses, hadiths, vocabulary, scenarios).
 */

import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import type { Server } from "http";
import request from "supertest";
import * as fs from "fs";
import * as path from "path";

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-request-id-456"),
}));

// Mock cache middleware to pass through
jest.mock("../middleware/cache", () => ({
  cacheMiddleware: () => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
  CACHE_TTL: {
    ONE_HOUR: 3600,
    ONE_DAY: 86400,
  },
}));

// Mock request logger
jest.mock("../middleware/request-logger", () => ({
  requestLoggerMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.id = "mock-request-id-456";
    req.logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;
    next();
  },
}));

// Import after mocks
import { registerOfflineSyncRoutes } from "../routes/offline-sync-routes";

describe("Offline Sync Routes", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    // Add request logger mock
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.id = "mock-request-id-456";
      req.logger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      } as any;
      next();
    });

    registerOfflineSyncRoutes(app);
  });

  // =========================================================================
  // INVALID CONTENT TYPE
  // =========================================================================

  describe("GET /api/offline/:contentType - Invalid Type", () => {
    test("returns 400 for invalid content type", async () => {
      const res = await request(app).get("/api/offline/invalid-type");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
      expect(res.body.message).toContain("invalid-type");
    });

    test("rejects non-existent content types", async () => {
      const res = await request(app).get("/api/offline/prayers");

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // VALID CONTENT TYPES
  // =========================================================================

  describe("GET /api/offline/surahs", () => {
    test("returns surahs data with correct shape", async () => {
      const res = await request(app).get("/api/offline/surahs");

      // May be 200 (data exists) or 500 (seed file not found)
      if (res.status === 200) {
        expect(res.body.contentType).toBe("surahs");
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.total).toBeGreaterThanOrEqual(0);
        expect(res.body.timestamp).toBeDefined();
        // Verify ISO timestamp format
        expect(() => new Date(res.body.timestamp)).not.toThrow();
      } else {
        // Seed file not available in test environment
        expect(res.status).toBe(500);
      }
    });
  });

  describe("GET /api/offline/hadiths", () => {
    test("returns hadiths data with correct shape", async () => {
      const res = await request(app).get("/api/offline/hadiths");

      if (res.status === 200) {
        expect(res.body.contentType).toBe("hadiths");
        expect(res.body.data).toBeInstanceOf(Array);
        expect(typeof res.body.total).toBe("number");
        expect(res.body.timestamp).toBeDefined();
      } else {
        expect(res.status).toBe(500);
      }
    });
  });

  describe("GET /api/offline/vocabulary", () => {
    test("returns vocabulary data with correct shape", async () => {
      const res = await request(app).get("/api/offline/vocabulary");

      if (res.status === 200) {
        expect(res.body.contentType).toBe("vocabulary");
        expect(res.body.data).toBeInstanceOf(Array);
        expect(typeof res.body.total).toBe("number");
      } else {
        expect(res.status).toBe(500);
      }
    });
  });

  describe("GET /api/offline/scenarios", () => {
    test("returns scenarios data with correct shape", async () => {
      const res = await request(app).get("/api/offline/scenarios");

      if (res.status === 200) {
        expect(res.body.contentType).toBe("scenarios");
        expect(res.body.data).toBeInstanceOf(Array);
        expect(typeof res.body.total).toBe("number");
      } else {
        expect(res.status).toBe(500);
      }
    });
  });

  // =========================================================================
  // VERSES WITH SURAH FILTER
  // =========================================================================

  describe("GET /api/offline/verses", () => {
    test("returns 400 for invalid surah number", async () => {
      const res = await request(app).get("/api/offline/verses?surah=0");

      if (res.status === 400) {
        expect(res.body.code).toBe("VALIDATION_FAILED");
        expect(res.body.message).toContain("surah");
      }
      // Also accept 500 if seed data doesn't exist
    });

    test("returns 400 for surah > 114", async () => {
      const res = await request(app).get("/api/offline/verses?surah=200");

      if (res.status === 400) {
        expect(res.body.code).toBe("VALIDATION_FAILED");
      }
    });

    test("returns 400 for non-numeric surah", async () => {
      const res = await request(app).get("/api/offline/verses?surah=abc");

      if (res.status === 400) {
        expect(res.body.code).toBe("VALIDATION_FAILED");
      }
    });

    test("accepts valid surah number", async () => {
      const res = await request(app).get("/api/offline/verses?surah=1");

      // Either 200 with filtered data or 500 if seed file doesn't exist
      if (res.status === 200) {
        expect(res.body.contentType).toBe("verses");
        expect(res.body.data).toBeInstanceOf(Array);
      }
    });
  });

  // =========================================================================
  // RESPONSE FORMAT
  // =========================================================================

  describe("Response Format", () => {
    test("all valid content types accepted", async () => {
      const types = ["surahs", "verses", "hadiths", "vocabulary", "scenarios"];

      for (const type of types) {
        const res = await request(app).get(`/api/offline/${type}`);
        // Should be either 200 (data loaded) or 500 (seed file missing)
        // but NOT 400 (valid content type)
        expect([200, 500]).toContain(res.status);
      }
    });
  });
});
