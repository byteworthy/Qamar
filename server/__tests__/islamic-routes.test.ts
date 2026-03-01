/**
 * Islamic Features API Routes Test Suite
 *
 * Tests all Islamic feature endpoints:
 * - Quran API (surahs, verses, bookmarks, search)
 * - Prayer API (preferences, tracking)
 * - Progress API (get progress, track events)
 *
 * Validates:
 * - Input validation (Zod schemas)
 * - Authentication requirements
 * - Error handling patterns
 * - Response structure
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

// Import after mocks
import { registerRoutes } from "../routes";
import { requestLoggerMiddleware } from "../middleware/request-logger";

// Mock uuid module
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-request-id-123"),
}));

// Mock database
const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
const mockDbDelete = jest.fn();
const mockDbUpdate = jest.fn();

const createMockQueryChain = (result: unknown[] = []) => {
  const chain: Record<string, any> = {};
  chain.from = (jest.fn() as any).mockReturnValue(chain);
  chain.where = (jest.fn() as any).mockReturnValue(chain);
  chain.orderBy = (jest.fn() as any).mockReturnValue(chain);
  chain.limit = (jest.fn() as any).mockReturnValue(chain);
  chain.offset = (jest.fn() as any).mockReturnValue(chain);
  chain.returning = (jest.fn() as any).mockResolvedValue(result);
  chain.values = (jest.fn() as any).mockReturnValue(chain);
  chain.set = (jest.fn() as any).mockReturnValue(chain);
  chain.onConflictDoUpdate = (jest.fn() as any).mockReturnValue(chain);
  chain.onConflictDoNothing = (jest.fn() as any).mockReturnValue(chain);

  // Make the chain itself thenable (resolves to result)
  chain.then = (jest.fn() as any).mockImplementation((resolve: any) =>
    resolve(result),
  );
  return chain;
};

jest.mock("../db", () => ({
  db: {
    select: (...args: any[]) => mockDbSelect(...args),
    insert: (...args: any[]) => mockDbInsert(...args),
    delete: (...args: any[]) => mockDbDelete(...args),
    update: (...args: any[]) => mockDbUpdate(...args),
  },
}));

// Mock schema
jest.mock("@shared/schema", () => ({
  quranMetadata: {
    surahNumber: "surah_number",
    revelationPlace: "revelation_place",
  },
  quranBookmarks: {
    id: "id",
    userId: "user_id",
    surahNumber: "surah_number",
    verseNumber: "verse_number",
    note: "note",
    createdAt: "created_at",
  },
  prayerPreferences: { userId: "user_id" },
  userProgress: {
    userId: "user_id",
    quranVersesRead: "quran_verses_read",
    arabicWordsLearned: "arabic_words_learned",
    prayerTimesChecked: "prayer_times_checked",
    reflectionSessionsCompleted: "reflection_sessions_completed",
    streakDays: "streak_days",
    lastActiveDate: "last_active_date",
  },
  users: {},
}));

// Mock encryption
jest.mock("../encryption", () => ({
  encryptData: jest.fn((data: string) => `encrypted:${data}`),
  decryptData: jest.fn((data: string) =>
    data.startsWith("encrypted:") ? data.substring(10) : data,
  ),
}));

// Mock storage
jest.mock("../storage", () => ({
  storage: {
    getReflectionHistory: (jest.fn() as any).mockResolvedValue([]),
    getOrCreateUser: (jest.fn() as any).mockResolvedValue({ id: "test" }),
    getTodayReflectionCount: (jest.fn() as any).mockResolvedValue(0),
    saveReflection: jest.fn(),
    getReflectionCount: (jest.fn() as any).mockResolvedValue(0),
    getRecentReflections: (jest.fn() as any).mockResolvedValue([]),
    deleteReflection: (jest.fn() as any).mockResolvedValue(1),
    getLatestInsightSummary: (jest.fn() as any).mockResolvedValue(null),
    saveInsightSummary: jest.fn(),
    getAssumptionLibrary: (jest.fn() as any).mockResolvedValue([]),
  },
}));

jest.mock("../billing");
jest.mock("../config", () => ({
  VALIDATION_MODE: true,
  isAnthropicConfigured: jest.fn().mockReturnValue(false),
  getValidationModeAnalyzeResponse: jest.fn().mockReturnValue({
    distortions: ["Test"],
    happening: "Test",
    pattern: ["Test"],
    matters: "Test",
  }),
  getValidationModeReframeResponse: jest.fn().mockReturnValue({
    beliefTested: "Test",
    perspective: "Test",
    nextStep: "Test",
    anchors: ["Test"],
  }),
  getValidationModePracticeResponse: jest.fn().mockReturnValue({
    title: "Test",
    steps: ["Test"],
    reminder: "Test",
    duration: "1 min",
  }),
  getValidationModeInsightSummary: jest.fn().mockReturnValue("Test summary"),
}));
jest.mock("../data-retention");
jest.mock("@anthropic-ai/sdk", () => {
  return (jest.fn() as any).mockImplementation(() => ({
    messages: {
      create: (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "test" }],
      }),
    },
  }));
});
jest.mock("../middleware/ai-rate-limiter", () => ({
  aiRateLimiter: jest.fn((_req: Request, _res: Response, next: NextFunction) =>
    next(),
  ),
  insightRateLimiter: jest.fn(
    (_req: Request, _res: Response, next: NextFunction) => next(),
  ),
}));
jest.mock("../middleware/rate-limit", () => ({
  adminLimiter: jest.fn((_req: Request, _res: Response, next: NextFunction) =>
    next(),
  ),
}));
jest.mock("../notificationRoutes", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/test", (_req: Request, res: Response) =>
    res.json({ test: true }),
  );
  return router;
});

describe("Islamic Features API Routes", () => {
  let app: Express;
  let server: Server;
  const mockUserId = "test-user-islamic-123";

  beforeEach(async () => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use(requestLoggerMiddleware);

    // Mock authentication
    app.use((req, _res, next) => {
      req.auth = { userId: mockUserId, sessionToken: "mock-token" };
      next();
    });

    server = await registerRoutes(app);
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  // ===========================================================================
  // QURAN SURAHS ENDPOINT
  // ===========================================================================

  describe("GET /api/quran/surahs", () => {
    test("returns surah list successfully", async () => {
      const mockSurahs = [
        {
          id: 1,
          surahNumber: 1,
          nameArabic: "الفاتحة",
          nameEnglish: "Al-Fatihah",
          versesCount: 7,
          revelationPlace: "Makkah",
          orderInRevelation: 5,
        },
        {
          id: 2,
          surahNumber: 2,
          nameArabic: "البقرة",
          nameEnglish: "Al-Baqarah",
          versesCount: 286,
          revelationPlace: "Madinah",
          orderInRevelation: 87,
        },
      ];

      const chain = createMockQueryChain(mockSurahs);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/quran/surahs");

      expect(res.status).toBe(200);
      expect(res.body.surahs).toBeDefined();
      expect(res.body.total).toBe(2);
    });

    test("filters surahs by revelation place", async () => {
      const mockSurahs = [
        {
          id: 1,
          surahNumber: 1,
          nameArabic: "الفاتحة",
          nameEnglish: "Al-Fatihah",
          versesCount: 7,
          revelationPlace: "Makkah",
          orderInRevelation: 5,
        },
      ];

      const chain = createMockQueryChain(mockSurahs);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get(
        "/api/quran/surahs?revelationPlace=Makkah",
      );

      expect(res.status).toBe(200);
      expect(res.body.surahs).toHaveLength(1);
    });

    test("rejects invalid revelationPlace", async () => {
      const res = await request(app).get(
        "/api/quran/surahs?revelationPlace=InvalidPlace",
      );

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("handles database errors gracefully", async () => {
      // When the db throws, the asyncHandler catches and returns 500
      // Use a unique query param to avoid cache hits from previous tests
      mockDbSelect.mockImplementation(() => {
        throw new Error("DB Error");
      });

      const res = await request(app).get(
        "/api/quran/surahs?revelationPlace=Madinah",
      );

      // Since this is a new cache key (with Madinah filter), it won't be cached
      expect(res.status).toBe(500);
    });
  });

  // ===========================================================================
  // QURAN VERSES ENDPOINT
  // ===========================================================================

  describe("GET /api/quran/verses/:surahId", () => {
    test("returns verse data for valid surah", async () => {
      const mockSurah = {
        id: 1,
        surahNumber: 1,
        nameArabic: "الفاتحة",
        nameEnglish: "Al-Fatihah",
        versesCount: 7,
        revelationPlace: "Makkah",
        orderInRevelation: 5,
      };

      const chain = createMockQueryChain([mockSurah]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/quran/verses/1");

      expect(res.status).toBe(200);
      expect(res.body.surah).toBeDefined();
      expect(res.body.surah.surahNumber).toBe(1);
      expect(res.body.verses).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    test("returns 404 for non-existent surah", async () => {
      // Use a surah number not in cache
      const chain = createMockQueryChain([]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/quran/verses/99");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    test("rejects invalid surah number", async () => {
      const res = await request(app).get("/api/quran/verses/0");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects surah number > 114", async () => {
      const res = await request(app).get("/api/quran/verses/115");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("supports pagination", async () => {
      const mockSurah = {
        id: 2,
        surahNumber: 2,
        nameArabic: "البقرة",
        nameEnglish: "Al-Baqarah",
        versesCount: 286,
        revelationPlace: "Madinah",
        orderInRevelation: 87,
      };

      const chain = createMockQueryChain([mockSurah]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/quran/verses/2?page=2&limit=10");

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalPages).toBe(29); // ceil(286/10)
    });
  });

  // ===========================================================================
  // QURAN SEARCH ENDPOINT
  // ===========================================================================

  describe("GET /api/quran/search", () => {
    test("returns search results (placeholder)", async () => {
      const res = await request(app).get("/api/quran/search?q=mercy");

      expect(res.status).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.message).toBeDefined(); // Placeholder message
    });

    test("rejects search query too short", async () => {
      const res = await request(app).get("/api/quran/search?q=a");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects missing search query", async () => {
      const res = await request(app).get("/api/quran/search");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });
  });

  // ===========================================================================
  // QURAN BOOKMARKS ENDPOINTS
  // ===========================================================================

  describe("POST /api/quran/bookmarks", () => {
    test("creates bookmark successfully", async () => {
      // First call: check surah exists, second call: check for duplicate
      const surahChain = createMockQueryChain([
        {
          id: 1,
          surahNumber: 1,
          versesCount: 7,
          nameArabic: "الفاتحة",
          nameEnglish: "Al-Fatihah",
          revelationPlace: "Makkah",
        },
      ]);
      const duplicateChain = createMockQueryChain([]);
      const insertChain = createMockQueryChain([
        {
          id: 1,
          userId: "test-user-islamic-123",
          surahNumber: 1,
          verseNumber: 3,
          note: "encrypted:Test note",
          createdAt: new Date(),
        },
      ]);

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return surahChain;
        return duplicateChain;
      });
      mockDbInsert.mockReturnValue(insertChain);

      const res = await request(app)
        .post("/api/quran/bookmarks")
        .send({ surahNumber: 1, verseNumber: 3, note: "Test note" });

      expect(res.status).toBe(201);
      expect(res.body.bookmark).toBeDefined();
    });

    test("rejects bookmark for invalid surah number", async () => {
      const res = await request(app)
        .post("/api/quran/bookmarks")
        .send({ surahNumber: 0, verseNumber: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects bookmark for missing verse number", async () => {
      const res = await request(app)
        .post("/api/quran/bookmarks")
        .send({ surahNumber: 1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("requires authentication", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(requestLoggerMiddleware);
      const unauthServer = await registerRoutes(unauthApp);

      const res = await request(unauthApp)
        .post("/api/quran/bookmarks")
        .send({ surahNumber: 1, verseNumber: 1 });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");

      unauthServer.close();
    });
  });

  describe("GET /api/quran/bookmarks", () => {
    test("returns user bookmarks", async () => {
      const mockBookmarks = [
        {
          id: 1,
          surahNumber: 1,
          verseNumber: 3,
          note: null,
          createdAt: new Date(),
        },
      ];
      const mockCount = [{ count: 1 }];

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          return createMockQueryChain(mockBookmarks);
        }
        return createMockQueryChain(mockCount);
      });

      const res = await request(app).get("/api/quran/bookmarks");

      expect(res.status).toBe(200);
      expect(res.body.bookmarks).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    test("requires authentication", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(requestLoggerMiddleware);
      const unauthServer = await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/quran/bookmarks");

      expect(res.status).toBe(401);

      unauthServer.close();
    });
  });

  describe("DELETE /api/quran/bookmarks/:id", () => {
    test("deletes bookmark successfully", async () => {
      const mockBookmark = { id: 1, userId: mockUserId };
      const chain = createMockQueryChain([mockBookmark]);
      mockDbSelect.mockReturnValue(chain);

      const deleteChain = createMockQueryChain([]);
      mockDbDelete.mockReturnValue(deleteChain);

      const res = await request(app).delete("/api/quran/bookmarks/1");

      expect(res.status).toBe(204);
    });

    test("returns 404 for non-existent bookmark", async () => {
      const chain = createMockQueryChain([]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).delete("/api/quran/bookmarks/999");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    test("rejects invalid bookmark ID", async () => {
      const res = await request(app).delete("/api/quran/bookmarks/abc");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("requires authentication", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(requestLoggerMiddleware);
      const unauthServer = await registerRoutes(unauthApp);

      const res = await request(unauthApp).delete("/api/quran/bookmarks/1");

      expect(res.status).toBe(401);

      unauthServer.close();
    });
  });

  // ===========================================================================
  // PRAYER PREFERENCES ENDPOINTS
  // ===========================================================================

  describe("GET /api/prayer/preferences", () => {
    test("returns default preferences for new user", async () => {
      const chain = createMockQueryChain([]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/prayer/preferences");

      expect(res.status).toBe(200);
      expect(res.body.preferences).toBeDefined();
      expect(res.body.preferences.calculationMethod).toBe("MWL");
      expect(res.body.preferences.madhab).toBe("Shafi");
      expect(res.body.preferences.notificationsEnabled).toBe(true);
    });

    test("returns saved preferences for existing user", async () => {
      const mockPrefs = {
        calculationMethod: "ISNA",
        madhab: "Hanafi",
        notificationsEnabled: false,
        latitude: 40.7128,
        longitude: -74.006,
        locationName: "New York, NY",
        updatedAt: new Date(),
      };
      const chain = createMockQueryChain([mockPrefs]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/prayer/preferences");

      expect(res.status).toBe(200);
      expect(res.body.preferences.calculationMethod).toBe("ISNA");
      expect(res.body.preferences.madhab).toBe("Hanafi");
      expect(res.body.preferences.notificationsEnabled).toBe(false);
    });

    test("requires authentication", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(requestLoggerMiddleware);
      const unauthServer = await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/prayer/preferences");

      expect(res.status).toBe(401);

      unauthServer.close();
    });
  });

  describe("PUT /api/prayer/preferences", () => {
    test("updates preferences successfully", async () => {
      const updated = {
        calculationMethod: "ISNA",
        madhab: "Hanafi",
        notificationsEnabled: true,
        latitude: 40.7128,
        longitude: -74.006,
        locationName: "New York",
        updatedAt: new Date(),
      };

      const insertChain = createMockQueryChain([updated]);
      mockDbInsert.mockReturnValue(insertChain);

      const res = await request(app).put("/api/prayer/preferences").send({
        calculationMethod: "ISNA",
        madhab: "Hanafi",
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.preferences).toBeDefined();
    });

    test("rejects invalid calculation method", async () => {
      const res = await request(app)
        .put("/api/prayer/preferences")
        .send({ calculationMethod: "InvalidMethod" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects invalid madhab", async () => {
      const res = await request(app)
        .put("/api/prayer/preferences")
        .send({ madhab: "InvalidMadhab" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects latitude out of range", async () => {
      const res = await request(app)
        .put("/api/prayer/preferences")
        .send({ latitude: 100 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects longitude out of range", async () => {
      const res = await request(app)
        .put("/api/prayer/preferences")
        .send({ longitude: 200 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });
  });

  describe("POST /api/prayer/track", () => {
    test("tracks prayer check successfully", async () => {
      const chain = createMockQueryChain([]);
      mockDbInsert.mockReturnValue(chain);

      const res = await request(app)
        .post("/api/prayer/track")
        .send({ prayerName: "Fajr", onTime: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("rejects invalid prayer name", async () => {
      const res = await request(app)
        .post("/api/prayer/track")
        .send({ prayerName: "InvalidPrayer", onTime: true });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects missing onTime field", async () => {
      const res = await request(app)
        .post("/api/prayer/track")
        .send({ prayerName: "Dhuhr" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("accepts all valid prayer names", async () => {
      const chain = createMockQueryChain([]);
      mockDbInsert.mockReturnValue(chain);

      for (const prayerName of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
        const res = await request(app)
          .post("/api/prayer/track")
          .send({ prayerName, onTime: false });

        expect(res.status).toBe(200);
      }
    });
  });

  // ===========================================================================
  // PROGRESS ENDPOINTS
  // ===========================================================================

  describe("GET /api/progress", () => {
    test("returns zero-state for new user", async () => {
      const chain = createMockQueryChain([]);
      mockDbSelect.mockReturnValue(chain);

      const res = await request(app).get("/api/progress");

      expect(res.status).toBe(200);
      expect(res.body.progress).toBeDefined();
      expect(res.body.progress.quranVersesRead).toBe(0);
      expect(res.body.progress.arabicWordsLearned).toBe(0);
      expect(res.body.progress.prayerTimesChecked).toBe(0);
      expect(res.body.progress.reflectionSessionsCompleted).toBe(0);
      expect(res.body.progress.streakDays).toBe(0);
    });

    test("returns existing progress", async () => {
      const mockProgress = {
        quranVersesRead: 50,
        arabicWordsLearned: 20,
        prayerTimesChecked: 30,
        reflectionSessionsCompleted: 5,
        streakDays: 7,
        lastActiveDate: new Date(),
        updatedAt: new Date(),
      };
      const chain = createMockQueryChain([mockProgress]);
      mockDbSelect.mockReturnValue(chain);
      // Mock the update chain for streak check
      mockDbUpdate.mockReturnValue(createMockQueryChain([]));

      const res = await request(app).get("/api/progress");

      expect(res.status).toBe(200);
      expect(res.body.progress.quranVersesRead).toBe(50);
      expect(res.body.progress.streakDays).toBe(7);
    });

    test("resets streak when inactive for more than 1 day", async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const mockProgress = {
        quranVersesRead: 50,
        arabicWordsLearned: 20,
        prayerTimesChecked: 30,
        reflectionSessionsCompleted: 5,
        streakDays: 7,
        lastActiveDate: twoDaysAgo,
        updatedAt: twoDaysAgo,
      };

      const selectChain = createMockQueryChain([mockProgress]);
      mockDbSelect.mockReturnValue(selectChain);
      const updateChain = createMockQueryChain([]);
      mockDbUpdate.mockReturnValue(updateChain);

      const res = await request(app).get("/api/progress");

      expect(res.status).toBe(200);
      expect(res.body.progress.streakDays).toBe(0);
    });

    test("requires authentication", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(requestLoggerMiddleware);
      const unauthServer = await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/progress");

      expect(res.status).toBe(401);

      unauthServer.close();
    });
  });

  describe("POST /api/progress/track", () => {
    test("tracks quran verse read", async () => {
      const selectChain = createMockQueryChain([]);
      mockDbSelect.mockReturnValue(selectChain);
      const insertChain = createMockQueryChain([]);
      mockDbInsert.mockReturnValue(insertChain);

      const updatedProgress = {
        quranVersesRead: 5,
        arabicWordsLearned: 0,
        prayerTimesChecked: 0,
        reflectionSessionsCompleted: 0,
        streakDays: 1,
        lastActiveDate: new Date(),
      };

      // Second select after insert for returning updated data
      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain([]); // Check existing
        return createMockQueryChain([updatedProgress]); // Fetch updated
      });

      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "quran_verse_read", count: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.progress).toBeDefined();
    });

    test("tracks arabic word learned", async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain([]));
      mockDbInsert.mockReturnValue(createMockQueryChain([]));

      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "arabic_word_learned", count: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("tracks reflection completed", async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain([]));
      mockDbInsert.mockReturnValue(createMockQueryChain([]));

      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "reflection_completed" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("defaults count to 1", async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain([]));
      mockDbInsert.mockReturnValue(createMockQueryChain([]));

      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "prayer_time_checked" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("rejects invalid type", async () => {
      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "invalid_type" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects count exceeding maximum", async () => {
      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "quran_verse_read", count: 1001 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("rejects negative count", async () => {
      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "quran_verse_read", count: -1 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("requires authentication", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use(requestLoggerMiddleware);
      const unauthServer = await registerRoutes(unauthApp);

      const res = await request(unauthApp)
        .post("/api/progress/track")
        .send({ type: "quran_verse_read" });

      expect(res.status).toBe(401);

      unauthServer.close();
    });
  });

  // ===========================================================================
  // VALIDATION SCHEMA TESTS
  // ===========================================================================

  describe("Validation Schemas", () => {
    test("prayer preferences rejects extra fields", async () => {
      const res = await request(app)
        .put("/api/prayer/preferences")
        .send({ calculationMethod: "MWL", unknownField: "value" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("progress track rejects extra fields", async () => {
      const res = await request(app)
        .post("/api/progress/track")
        .send({ type: "quran_verse_read", count: 1, extraField: "value" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });
  });
});
