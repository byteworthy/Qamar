import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { userSessions } from '@shared/schema';
import { eq, gt } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'noor_session';
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
  return process.env.SESSION_SECRET || 'dev-session-secret-change-in-production';
}

function signToken(token: string): string {
  const secret = getSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(token).digest('hex');
  return `${token}.${signature}`;
}

function verifySignedToken(signedToken: string): string | null {
  const parts = signedToken.split('.');
  if (parts.length !== 2) return null;
  
  const [token, signature] = parts;
  const secret = getSessionSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(token).digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }
  
  return token;
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const signedToken = req.cookies?.[SESSION_COOKIE_NAME];
    
    if (signedToken) {
      const token = verifySignedToken(signedToken);
      if (token) {
        const [session] = await db.select()
          .from(userSessions)
          .where(eq(userSessions.token, token));
        
        if (session && new Date(session.expiresAt) > new Date()) {
          req.auth = {
            userId: session.userId,
            email: session.email,
            sessionToken: token,
          };
          return next();
        }
      }
    }
    
    const newToken = generateSessionToken();
    const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
    
    await db.insert(userSessions).values({
      token: newToken,
      userId,
      expiresAt,
    }).onConflictDoNothing();
    
    const signedNewToken = signToken(newToken);
    
    res.cookie(SESSION_COOKIE_NAME, signedNewToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
      path: '/',
    });
    
    req.auth = {
      userId,
      email: null,
      sessionToken: newToken,
    };
    
    next();
  } catch (error) {
    console.error('[AUTH] Session middleware error:', error);
    next();
  }
}

export async function updateSessionEmail(token: string, email: string): Promise<void> {
  await db.update(userSessions)
    .set({ email })
    .where(eq(userSessions.token, token));
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
