import type { Request, Response, NextFunction } from 'express';
import { createRequestLogger, type Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include logger
declare global {
  namespace Express {
    interface Request {
      logger: Logger;
    }
  }
}

/**
 * Request logging middleware
 *
 * Attaches a request-scoped logger to each request and logs:
 * - Incoming request with context (method, path, query, user agent)
 * - Response completion with duration and status code
 *
 * The request logger is available as req.logger throughout the request lifecycle.
 */
export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate unique request ID (use existing header or create new)
  req.id = (req.headers['x-request-id'] as string) || uuidv4();

  // Attach request-scoped logger
  req.logger = createRequestLogger(req);

  // Log incoming request
  req.logger.http('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
  });

  // Capture start time for duration calculation
  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'http';

    req.logger[level]('Request completed', {
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length'),
    });
  });

  next();
}
