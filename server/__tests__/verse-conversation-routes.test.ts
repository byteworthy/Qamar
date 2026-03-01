import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import request from "supertest";
import { registerVerseConversationRoutes } from "../routes/verse-conversation-routes";
import { billingService } from "../billing";

// =============================================================================
// MOCKS
// =============================================================================

// Mock billing
jest.mock("../billing");

// Mock database — chain: db.select().from().where() → [{nameEnglish}]
const mockWhere = jest
  .fn<() => Promise<{ nameEnglish: string }[]>>()
  .mockResolvedValue([{ nameEnglish: "Al-Fatihah" }]);
jest.mock("../db", () => ({
  db: {
    select: () => ({ from: () => ({ where: mockWhere }) }),
  },
}));

// Mock shared schema
jest.mock("@shared/schema", () => ({
  quranMetadata: { surahNumber: "surah_number" },
}));

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

describe("POST /api/verse/discuss", () => {
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
    registerVerseConversationRoutes(app);
  });

  test("returns AI response for verse discussion", async () => {
    (mockAnthropicCreate as any).mockResolvedValue({
      content: [
        {
          type: "text",
          text: "This verse reminds us to begin everything with the name of Allah...",
        },
      ],
    });

    const res = await request(app).post("/api/verse/discuss").send({
      surahNumber: 1,
      verseNumber: 1,
      message: "Why do we start with Bismillah?",
      arabicText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translation:
        "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      history: [],
    });

    expect(res.status).toBe(200);
    expect(res.body.response).toContain("Allah");
    expect(res.body.remainingQuota).toBeDefined();
  });

  test("validates required fields", async () => {
    const res = await request(app)
      .post("/api/verse/discuss")
      .send({ surahNumber: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("verseNumber");
  });

  test("passes conversation history to Claude", async () => {
    (mockAnthropicCreate as any).mockResolvedValue({
      content: [{ type: "text", text: "Following up on that..." }],
    });

    const res = await request(app)
      .post("/api/verse/discuss")
      .send({
        surahNumber: 1,
        verseNumber: 1,
        message: "Tell me more",
        arabicText: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        translation:
          "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        history: [
          { role: "user", content: "First question" },
          { role: "assistant", content: "First answer" },
        ],
      });

    expect(res.status).toBe(200);
    expect(mockAnthropicCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          { role: "user", content: "First question" },
          { role: "assistant", content: "First answer" },
          { role: "user", content: "Tell me more" },
        ]),
      }),
    );
  });

  test("validates history is an array", async () => {
    const res = await request(app).post("/api/verse/discuss").send({
      surahNumber: 1,
      verseNumber: 1,
      message: "Test",
      arabicText: "test",
      translation: "test",
      history: "not an array",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("array");
  });
});
