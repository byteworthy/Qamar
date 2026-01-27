---
phase: 04-observability-logging
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - server/utils/logger.ts
  - server/config.ts
  - package.json
autonomous: true

must_haves:
  truths:
    - "Structured logging service implemented (Winston or Pino)"
    - "Logger configured with appropriate log levels"
    - "Logger includes request context (requestId, userId, timestamp)"
    - "Logger excludes sensitive data from logs"
    - "Logger ready for integration across codebase"
  artifacts:
    - path: "server/utils/logger.ts"
      provides: "Structured logging service"
      contains: "createLogger|pino"
    - path: "server/config.ts"
      provides: "Logging configuration"
      contains: "logLevel"
  key_links:
    - from: "logger instance"
      to: "application code"
      via: "structured logging calls"
      pattern: "logger\\.(info|error|warn|debug)"
---

<objective>
Implement production-grade structured logging service to replace console logging.

Purpose: Establish logging infrastructure before migrating console.log calls, ensuring proper log levels, context, and sensitive data filtering.

Output: Fully configured logging service (Winston or Pino) ready for integration across the codebase.
</objective>

<context>
@.planning/ROADMAP.md
@server/config.ts
@server/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install logging library</name>
  <files>package.json</files>
  <action>
Install Winston as the structured logging library:

```bash
npm install winston
npm install --save-dev @types/winston
```

Alternative: If you prefer Pino (faster, lighter):
```bash
npm install pino
npm install pino-pretty --save-dev
```

For this plan, we'll use Winston as it has better TypeScript support and more features for production use.
  </action>
  <verify>
- winston package installed
- @types/winston installed
- package.json updated with dependencies
  </verify>
  <done>Winston logging library installed</done>
</task>

<task type="auto">
  <name>Task 2: Create logging service with sensitive data filtering</name>
  <files>server/utils/logger.ts</files>
  <action>
Create `server/utils/logger.ts` with comprehensive logging service:

```typescript
import winston from 'winston';
import { Request } from 'express';

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
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(LOG_COLORS);

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'thought', // User reflection content
  'reframe', // Generated reframe content
  'intention', // User intention
  'message', // AI messages
  'prompt', // AI prompts
  'email', // PII
];

// Redact sensitive data from objects
function redactSensitiveData(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if key contains sensitive field name
      const isSensitive = SENSITIVE_FIELDS.some(field =>
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
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
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Redact sensitive data from metadata
    const safeMeta = redactSensitiveData(meta);

    const metaString = Object.keys(safeMeta).length
      ? JSON.stringify(safeMeta, null, 2)
      : '';

    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: LOG_LEVELS,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'noor-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        structuredFormat
      ),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Helper to extract request context
export function getRequestContext(req: Request): {
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  ip?: string;
} {
  return {
    requestId: req.id || 'unknown',
    userId: req.user?.id,
    method: req.method,
    path: req.path,
    ip: req.ip || req.headers['x-forwarded-for'] as string,
  };
}

// Enhanced logger with request context
export class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = redactSensitiveData(context) as Record<string, unknown>;
  }

  private log(level: string, message: string, meta: Record<string, unknown> = {}): void {
    const safeMeta = redactSensitiveData(meta) as Record<string, unknown>;
    logger.log(level, message, { ...this.context, ...safeMeta });
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.log('info', message, meta);
  }

  error(message: string, error?: Error | unknown, meta: Record<string, unknown> = {}): void {
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

    this.log('error', message, errorMeta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.log('warn', message, meta);
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.log('debug', message, meta);
  }

  http(message: string, meta: Record<string, unknown> = {}): void {
    this.log('http', message, meta);
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
```
  </action>
  <verify>
- Logger file created with Winston configuration
- Sensitive data filtering implemented
- Request context helpers created
- TypeScript compilation passes
  </verify>
  <done>Structured logging service created with sensitive data protection</done>
</task>

<task type="auto">
  <name>Task 3: Update configuration for logging</name>
  <files>server/config.ts</files>
  <action>
Update `server/config.ts` to include logging configuration:

```typescript
// Add to existing config.ts

export const loggingConfig = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Enable file logging in production
  enableFileLogging: process.env.NODE_ENV === 'production',

  // Log directory
  logDirectory: process.env.LOG_DIRECTORY || './logs',

  // Redact sensitive fields
  redactSensitiveData: true,

  // Additional sensitive field patterns
  customSensitivePatterns: process.env.SENSITIVE_LOG_PATTERNS
    ? process.env.SENSITIVE_LOG_PATTERNS.split(',')
    : [],
};

// Add to validation
export function validateConfig(): void {
  // ... existing validation

  // Validate logging config
  const validLogLevels = ['error', 'warn', 'info', 'http', 'debug'];
  if (!validLogLevels.includes(loggingConfig.level)) {
    throw new Error(
      `Invalid LOG_LEVEL: ${loggingConfig.level}. Must be one of: ${validLogLevels.join(', ')}`
    );
  }
}
```

Add to `.env.example`:
```
# Logging Configuration
LOG_LEVEL=info
LOG_DIRECTORY=./logs
SENSITIVE_LOG_PATTERNS=
```
  </action>
  <verify>
- Config file updated with logging configuration
- Environment variables documented
- TypeScript compilation passes
  </verify>
  <done>Logging configuration added to server config</done>
</task>

<task type="auto">
  <name>Task 4: Add Express middleware for request logging</name>
  <files>server/middleware/request-logger.ts</files>
  <action>
Create Express middleware for automatic request/response logging:

```typescript
import { Request, Response, NextFunction } from 'express';
import { createRequestLogger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type to include logger and requestId
declare global {
  namespace Express {
    interface Request {
      id: string;
      logger: ReturnType<typeof createRequestLogger>;
    }
  }
}

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate unique request ID
  req.id = req.headers['x-request-id'] as string || uuidv4();

  // Attach request-scoped logger
  req.logger = createRequestLogger(req);

  // Log incoming request
  req.logger.http('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
  });

  // Capture start time
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
```

Add to `server/index.ts`:
```typescript
import { requestLoggerMiddleware } from './middleware/request-logger';

// Add after body parsing middleware, before routes
app.use(requestLoggerMiddleware);
```
  </action>
  <verify>
- Request logger middleware created
- Middleware integrated into Express app
- TypeScript compilation passes
- Logs show request/response information
  </verify>
  <done>Request logging middleware integrated</done>
</task>

<task type="auto">
  <name>Task 5: Test logging service</name>
  <files>server/__tests__/logger.test.ts</files>
  <action>
Create tests for logging service:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Logger, defaultLogger } from '../utils/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Sensitive data redaction', () => {
    it('should redact password field', () => {
      const logger = new Logger();
      logger.info('User login', { password: 'secret123' });

      // Check that password was redacted
      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData).toContain('[REDACTED]');
      expect(loggedData).not.toContain('secret123');
    });

    it('should redact thought content', () => {
      const logger = new Logger();
      logger.info('Reflection created', {
        thought: 'My private thoughts',
        emotionalState: 'anxious',
      });

      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData).toContain('[REDACTED]');
      expect(loggedData).not.toContain('My private thoughts');
      expect(loggedData).toContain('anxious'); // Non-sensitive data preserved
    });

    it('should redact nested sensitive fields', () => {
      const logger = new Logger();
      logger.info('API call', {
        user: {
          email: 'user@example.com',
          name: 'John',
        },
        headers: {
          authorization: 'Bearer token123',
        },
      });

      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData).toContain('[REDACTED]');
      expect(loggedData).not.toContain('user@example.com');
      expect(loggedData).not.toContain('token123');
      expect(loggedData).toContain('John'); // Non-sensitive data preserved
    });
  });

  describe('Context management', () => {
    it('should include context in all logs', () => {
      const logger = new Logger({ requestId: 'req-123', userId: 'user-456' });
      logger.info('Test message');

      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData).toContain('req-123');
      expect(loggedData).toContain('user-456');
    });

    it('should create child logger with additional context', () => {
      const parentLogger = new Logger({ requestId: 'req-123' });
      const childLogger = parentLogger.child({ userId: 'user-456' });

      childLogger.info('Child log');

      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData).toContain('req-123');
      expect(loggedData).toContain('user-456');
    });
  });

  describe('Error logging', () => {
    it('should log error with stack trace', () => {
      const logger = new Logger();
      const error = new Error('Test error');

      logger.error('Error occurred', error);

      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData).toContain('Test error');
      expect(loggedData).toContain('stack');
    });
  });
});
```
  </action>
  <verify>
- Logger tests created
- Tests pass: `npm test logger.test.ts`
- Sensitive data redaction verified
- Context management verified
  </verify>
  <done>Logging service tested and verified</done>
</task>

</tasks>

<verification>
1. Confirm server/utils/logger.ts created with Winston
2. Verify sensitive data filtering works (test with password, thought fields)
3. Run `npm test logger.test.ts` - tests pass
4. Check logs directory created in production mode
5. TypeScript compilation passes
</verification>

<success_criteria>
1. Winston logging library installed and configured
2. Structured logging service created (server/utils/logger.ts)
3. Sensitive data redaction implemented and tested
4. Request context helpers created
5. Express middleware for request logging integrated
6. Logging configuration added to server/config.ts
7. Logger tests pass
8. TypeScript compilation passes
9. Ready for integration across codebase (OBS-01 migration)
10. Code committed with clear commit message referencing OBS-02
</success_criteria>

<output>
After completion, create `.planning/phases/04-observability-logging/01-SUMMARY.md`
</output>
