import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { aiDailyQuotaMiddleware } from "../middleware/ai-daily-quota";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import { buildTafsirPrompt, TafsirResponse } from "../services/tafsir-prompts";
import { quranMetadata } from "@shared/schema";
import { db } from "../db";
import logger from "../utils/logger";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /api/tafsir/explain
 * Generate AI tafsir explanation for a verse
 */
router.post(
  "/explain",
  aiDailyQuotaMiddleware,
  aiRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const { surahNumber, verseNumber, arabicText, translation } = req.body;

      // Validation
      if (!surahNumber || !verseNumber || !arabicText || !translation) {
        return res.status(400).json({
          error:
            "Missing required fields: surahNumber, verseNumber, arabicText, translation",
        });
      }

      if (surahNumber < 1 || surahNumber > 114) {
        return res.status(400).json({ error: "Invalid surah number (1-114)" });
      }

      // Fetch surah name from database
      const [surah] = await db
        .select()
        .from(quranMetadata)
        .where(eq(quranMetadata.surahNumber, surahNumber));

      const surahName = surah?.nameEnglish ?? `Surah ${surahNumber}`;

      const systemPrompt = buildTafsirPrompt({
        surahNumber,
        surahName,
        verseNumber,
        arabicText,
        translation,
      });

      logger.info("[Tafsir] Requesting AI explanation", {
        surah: surahNumber,
        verse: verseNumber,
      });

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: systemPrompt }],
      });

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      const tafsir: TafsirResponse = JSON.parse(responseText);

      return res.json({
        ...tafsir,
        remainingQuota: (req as any).remainingQuota ?? null,
      });
    } catch (error: any) {
      logger.error("[Tafsir] Error generating explanation", { error });

      if (error.status === 429) {
        return res.status(503).json({
          error: "AI service temporarily unavailable. Please try again later.",
        });
      }

      return res.status(500).json({
        error: "Failed to generate tafsir explanation",
      });
    }
  },
);

export function registerTafsirRoutes(app: Router) {
  app.use("/api/tafsir", router);
}
