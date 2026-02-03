import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db } from "../db";
import { userSessions } from "@shared/schema";
import { eq, gt } from "drizzle-orm";
import { encryptData, decryptData } from "../encryption";
import { defaultLogger } from "../utils/logger";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";

const SESSION_COOKIE_NAME = "noor_session";
const SESSION_DURATION_DAYS = 30;

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email?: string | null;
        sessionToken: string;
      };
    }
  }
}

function getSessionSecret(): string {
  if (!process.env.SESSION_SECRET) {
    defaultLogger.error(
      "FATAL: SESSION_SECRET not configured",
      new Error("SESSION_SECRET missing"),
      {
        operation: "get_session_secret",
        environment: process.env.NODE_ENV || "unknown",
        impact:
          "Server refusing to start - session security requires explicit secret",
      },
    );
    throw new Error(
      "SESSION_SECRET environment variable is required. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  return process.env.SESSION_SECRET;
}

function signToken(token: string): string {
  const secret = getSessionSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(token)
    .digest("hex");
  return `${token}.${signature}`;
}

function verifySignedToken(signedToken: string): string | null {
  try {
    const parts = signedToken.split(".");
    if (parts.length !== 2) return null;

    const [token, signature] = parts;
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(token)
      .digest("hex");

    // SECURITY: Check buffer lengths first to prevent timingSafeEqual from throwing
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      defaultLogger.warn(
        "Session signature length mismatch - possible tampering attempt",
        {
          operation: "verify_signed_token",
          securityEvent: "signature_length_mismatch",
        },
      );
      return null;
    }

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      defaultLogger.warn("Session signature verification failed", {
        operation: "verify_signed_token",
        securityEvent: "signature_verification_failed",
      });
      return null;
    }

    return token;
  } catch (error) {
    defaultLogger.warn("Session token verification error", {
      operation: "verify_signed_token",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const signedToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (signedToken) {
      const token = verifySignedToken(signedToken);
      if (token) {
        const [session] = await db
          .select()
          .from(userSessions)
          .where(eq(userSessions.token, token));

        if (session && new Date(session.expiresAt) > new Date()) {
          // Decrypt email if it exists
          let decryptedEmail: string | null = null;
          try {
            decryptedEmail = session.email ? decryptData(session.email) : null;
          } catch (error) {
            defaultLogger.error(
              "Failed to decrypt session email",
              error instanceof Error ? error : new Error(String(error)),
              {
                operation: "decrypt_session_email",
                userId: session.userId,
              },
            );
            // Continue with null email - session still valid
          }
          req.auth = {
            userId: session.userId,
            email: decryptedEmail,
            sessionToken: token,
          };
          return next();
        }
      }
    }

    const newToken = generateSessionToken();
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );

    await db
      .insert(userSessions)
      .values({
        token: newToken,
        userId,
        expiresAt,
      })
      .onConflictDoNothing();

    const signedNewToken = signToken(newToken);

    res.cookie(SESSION_COOKIE_NAME, signedNewToken, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.REPLIT_DEPLOYMENT === "1",
      sameSite: "lax",
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
      path: "/",
    });

    req.auth = {
      userId,
      email: null,
      sessionToken: newToken,
    };

    next();
  } catch (error) {
    // SECURITY: On any error, clear potentially forged cookie and create fresh session
    defaultLogger.error(
      "Session middleware error, issuing new session",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "session_middleware",
        action: "issuing_new_session",
      },
    );

    // Clear the invalid cookie
    res.clearCookie(SESSION_COOKIE_NAME);

    // Create a new session
    try {
      const newToken = generateSessionToken();
      const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const expiresAt = new Date(
        Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
      );

      await db
        .insert(userSessions)
        .values({
          token: newToken,
          userId,
          expiresAt,
        })
        .onConflictDoNothing();

      const signedNewToken = signToken(newToken);

      res.cookie(SESSION_COOKIE_NAME, signedNewToken, {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production" ||
          process.env.REPLIT_DEPLOYMENT === "1",
        sameSite: "lax",
        maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
        path: "/",
      });

      req.auth = {
        userId,
        email: null,
        sessionToken: newToken,
      };
    } catch (innerError) {
      defaultLogger.error(
        "Failed to create recovery session",
        innerError instanceof Error
          ? innerError
          : new Error(String(innerError)),
        {
          operation: "create_recovery_session",
        },
      );
      // Continue without auth - endpoints will handle 401 appropriately
    }

    next();
  }
}

/**
 * Update session email (encrypted before storage)
 */
export async function updateSessionEmail(
  token: string,
  email: string,
): Promise<void> {
  let encryptedEmail: string;
  try {
    encryptedEmail = encryptData(email);
  } catch (error) {
    defaultLogger.error(
      "Failed to encrypt email",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "encrypt_session_email",
      },
    );
    throw new Error("Failed to secure user data");
  }
  await db
    .update(userSessions)
    .set({ email: encryptedEmail })
    .where(eq(userSessions.token, token));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTH_REQUIRED,
        req.id
      )
    );
  }
  next();
}
