import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { aiDailyQuotaMiddleware } from "../middleware/ai-daily-quota";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import { buildVerseConversationPrompt } from "../services/verse-conversation-prompts";
import { quranMetadata } from "@shared/schema";
import { db } from "../db";
import logger from "../utils/logger";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

router.post(
  "/discuss",
  aiDailyQuotaMiddleware,
  aiRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const {
        surahNumber,
        verseNumber,
        message,
        arabicText,
        translation,
        history = [],
      } = req.body;

      // Validation
      if (
        !surahNumber ||
        !verseNumber ||
        !message ||
        !arabicText ||
        !translation
      ) {
        return res.status(400).json({
          error:
            "Missing required fields: surahNumber, verseNumber, message, arabicText, translation",
        });
      }

      if (!Array.isArray(history)) {
        return res.status(400).json({ error: "history must be an array" });
      }

      // Fetch surah name from database
      const [surah] = await db
        .select()
        .from(quranMetadata)
        .where(eq(quranMetadata.surahNumber, surahNumber));

      const surahName = surah?.nameEnglish ?? `Surah ${surahNumber}`;

      const systemPrompt = buildVerseConversationPrompt({
        surahNumber,
        surahName,
        verseNumber,
        arabicText,
        translation,
      });

      const messages: Anthropic.MessageParam[] = [
        ...history.map((msg: Message) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      logger.info("[VerseConversation] Processing message", {
        surah: surahNumber,
        verse: verseNumber,
        historyLength: history.length,
      });

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      });

      const responseText =
        response.content[0].type === "text" ? response.content[0].text : "";

      return res.json({
        response: responseText,
        remainingQuota: (req as any).remainingQuota ?? null,
      });
    } catch (error: any) {
      logger.error("[VerseConversation] Error processing message", { error });

      if (error.status === 429) {
        return res.status(503).json({
          error: "AI service temporarily unavailable. Please try again later.",
        });
      }

      return res.status(500).json({
        error: "Failed to process conversation message",
      });
    }
  },
);

export function registerVerseConversationRoutes(app: Router) {
  app.use("/api/verse", router);
}
