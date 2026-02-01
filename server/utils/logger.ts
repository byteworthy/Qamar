import * as winston from "winston";
import type { Request } from "express";

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
      };
    }
  }
}

// Define log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const LOG_COLORS = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(LOG_COLORS);

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "apiKey",
  "secret",
  "authorization",
  "cookie",
  "thought", // User reflection content
  "reframe", // Generated reframe content
  "intention", // User intention
  "message", // AI messages
  "prompt", // AI prompts
  "email", // PII
];

// Redact sensitive data from objects
function redactSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  if (typeof obj === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive field name
      const isSensitive = SENSITIVE_FIELDS.some((field) =>
        lowerKey.includes(field.toLowerCase()),
      );

      if (isSensitive) {
        redacted[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        redacted[key] = redactSensitiveData(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  return obj;
}

// Custom format for structured logs
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Redact sensitive data from metadata
    const safeMeta = redactSensitiveData(meta);

    const metaString = Object.keys(safeMeta as Record<string, unknown>).length
      ? JSON.stringify(safeMeta, null, 2)
      : "";

    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
  }),
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels: LOG_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "noor-api",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        structuredFormat,
      ),
    }),
  ],
});

// File logging disabled in production - Railway captures console output automatically
// If you need file logging in production, use /tmp directory:
// if (process.env.ENABLE_FILE_LOGGING === "true") {
//   logger.add(
//     new winston.transports.File({
//       filename: "/tmp/logs/error.log",
//       level: "error",
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
//   );
// }

// Helper to extract request context
export function getRequestContext(req: Request): {
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  ip?: string;
} {
  return {
    requestId: req.id || "unknown",
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    ip: req.ip || (req.headers["x-forwarded-for"] as string),
  };
}

// Enhanced logger with request context
export class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = redactSensitiveData(context) as Record<string, unknown>;
  }

  private log(
    level: string,
    message: string,
    meta: Record<string, unknown> = {},
  ): void {
    const safeMeta = redactSensitiveData(meta) as Record<string, unknown>;
    logger.log(level, message, { ...this.context, ...safeMeta });
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.log("info", message, meta);
  }

  error(
    message: string,
    error?: Error | unknown,
    meta: Record<string, unknown> = {},
  ): void {
    const errorMeta: Record<string, unknown> = { ...meta };

    if (error instanceof Error) {
      errorMeta.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      errorMeta.error = String(error);
    }

    this.log("error", message, errorMeta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.log("warn", message, meta);
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.log("debug", message, meta);
  }

  http(message: string, meta: Record<string, unknown> = {}): void {
    this.log("http", message, meta);
  }

  // Create child logger with additional context
  child(additionalContext: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

// Export singleton logger for general use
export const defaultLogger = new Logger();

// Export logger creator for request-scoped loggers
export function createRequestLogger(req: Request): Logger {
  return new Logger(getRequestContext(req));
}

export default logger;
