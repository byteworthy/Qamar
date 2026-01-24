import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db } from "../db";
import { userSessions } from "@shared/schema";
import { eq, gt } from "drizzle-orm";
import { encryptData, decryptData } from "../encryption";

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
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !process.env.SESSION_SECRET) {
    console.error(
      "FATAL: SESSION_SECRET not configured in production. " +
        "Session security will fail. Server refusing to start.",
    );
    throw new Error(
      "SESSION_SECRET environment variable is required in production.",
    );
  }

  return (
    process.env.SESSION_SECRET || "dev-session-secret-change-in-production"
  );
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
      console.warn(
        "[AUTH] Session signature length mismatch - possible tampering attempt",
      );
      return null;
    }

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn("[AUTH] Session signature verification failed");
      return null;
    }

    return token;
  } catch (error) {
    console.warn("[AUTH] Session token verification error:", error);
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
          const decryptedEmail = session.email
            ? decryptData(session.email)
            : null;
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
    console.error(
      "[AUTH] Session middleware error, issuing new session:",
      error,
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
      console.error("[AUTH] Failed to create recovery session:", innerError);
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
  const encryptedEmail = encryptData(email);
  await db
    .update(userSessions)
    .set({ email: encryptedEmail })
    .where(eq(userSessions.token, token));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
