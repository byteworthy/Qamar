// server/__tests__/study-plan-routes.test.ts
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express, { type Express } from "express";
import request from "supertest";
import { registerStudyPlanRoutes } from "../routes/study-plan-routes";

import { generateWeeklyPlan } from "../services/study-plan-generator";

// Mock services
jest.mock("../services/study-plan-generator");
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn() },
}));
jest.mock("../middleware/ai-daily-quota", () => ({
  aiDailyQuotaMiddleware: (req: any, res: any, next: any) => {
    req.remainingQuota = 3;
    next();
  },
}));
jest.mock("../middleware/ai-rate-limiter", () => ({
  aiRateLimiter: (req: any, res: any, next: any) => next(),
}));

describe("POST /api/study-plan/generate", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerStudyPlanRoutes(app);
  });

  test("generates plan for valid input", async () => {
    const mockPlan = {
      id: "plan-123",
      createdAt: Date.now(),
      weekStartDate: "2026-02-17",
      goal: "memorize_juz_30",
      timeCommitment: "20min",
      skillLevel: "intermediate",
      tasks: [],
      completionRate: 0,
      streak: 0,
    };

    (generateWeeklyPlan as any).mockResolvedValue(mockPlan);

    const res = await request(app).post("/api/study-plan/generate").send({
      goal: "memorize_juz_30",
      timeCommitment: "20min",
      skillLevel: "intermediate",
    });

    expect(res.status).toBe(200);
    expect(res.body.plan).toMatchObject({ id: "plan-123" });
    expect(res.body.remainingQuota).toBe(3);
  });

  test("validates required fields", async () => {
    const res = await request(app)
      .post("/api/study-plan/generate")
      .send({ goal: "memorize_juz_30" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("validates custom goal text", async () => {
    const res = await request(app).post("/api/study-plan/generate").send({
      goal: "custom",
      timeCommitment: "20min",
      skillLevel: "intermediate",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("customGoalText required");
  });
});
