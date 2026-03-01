/**
 * API Flow Integration Tests
 *
 * Tests the full reflection flow through the API:
 * analyze -> reframe -> practice -> save
 *
 * Uses the existing routes.test.ts pattern with mock Anthropic responses.
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
import { storage } from "../storage";
import * as billingService from "../billing";
import * as config from "../config";
import * as encryption from "../encryption";
import * as dataRetention from "../data-retention";
import { requestLoggerMiddleware } from "../middleware/request-logger";

jest.setTimeout(15000);

// Mock uuid
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-flow-request-id"),
}));

// Mock all dependencies
jest.mock("@shared/schema", () => ({
  users: {},
}));
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
jest.mock("../billing");
jest.mock("../config");
jest.mock("../encryption");
jest.mock("../data-retention");

// Mock Anthropic
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

// Mock middleware
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
  return router;
});

describe("Full Reflection API Flow", () => {
  let app: Express;
  let server: Server;
  const mockUserId = "flow-test-user";

  beforeEach(async () => {
    jest.clearAllMocks();

    mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
      content: [{ type: "text", text: "{}" }],
    });

    app = express();
    app.use(express.json());
    app.use(requestLoggerMiddleware);

    // Mock auth
    app.use((req, _res, next) => {
      req.auth = { userId: mockUserId, sessionToken: "mock-token" };
      next();
    });

    server = await registerRoutes(app);

    // Default config
    (config.VALIDATION_MODE as any) = false;
    (config.isAnthropicConfigured as jest.Mock).mockReturnValue(true);

    // Default storage mocks
    (storage.getOrCreateUser as jest.Mock<any>).mockResolvedValue({
      id: mockUserId,
    });
    (storage.getTodayReflectionCount as jest.Mock<any>).mockResolvedValue(0);
    (storage.saveReflection as jest.Mock<any>).mockResolvedValue(undefined);
    (storage.getReflectionHistory as jest.Mock<any>).mockResolvedValue([]);

    // Billing
    (
      billingService.billingService.getBillingStatus as any as jest.Mock<any>
    ).mockResolvedValue({ status: "free" });
    (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
      false,
    );

    // Encryption
    (encryption.encryptData as any as jest.Mock<any>).mockImplementation(
      (data: string) => `encrypted:${data}`,
    );
    (encryption.decryptData as any as jest.Mock<any>).mockImplementation(
      (data: string) =>
        data.startsWith("encrypted:") ? data.substring(10) : data,
    );

    // Data retention
    (dataRetention.isAdminEndpointEnabled as jest.Mock).mockReturnValue(false);
    (dataRetention.verifyAdminToken as jest.Mock).mockReturnValue(false);
  });

  afterEach(async () => {
    if (server?.close) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // =========================================================================
  // FULL FLOW: analyze -> reframe -> practice -> save
  // =========================================================================

  test("complete reflection flow: analyze -> reframe -> practice -> save", async () => {
    // STEP 1: Analyze
    mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            distortions: ["Catastrophizing", "Black-and-white thinking"],
            happening: "You're feeling anxious about tomorrow.",
            pattern: ["Predicting worst outcomes without evidence."],
            matters: "Your concern shows you care about the outcome.",
          }),
        },
      ],
    });

    const analyzeRes = await request(app).post("/api/analyze").send({
      thought: "Everything will go wrong tomorrow at my presentation",
      emotionalIntensity: "moderate",
    });

    expect(analyzeRes.status).toBe(200);
    expect(analyzeRes.body.distortions).toContain("Catastrophizing");
    expect(analyzeRes.body.happening).toBeTruthy();

    // STEP 2: Reframe
    mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            beliefTested:
              "Predicting certain failure for tomorrow's presentation.",
            perspective:
              "Effort is required, outcomes belong to Allah. You can prepare without certainty.",
            nextStep: "Focus on one section of the presentation tonight.",
            anchors: [
              "Effort is required, outcomes belong to Allah",
              "Allah does not burden beyond capacity",
            ],
          }),
        },
      ],
    });

    const reframeRes = await request(app).post("/api/reframe").send({
      thought: "Everything will go wrong tomorrow",
      patterns: analyzeRes.body.distortions,
      analysis: analyzeRes.body.happening,
    });

    expect(reframeRes.status).toBe(200);
    expect(reframeRes.body.beliefTested).toBeTruthy();
    expect(reframeRes.body.perspective).toBeTruthy();
    expect(reframeRes.body.anchors).toBeInstanceOf(Array);

    // STEP 3: Practice
    mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            title: "Grounding Breath",
            steps: [
              "Inhale for 4 counts, saying SubhanAllah.",
              "Hold for 4 counts.",
              "Exhale for 4 counts, releasing tension.",
            ],
            reminder: "Each breath returns you to the present.",
            duration: "2-3 minutes",
          }),
        },
      ],
    });

    const practiceRes = await request(app).post("/api/practice").send({
      reframe: reframeRes.body.perspective,
    });

    expect(practiceRes.status).toBe(200);
    expect(practiceRes.body.title).toBeTruthy();
    expect(practiceRes.body.steps).toBeInstanceOf(Array);
    expect(practiceRes.body.steps.length).toBeGreaterThan(0);

    // STEP 4: Save reflection
    const saveRes = await request(app).post("/api/reflection/save").send({
      thought: "Everything will go wrong tomorrow",
      patterns: analyzeRes.body.distortions,
      reframe: reframeRes.body.perspective,
      intention: "I'll prepare one section and trust the rest to Allah",
      practice: practiceRes.body.title,
      anchor: reframeRes.body.anchors[0],
    });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.success).toBe(true);

    // Verify storage was called with encrypted data
    expect(storage.saveReflection).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        thought: expect.stringContaining("encrypted:"),
        reframe: expect.stringContaining("encrypted:"),
        distortions: analyzeRes.body.distortions,
      }),
    );
  });

  // =========================================================================
  // FLOW WITH FREE USER LIMIT
  // =========================================================================

  test("second reflection blocked for free user", async () => {
    (storage.getTodayReflectionCount as jest.Mock<any>).mockResolvedValue(3);

    const res = await request(app)
      .post("/api/reflection/save")
      .send({
        thought: "Second thought",
        patterns: ["Test"],
        reframe: "Test reframe",
        practice: "Test practice",
      });

    expect(res.status).toBe(402);
    expect(res.body.code).toBe("PAYMENT_REQUIRED");
  });

  // =========================================================================
  // ANALYZE -> VERIFY CAN-REFLECT BEFORE SAVE
  // =========================================================================

  test("can-reflect check before starting flow", async () => {
    // Free user, no reflections today
    const canReflectRes = await request(app).get("/api/reflection/can-reflect");

    expect(canReflectRes.status).toBe(200);
    expect(canReflectRes.body.canReflect).toBe(true);
    expect(canReflectRes.body.remaining).toBe(3);
  });

  // =========================================================================
  // VALIDATION MODE FALLBACK FLOW
  // =========================================================================

  test("full flow works in validation mode without AI", async () => {
    (config.VALIDATION_MODE as any) = true;
    (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

    (config.getValidationModeAnalyzeResponse as jest.Mock).mockReturnValue({
      distortions: ["Emotional reasoning"],
      happening: "Validation placeholder",
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

    // All three endpoints should return 200 with placeholder data
    const analyzeRes = await request(app).post("/api/analyze").send({
      thought: "Test thought for validation",
    });
    expect(analyzeRes.status).toBe(200);
    expect(analyzeRes.body.distortions).toBeDefined();

    const reframeRes = await request(app)
      .post("/api/reframe")
      .send({
        thought: "Test thought",
        patterns: ["Emotional reasoning"],
      });
    expect(reframeRes.status).toBe(200);
    expect(reframeRes.body.beliefTested).toBeDefined();

    const practiceRes = await request(app).post("/api/practice").send({
      reframe: "Test reframe",
    });
    expect(practiceRes.status).toBe(200);
    expect(practiceRes.body.title).toBeDefined();
  });
});
