---
phase: 04-observability-logging
plan: 02
type: execute
wave: 2
depends_on: [04-01]
files_modified:
  - server/routes.ts
  - server/middleware/auth.ts
  - server/middleware/rate-limit.ts
  - server/canonical-orchestrator.ts
  - server/conversational-ai.ts
  - server/tone-compliance-checker.ts
  - server/pacing-controller.ts
  - server/billing/index.ts
autonomous: true

must_haves:
  truths:
    - "Zero console.log calls in server code"
    - "All logging uses structured logger"
    - "Request context included in logs (requestId, userId)"
    - "Error logs include contextual information"
    - "No sensitive data in logs"
  artifacts:
    - path: "server/routes.ts"
      provides: "Structured logging throughout routes"
      contains: "req\\.logger\\.(info|error|warn)"
    - path: "server/middleware/auth.ts"
      provides: "Structured logging in auth middleware"
      contains: "logger\\.(info|error)"
  key_links:
    - from: "route handlers"
      to: "logger instance"
      via: "structured log calls"
      pattern: "logger\\.(info|error|warn|debug)"
---

<objective>
Replace all console.log calls with structured logging across server codebase (83 instances).

Purpose: Migrate from console logging to production-grade structured logging with proper context and sensitive data protection.

Output: Server codebase using structured logging throughout, with zero console.log calls remaining.
</objective>

<context>
@.planning/ROADMAP.md
@server/utils/logger.ts
@server/routes.ts
@server/middleware/auth.ts
@server/canonical-orchestrator.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace console.log in routes.ts</name>
  <files>server/routes.ts</files>
  <action>
Replace all console.log calls in server/routes.ts with structured logging:

1. Add logger import at top of file:
```typescript
import { createRequestLogger } from './utils/logger';
```

2. Replace console.log patterns:

PATTERN 1: Error logging
```typescript
// BEFORE:
console.error("[Routes] Error:", error);

// AFTER:
req.logger.error("Operation failed", error, {
  operation: "specific_operation_name",
  userId: req.user?.id,
});
```

PATTERN 2: Info logging
```typescript
// BEFORE:
console.log("[Routes] User created reflection");

// AFTER:
req.logger.info("User created reflection", {
  reflectionId: reflection.id,
  emotionalState: reflection.emotionalState,
});
```

PATTERN 3: Debug logging
```typescript
// BEFORE:
console.log("[Routes] Analyzing thought:", thought);

// AFTER:
req.logger.debug("Analyzing thought", {
  thoughtLength: thought.length,
  // Do not log actual thought content (sensitive)
});
```

PATTERN 4: Warning logging
```typescript
// BEFORE:
console.warn("[Routes] Rate limit approaching");

// AFTER:
req.logger.warn("Rate limit approaching", {
  remainingRequests: remaining,
  resetTime: resetTime,
});
```

3. Replace all instances systematically, maintaining context but removing sensitive data.

4. Ensure all error handlers use structured logging:
```typescript
try {
  // operation
} catch (error) {
  req.logger.error("Failed to process request", error, {
    operation: "operation_name",
  });
  return res.status(500).json({ error: "Internal server error" });
}
```
  </action>
  <verify>
- No console.log/error/warn in routes.ts
- All logs use req.logger
- Sensitive data not logged
- TypeScript compilation passes
  </verify>
  <done>All console logging in routes.ts replaced with structured logging</done>
</task>

<task type="auto">
  <name>Task 2: Replace console.log in middleware files</name>
  <files>server/middleware/auth.ts, server/middleware/rate-limit.ts, server/middleware/production.ts, server/middleware/ai-rate-limiter.ts</files>
  <action>
Replace console.log in all middleware files:

For middleware files that don't have access to req.logger yet:

```typescript
import { defaultLogger } from '../utils/logger';

// BEFORE:
console.log("[Auth] User authenticated:", userId);

// AFTER:
defaultLogger.info("User authenticated", {
  userId,
  sessionId: session.id,
});
```

For middleware that has Request access:

```typescript
// BEFORE:
console.error("[Auth] Authentication failed:", error);

// AFTER:
req.logger.error("Authentication failed", error, {
  path: req.path,
  method: req.method,
});
```

Files to update:
1. server/middleware/auth.ts
2. server/middleware/rate-limit.ts
3. server/middleware/production.ts
4. server/middleware/ai-rate-limiter.ts

Ensure each middleware:
- Uses req.logger when Request object available
- Uses defaultLogger for initialization logging
- Includes relevant context (userId, path, method)
- Does not log sensitive data (tokens, passwords, thought content)
  </action>
  <verify>
- No console.log in middleware files
- Structured logging used throughout
- Context preserved in logs
- TypeScript compilation passes
  </verify>
  <done>All console logging in middleware replaced with structured logging</done>
</task>

<task type="auto">
  <name>Task 3: Replace console.log in AI orchestration modules</name>
  <files>server/canonical-orchestrator.ts, server/conversational-ai.ts, server/tone-compliance-checker.ts, server/pacing-controller.ts, server/stateInference.ts, server/toneClassifier.ts</files>
  <action>
Replace console.log in AI orchestration modules:

```typescript
import { defaultLogger } from './utils/logger';

class CanonicalOrchestrator {
  private logger = defaultLogger.child({ module: 'CanonicalOrchestrator' });

  async orchestratePrompt(input: unknown): Promise<unknown> {
    this.logger.debug("Orchestrating prompt", {
      inputLength: typeof input === 'string' ? input.length : 0,
      // Do not log actual prompt content
    });

    try {
      // orchestration logic
      this.logger.info("Prompt orchestration completed", {
        duration: elapsed,
        success: true,
      });
    } catch (error) {
      this.logger.error("Prompt orchestration failed", error, {
        stage: "specific_stage",
      });
      throw error;
    }
  }
}
```

Pattern for each module:
1. Create module-scoped logger with context
2. Replace console.log with appropriate log level
3. Include operational context (duration, success/failure)
4. Never log actual user content or AI responses
5. Log metadata only (lengths, types, states)

Files to update:
1. server/canonical-orchestrator.ts
2. server/conversational-ai.ts
3. server/tone-compliance-checker.ts
4. server/pacing-controller.ts
5. server/stateInference.ts
6. server/toneClassifier.ts
  </action>
  <verify>
- No console.log in AI modules
- Module-scoped loggers created
- Operational context logged, not content
- TypeScript compilation passes
  </verify>
  <done>All console logging in AI modules replaced with structured logging</done>
</task>

<task type="auto">
  <name>Task 4: Replace console.log in billing and utility modules</name>
  <files>server/billing/index.ts, server/encryption.ts, server/storage.ts, server/sentry.ts, server/health.ts</files>
  <action>
Replace console.log in remaining server modules:

For billing webhooks:
```typescript
import { defaultLogger } from '../utils/logger';

const billingLogger = defaultLogger.child({ module: 'Billing' });

export function handleStripeWebhook(req: Request, res: Response): void {
  billingLogger.info("Processing webhook", {
    type: event.type,
    eventId: event.id,
  });

  try {
    // webhook handling
    billingLogger.info("Webhook processed successfully", {
      type: event.type,
      customerId: customer.id,
    });
  } catch (error) {
    billingLogger.error("Webhook processing failed", error, {
      type: event.type,
      eventId: event.id,
    });
  }
}
```

For encryption module:
```typescript
// BEFORE:
console.error("[Encryption] Encryption failed:", error);

// AFTER:
import { defaultLogger } from './utils/logger';

const encryptionLogger = defaultLogger.child({ module: 'Encryption' });

encryptionLogger.error("Encryption failed", error, {
  operation: "encrypt",
  // Do not log the plaintext or encrypted data
});
```

Files to update:
1. server/billing/index.ts - billing webhook logging
2. server/encryption.ts - encryption/decryption logging
3. server/storage.ts - database operation logging
4. server/sentry.ts - error tracking logging
5. server/health.ts - health check logging

Guidelines:
- Use module-scoped loggers
- Log operation results, not sensitive data
- Include customer/user IDs for tracking
- Never log encryption keys, tokens, or plaintext
  </action>
  <verify>
- No console.log in utility modules
- Module-specific loggers used
- Sensitive data not logged
- TypeScript compilation passes
  </verify>
  <done>All console logging in utility modules replaced with structured logging</done>
</task>

<task type="auto">
  <name>Task 5: Verify zero console.log and test logging</name>
  <files>server/**/*.ts</files>
  <action>
1. Search for remaining console.log calls:
   ```bash
   grep -r "console\\.log\|console\\.error\|console\\.warn\|console\\.info\|console\\.debug" server/ --include="*.ts" --exclude-dir=node_modules --exclude-dir=__tests__
   ```

   Expected: Zero results (except in logger.ts itself)

2. Run TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Run full test suite:
   ```bash
   npm test
   ```

4. Start server in development mode and verify logs:
   ```bash
   npm run dev
   ```

   Check that:
   - Logs are structured JSON in production
   - Logs are colorized and readable in development
   - Request IDs appear in logs
   - User IDs appear where applicable
   - No sensitive data (thoughts, passwords) in logs

5. Test error scenarios:
   - Trigger authentication failure - verify error logged with context
   - Trigger validation error - verify warning logged
   - Make successful API call - verify info logged

6. Check log files in production mode:
   ```bash
   NODE_ENV=production npm start
   cat logs/combined.log
   cat logs/error.log
   ```
  </action>
  <verify>
- Zero console.log calls in server code
- All tests pass
- Logs show proper structure and context
- Sensitive data redacted
- Log files created in production mode
  </verify>
  <done>All console logging replaced and verified across codebase</done>
</task>

</tasks>

<verification>
1. Run grep for console.log - should return zero results in server/
2. Verify structured logs in development mode
3. Verify JSON logs in production mode
4. Check that sensitive fields are redacted
5. Confirm request context (requestId, userId) in logs
6. All tests pass
</verification>

<success_criteria>
1. Zero console.log/error/warn/info calls in server code
2. All logging uses structured logger (Winston)
3. Request context included (requestId, userId, method, path)
4. Error logs include error details and stack traces
5. Sensitive data (thoughts, passwords, tokens) not logged
6. Module-scoped loggers used for non-request logging
7. Log levels appropriate (error, warn, info, debug)
8. TypeScript compilation passes
9. All existing tests pass
10. Logs readable in development, JSON in production
11. Code committed with clear commit message referencing OBS-01, OBS-03, OBS-04
</success_criteria>

<output>
After completion, create `.planning/phases/04-observability-logging/02-SUMMARY.md`
</output>
