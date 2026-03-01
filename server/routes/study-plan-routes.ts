// server/routes/study-plan-routes.ts
import express, { type Express } from "express";
import { aiDailyQuotaMiddleware } from "../middleware/ai-daily-quota";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import { generateWeeklyPlan } from "../services/study-plan-generator";
import type { StudyPlanInput } from "../../shared/types/study-plan";
import logger from "../utils/logger";

export function registerStudyPlanRoutes(app: Express) {
  const router = express.Router();

  // POST /api/study-plan/generate - Generate new weekly plan
  router.post(
    "/generate",
    aiDailyQuotaMiddleware,
    aiRateLimiter,
    async (req, res) => {
      try {
        const input: StudyPlanInput = req.body;

        // Validation
        if (!input.goal || !input.timeCommitment || !input.skillLevel) {
          return res.status(400).json({
            error: "Missing required fields: goal, timeCommitment, skillLevel",
          });
        }

        if (input.goal === "custom" && !input.customGoalText) {
          return res
            .status(400)
            .json({ error: 'customGoalText required when goal is "custom"' });
        }

        if (
          input.goal === "understand_specific_surah" &&
          !input.specificSurah
        ) {
          return res.status(400).json({
            error:
              'specificSurah required when goal is "understand_specific_surah"',
          });
        }

        const plan = await generateWeeklyPlan(input);

        return res.json({
          plan,
          remainingQuota: (req as any).remainingQuota ?? null,
        });
      } catch (error: any) {
        logger.error("Failed to generate study plan", { error });
        return res.status(500).json({ error: "Failed to generate study plan" });
      }
    },
  );

  app.use("/api/study-plan", router);
}
