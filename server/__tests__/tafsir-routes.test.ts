import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import request from "supertest";
import { registerTafsirRoutes } from "../routes/tafsir-routes";
import { billingService } from "../billing";

// =============================================================================
// MOCKS
// =============================================================================

// Mock billing
jest.mock("../billing");

// Mock Anthropic with factory
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

// Mock rate limiter (pass-through)
jest.mock("../middleware/ai-rate-limiter", () => ({
  aiRateLimiter: jest.fn((_req: Request, _res: Response, next: NextFunction) =>
    next(),
  ),
}));

// Mock logger
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("POST /api/tafsir/explain", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mock
    mockAnthropicCreate = jest.fn() as jest.Mock;

    // Setup Express app
    app = express();
    app.use(express.json());

    // Mock billing service
    (billingService.getBillingStatus as jest.Mock) = jest.fn(async () => ({
      status: "free",
    }));
    (billingService.isPaidUser as jest.Mock) = jest.fn(() => false);

    // Register routes
    registerTafsirRoutes(app);
  });

  test("returns tafsir explanation for a verse", async () => {
    const mockResponse = {
      context: "Revealed in Mecca...",
      keyTerms: [
        {
          arabic: "ٱللَّهِ",
          transliteration: "Allah",
          root: "ء-ل-ه",
          meaning: "The One God",
        },
      ],
      scholarlyViews: "Ibn Kathir explains...",
      crossReferences: ["112:1-4"],
      practicalTakeaway: "This reminds us to begin with His name.",
    };

    (mockAnthropicCreate as any).mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(mockResponse) }],
    });

    const res = await request(app).post("/api/tafsir/explain").send({
      surahNumber: 1,
      verseNumber: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(mockResponse);
    expect(res.body.remainingQuota).toBeDefined();
  });

  test("validates required fields", async () => {
    const res = await request(app)
      .post("/api/tafsir/explain")
      .send({ surahNumber: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("verseNumber");
  });

  test("validates surah number range", async () => {
    const res = await request(app)
      .post("/api/tafsir/explain")
      .send({ surahNumber: 115, verseNumber: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid surah number");
  });
});
