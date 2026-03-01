import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import express, { type Express } from "express";
import request from "supertest";
import { registerDuaRoutes } from "../routes/dua-routes";

// Import after mocking
import { searchDuas } from "../services/dua-recommender";

// =============================================================================
// MOCKS
// =============================================================================

// Mock logger
jest.mock("../utils/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock dua-recommender service
jest.mock("../services/dua-recommender");

// Type the mock
const mockSearchDuas = searchDuas as jest.MockedFunction<typeof searchDuas>;

describe("POST /api/duas/recommend", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Express app
    app = express();
    app.use(express.json());

    // Register routes
    registerDuaRoutes(app);
  });

  test("returns duas for valid request", async () => {
    const mockDuas = [
      {
        arabic: "أَسْتَغْفِرُ اللهَ",
        transliteration: "Astaghfirullah",
        translation: "I seek forgiveness from Allah",
        source: "Quran 3:135",
        occasion: "When seeking forgiveness",
        category: "Forgiveness",
      },
      {
        arabic: "رَبِّ اغْفِرْ لِي",
        transliteration: "Rabbi ighfir li",
        translation: "My Lord, forgive me",
        source: "Sahih Muslim",
        occasion: "When seeking forgiveness",
        category: "Forgiveness",
      },
    ];

    (mockSearchDuas as any).mockResolvedValue(mockDuas);

    const res = await request(app)
      .post("/api/duas/recommend")
      .send({
        situation: "Seeking forgiveness",
        emotionalState: "regret",
        keywords: ["forgiveness", "mercy"],
      });

    expect(res.status).toBe(200);
    expect(res.body.duas).toHaveLength(2);
    expect(res.body.duas[0]).toMatchObject({
      arabic: "أَسْتَغْفِرُ اللهَ",
      transliteration: "Astaghfirullah",
      translation: "I seek forgiveness from Allah",
    });

    expect(mockSearchDuas).toHaveBeenCalledWith({
      situation: "Seeking forgiveness",
      emotionalState: "regret",
      keywords: ["forgiveness", "mercy"],
    });
  });

  test("validates required fields", async () => {
    const res = await request(app).post("/api/duas/recommend").send({
      emotionalState: "anxious",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("situation");
  });

  test("returns empty array for no matches", async () => {
    (mockSearchDuas as any).mockResolvedValue([]);

    const res = await request(app).post("/api/duas/recommend").send({
      situation: "Very rare specific situation",
    });

    expect(res.status).toBe(200);
    expect(res.body.duas).toEqual([]);
  });

  test("handles service errors gracefully", async () => {
    (mockSearchDuas as any).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const res = await request(app).post("/api/duas/recommend").send({
      situation: "Seeking patience",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to search duas");
  });
});
