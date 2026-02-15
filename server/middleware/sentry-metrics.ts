/**
 * Sentry Performance Metrics Middleware
 *
 * Tracks API response times with method, route, and status_code attributes.
 * Must be placed BEFORE route handlers in the middleware chain.
 */

import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

/**
 * Express middleware that records API response time metrics via Sentry.
 * Attaches to the response "finish" event to capture the final status code.
 */
export function sentryMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    // Use the matched Express route pattern (e.g. /api/companion/message)
    // rather than the raw URL to avoid high-cardinality metric explosion.
    const route = req.route?.path
      ? `${req.baseUrl || ""}${req.route.path}`
      : req.path;

    Sentry.metrics.distribution("http.server.duration", duration, {
      unit: "millisecond",
      attributes: {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      },
    });
  });

  next();
}
