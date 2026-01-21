/**
 * Sentry Error Tracking (Backend)
 *
 * Captures unhandled errors and Express errors.
 * Scrubs PII (thought, reframe, intention) from breadcrumbs and request bodies.
 * Disabled by default. Set SENTRY_DSN environment variable to enable.
 */

import * as Sentry from "@sentry/node";

let sentryInitialized = false;

// Fields to scrub from request bodies and breadcrumbs
const PII_FIELDS = [
  "thought",
  "reframe",
  "intention",
  "belief",
  "reflection",
  "content",
  "message",
  "prompt",
];

/**
 * Scrub PII from an object (mutates in place).
 */
function scrubPii(data: Record<string, unknown>): Record<string, unknown> {
  if (!data || typeof data !== "object") return data;

  for (const field of PII_FIELDS) {
    if (field in data) {
      data[field] = "[REDACTED]";
    }
  }

  return data;
}

/**
 * Initialize Sentry for the backend.
 * No-op if SENTRY_DSN is not set.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log("[Sentry] Disabled - SENTRY_DSN not configured");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

      // Scrub PII from events before sending
      beforeSend(event) {
        // Scrub request body
        if (event.request?.data) {
          if (typeof event.request.data === "object") {
            scrubPii(event.request.data as Record<string, unknown>);
          } else if (typeof event.request.data === "string") {
            try {
              const parsed = JSON.parse(event.request.data);
              event.request.data = JSON.stringify(scrubPii(parsed));
            } catch {
              // Not JSON, leave as-is
            }
          }
        }

        // Remove cookies (may contain session data)
        if (event.request?.cookies) {
          event.request.cookies = {};
        }

        return event;
      },

      // Scrub PII from breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.data) {
          scrubPii(breadcrumb.data as Record<string, unknown>);
        }
        return breadcrumb;
      },
    });

    sentryInitialized = true;
    console.log("[Sentry] Initialized successfully");
  } catch (error) {
    console.error("[Sentry] Failed to initialize:", error);
    sentryInitialized = false;
  }
}

/**
 * Check if Sentry is enabled and initialized.
 */
export function isSentryEnabled(): boolean {
  return sentryInitialized;
}

/**
 * Capture an exception in Sentry with request ID correlation.
 */
export function captureException(
  error: Error,
  context?: { requestId?: string; [key: string]: unknown },
): void {
  if (!isSentryEnabled()) {
    console.error("[Error]", error.message, context || "");
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.requestId) {
      scope.setTag("requestId", context.requestId);
    }

    // Add extra context but scrub PII
    if (context) {
      const safeContext = { ...context };
      scrubPii(safeContext);
      scope.setExtras(safeContext);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture a message in Sentry.
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): void {
  if (!isSentryEnabled()) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry (hashed user ID only, no PII).
 */
export function setUser(userId: string | null): void {
  if (!isSentryEnabled()) {
    return;
  }

  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging.
 */
export function addBreadcrumb(message: string, category?: string): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category: category || "app",
    level: "info",
  });
}

/**
 * Setup Sentry error handling for Express app.
 * Call this after all routes are registered.
 */
export function setupSentryErrorHandler(
  app: import("express").Application,
): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.setupExpressErrorHandler(app);
}
