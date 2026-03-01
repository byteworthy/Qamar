import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { defaultLogger } from "../utils/logger";

const CSRF_COOKIE_NAME = "__Host-csrf";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * CSRF token generation endpoint
 * Returns a new CSRF token that clients can use for state-changing requests
 * Uses the double-submit cookie pattern: token in cookie + token returned to client
 */
export function csrfTokenRoute(req: Request, res: Response): void {
  try {
    const token = generateCsrfToken();

    // Set CSRF token in cookie
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.REPLIT_DEPLOYMENT === "1",
      sameSite: "lax",
      path: "/",
      maxAge: 3600000, // 1 hour
    });

    // Return token to client so they can include it in headers
    res.json({ csrfToken: token });
  } catch (error) {
    defaultLogger.error(
      "Failed to generate CSRF token",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "csrf_token_generation",
      },
    );
    res.status(500).json({ error: "Failed to generate CSRF token" });
  }
}

/**
 * CSRF protection middleware
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE)
 * Uses double-submit cookie pattern: compares token in cookie with token in header
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for CSRF token endpoint itself
  if (req.path === "/api/csrf-token") {
    return next();
  }

  try {
    // Get token from cookie
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    if (!cookieToken) {
      throw new Error("CSRF token missing from cookie");
    }

    // Get token from header
    const headerToken = req.headers["x-csrf-token"];
    if (!headerToken || typeof headerToken !== "string") {
      throw new Error("CSRF token missing from header");
    }

    // Compare tokens using timing-safe comparison
    const cookieBuffer = Buffer.from(cookieToken, "hex");
    const headerBuffer = Buffer.from(headerToken, "hex");

    if (cookieBuffer.length !== headerBuffer.length) {
      throw new Error("CSRF token length mismatch");
    }

    if (!crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
      throw new Error("CSRF token mismatch");
    }

    // Token is valid, continue
    next();
  } catch (error) {
    defaultLogger.warn("CSRF validation failed", {
      operation: "csrf_validation",
      path: req.path,
      method: req.method,
      securityEvent: "csrf_token_invalid",
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(403).json({
      error: "Invalid CSRF token",
      message: "CSRF token validation failed. Please refresh and try again.",
    });
  }
}

/**
 * Error handler for CSRF validation failures
 */
export function csrfErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    err instanceof Error &&
    (err.message.includes("CSRF") || err.message.includes("csrf"))
  ) {
    defaultLogger.warn("CSRF validation failed", {
      operation: "csrf_validation",
      path: req.path,
      method: req.method,
      securityEvent: "csrf_token_invalid",
    });

    res.status(403).json({
      error: "Invalid CSRF token",
      message: "CSRF token validation failed. Please refresh and try again.",
    });
    return;
  }

  next(err);
}
