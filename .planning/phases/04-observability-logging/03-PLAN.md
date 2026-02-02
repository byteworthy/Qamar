---
phase: 04-observability-logging
plan: 03
type: execute
wave: 3
depends_on: [04-02]
files_modified:
  - server/types/error-response.ts
  - server/middleware/error-handler.ts
  - server/routes.ts
  - server/notificationRoutes.ts
  - server/middleware/auth.ts
  - server/middleware/csrf.ts
  - server/__tests__/error-response.test.ts
autonomous: true

must_haves:
  truths:
    - "All API errors return consistent JSON structure"
    - "Error responses include requestId for traceability"
    - "HTTP status codes follow REST conventions"
    - "Error messages are consistent and actionable"
    - "Error responses distinguish between client/server errors"
  artifacts:
    - path: "server/types/error-response.ts"
      provides: "Standard error response interface"
      exports: ["ErrorResponse", "createErrorResponse"]
    - path: "server/middleware/error-handler.ts"
      provides: "Centralized error handler middleware"
      contains: "errorHandler"
    - path: "server/__tests__/error-response.test.ts"
      provides: "Error response format tests"
      min_lines: 50
  key_links:
    - from: "route handlers"
      to: "createErrorResponse"
      via: "error response creation"
      pattern: "createErrorResponse\\("
    - from: "Express app"
      to: "errorHandler middleware"
      via: "error handling chain"
      pattern: "app\\.use\\(errorHandler\\)"
---

<objective>
Standardize error response format across all API endpoints for consistency and traceability.

Purpose: Establish a single, consistent error response format with requestId tracking, proper status codes, and actionable error messages. This completes the observability stack by ensuring errors are both logged correctly (from 04-02) and returned consistently to clients.

Output: Unified error response system with standard interface, centralized error handler, and updated endpoints following REST conventions.
</objective>

<execution_context>
@C:\Users\richa\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\richa\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@server/routes.ts
@server/middleware/auth.ts
@server/utils/logger.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create standard error response types and utilities</name>
  <files>server/types/error-response.ts</files>
  <action>
Create `server/types/error-response.ts` with standard error response interface:

```typescript
/**
 * Standard error response format for all API endpoints
 *
 * Ensures consistent error handling across the API with:
 * - Unified structure
 * - Request traceability via requestId
 * - HTTP status code adherence
 * - Actionable error messages
 */

export interface ErrorResponse {
  /** Error indicator - always true for error responses */
  error: true;

  /** HTTP status code (400-599) */
  statusCode: number;

  /** User-facing error message (safe to display) */
  message: string;

  /** Error code for programmatic handling (e.g., "INVALID_INPUT", "AUTH_REQUIRED") */
  code: string;

  /** Request ID for log correlation and debugging */
  requestId: string;

  /** Timestamp when error occurred (ISO 8601 format) */
  timestamp: string;

  /** Optional: Additional error details for debugging (not shown to end users) */
  details?: Record<string, unknown>;
}

/**
 * Standard error codes following REST conventions
 */
export const ERROR_CODES = {
  // 400 - Client Errors
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // 401 - Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // 402 - Payment
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',

  // 403 - Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // 404 - Not Found
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // 409 - Conflict
  CONFLICT: 'CONFLICT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',

  // 429 - Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // 500 - Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // 503 - Service Unavailable
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Standard error messages by code
 */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: 'The provided input is invalid',
  VALIDATION_FAILED: 'Request validation failed',
  MISSING_REQUIRED_FIELD: 'Required field is missing',

  AUTH_REQUIRED: 'Authentication is required to access this resource',
  AUTH_INVALID: 'Invalid authentication credentials',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',

  PAYMENT_REQUIRED: 'Payment is required to access this feature',
  SUBSCRIPTION_INACTIVE: 'Your subscription is inactive',

  FORBIDDEN: 'You do not have permission to access this resource',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',

  NOT_FOUND: 'The requested resource was not found',
  RESOURCE_NOT_FOUND: 'Resource not found',

  CONFLICT: 'The request conflicts with the current state',
  DUPLICATE_RESOURCE: 'A resource with these properties already exists',

  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down',

  INTERNAL_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'A database error occurred',

  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable',
  MAINTENANCE_MODE: 'Service is under maintenance',
};

/**
 * Create a standard error response
 */
export function createErrorResponse(
  statusCode: number,
  code: string,
  requestId: string,
  customMessage?: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    error: true,
    statusCode,
    code,
    message: customMessage || ERROR_MESSAGES[code] || 'An error occurred',
    requestId,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
}

/**
 * HTTP Status codes with descriptions
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;
```
  </action>
  <verify>
- Error response types created with comprehensive interface
- Standard error codes defined
- Helper functions for error response creation
- TypeScript compilation passes
  </verify>
  <done>Standard error response interface and utilities created</done>
</task>

<task type="auto">
  <name>Task 2: Create centralized error handler middleware</name>
  <files>server/middleware/error-handler.ts</files>
  <action>
Create `server/middleware/error-handler.ts` with centralized error handling:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
  type ErrorResponse,
} from '../types/error-response';
import { defaultLogger } from '../utils/logger';

/**
 * Custom error class that includes error code and status
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler middleware
 *
 * Catches all errors thrown in routes/middleware and returns
 * standardized error responses with proper logging.
 *
 * Must be registered AFTER all routes in Express app.
 */
export function errorHandler(
  error: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Get requestId from request (added by request-logger middleware)
  const requestId = req.id || 'unknown';

  let errorResponse: ErrorResponse;

  // Handle different error types
  if (error instanceof AppError) {
    // Application errors with known status and code
    errorResponse = createErrorResponse(
      error.statusCode,
      error.code,
      requestId,
      error.message,
      error.details
    );

    // Log based on status code
    if (error.statusCode >= 500) {
      req.logger?.error('Application error', error, {
        code: error.code,
        statusCode: error.statusCode,
      });
    } else {
      req.logger?.warn('Client error', {
        code: error.code,
        statusCode: error.statusCode,
        message: error.message,
      });
    }
  } else if (error instanceof ZodError) {
    // Validation errors from Zod
    const details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    errorResponse = createErrorResponse(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_FAILED,
      requestId,
      'Request validation failed',
      { validationErrors: details }
    );

    req.logger?.warn('Validation error', {
      validationErrors: details,
    });
  } else {
    // Unknown/unexpected errors - treat as internal server error
    errorResponse = createErrorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      requestId,
      'An unexpected error occurred'
    );

    req.logger?.error('Unexpected error', error, {
      errorName: error.name,
      errorMessage: error.message,
    });
  }

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);
}

/**
 * Helper to create and throw an AppError
 */
export function throwError(
  statusCode: number,
  code: string,
  message?: string,
  details?: Record<string, unknown>
): never {
  throw new AppError(statusCode, code, message || '', details);
}

/**
 * Async handler wrapper to catch promise rejections
 *
 * Usage:
 *   app.get('/route', asyncHandler(async (req, res) => {
 *     // Async code here - errors automatically caught
 *   }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

Add to `server/index.ts` AFTER all routes:

```typescript
import { errorHandler } from './middleware/error-handler';

// ... all routes registered here ...

// Error handler MUST be last middleware
app.use(errorHandler);
```
  </action>
  <verify>
- Error handler middleware created
- AppError class defined
- asyncHandler wrapper created
- Error handler integrated into Express app
- TypeScript compilation passes
  </verify>
  <done>Centralized error handler middleware implemented</done>
</task>

<task type="auto">
  <name>Task 3: Update routes.ts to use standard error responses</name>
  <files>server/routes.ts</files>
  <action>
Update `server/routes.ts` to use standard error response format:

1. Add imports at top:
```typescript
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from './types/error-response';
import { AppError, asyncHandler } from './middleware/error-handler';
```

2. Replace inconsistent error responses with standard format:

**Pattern 1: Simple error responses**
```typescript
// BEFORE:
return res.status(400).json({ error: "Invalid input" });

// AFTER:
return res.status(HTTP_STATUS.BAD_REQUEST).json(
  createErrorResponse(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.INVALID_INPUT,
    req.id,
    "Invalid input"
  )
);
```

**Pattern 2: Authentication errors**
```typescript
// BEFORE:
return res.status(401).json({ error: "Authentication required" });

// AFTER:
return res.status(HTTP_STATUS.UNAUTHORIZED).json(
  createErrorResponse(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTH_REQUIRED,
    req.id
  )
);
```

**Pattern 3: Payment required errors**
```typescript
// BEFORE:
return res.status(402).json({ error: "Subscription required" });

// AFTER:
return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json(
  createErrorResponse(
    HTTP_STATUS.PAYMENT_REQUIRED,
    ERROR_CODES.PAYMENT_REQUIRED,
    req.id,
    "Active subscription required for this feature"
  )
);
```

**Pattern 4: Service unavailable (AI service)**
```typescript
// BEFORE:
return res.status(503).json({ error: "AI service unavailable" });

// AFTER:
return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
  createErrorResponse(
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    ERROR_CODES.AI_SERVICE_UNAVAILABLE,
    req.id,
    "AI service is temporarily unavailable. Please try again."
  )
);
```

**Pattern 5: Rate limit errors**
```typescript
// BEFORE:
return res.status(429).json({ error: "Too many requests" });

// AFTER:
return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
  createErrorResponse(
    HTTP_STATUS.TOO_MANY_REQUESTS,
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    req.id,
    "Rate limit exceeded. Please try again later.",
    { resetTime: rateLimitResetTime }
  )
);
```

**Pattern 6: Internal server errors**
```typescript
// BEFORE:
res.status(500).json({ error: "Failed to analyze thought" });

// AFTER:
res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
  createErrorResponse(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    req.id,
    "Failed to analyze thought"
  )
);
```

3. Use asyncHandler for async routes to automatically catch errors:
```typescript
// BEFORE:
app.post("/api/analyze", async (req, res) => {
  try {
    // async code
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
});

// AFTER:
app.post("/api/analyze", asyncHandler(async (req, res) => {
  // async code - errors automatically caught by errorHandler middleware
  // Explicitly return errors when needed:
  if (!input) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_INPUT,
      "Input is required"
    );
  }
}));
```

4. Update all ~39 error responses in routes.ts systematically:
   - Search for `res.status(4` and `res.status(5`
   - Replace each with createErrorResponse pattern
   - Use appropriate error code from ERROR_CODES
   - Include requestId from req.id
   - Preserve custom error messages where helpful
  </action>
  <verify>
- All error responses in routes.ts use createErrorResponse
- Appropriate error codes used for each scenario
- Request IDs included in all error responses
- TypeScript compilation passes
- No more inconsistent error formats ({ error: "..." } vs { message: "..." })
  </verify>
  <done>All error responses in routes.ts standardized</done>
</task>

<task type="auto">
  <name>Task 4: Update middleware error responses</name>
  <files>server/middleware/auth.ts, server/middleware/csrf.ts</files>
  <action>
Update middleware files to use standard error responses:

**server/middleware/auth.ts:**

```typescript
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from '../types/error-response';

// Update authentication failure responses:

// BEFORE:
return res.status(401).json({ error: "Authentication required" });

// AFTER:
return res.status(HTTP_STATUS.UNAUTHORIZED).json(
  createErrorResponse(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTH_REQUIRED,
    req.id
  )
);

// For invalid/expired sessions:
return res.status(HTTP_STATUS.UNAUTHORIZED).json(
  createErrorResponse(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.SESSION_EXPIRED,
    req.id,
    "Your session has expired. Please sign in again."
  )
);

// For invalid auth tokens:
return res.status(HTTP_STATUS.UNAUTHORIZED).json(
  createErrorResponse(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTH_INVALID,
    req.id,
    "Invalid authentication token"
  )
);
```

**server/middleware/csrf.ts:**

```typescript
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from '../types/error-response';

// BEFORE:
res.status(500).json({ error: "Failed to generate CSRF token" });

// AFTER:
res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
  createErrorResponse(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    req.id,
    "Failed to generate CSRF token"
  )
);
```

Update all error responses in both files to use standard format.
  </action>
  <verify>
- Middleware error responses standardized
- Authentication errors use AUTH_* error codes
- Request IDs included
- TypeScript compilation passes
  </verify>
  <done>Middleware error responses standardized</done>
</task>

<task type="auto">
  <name>Task 5: Update notification routes error responses</name>
  <files>server/notificationRoutes.ts</files>
  <action>
Update `server/notificationRoutes.ts` to use standard error responses:

```typescript
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from './types/error-response';

// Update all error responses in notification routes:

// BEFORE:
res.status(400).json({ error: "Token required" });

// AFTER:
res.status(HTTP_STATUS.BAD_REQUEST).json(
  createErrorResponse(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.MISSING_REQUIRED_FIELD,
    req.id,
    "Push notification token is required"
  )
);

// For auth errors:
return res.status(HTTP_STATUS.UNAUTHORIZED).json(
  createErrorResponse(
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.AUTH_REQUIRED,
    req.id
  )
);

// For internal errors:
res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
  createErrorResponse(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    req.id,
    "Failed to register push notification token"
  )
);
```

Update all error responses in notificationRoutes.ts to follow standard format.
  </action>
  <verify>
- Notification route errors standardized
- Appropriate error codes used
- Request IDs included
- TypeScript compilation passes
  </verify>
  <done>Notification routes error responses standardized</done>
</task>

<task type="auto">
  <name>Task 6: Create tests for error response format</name>
  <files>server/__tests__/error-response.test.ts</files>
  <action>
Create tests for error response standardization:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
  type ErrorResponse,
} from '../types/error-response';
import { AppError } from '../middleware/error-handler';

describe('Error Response Format', () => {
  describe('createErrorResponse', () => {
    it('should create standard error response with required fields', () => {
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT,
        'req-123'
      );

      expect(response).toMatchObject({
        error: true,
        statusCode: 400,
        code: 'INVALID_INPUT',
        requestId: 'req-123',
      });
      expect(response.message).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });

    it('should include custom message when provided', () => {
      const customMessage = 'Custom validation error';
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_FAILED,
        'req-456',
        customMessage
      );

      expect(response.message).toBe(customMessage);
    });

    it('should include details when provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const response = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_INPUT,
        'req-789',
        undefined,
        details
      );

      expect(response.details).toEqual(details);
    });

    it('should use default message when custom message not provided', () => {
      const response = createErrorResponse(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTH_REQUIRED,
        'req-999'
      );

      expect(response.message).toBe('Authentication is required to access this resource');
    });

    it('should include ISO 8601 timestamp', () => {
      const response = createErrorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        'req-abc'
      );

      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(response.timestamp).toMatch(timestampRegex);
    });
  });

  describe('AppError', () => {
    it('should create error with status code and error code', () => {
      const error = new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN,
        'Access denied'
      );

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Access denied');
    });

    it('should include details when provided', () => {
      const details = { resource: 'user', action: 'delete' };
      const error = new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        'Cannot delete user',
        details
      );

      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        'Something went wrong'
      );

      expect(error.stack).toBeDefined();
      expect(error.name).toBe('AppError');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should have correct status codes for common errors', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.PAYMENT_REQUIRED).toBe(402);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
    });
  });

  describe('Error Codes', () => {
    it('should have appropriate error codes for different scenarios', () => {
      expect(ERROR_CODES.INVALID_INPUT).toBe('INVALID_INPUT');
      expect(ERROR_CODES.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ERROR_CODES.PAYMENT_REQUIRED).toBe('PAYMENT_REQUIRED');
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ERROR_CODES.AI_SERVICE_UNAVAILABLE).toBe('AI_SERVICE_UNAVAILABLE');
    });
  });

  describe('Error Response Structure', () => {
    it('should match expected TypeScript interface', () => {
      const response: ErrorResponse = createErrorResponse(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_FAILED,
        'req-test'
      );

      // Type checking - if this compiles, interface is correct
      expect(typeof response.error).toBe('boolean');
      expect(typeof response.statusCode).toBe('number');
      expect(typeof response.message).toBe('string');
      expect(typeof response.code).toBe('string');
      expect(typeof response.requestId).toBe('string');
      expect(typeof response.timestamp).toBe('string');
    });
  });
});
```
  </action>
  <verify>
- Error response tests created
- Tests cover all scenarios (required fields, custom messages, details, timestamps)
- Tests pass: `npm test error-response.test.ts`
- TypeScript compilation passes
  </verify>
  <done>Error response format tests implemented and passing</done>
</task>

<task type="auto">
  <name>Task 7: Verify error response standardization across codebase</name>
  <files>server/**/*.ts</files>
  <action>
1. Search for inconsistent error response patterns:
   ```bash
   # Should find ZERO results (except in old comments or tests):
   grep -r "\.json\({ error:" server/ --include="*.ts" --exclude-dir=node_modules --exclude-dir=__tests__
   grep -r "\.json\({ message:" server/ --include="*.ts" --exclude-dir=node_modules --exclude-dir=__tests__
   ```

2. Verify all error responses use createErrorResponse:
   ```bash
   # Should find results - confirms standardization:
   grep -r "createErrorResponse" server/ --include="*.ts" --exclude-dir=node_modules
   ```

3. Check for error responses without requestId:
   ```bash
   # Should find ZERO results:
   grep -rE "status\([45][0-9]{2}\)\.json" server/ --include="*.ts" --exclude-dir=node_modules | grep -v "requestId\|req\.id"
   ```

4. Run TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

5. Run full test suite:
   ```bash
   npm test
   ```

6. Test error responses in development:
   - Start server: `npm run dev`
   - Make request that triggers validation error
   - Verify response includes: error, statusCode, message, code, requestId, timestamp
   - Make request that triggers auth error
   - Verify consistent format with requestId
   - Make request that triggers rate limit
   - Verify error response includes resetTime in details

7. Review status code usage:
   - 400 for invalid input/validation errors
   - 401 for authentication required/invalid
   - 402 for payment required
   - 403 for forbidden/insufficient permissions
   - 404 for not found
   - 429 for rate limiting
   - 500 for internal server errors
   - 503 for service unavailable

8. Confirm error logging correlation:
   - Error responses include requestId
   - Logger (from 04-02) logs include same requestId
   - Can trace error from API response to server logs using requestId
  </action>
  <verify>
- No inconsistent error formats remaining ({ error: "..." } without full structure)
- All error responses include requestId
- HTTP status codes follow REST conventions
- Error codes are consistent and meaningful
- All tests pass
- Can correlate API errors to server logs via requestId
  </verify>
  <done>Error response standardization verified across entire codebase</done>
</task>

</tasks>

<verification>
1. All API endpoints return consistent error JSON structure
2. Error responses include requestId for tracing to logs
3. HTTP status codes follow REST conventions (400s for client, 500s for server)
4. Error codes are standardized and programmatically usable
5. Error handler middleware catches all uncaught errors
6. TypeScript compilation passes
7. All tests pass including new error response tests
8. Can trace errors from API response to server logs using requestId
</verification>

<success_criteria>
1. Standard error response interface defined (ErrorResponse type)
2. Centralized error handler middleware implemented
3. All ~39 error responses in routes.ts standardized
4. All middleware error responses standardized
5. All notification route error responses standardized
6. Error response tests written and passing
7. Zero inconsistent error formats (old { error: "..." } pattern)
8. All error responses include requestId
9. HTTP status codes follow REST conventions
10. Error codes are consistent (ERROR_CODES)
11. Can correlate API errors to logs via requestId
12. TypeScript compilation passes
13. All existing tests still pass
14. Code committed with clear commit message referencing OBS-05
</success_criteria>

<output>
After completion, create `.planning/phases/04-observability-logging/04-03-SUMMARY.md`
</output>
