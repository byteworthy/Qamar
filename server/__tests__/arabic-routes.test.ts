/**
 * Arabic Language Routes Test Suite
 *
 * Tests the tutor, pronunciation, and translation API endpoints
 * plus the shared AI daily quota middleware.
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
import { registerRoutes } from "../routes";
import * as billingService from "../billing";
import * as config from "../config";
import {
  aiDailyUsage,
  getAIUsageToday,
  incrementAIUsage,
} from "../middleware/ai-daily-quota";
import { FREE_DAILY_LIMIT } from "../routes/constants";

// =============================================================================
// MOCKS — mirror the pattern from routes.test.ts
// =============================================================================

// Mock uuid module (used by request-logger middleware)
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-request-id-456"),
}));

// Mock shared schema
jest.mock("@shared/schema", () => ({
  users: {},
}));

// Mock storage
jest.mock("../storage", () => ({
  storage: {
    getReflectionHistory: jest.fn(),
    getOrCreateUser: jest.fn(),
    getTodayReflectionCount: jest.fn(),
    saveReflection: jest.fn(),
    getReflectionCount: jest.fn(),
    getRecentReflections: jest.fn(),
    deleteReflection: jest.fn(),
    getLatestInsightSummary: jest.fn(),
    saveInsightSummary: jest.fn(),
    getAssumptionLibrary: jest.fn(),
  },
}));

// Mock billing, config, encryption, data-retention
jest.mock("../billing");
jest.mock("../config");
jest.mock("../encryption");
jest.mock("../data-retention");

// Mock Sentry (used by tutor, pronunciation, translation routes)
jest.mock("@sentry/node", () => ({
  captureException: jest.fn(),
  startSpan: jest.fn((_opts: unknown, fn: () => unknown) => fn()),
}));

// Mock Anthropic with a factory that can be reconfigured per test
let mockAnthropicCreate: jest.Mock;
jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      get create() {
        return mockAnthropicCreate;
      },
    },
  }));
});

// Mock rate limiter middleware (pass-through)
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

// Mock notification routes
jest.mock("../notificationRoutes", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/test", (_req: Request, res: Response) =>
    res.json({ test: true }),
  );
  return router;
});

// Mock the translation service
jest.mock("../services/translation-service", () => ({
  translateText: (jest.fn() as jest.Mock<any>).mockResolvedValue({
    translatedText: "translated text",
    source: "mymemory",
  }),
  transliterateArabic: jest.fn().mockReturnValue("transliterated"),
}));

// Mock the pronunciation scorer
jest.mock("../services/pronunciation-scorer", () => ({
  scorePronunciation: jest.fn().mockReturnValue({
    score: 85,
    accuracy: 0.87,
    wordResults: [
      { expected: "بسم", actual: "بسم", isCorrect: true },
      { expected: "الله", actual: "الاه", isCorrect: false },
    ],
  }),
}));

// Don't mock tutor-prompts — let it use real values

// =============================================================================
// AI DAILY QUOTA MIDDLEWARE — UNIT TESTS
// =============================================================================

describe("AI Daily Quota Middleware (unit)", () => {
  beforeEach(() => {
    aiDailyUsage.clear();
  });

  test("getAIUsageToday returns 0 for a new user", () => {
    expect(getAIUsageToday("new-user")).toBe(0);
  });

  test("incrementAIUsage increments counter from 0 to 1", () => {
    incrementAIUsage("user-a");
    expect(getAIUsageToday("user-a")).toBe(1);
  });

  test("getAIUsageToday returns correct count after multiple increments", () => {
    incrementAIUsage("user-b");
    incrementAIUsage("user-b");
    incrementAIUsage("user-b");
    expect(getAIUsageToday("user-b")).toBe(3);
  });

  test("different users have independent counters", () => {
    incrementAIUsage("user-x");
    incrementAIUsage("user-x");
    incrementAIUsage("user-y");
    expect(getAIUsageToday("user-x")).toBe(2);
    expect(getAIUsageToday("user-y")).toBe(1);
  });

  test("getAIUsageToday resets count when date changes", () => {
    // Manually set a past date entry
    aiDailyUsage.set("user-z", { count: 10, date: "2020-01-01" });
    expect(getAIUsageToday("user-z")).toBe(0);
  });
});

// =============================================================================
// ROUTE INTEGRATION TESTS
// =============================================================================

describe("Arabic Language Routes", () => {
  let app: Express;
  let server: Server;

  const mockUserId = "test-user-arabic";

  beforeEach(async () => {
    jest.clearAllMocks();
    aiDailyUsage.clear();

    // Setup default Anthropic mock
    mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
      content: [{ type: "text", text: "default ai response" }],
    });

    // Create fresh Express app
    app = express();
    app.use(express.json());

    // Request logger middleware (adds req.logger and req.id)
    const { requestLoggerMiddleware } = require("../middleware/request-logger");
    app.use(requestLoggerMiddleware);

    // Mock authentication middleware
    app.use((req, _res, next) => {
      req.auth = { userId: mockUserId, sessionToken: "mock-token" };
      next();
    });

    // Register all routes
    server = await registerRoutes(app);

    // Setup default config mocks
    (config.VALIDATION_MODE as any) = false;
    (config.isAnthropicConfigured as jest.Mock).mockReturnValue(true);
    (config.getValidationModeAnalyzeResponse as jest.Mock).mockReturnValue({
      distortions: ["Test distortion"],
      happening: "Test happening",
      pattern: ["Test pattern"],
      matters: "Test matters",
    });
    (config.getValidationModeReframeResponse as jest.Mock).mockReturnValue({
      beliefTested: "Test belief",
      perspective: "Test perspective",
      nextStep: "Test step",
      anchors: ["Test anchor"],
    });
    (config.getValidationModePracticeResponse as jest.Mock).mockReturnValue({
      title: "Test practice",
      steps: ["Step 1"],
      reminder: "Test reminder",
      duration: "1 min",
    });

    // Setup default billing mocks — free user by default
    (
      billingService.billingService.getBillingStatus as any as jest.Mock<any>
    ).mockResolvedValue({
      status: "free",
    });
    (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
      false,
    );
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  // ===========================================================================
  // POST /api/tutor/chat
  // ===========================================================================

  describe("POST /api/tutor/chat", () => {
    test("returns 400 for missing message", async () => {
      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ mode: "vocabulary" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 400 for missing mode", async () => {
      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ message: "hello" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 400 for invalid mode", async () => {
      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ message: "hello", mode: "invalid_mode" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 200 with response for valid vocabulary request", async () => {
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "Marhaba! Let's learn some words." }],
      });

      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ message: "Teach me greetings", mode: "vocabulary" });

      expect(res.status).toBe(200);
      expect(res.body.response).toBe("Marhaba! Let's learn some words.");
      expect(res.body.mode).toBe("vocabulary");
      expect(res.body.remainingQuota).toBeDefined();
    });

    test("returns 200 with response for valid conversation request with history", async () => {
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "Great conversation!" }],
      });

      const res = await request(app)
        .post("/api/tutor/chat")
        .send({
          message: "How do I say thank you?",
          mode: "conversation",
          conversationHistory: [
            { role: "user", content: "Hello" },
            { role: "assistant", content: "Marhaba!" },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.response).toBe("Great conversation!");
      expect(res.body.mode).toBe("conversation");
    });

    test("returns 429 when daily limit exceeded for free user", async () => {
      // Exhaust the quota by setting usage to the limit
      // The middleware uses req.ip as userId
      const ip = "::ffff:127.0.0.1";
      for (let i = 0; i < FREE_DAILY_LIMIT; i++) {
        incrementAIUsage(ip);
      }

      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ message: "Teach me", mode: "vocabulary" });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe("Daily AI limit reached");
      expect(res.body.upgradeRequired).toBe(true);
    });

    test("paid users bypass daily quota limit", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );

      // Exhaust the quota
      const ip = "::ffff:127.0.0.1";
      for (let i = 0; i < FREE_DAILY_LIMIT + 5; i++) {
        incrementAIUsage(ip);
      }

      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "Unlimited learning!" }],
      });

      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ message: "Teach me", mode: "grammar" });

      expect(res.status).toBe(200);
      expect(res.body.response).toBe("Unlimited learning!");
      expect(res.body.remainingQuota).toBeNull();
    });

    test("returns validation mode response when VALIDATION_MODE is true", async () => {
      (config.VALIDATION_MODE as any) = true;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post("/api/tutor/chat")
        .send({ message: "hello", mode: "vocabulary" });

      expect(res.status).toBe(200);
      expect(res.body.response).toContain("VALIDATION MODE");
      expect(res.body.mode).toBe("vocabulary");
    });
  });

  // ===========================================================================
  // POST /api/pronunciation/check
  // ===========================================================================

  describe("POST /api/pronunciation/check", () => {
    test("returns 400 for missing expectedText", async () => {
      const res = await request(app)
        .post("/api/pronunciation/check")
        .send({ transcribedText: "بسم الاه" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 400 for missing transcribedText", async () => {
      const res = await request(app)
        .post("/api/pronunciation/check")
        .send({ expectedText: "بسم الله" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 400 for empty expectedText", async () => {
      const res = await request(app)
        .post("/api/pronunciation/check")
        .send({ expectedText: "", transcribedText: "بسم" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 200 with score and wordResults for valid request", async () => {
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "Focus on the letter ل pronunciation." }],
      });

      const res = await request(app)
        .post("/api/pronunciation/check")
        .send({
          expectedText: "بسم الله",
          transcribedText: "بسم الاه",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(85);
      expect(res.body.accuracy).toBe(0.87);
      expect(res.body.wordResults).toHaveLength(2);
      expect(res.body.wordResults[0].isCorrect).toBe(true);
      expect(res.body.wordResults[1].isCorrect).toBe(false);
      expect(res.body.tips).toBeDefined();
      expect(res.body.remainingQuota).toBeDefined();
    });

    test("returns 429 when daily limit exceeded for free user", async () => {
      const ip = "::ffff:127.0.0.1";
      for (let i = 0; i < FREE_DAILY_LIMIT; i++) {
        incrementAIUsage(ip);
      }

      const res = await request(app)
        .post("/api/pronunciation/check")
        .send({
          expectedText: "بسم الله",
          transcribedText: "بسم الاه",
        });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe("Daily AI limit reached");
      expect(res.body.upgradeRequired).toBe(true);
    });

    test("accepts optional surahNumber and verseNumber", async () => {
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "Tip" }],
      });

      const res = await request(app)
        .post("/api/pronunciation/check")
        .send({
          expectedText: "بسم الله الرحمن الرحيم",
          transcribedText: "بسم الله الرحمن الرحيم",
          surahNumber: 1,
          verseNumber: 1,
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBeDefined();
    });
  });

  // ===========================================================================
  // POST /api/translate
  // ===========================================================================

  describe("POST /api/translate", () => {
    test("returns 400 for missing text", async () => {
      const res = await request(app)
        .post("/api/translate")
        .send({ from: "en", to: "ar" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 400 for empty text", async () => {
      const res = await request(app)
        .post("/api/translate")
        .send({ text: "", from: "en", to: "ar" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 200 with translatedText for valid request", async () => {
      const res = await request(app)
        .post("/api/translate")
        .send({ text: "peace", from: "en", to: "ar" });

      expect(res.status).toBe(200);
      expect(res.body.translatedText).toBe("translated text");
      expect(res.body.transliteration).toBe("transliterated");
      expect(res.body.source).toBe("mymemory");
    });

    test("uses default from/to when not specified", async () => {
      const res = await request(app)
        .post("/api/translate")
        .send({ text: "hello" });

      expect(res.status).toBe(200);
      expect(res.body.translatedText).toBe("translated text");
    });

    test("does NOT enforce AI daily quota (free endpoint)", async () => {
      // Exhaust the AI quota
      const ip = "::ffff:127.0.0.1";
      for (let i = 0; i < FREE_DAILY_LIMIT + 10; i++) {
        incrementAIUsage(ip);
      }

      const res = await request(app)
        .post("/api/translate")
        .send({ text: "hello", from: "en", to: "ar" });

      // Should still succeed — translation is free, no AI quota check
      expect(res.status).toBe(200);
      expect(res.body.translatedText).toBe("translated text");
    });

    test("returns null transliteration when target is not Arabic", async () => {
      const res = await request(app)
        .post("/api/translate")
        .send({ text: "سلام", from: "ar", to: "en" });

      expect(res.status).toBe(200);
      expect(res.body.transliteration).toBeNull();
    });
  });

  // ===========================================================================
  // POST /api/translate/explain
  // ===========================================================================

  describe("POST /api/translate/explain", () => {
    test("returns 400 for missing arabicText", async () => {
      const res = await request(app)
        .post("/api/translate/explain")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 400 for empty arabicText", async () => {
      const res = await request(app)
        .post("/api/translate/explain")
        .send({ arabicText: "" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe("VALIDATION_FAILED");
    });

    test("returns 200 with explanation for valid request", async () => {
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [
          {
            type: "text",
            text: "The root letters are ك-ت-ب (k-t-b) meaning 'to write'.",
          },
        ],
      });

      const res = await request(app)
        .post("/api/translate/explain")
        .send({ arabicText: "كتاب" });

      expect(res.status).toBe(200);
      expect(res.body.explanation).toContain("root letters");
      expect(res.body.remainingQuota).toBeDefined();
    });

    test("returns 429 when daily limit exceeded for free user", async () => {
      const ip = "::ffff:127.0.0.1";
      for (let i = 0; i < FREE_DAILY_LIMIT; i++) {
        incrementAIUsage(ip);
      }

      const res = await request(app)
        .post("/api/translate/explain")
        .send({ arabicText: "كتاب" });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe("Daily AI limit reached");
      expect(res.body.upgradeRequired).toBe(true);
    });

    test("returns validation mode response when VALIDATION_MODE is true", async () => {
      (config.VALIDATION_MODE as any) = true;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post("/api/translate/explain")
        .send({ arabicText: "كتاب" });

      expect(res.status).toBe(200);
      expect(res.body.explanation).toContain("VALIDATION MODE");
    });

    test("returns 503 when AI not configured and not in validation mode", async () => {
      (config.VALIDATION_MODE as any) = false;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post("/api/translate/explain")
        .send({ arabicText: "كتاب" });

      expect(res.status).toBe(503);
      expect(res.body.code).toBe("AI_SERVICE_UNAVAILABLE");
    });

    test("paid users get null remainingQuota", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );

      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "Explanation here." }],
      });

      const res = await request(app)
        .post("/api/translate/explain")
        .send({ arabicText: "كتاب" });

      expect(res.status).toBe(200);
      expect(res.body.remainingQuota).toBeNull();
    });
  });
});
