/**
 * Tests for Hifz API Routes
 *
 * Tests AI-powered mistake analysis endpoint for Hifz memorization feature.
 */

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import request from "supertest";
import { registerHifzRoutes } from "../routes/hifz-routes";
import type { WordComparisonResult } from "../../shared/types/hifz";
import * as aiQuota from "../middleware/ai-daily-quota";
import { billingService } from "../billing";
import * as config from "../config";
import { requestLoggerMiddleware } from "../middleware/request-logger";

// =============================================================================
// MOCKS
// =============================================================================

// Mock uuid module (used by request-logger middleware)
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-request-id-hifz"),
}));

// Mock billing, config
jest.mock("../billing");
jest.mock("../config");

// Mock Sentry
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
}));

// Mock request logger - add logger to req
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock("../middleware/request-logger", () => ({
  requestLoggerMiddleware: jest.fn(
    (req: any, _res: Response, next: NextFunction) => {
      req.logger = mockLogger;
      req.id = "mock-request-id-hifz";
      next();
    },
  ),
}));

describe("POST /api/hifz/analyze-mistakes", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mock functions
    mockAnthropicCreate = jest.fn() as jest.Mock;

    // Setup Express app
    app = express();
    app.use(express.json());
    app.use(requestLoggerMiddleware);

    // Mock billing service
    (billingService.getBillingStatus as jest.Mock) = jest.fn(async () => ({
      status: "free",
    }));
    (billingService.isPaidUser as jest.Mock) = jest.fn(() => false);

    // Mock config
    (config.isAnthropicConfigured as jest.Mock<
      typeof config.isAnthropicConfigured
    >) = jest.fn(() => true);
    (config.VALIDATION_MODE as boolean) = false;

    // Mock AI daily quota (in-memory map)
    aiQuota.aiDailyUsage.clear();

    // Register routes
    registerHifzRoutes(app);
  });

  test("returns AI-generated tips for recitation mistakes", async () => {
    // Mock Anthropic response
    (mockAnthropicCreate as any).mockResolvedValue({
      content: [
        {
          type: "text",
          text: "Great effort! You scored 75% on Surah Al-Fatiha verse 1.\n\nTips for improvement:\n1. Pay attention to the مَ (ma) sound - you pronounced it as مِ (mi)\n2. Practice the elongation (madd) in بِسْمِ - hold it for 2 counts\n3. Review the tajweed rule for noon sakinah before ب\n\nKeep practicing! You're making excellent progress.",
        },
      ],
    });

    const wordResults: WordComparisonResult[] = [
      { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
      { expected: "اللَّهِ", actual: "اللِّهِ", isCorrect: false },
    ];

    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        transcribedText: "بِسْمِ اللِّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        score: 75,
        wordResults,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tips");
    expect(response.body.tips).toContain("Tips for improvement");
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(1);
  });

  test("returns 400 when surahNumber is missing", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 when verseNumber is missing", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 when expectedText is missing", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 when transcribedText is missing", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 when score is missing", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 when wordResults is missing", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("returns 400 when score is below 0", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: -10,
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Score must be between 0 and 100");
  });

  test("returns 400 when score is above 100", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 150,
        wordResults: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Score must be between 0 and 100");
  });

  test("returns 400 when wordResults is not an array", async () => {
    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: "not an array",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("wordResults must be an array");
  });

  test("returns 429 when AI quota exceeded (free tier)", async () => {
    // Simulate user hitting quota limit by making 3 calls
    // Note: supertest uses ::ffff:127.0.0.1 as the IP
    const userId = "::ffff:127.0.0.1";
    const today = new Date().toISOString().split("T")[0];
    aiQuota.aiDailyUsage.set(userId, { count: 3, date: today });

    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(429);
    expect(response.body.error).toBe("Daily AI limit reached");
  });

  test("calls Claude Haiku with correct model and parameters", async () => {
    (mockAnthropicCreate as any).mockResolvedValue({
      content: [{ type: "text", text: "Test tips" }],
    });

    const wordResults: WordComparisonResult[] = [
      { expected: "بِسْمِ", actual: "بِسْمِ", isCorrect: true },
      { expected: "اللَّهِ", actual: "اللِّهِ", isCorrect: false },
    ];

    await request(app).post("/api/hifz/analyze-mistakes").send({
      surahNumber: 1,
      verseNumber: 1,
      expectedText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      transcribedText: "بِسْمِ اللِّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      score: 75,
      wordResults,
    });

    expect(mockAnthropicCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        temperature: 0.7,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining("Surah 1"),
          }),
        ]),
      }),
    );
  });

  test("handles Anthropic API errors gracefully", async () => {
    (mockAnthropicCreate as any).mockRejectedValue(new Error("API error"));

    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Failed to analyze mistakes");
  });

  test("returns remainingQuota for free users", async () => {
    (mockAnthropicCreate as any).mockResolvedValue({
      content: [{ type: "text", text: "Test tips" }],
    });

    // Start fresh - no previous usage
    // Note: supertest uses ::ffff:127.0.0.1 as the IP
    const userId = "::ffff:127.0.0.1";
    const today = new Date().toISOString().split("T")[0];
    aiQuota.aiDailyUsage.set(userId, { count: 0, date: today });

    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("remainingQuota");
    expect(response.body.remainingQuota).toBe(2); // 3 - 1 (after this call) = 2
  });

  test("returns null remainingQuota for paid users", async () => {
    (mockAnthropicCreate as any).mockResolvedValue({
      content: [{ type: "text", text: "Test tips" }],
    });

    (billingService.isPaidUser as jest.Mock) = jest.fn(() => true);

    const response = await request(app)
      .post("/api/hifz/analyze-mistakes")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        expectedText: "بِسْمِ اللَّهِ",
        transcribedText: "بِسْمِ اللِّهِ",
        score: 75,
        wordResults: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("remainingQuota");
    expect(response.body.remainingQuota).toBeNull();
  });
});
