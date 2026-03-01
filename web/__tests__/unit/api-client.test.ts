import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  analyzeThought,
  saveReflection,
  reframeThought,
  getHistory,
  getInsights,
  healthCheck,
} from "@/lib/api";

// Mock global fetch
global.fetch = vi.fn();

function createFetchResponse(data: any) {
  return {
    ok: true,
    json: async () => data,
  };
}

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeThought", () => {
    it("should include credentials in analyze request", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({
          distortions: [],
          happening: "",
          pattern: [],
          matters: "",
        }),
      );

      await analyzeThought("test thought");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/analyze"),
        expect.objectContaining({
          credentials: "include",
          method: "POST",
        }),
      );
    });

    it("should send thought and emotional intensity", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({
          distortions: ["Catastrophizing"],
          happening: "",
          pattern: [],
          matters: "",
        }),
      );

      await analyzeThought("I will fail", 4);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            thought: "I will fail",
            emotionalIntensity: 4,
            somaticAwareness: undefined,
          }),
        }),
      );
    });

    it("should throw error on failed request", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(analyzeThought("test")).rejects.toThrow("Analysis failed");
    });
  });

  describe("reframeThought", () => {
    it("should include credentials in reframe request", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({
          beliefTested: "",
          perspective: "",
          nextStep: "",
          anchors: [],
        }),
      );

      await reframeThought("test thought", ["Catastrophizing"], "analysis");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/reframe"),
        expect.objectContaining({
          credentials: "include",
          method: "POST",
        }),
      );
    });

    it("should send thought, distortions, and analysis", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({
          beliefTested: "test",
          perspective: "test",
          nextStep: "test",
          anchors: [],
        }),
      );

      await reframeThought(
        "I will fail",
        ["Catastrophizing"],
        "Negative thinking",
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("I will fail"),
        }),
      );
    });
  });

  describe("saveReflection", () => {
    it("should include credentials in save request", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({ success: true }),
      );

      await saveReflection({
        thought: "test",
        distortions: [],
        reframe: "test",
        intention: "test",
        practice: "test",
        anchor: "test",
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/reflection/save"),
        expect.objectContaining({
          credentials: "include",
          method: "POST",
        }),
      );
    });

    it("should send complete reflection data", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({ success: true, detectedState: "Qalb-Aligned" }),
      );

      const reflectionData = {
        thought: "I am worried",
        distortions: ["Catastrophizing"],
        reframe: "Allah has a plan",
        intention: "Trust in Allah",
        practice: "Dhikr",
        anchor: "Surah 94:5-6",
      };

      const result = await saveReflection(reflectionData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(reflectionData),
        }),
      );

      expect(result.success).toBe(true);
      expect(result.detectedState).toBe("Qalb-Aligned");
    });
  });

  describe("getHistory", () => {
    it("should use GET method with credentials", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({ history: [], isLimited: false, limit: null }),
      );

      await getHistory();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/reflection/history"),
        expect.objectContaining({
          credentials: "include",
          method: "GET",
        }),
      );
    });

    it("should return history data", async () => {
      const mockHistory = [
        {
          id: "1",
          thought: "test",
          distortions: [],
          reframe: "test",
          intention: "test",
          practice: "test",
          userId: "user1",
          createdAt: new Date().toISOString(),
        },
      ];

      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({
          history: mockHistory,
          isLimited: true,
          limit: 3,
        }),
      );

      const result = await getHistory();

      expect(result.history).toHaveLength(1);
      expect(result.isLimited).toBe(true);
      expect(result.limit).toBe(3);
    });
  });

  describe("getInsights", () => {
    it("should use GET method with credentials", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({
          available: false,
          reflectionCount: 2,
          message: "Need more reflections",
        }),
      );

      await getInsights();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/insights/summary"),
        expect.objectContaining({
          credentials: "include",
          method: "GET",
        }),
      );
    });
  });

  describe("healthCheck", () => {
    it("should check API health", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({ status: "ok", database: "connected" }),
      );

      const result = await healthCheck();

      expect(result.status).toBe("ok");
      expect(result.database).toBe("connected");
    });

    it("should include credentials", async () => {
      (fetch as any).mockResolvedValueOnce(
        createFetchResponse({ status: "ok" }),
      );

      await healthCheck();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/health"),
        expect.objectContaining({
          credentials: "include",
        }),
      );
    });
  });
});
