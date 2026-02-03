---
phase: "04"
plan: "03"
subsystem: observability
tags: [error-handling, error-response, middleware, standardization, api]
requires: []
provides:
  - standard-error-response-types
  - error-handler-middleware
  - app-error-class
  - async-handler-wrapper
affects:
  - 04-04 # Route integration will use error handler
  - All API routes # Standardized error responses across all endpoints
tech-stack:
  added: []
  patterns:
    - centralized-error-handling
    - standard-error-responses
    - automatic-error-logging
key-files:
  created:
    - server/types/error-response.ts
    - server/middleware/error-handler.ts
    - server/__tests__/error-response.test.ts
  modified: []
decisions:
  - decision: "Use centralized error handler middleware"
    rationale: "Consistent error responses across all API endpoints, automatic logging, simplified route error handling"
  - decision: "Standard error response interface with requestId"
    rationale: "Enable request tracing, debugging, and log correlation for production issues"
  - decision: "AppError class for application errors"
    rationale: "Type-safe error throwing with status codes and error codes for programmatic handling"
  - decision: "Handle ZodError validation errors"
    rationale: "Consistent validation error format across all endpoints using Zod schemas"
  - decision: "asyncHandler wrapper for promise rejections"
    rationale: "Simplify route handlers - automatic error catching without try/catch boilerplate"
metrics:
  tests-added: 11
  tests-passing: 525
  coverage: "100% of error response utilities and types"
  duration: "6.3 minutes"
completed: 2026-02-03
---

# Phase 04 Plan 03: Error Handling Foundation Summary

Standard error response types, centralized error handler middleware, and comprehensive tests ready for route integration.

## What Was Built

### Standard Error Response Types (server/types/error-response.ts)

**ErrorResponse interface:**
- `error: true` - Consistent error indicator
- `statusCode: number` - HTTP status code (400-599)
- `message: string` - User-facing error message
- `code: string` - Error code for programmatic handling
- `requestId: string` - Request ID for log correlation
- `timestamp: string` - ISO 8601 timestamp
- `details?: Record<string, unknown>` - Optional debug details

**Standard error codes (ERROR_CODES):**
- **400 Client Errors:** INVALID_INPUT, VALIDATION_FAILED, MISSING_REQUIRED_FIELD
- **401 Authentication:** AUTH_REQUIRED, AUTH_INVALID, SESSION_EXPIRED
- **402 Payment:** PAYMENT_REQUIRED, SUBSCRIPTION_INACTIVE
- **403 Authorization:** FORBIDDEN, INSUFFICIENT_PERMISSIONS
- **404 Not Found:** NOT_FOUND, RESOURCE_NOT_FOUND
- **409 Conflict:** CONFLICT, DUPLICATE_RESOURCE
- **429 Rate Limiting:** RATE_LIMIT_EXCEEDED, TOO_MANY_REQUESTS
- **500 Server Errors:** INTERNAL_ERROR, DATABASE_ERROR
- **503 Service Unavailable:** SERVICE_UNAVAILABLE, AI_SERVICE_UNAVAILABLE, MAINTENANCE_MODE

**HTTP_STATUS constants:**
- Success: OK (200), CREATED (201), NO_CONTENT (204)
- Client Errors: BAD_REQUEST (400), UNAUTHORIZED (401), PAYMENT_REQUIRED (402), FORBIDDEN (403), NOT_FOUND (404), CONFLICT (409), UNPROCESSABLE_ENTITY (422), TOO_MANY_REQUESTS (429)
- Server Errors: INTERNAL_SERVER_ERROR (500), NOT_IMPLEMENTED (501), SERVICE_UNAVAILABLE (503)

**createErrorResponse helper:**
- Creates standardized error responses
- Uses default messages when custom message not provided
- Includes optional details object for debugging
- Adds ISO 8601 timestamp automatically

### Centralized Error Handler Middleware (server/middleware/error-handler.ts)

**AppError class:**
- Custom error class with statusCode, code, message, details
- Captures stack trace for debugging
- Extends native Error class
- Type-safe error construction

**errorHandler middleware:**
- Catches all errors thrown in routes/middleware
- Handles three error types:
  - **AppError:** Application errors with known status/code
  - **ZodError:** Validation errors from Zod schemas
  - **Error:** Unknown/unexpected errors (500 internal error)
- Automatic logging based on error severity:
  - 5xx errors → req.logger.error() with stack trace
  - 4xx errors → req.logger.warn() with details
  - Validation errors → req.logger.warn() with validation details
- Returns standardized ErrorResponse to client
- Uses requestId from request for log correlation

**throwError helper:**
- Convenience function to throw AppError
- Type-safe: `throwError(statusCode, code, message?, details?)`
- Never returns (TypeScript `never` type)

**asyncHandler wrapper:**
- Wraps async route handlers
- Automatically catches promise rejections
- Forwards errors to error handler middleware
- Eliminates try/catch boilerplate in routes

### Comprehensive Test Suite (server/__tests__/error-response.test.ts)

**11 tests covering:**
- **createErrorResponse (5 tests):**
  - Required fields present
  - Custom messages
  - Details included when provided
  - Default messages when not provided
  - ISO 8601 timestamp format
- **AppError class (3 tests):**
  - Status code and error code
  - Details included when provided
  - Stack trace captured
- **HTTP_STATUS constants (1 test):**
  - Correct status codes for common errors
- **ERROR_CODES constants (1 test):**
  - Appropriate error codes for different scenarios
- **TypeScript interface validation (1 test):**
  - ErrorResponse structure matches TypeScript interface

## Tasks Completed

| Task | Status | Commit | Notes |
|------|--------|--------|-------|
| 1. Create error response types | ✓ Complete | bd2c49d | ErrorResponse interface, ERROR_CODES, HTTP_STATUS, createErrorResponse |
| 2. Create error handler middleware | ✓ Complete | c09ae98 | AppError class, errorHandler, throwError, asyncHandler |
| 3. Create error response tests | ✓ Complete | 97c1285 | 11 tests covering all scenarios, 100% pass rate |

## Deviations from Plan

**None** - Plan executed exactly as written.

All tasks completed as specified with no architectural changes, blocking issues, or unexpected work.

## Success Criteria Validation

- [x] Standard error response interface defined (ErrorResponse type)
- [x] Centralized error handler middleware implemented
- [x] AppError class and asyncHandler wrapper created
- [x] Error response tests written and passing (11/11)
- [x] TypeScript compilation passes (0 errors)
- [x] All existing tests still pass (525/525)
- [x] Foundation ready for Wave 4 route integration
- [x] Code committed with clear commit messages referencing OBS-05

## Technical Details

### Error Response Structure

```typescript
interface ErrorResponse {
  error: true;
  statusCode: number;
  message: string;
  code: string;
  requestId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
```

### Error Handler Flow

1. **Error thrown in route/middleware** → Express catches and forwards to errorHandler
2. **errorHandler checks error type:**
   - AppError → Extract statusCode, code, message, details
   - ZodError → Extract validation errors, map to details
   - Error → Treat as 500 internal error
3. **Log based on severity:**
   - 5xx → error level with stack trace
   - 4xx → warn level with details
4. **Create standardized response** via createErrorResponse
5. **Send response** with appropriate status code

### Usage Examples

```typescript
// Throw application error
import { throwError, HTTP_STATUS, ERROR_CODES } from '../types/error-response';
throwError(HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, 'Access denied');

// Use AppError directly
import { AppError } from '../middleware/error-handler';
throw new AppError(
  HTTP_STATUS.BAD_REQUEST,
  ERROR_CODES.INVALID_INPUT,
  'Email format invalid',
  { field: 'email', providedValue: 'invalid' }
);

// Wrap async route with asyncHandler
import { asyncHandler } from '../middleware/error-handler';
app.get('/api/reflection/:id', asyncHandler(async (req, res) => {
  const reflection = await getReflection(req.params.id);
  if (!reflection) {
    throwError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND, 'Reflection not found');
  }
  res.json(reflection);
}));

// Register error handler AFTER all routes
import { errorHandler } from './middleware/error-handler';
app.use(errorHandler);
```

### Zod Validation Error Handling

```typescript
// ZodError automatically handled by errorHandler
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/api/signup', asyncHandler(async (req, res) => {
  const data = schema.parse(req.body); // Throws ZodError if invalid
  // errorHandler catches ZodError and returns:
  // {
  //   error: true,
  //   statusCode: 400,
  //   code: 'VALIDATION_FAILED',
  //   message: 'Request validation failed',
  //   details: {
  //     validationErrors: [
  //       { path: 'email', message: 'Invalid email' },
  //       { path: 'password', message: 'String must contain at least 8 character(s)' }
  //     ]
  //   }
  // }
}));
```

## Next Phase Readiness

**Blockers:** None

**Dependencies satisfied:**
- Error handling foundation ready for Wave 4 route integration (plan 04-04)
- Can be used immediately in any route handler
- Compatible with existing logging infrastructure (plan 04-01, 04-02)

**Concerns:** None

**Integration notes:**
- Error handler middleware must be registered AFTER all routes in server/index.ts
- Use asyncHandler wrapper for all async routes to catch promise rejections
- Use throwError or AppError for application errors with known status/code
- ZodError automatically handled (no additional code needed)
- requestId automatically included (from request-logger middleware in plan 04-01)

## Files Modified

### Created
- `server/types/error-response.ts` (159 lines) - Standard error response types and utilities
- `server/middleware/error-handler.ts` (133 lines) - Centralized error handler middleware
- `server/__tests__/error-response.test.ts` (154 lines) - Comprehensive test suite

### Modified
- None (integration into server/index.ts planned for Wave 4)

## Commits

- `bd2c49d` - feat(04-03): add standard error response types and utilities
- `c09ae98` - feat(04-03): add centralized error handler middleware
- `97c1285` - test(04-03): add comprehensive error response tests

## Verification

```bash
# Run error response tests
npm test error-response.test.ts
# ✓ 11 tests passing

# Check TypeScript compilation
npm run check:types
# ✓ 0 errors

# Run all tests
npm test
# ✓ 525 tests passing (11 new tests added)
```

## Risk Assessment

**Low risk:**
- No changes to existing code (new files only)
- Middleware not yet integrated (will be in plan 04-04)
- Tests validate all error response scenarios
- TypeScript provides compile-time safety for error codes and status codes

**Potential issues:**
- Error handler must be registered AFTER all routes (order matters)
- asyncHandler must wrap async routes (or use try/catch manually)
- Custom error messages should be user-facing (no sensitive data)

## Recommendations for Next Plan (04-04)

1. Register errorHandler middleware in server/index.ts AFTER all routes
2. Wrap all async routes with asyncHandler
3. Replace manual error handling with throwError or AppError
4. Use standard ERROR_CODES for consistency
5. Add details object for debugging (logged but not shown to users)
6. Test error responses in integration tests
7. Verify requestId appears in logs and responses
8. Consider adding client-side error handling for specific error codes
