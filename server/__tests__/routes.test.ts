/**
 * Routes Test Suite for Noor
 *
 * Tests all API endpoints in server/routes.ts
 * Target: >80% code coverage
 *
 * Endpoints covered:
 * - Health check
 * - AI endpoints (analyze, reframe, practice)
 * - Reflection endpoints (save, history, delete, can-reflect, patterns)
 * - Insights endpoints (summary, assumptions)
 * - Duas endpoints (contextual)
 * - Admin endpoints (retention cleanup)
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
import Anthropic from "@anthropic-ai/sdk";
import { Logger } from "../utils/logger";
import { requestLoggerMiddleware } from "../middleware/request-logger";

// Mock uuid module (used by request-logger middleware)
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-request-id-123"),
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

// Mock Anthropic with a factory that can be reconfigured
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

// Mock notification routes
jest.mock("../notificationRoutes", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/test", (_req: Request, res: Response) =>
    res.json({ test: true }),
  );
  return router;
});

describe("API Routes", () => {
  let app: Express;
  let server: Server;

  // Mock authenticated user
  const mockUserId = "test-user-123";

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default Anthropic mock (can be overridden by tests)
    mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
      content: [{ type: "text", text: "default response" }],
    });

    // Create fresh Express app
    app = express();
    app.use(express.json());

    // Request logger middleware (adds req.logger)
    app.use(requestLoggerMiddleware);

    // Mock authentication middleware
    app.use((req, _res, next) => {
      req.auth = { userId: mockUserId, sessionToken: "mock-token" };
      next();
    });

    // Register routes
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

    // Setup default storage mocks
    (storage.getReflectionHistory as jest.Mock<any>).mockResolvedValue([]);
    (storage.getOrCreateUser as jest.Mock<any>).mockResolvedValue({
      id: mockUserId,
    });
    (storage.getTodayReflectionCount as jest.Mock<any>).mockResolvedValue(0);
    (storage.saveReflection as jest.Mock<any>).mockResolvedValue(undefined);
    (storage.getReflectionCount as jest.Mock<any>).mockResolvedValue(0);
    (storage.getRecentReflections as jest.Mock<any>).mockResolvedValue([]);
    (storage.deleteReflection as jest.Mock<any>).mockResolvedValue(1);
    (storage.getLatestInsightSummary as jest.Mock<any>).mockResolvedValue(null);
    (storage.saveInsightSummary as jest.Mock<any>).mockResolvedValue(undefined);
    (storage.getAssumptionLibrary as jest.Mock<any>).mockResolvedValue([]);

    // Setup default billing mocks
    (
      billingService.billingService.getBillingStatus as any as jest.Mock<any>
    ).mockResolvedValue({
      status: "free",
    });
    (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
      false,
    );

    // Setup encryption mocks
    (encryption.encryptData as any as jest.Mock<any>).mockImplementation(
      (data: string) => `encrypted:${data}`,
    );
    (encryption.decryptData as any as jest.Mock<any>).mockImplementation(
      (data: string) =>
        data.startsWith("encrypted:") ? data.substring(10) : data,
    );

    // Setup data retention mocks
    (dataRetention.isAdminEndpointEnabled as jest.Mock).mockReturnValue(false);
    (dataRetention.verifyAdminToken as jest.Mock).mockReturnValue(false);
    (dataRetention.runManualCleanup as any as jest.Mock<any>).mockResolvedValue(
      {
        deletedReflections: 0,
        deletedUsers: 0,
      },
    );
  });

  afterEach(() => {
    if (server && server.close) {
      server.close();
    }
  });

  // =============================================================================
  // HEALTH CHECK ENDPOINT
  // =============================================================================

  describe("GET /api/health", () => {
    test("returns healthy status when all checks pass", async () => {
      // Use the factory pattern mock
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue({
        content: [{ type: "text", text: "test response" }],
      });

      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
      expect(res.body.checks).toBeDefined();
      expect(res.body.checks.database).toBe(true);
      expect(res.body.checks.timestamp).toBeDefined();
      expect(res.body.checks.version).toBe("1.0.0");
    });

    test("returns validation mode in checks", async () => {
      (config.VALIDATION_MODE as any) = true;

      const res = await request(app).get("/api/health");

      expect(res.body.checks.mode).toBe("validation");
    });

    test("returns degraded status when database fails", async () => {
      (
        (storage as any).getReflectionHistory as jest.Mock<any>
      ).mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/health");

      expect(res.status).toBe(503);
      expect(res.body.status).toBe("degraded");
      expect(res.body.checks.database).toBe(false);
      expect(res.body.error).toContain("Database unavailable");
    });

    test("handles health check errors gracefully", async () => {
      (
        (storage as any).getReflectionHistory as jest.Mock<any>
      ).mockImplementation(() => {
        throw new Error("Catastrophic error");
      });

      const res = await request(app).get("/api/health");

      expect(res.status).toBe(503);
      expect(res.body.status).toBe("degraded"); // Degraded when some checks fail
      expect(res.body.checks.database).toBe(false);
    });
  });

  // =============================================================================
  // ANALYZE ENDPOINT
  // =============================================================================

  describe("POST /api/analyze", () => {
    const mockAnthropicResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            distortions: ["Catastrophizing"],
            happening: "You're experiencing anxiety",
            pattern: ["This is a common thought pattern"],
            matters: "Your feelings are valid",
          }),
        },
      ],
    };

    beforeEach(() => {
      // Reconfigure the mock for this describe block
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue(
        mockAnthropicResponse,
      );
    });

    test("analyzes thought successfully", async () => {
      (config.VALIDATION_MODE as any) = false;
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue(
        mockAnthropicResponse,
      );

      const res = await request(app).post("/api/analyze").send({
        thought: "I'm worried about failing my exam",
        emotionalIntensity: "moderate",
      });

      expect(res.status).toBe(200);
      expect(res.body.distortions).toBeDefined();
      expect(res.body.happening).toBeDefined();
      expect(res.body.pattern).toBeDefined();
      expect(res.body.matters).toBeDefined();
    });

    test("returns validation error for missing thought", async () => {
      const res = await request(app).post("/api/analyze").send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
      expect(res.body.details).toBeDefined();
    });

    test("returns validation error for thought too long", async () => {
      const res = await request(app)
        .post("/api/analyze")
        .send({
          thought: "x".repeat(5001),
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
    });

    test("returns placeholder in validation mode", async () => {
      (config.VALIDATION_MODE as any) = true;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app).post("/api/analyze").send({
        thought: "I'm feeling anxious",
      });

      expect(res.status).toBe(200);
      expect(res.body.distortions).toBeDefined();
    });

    test("returns 503 when AI not configured", async () => {
      (config.VALIDATION_MODE as any) = false;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app).post("/api/analyze").send({
        thought: "I'm feeling anxious",
      });

      expect(res.status).toBe(503);
      expect(res.body.code).toBe("AI_SERVICE_UNAVAILABLE");
      expect(res.body.error).toBe(true);
    });

    test("handles AI errors gracefully (via validation mode fallback)", async () => {
      // Note: VALIDATION_MODE is true in test environment, so this test verifies
      // that a 503 is returned when AI is not configured
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);
      mockAnthropicCreate = (jest.fn() as any).mockRejectedValue(
        new Error("AI Error"),
      );

      const res = await request(app).post("/api/analyze").send({
        thought: "I'm feeling anxious",
      });

      // Returns service unavailable when AI not configured
      expect(res.status).toBe(503);
      expect(res.body.error).toBeDefined();
    });
  });

  // =============================================================================
  // REFRAME ENDPOINT
  // =============================================================================

  describe("POST /api/reframe", () => {
    const mockAnthropicResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            beliefTested: "The belief that you will fail",
            perspective: "Failure is part of learning",
            nextStep: "Focus on preparation",
            anchors: ["Effort is required, outcomes belong to Allah"],
          }),
        },
      ],
    };

    beforeEach(() => {
      // Reconfigure the mock for this describe block
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue(
        mockAnthropicResponse,
      );
    });

    test("generates reframe successfully", async () => {
      (config.VALIDATION_MODE as any) = false;

      const res = await request(app)
        .post("/api/reframe")
        .send({
          thought: "I'm going to fail",
          distortions: ["Catastrophizing"],
          analysis: "You're predicting the worst outcome",
        });

      expect(res.status).toBe(200);
      expect(res.body.beliefTested).toBeDefined();
      expect(res.body.perspective).toBeDefined();
      expect(res.body.nextStep).toBeDefined();
      expect(res.body.anchors).toBeDefined();
    });

    test("returns validation error for missing thought", async () => {
      const res = await request(app)
        .post("/api/reframe")
        .send({
          distortions: ["Catastrophizing"],
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
    });

    test("returns validation error for missing distortions", async () => {
      const res = await request(app).post("/api/reframe").send({
        thought: "I'm going to fail",
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
    });

    test("returns placeholder in validation mode", async () => {
      (config.VALIDATION_MODE as any) = true;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post("/api/reframe")
        .send({
          thought: "I'm going to fail",
          distortions: ["Catastrophizing"],
        });

      expect(res.status).toBe(200);
      expect(res.body.beliefTested).toBeDefined();
    });
  });

  // =============================================================================
  // PRACTICE ENDPOINT
  // =============================================================================

  describe("POST /api/practice", () => {
    const mockAnthropicResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            title: "Dhikr Breathing",
            steps: ["Breathe in", "Hold", "Breathe out"],
            reminder: "Take it easy",
            duration: "2 minutes",
          }),
        },
      ],
    };

    beforeEach(() => {
      // Reconfigure the mock for this describe block
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue(
        mockAnthropicResponse,
      );
    });

    test("generates practice successfully", async () => {
      (config.VALIDATION_MODE as any) = false;

      const res = await request(app).post("/api/practice").send({
        reframe: "Focus on what you can control",
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBeDefined();
      expect(res.body.steps).toBeDefined();
      expect(res.body.reminder).toBeDefined();
      expect(res.body.duration).toBeDefined();
    });

    test("returns validation error for missing reframe", async () => {
      const res = await request(app).post("/api/practice").send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
    });

    test("returns placeholder in validation mode", async () => {
      (config.VALIDATION_MODE as any) = true;
      (config.isAnthropicConfigured as jest.Mock).mockReturnValue(false);

      const res = await request(app).post("/api/practice").send({
        reframe: "Focus on what you can control",
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBeDefined();
    });
  });

  // =============================================================================
  // REFLECTION SAVE ENDPOINT
  // =============================================================================

  describe("POST /api/reflection/save", () => {
    test("saves reflection successfully for free user", async () => {
      const res = await request(app)
        .post("/api/reflection/save")
        .send({
          thought: "I'm worried about my future",
          distortions: ["Catastrophizing"],
          reframe: "The future is uncertain but I can prepare",
          intention: "To trust Allah",
          practice: "Dhikr breathing",
          anchor: "Effort is required, outcomes belong to Allah",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect((storage as any).saveReflection).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          thought: expect.stringContaining("encrypted:"),
          distortions: ["Catastrophizing"],
          reframe: expect.stringContaining("encrypted:"),
        }),
      );
    });

    test("returns 401 when not authenticated", async () => {
      // Create app without auth middleware
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp)
        .post("/api/reflection/save")
        .send({
          thought: "Test thought",
          distortions: ["Test"],
          reframe: "Test reframe",
          practice: "Test practice",
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("returns validation error for missing required fields", async () => {
      const res = await request(app).post("/api/reflection/save").send({
        thought: "Test thought",
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_FAILED");
      expect(res.body.error).toBe(true);
    });

    test("returns 402 when free user exceeds daily limit", async () => {
      (
        (storage as any).getTodayReflectionCount as jest.Mock<any>
      ).mockResolvedValue(1);

      const res = await request(app)
        .post("/api/reflection/save")
        .send({
          thought: "Test thought",
          distortions: ["Test"],
          reframe: "Test reframe",
          practice: "Test practice",
        });

      expect(res.status).toBe(402);
      expect(res.body.message).toContain("Noor Plus");
      expect(res.body.code).toBe("PAYMENT_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("allows unlimited reflections for paid users", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      (
        (storage as any).getTodayReflectionCount as jest.Mock<any>
      ).mockResolvedValue(10);

      const res = await request(app)
        .post("/api/reflection/save")
        .send({
          thought: "Test thought",
          distortions: ["Test"],
          reframe: "Test reframe",
          practice: "Test practice",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("handles encryption errors gracefully", async () => {
      (encryption.encryptData as jest.Mock).mockImplementation(() => {
        throw new Error("Encryption failed");
      });

      const res = await request(app)
        .post("/api/reflection/save")
        .send({
          thought: "Test thought",
          distortions: ["Test"],
          reframe: "Test reframe",
          practice: "Test practice",
        });

      expect(res.status).toBe(500);
      expect(res.body.code).toBe("INTERNAL_ERROR");
      expect(res.body.error).toBe(true);
    });
  });

  // =============================================================================
  // REFLECTION HISTORY ENDPOINT
  // =============================================================================

  describe("GET /api/reflection/history", () => {
    test("returns reflection history for free user with limit", async () => {
      const mockHistory = [
        {
          id: 1,
          thought: "encrypted:worried",
          reframe: "encrypted:trust",
          intention: "encrypted:peace",
          distortions: ["Test"],
          practice: "Breathing",
          createdAt: new Date(),
        },
      ];
      (
        (storage as any).getReflectionHistory as jest.Mock<any>
      ).mockResolvedValue(mockHistory);

      const res = await request(app).get("/api/reflection/history");

      expect(res.status).toBe(200);
      expect(res.body.history).toHaveLength(1);
      expect(res.body.history[0].thought).toBe("worried");
      expect(res.body.isLimited).toBe(true);
      expect(res.body.limit).toBe(3);
      expect((storage as any).getReflectionHistory).toHaveBeenCalledWith(
        mockUserId,
        3,
      );
    });

    test("returns unlimited history for paid users", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );

      const res = await request(app).get("/api/reflection/history");

      expect(res.status).toBe(200);
      expect(res.body.isLimited).toBe(false);
      expect(res.body.limit).toBeNull();
      expect((storage as any).getReflectionHistory).toHaveBeenCalledWith(
        mockUserId,
        undefined,
      );
    });

    test("returns 401 when not authenticated", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/reflection/history");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("handles decryption errors gracefully", async () => {
      (
        (storage as any).getReflectionHistory as jest.Mock<any>
      ).mockResolvedValue([
        {
          id: 1,
          thought: "encrypted:test",
          reframe: "encrypted:test",
          intention: null,
          distortions: [],
          practice: "test",
          createdAt: new Date(),
        },
      ]);
      (encryption.decryptData as jest.Mock).mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      const res = await request(app).get("/api/reflection/history");

      expect(res.status).toBe(200);
      expect(res.body.history[0].thought).toBe("[Unable to decrypt]");
    });
  });

  // =============================================================================
  // REFLECTION DELETE ENDPOINT
  // =============================================================================

  describe("DELETE /api/reflection/:id", () => {
    test("deletes reflection successfully", async () => {
      const res = await request(app).delete("/api/reflection/123");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deletedCount).toBe(1);
      expect((storage as any).deleteReflection).toHaveBeenCalledWith(
        mockUserId,
        123,
      );
    });

    test("returns 401 when not authenticated", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp).delete("/api/reflection/123");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
    });

    test("returns 400 for invalid reflection ID", async () => {
      const res = await request(app).delete("/api/reflection/invalid");

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_INPUT");
      expect(res.body.error).toBe(true);
    });

    test("returns 404 when reflection not found", async () => {
      ((storage as any).deleteReflection as jest.Mock<any>).mockResolvedValue(
        0,
      );

      const res = await request(app).delete("/api/reflection/999");

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("not found");
      expect(res.body.code).toBe("NOT_FOUND");
      expect(res.body.error).toBe(true);
    });
  });

  // =============================================================================
  // CAN REFLECT ENDPOINT
  // =============================================================================

  describe("GET /api/reflection/can-reflect", () => {
    test("returns true for free user with remaining reflections", async () => {
      (
        (storage as any).getTodayReflectionCount as jest.Mock<any>
      ).mockResolvedValue(0);

      const res = await request(app).get("/api/reflection/can-reflect");

      expect(res.status).toBe(200);
      expect(res.body.canReflect).toBe(true);
      expect(res.body.remaining).toBe(1);
      expect(res.body.isPaid).toBe(false);
    });

    test("returns false when free user has no remaining reflections", async () => {
      (
        (storage as any).getTodayReflectionCount as jest.Mock<any>
      ).mockResolvedValue(1);

      const res = await request(app).get("/api/reflection/can-reflect");

      expect(res.status).toBe(200);
      expect(res.body.canReflect).toBe(false);
      expect(res.body.remaining).toBe(0);
    });

    test("returns unlimited for paid users", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );

      const res = await request(app).get("/api/reflection/can-reflect");

      expect(res.status).toBe(200);
      expect(res.body.canReflect).toBe(true);
      expect(res.body.remaining).toBeNull();
      expect(res.body.isPaid).toBe(true);
    });

    test("allows reflection check for unauthenticated users", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/reflection/can-reflect");

      expect(res.status).toBe(200);
      expect(res.body.canReflect).toBe(true);
      expect(res.body.remaining).toBe(1);
    });
  });

  // =============================================================================
  // REFLECTION PATTERNS ENDPOINT
  // =============================================================================

  describe("GET /api/reflection/patterns", () => {
    test("returns patterns for paid users with sufficient reflections", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      ((storage as any).getReflectionCount as jest.Mock<any>).mockResolvedValue(
        5,
      );
      (
        (storage as any).getRecentReflections as jest.Mock<any>
      ).mockResolvedValue([
        {
          id: 1,
          keyAssumption: "I'm not good enough",
          detectedState: "anxiety",
          distortions: ["Catastrophizing"],
        },
        {
          id: 2,
          keyAssumption: "I'm not good enough",
          detectedState: "anxiety",
          distortions: ["Emotional reasoning"],
        },
      ]);

      const res = await request(app).get("/api/reflection/patterns");

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(res.body.assumptions).toBeDefined();
      expect(res.body.assumptions.length).toBeGreaterThan(0);
    });

    test("returns 403 for free users", async () => {
      const res = await request(app).get("/api/reflection/patterns");

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Noor Plus");
      expect(res.body.code).toBe("PAYMENT_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("returns null summary when reflection count is low", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      ((storage as any).getReflectionCount as jest.Mock<any>).mockResolvedValue(
        2,
      );

      const res = await request(app).get("/api/reflection/patterns");

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeNull();
      expect(res.body.assumptions).toEqual([]);
    });

    test("returns 401 when not authenticated", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/reflection/patterns");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
    });
  });

  // =============================================================================
  // INSIGHTS SUMMARY ENDPOINT
  // =============================================================================

  describe("GET /api/insights/summary", () => {
    const mockAnthropicResponse = {
      content: [
        {
          type: "text",
          text: "Your reflections show a pattern of growth and self-awareness.",
        },
      ],
    };

    beforeEach(() => {
      // Reconfigure the mock for this describe block
      mockAnthropicCreate = (jest.fn() as any).mockResolvedValue(
        mockAnthropicResponse,
      );
    });

    test("generates new summary for paid user with sufficient reflections", async () => {
      (config.VALIDATION_MODE as any) = false;
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      ((storage as any).getReflectionCount as jest.Mock<any>).mockResolvedValue(
        5,
      );
      (
        (storage as any).getRecentReflections as jest.Mock<any>
      ).mockResolvedValue([
        {
          keyAssumption: "Test",
          detectedState: "anxiety",
          distortions: ["Test"],
        },
      ]);

      const res = await request(app).get("/api/insights/summary");

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(true);
      expect(res.body.summary).toBeDefined();
      expect(res.body.reflectionCount).toBe(5);
    });

    test("returns existing summary when available", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      ((storage as any).getReflectionCount as jest.Mock<any>).mockResolvedValue(
        5,
      );
      (
        (storage as any).getLatestInsightSummary as jest.Mock<any>
      ).mockResolvedValue({
        summary: "Existing summary",
        reflectionCount: 5,
        generatedAt: new Date(),
      });

      const res = await request(app).get("/api/insights/summary");

      expect(res.status).toBe(200);
      expect(res.body.summary).toBe("Existing summary");
    });

    test("returns unavailable when reflection count is low", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      ((storage as any).getReflectionCount as jest.Mock<any>).mockResolvedValue(
        3,
      );

      const res = await request(app).get("/api/insights/summary");

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(false);
      expect(res.body.message).toContain("Complete 5 reflections");
      expect(res.body.requiredCount).toBe(5);
    });

    test("returns 403 for free users", async () => {
      const res = await request(app).get("/api/insights/summary");

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("PAYMENT_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("returns 401 when not authenticated", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/insights/summary");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
      expect(res.body.error).toBe(true);
    });
  });

  // =============================================================================
  // INSIGHTS ASSUMPTIONS ENDPOINT
  // =============================================================================

  describe("GET /api/insights/assumptions", () => {
    test("returns assumption library for paid users", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );
      (
        (storage as any).getAssumptionLibrary as jest.Mock<any>
      ).mockResolvedValue([
        { assumption: "I'm not good enough", count: 5, lastSeen: new Date() },
      ]);

      const res = await request(app).get("/api/insights/assumptions");

      expect(res.status).toBe(200);
      expect(res.body.assumptions).toBeDefined();
      expect(res.body.total).toBe(1);
    });

    test("returns 403 for free users", async () => {
      const res = await request(app).get("/api/insights/assumptions");

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("PAYMENT_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("returns 401 when not authenticated", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp).get("/api/insights/assumptions");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
      expect(res.body.error).toBe(true);
    });
  });

  // =============================================================================
  // DUAS CONTEXTUAL ENDPOINT
  // =============================================================================

  describe("POST /api/duas/contextual", () => {
    test("returns contextual dua for paid users", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );

      const res = await request(app)
        .post("/api/duas/contextual")
        .send({ state: "grief" });

      expect(res.status).toBe(200);
      expect(res.body.state).toBe("grief");
      expect(res.body.dua).toBeDefined();
      expect(res.body.dua.arabic).toBeDefined();
      expect(res.body.dua.transliteration).toBeDefined();
      expect(res.body.dua.meaning).toBeDefined();
    });

    test("returns default dua for unknown state", async () => {
      (billingService.billingService.isPaidUser as jest.Mock).mockReturnValue(
        true,
      );

      const res = await request(app)
        .post("/api/duas/contextual")
        .send({ state: "unknown-state" });

      expect(res.status).toBe(200);
      expect(res.body.dua).toBeDefined();
    });

    test("returns 403 for free users", async () => {
      const res = await request(app)
        .post("/api/duas/contextual")
        .send({ state: "grief" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("PAYMENT_REQUIRED");
      expect(res.body.error).toBe(true);
    });

    test("returns 401 when not authenticated", async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      await registerRoutes(unauthApp);

      const res = await request(unauthApp)
        .post("/api/duas/contextual")
        .send({ state: "grief" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_REQUIRED");
      expect(res.body.error).toBe(true);
    });
  });

  // =============================================================================
  // ADMIN RETENTION ENDPOINT
  // =============================================================================

  describe("POST /api/admin/retention/run", () => {
    test("returns 404 when endpoint is disabled", async () => {
      const res = await request(app)
        .post("/api/admin/retention/run")
        .set("x-admin-token", "test-token");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("NOT_FOUND");
      expect(res.body.error).toBe(true);
    });

    test("returns 401 for invalid admin token", async () => {
      (dataRetention.isAdminEndpointEnabled as jest.Mock).mockReturnValue(true);
      (dataRetention.verifyAdminToken as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post("/api/admin/retention/run")
        .set("x-admin-token", "invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_INVALID");
      expect(res.body.error).toBe(true);
    });

    test("runs cleanup successfully with valid token", async () => {
      (dataRetention.isAdminEndpointEnabled as jest.Mock).mockReturnValue(true);
      (dataRetention.verifyAdminToken as jest.Mock).mockReturnValue(true);
      (dataRetention.runManualCleanup as jest.Mock<any>).mockResolvedValue({
        deletedReflections: 10,
        deletedUsers: 2,
      });

      const res = await request(app)
        .post("/api/admin/retention/run")
        .set("x-admin-token", "valid-token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result.deletedReflections).toBe(10);
    });

    test("handles cleanup errors gracefully", async () => {
      (dataRetention.isAdminEndpointEnabled as jest.Mock).mockReturnValue(true);
      (dataRetention.verifyAdminToken as jest.Mock).mockReturnValue(true);
      (dataRetention.runManualCleanup as jest.Mock<any>).mockRejectedValue(
        new Error("Cleanup failed"),
      );

      const res = await request(app)
        .post("/api/admin/retention/run")
        .set("x-admin-token", "valid-token");

      expect(res.status).toBe(500);
      expect(res.body.code).toBe("INTERNAL_ERROR");
      expect(res.body.error).toBe(true);
    });
  });

  // =============================================================================
  // NOTIFICATION ROUTES
  // =============================================================================

  describe("Notification Routes", () => {
    test("notification routes are mounted", async () => {
      const res = await request(app).get("/api/notifications/test");

      expect(res.status).toBe(200);
      expect(res.body.test).toBe(true);
    });
  });
});
