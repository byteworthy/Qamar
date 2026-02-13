import { createServer, type Server } from "node:http";
import type { Express } from "express";
import notificationRoutes from "./notificationRoutes";
import { registerAdminHealthRoutes } from "./routes/admin-health-routes";
import { registerAiRoutes } from "./routes/ai-routes";
import { registerReframePracticeRoutes } from "./routes/reframe-practice-routes";
import { registerReflectionRoutes } from "./routes/reflection-routes";
import { registerInsightDuaRoutes } from "./routes/insight-dua-routes";
import { registerQuranRoutes } from "./routes/quran-routes";
import { registerPrayerRoutes } from "./routes/prayer-routes";
import { registerProgressRoutes } from "./routes/progress-routes";
import { registerHadithRoutes } from "./routes/hadith-routes";
import { registerAdhkarRoutes } from "./routes/adhkar-routes";
import { registerVocabularyRoutes } from "./routes/vocabulary-routes";
import { registerCompanionRoutes } from "./routes/companion-routes";
import { registerRagRoutes } from "./routes/rag-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount notification routes
  app.use("/api/notifications", notificationRoutes);

  // Register all route groups
  registerAdminHealthRoutes(app);
  registerAiRoutes(app);
  registerReframePracticeRoutes(app);
  registerReflectionRoutes(app);
  registerInsightDuaRoutes(app);

  // Register Islamic feature routes
  registerQuranRoutes(app);
  registerPrayerRoutes(app);
  registerHadithRoutes(app);
  registerAdhkarRoutes(app);
  registerProgressRoutes(app);
  registerVocabularyRoutes(app);

  // Register AI companion routes
  registerCompanionRoutes(app);

  // Register RAG knowledge base routes
  registerRagRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
