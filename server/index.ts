import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import {
  registerBillingWebhookRoute,
  registerBillingRoutes,
  getStripeSync,
} from "./billing";
import { runMigrations } from "stripe-replit-sync";
import { sessionMiddleware } from "./middleware/auth";
import { initializeDataRetention, runManualCleanup } from "./data-retention";
import {
  VALIDATION_MODE,
  logConfigStatus,
  validateProductionConfig,
  isStripeConfigured,
} from "./config";
import {
  initSentry,
  setupSentryErrorHandler,
  captureException,
} from "./sentry";
import { registerHealthRoute } from "./health";
import {
  requestIdMiddleware,
  rateLimiterMiddleware,
} from "./middleware/production";
import * as fs from "fs";
import * as path from "path";

/**
 * HTTP Error with optional status code
 */
interface HTTPError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Type guard to check if error is HTTPError
 */
function isHTTPError(error: unknown): error is HTTPError {
  return (
    error instanceof Error &&
    (typeof (error as HTTPError).status === "number" ||
      typeof (error as HTTPError).statusCode === "number" ||
      error instanceof Error)
  );
}

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d: string) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    if (origin && origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application): void {
  app.use(
    express.json({
      verify: (req: Request, _res: Response, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const path = req.path;
    const requestId = req.requestId || "-";
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json.bind(res);
    res.json = function (bodyJson: Record<string, unknown>) {
      capturedJsonResponse = bodyJson;
      return originalResJson(bodyJson);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `[${requestId}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      // Exclude response bodies for sensitive AI routes to prevent logging user content
      const isSensitiveRoute =
        path.startsWith("/api/analyze") ||
        path.startsWith("/api/reframe") ||
        path.startsWith("/api/reflection");

      if (capturedJsonResponse && !isSensitiveRoute) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 100) {
        logLine = logLine.slice(0, 99) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application): void {
  // Sentry error handler (captures errors if Sentry is configured)
  setupSentryErrorHandler(app);

  // Custom error handler for logging and response
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    // Type guard and normalize error
    let error: HTTPError;
    if (isHTTPError(err)) {
      error = err;
    } else {
      // Convert non-Error types to Error
      error = new Error(String(err));
    }

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    const requestId = req.requestId || "-";

    log(`[${requestId}] ERROR ${status}: ${message}`);

    // Capture exception in Sentry with requestId correlation
    captureException(error, { requestId, status, path: req.path });

    if (!res.headersSent) {
      res.status(status).json({ message, requestId });
    }
  });
}

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log("DATABASE_URL not set, skipping Stripe initialization");
    return;
  }

  try {
    log("Initializing Stripe schema...");
    await runMigrations({ databaseUrl });
    log("Stripe schema ready");

    const stripeSync = await getStripeSync();

    log("Setting up managed webhook...");

    // Use explicit webhook domain if configured, otherwise fall back to first Replit domain
    const webhookDomain = process.env.STRIPE_WEBHOOK_DOMAIN
      || process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();

    if (!webhookDomain) {
      log("WARNING: No webhook domain configured. Set STRIPE_WEBHOOK_DOMAIN or REPLIT_DOMAINS.");
      log("Skipping Stripe webhook setup - billing webhooks will not work.");
      return;
    }

    const webhookBaseUrl = `https://${webhookDomain}`;
    log(`Using webhook base URL: ${webhookBaseUrl}`);
    try {
      const result = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/billing/webhook`,
      );
      if (result?.webhook?.url) {
        log(`Webhook configured: ${result.webhook.url}`);
      } else {
        log("Webhook setup returned without URL, continuing...");
      }
    } catch (webhookError: unknown) {
      const message =
        webhookError instanceof Error
          ? webhookError.message
          : String(webhookError);
      log("Webhook setup error (non-fatal):", message);
    }

    log("Syncing Stripe data in background...");
    stripeSync
      .syncBackfill()
      .then(() => log("Stripe data synced"))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        log("Error syncing Stripe data:", message);
      });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log("Stripe initialization error:", message);
  }
}

(async () => {
  // Initialize Sentry error tracking (no-op if SENTRY_DSN not configured)
  initSentry();

  // Log configuration status and validate for production
  logConfigStatus();
  validateProductionConfig();

  setupCors(app);

  // Production middleware: request ID and rate limiting
  app.use(requestIdMiddleware);
  app.use(rateLimiterMiddleware);

  // Health check endpoint (before other routes)
  registerHealthRoute(app);

  // CRITICAL: Webhook route MUST be registered BEFORE body parsing middleware.
  // Stripe webhook verification requires the raw request body as a Buffer.
  // If express.json() runs first, it will parse the body and break signature verification.
  registerBillingWebhookRoute(app);

  setupBodyParsing(app);

  // Cookie parser must come before session middleware
  app.use(cookieParser());

  // Session middleware creates/validates signed session cookies for user identity
  // All subsequent routes can access req.auth.userId instead of trusting client input
  app.use(sessionMiddleware);

  setupRequestLogging(app);

  await initStripe();

  // Initialize data retention service (runs cleanup every 24 hours)
  log("Initializing data retention service...");
  initializeDataRetention();
  log("Data retention service initialized");

  registerBillingRoutes(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  // 404 handler for unmatched routes
  app.use((req: Request, res: Response) => {
    const requestId = req.requestId || "-";
    res.status(404).json({
      error: "Not Found",
      path: req.path,
      requestId,
    });
  });

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`express server serving on port ${port}`);
  });
})();
