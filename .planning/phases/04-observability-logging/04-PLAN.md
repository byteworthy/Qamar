---
phase: 04-observability-logging
plan: 04
type: execute
wave: 4
depends_on: [04-03]
files_modified:
  - server/routes.ts
  - server/notificationRoutes.ts
  - server/middleware/auth.ts
  - server/middleware/csrf.ts
  - server/index.ts
autonomous: true

must_haves:
  truths:
    - "All API errors return consistent JSON structure"
    - "Error responses include requestId for traceability"
    - "HTTP status codes follow REST conventions"
    - "Error messages are consistent and actionable"
    - "Error responses distinguish between client/server errors"
  artifacts:
    - path: "server/routes.ts"
      provides: "Structured error responses throughout routes"
      contains: "createErrorResponse"
    - path: "server/middleware/auth.ts"
      provides: "Structured error responses in auth middleware"
      contains: "createErrorResponse"
    - path: "server/index.ts"
      provides: "Error handler middleware integrated"
      contains: "errorHandler"
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
Integrate error handling across routes: update all endpoints to use standard error responses and integrate error handler middleware.

Purpose: Complete the observability stack by ensuring errors are both logged correctly (from 04-02) and returned consistently to clients using the foundation from 04-03.

Output: All API endpoints using standard error responses with requestId tracking, proper status codes, and error handler middleware integrated.
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@server/routes.ts
@server/middleware/auth.ts
@server/types/error-response.ts
@server/middleware/error-handler.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update routes.ts to use standard error responses</name>
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
  <name>Task 2: Update middleware error responses</name>
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
  <name>Task 3: Update notification routes error responses</name>
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
  <name>Task 4: Integrate error handler middleware into Express app</name>
  <files>server/index.ts</files>
  <action>
Update `server/index.ts` to integrate error handler middleware:

Add import at top:

```typescript
import { errorHandler } from './middleware/error-handler';
```

Add error handler AFTER all routes are registered (MUST be last middleware):

```typescript
// ... all routes registered here ...

// Error handler MUST be last middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This ensures all errors thrown in routes or middleware are caught and formatted consistently.
  </action>
  <verify>
- Error handler middleware imported
- Error handler registered as LAST middleware (after all routes)
- TypeScript compilation passes
- Server starts successfully
  </verify>
  <done>Error handler middleware integrated into Express app</done>
</task>

<task type="auto">
  <name>Task 5: Verify error response standardization across codebase</name>
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
7. All tests pass
8. Can trace errors from API response to server logs using requestId
</verification>

<success_criteria>
1. All ~39 error responses in routes.ts standardized
2. All middleware error responses standardized
3. All notification route error responses standardized
4. Error handler middleware integrated into Express app
5. Zero inconsistent error formats (old { error: "..." } pattern)
6. All error responses include requestId
7. HTTP status codes follow REST conventions
8. Error codes are consistent (ERROR_CODES)
9. Can correlate API errors to logs via requestId
10. TypeScript compilation passes
11. All existing tests still pass
12. Code committed with clear commit message referencing OBS-05
</success_criteria>

<output>
After completion, create `.planning/phases/04-observability-logging/04-04-SUMMARY.md`
</output>
