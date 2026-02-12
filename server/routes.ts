import { createServer, type Server } from "node:http";
import type { Express } from "express";
import notificationRoutes from "./notificationRoutes";
import { registerAdminHealthRoutes } from "./routes/admin-health-routes";
import { registerAiRoutes } from "./routes/ai-routes";
import { registerReframePracticeRoutes } from "./routes/reframe-practice-routes";
import { registerReflectionRoutes } from "./routes/reflection-routes";
import { registerInsightDuaRoutes } from "./routes/insight-dua-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount notification routes
  app.use("/api/notifications", notificationRoutes);

  // Register all route groups
  registerAdminHealthRoutes(app);
  registerAiRoutes(app);
  registerReframePracticeRoutes(app);
  registerReflectionRoutes(app);
  registerInsightDuaRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
