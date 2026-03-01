import { Router, Request, Response } from "express";
import { searchDuas } from "../services/dua-recommender";
import logger from "../utils/logger";

const router = Router();

/**
 * POST /api/duas/recommend
 * Search for duas based on situation/emotion/keywords
 * No AI quota required (uses search, not generation)
 */
router.post("/recommend", async (req: Request, res: Response) => {
  try {
    const { situation, emotionalState, keywords } = req.body;

    // Validation
    if (!situation) {
      return res.status(400).json({
        error: "Missing required field: situation",
      });
    }

    logger.info("[DuaRecommender] Searching for duas", {
      situation,
      emotionalState,
      keywords,
    });

    const duas = await searchDuas({ situation, emotionalState, keywords });

    return res.json({ duas });
  } catch (error: any) {
    logger.error("[DuaRecommender] Error searching duas", { error });
    return res.status(500).json({
      error: "Failed to search duas",
    });
  }
});

export function registerDuaRoutes(app: Router) {
  app.use("/api/duas", router);
}
