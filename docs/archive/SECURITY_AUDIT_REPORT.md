# Security Audit Report - Noor

**Audit Date:** January 20, 2026  
**Auditor:** Paranoid Senior Security Engineer (AI-Assisted)  
**Repository:** C:\Dev\Noor-CBT  
**Commit:** 4ebf01e6bd8fcb6a4300001a7c698d3388d2c323

---

## A. Executive Risk Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 0 | ✅ None found |
| 🟠 High | 1 | ⚠️ Requires attention |
| 🟡 Medium | 3 | 📋 Should address before launch |
| 🟢 Low | 2 | 📝 Recommended improvements |

### Overall Assessment: **CONDITIONALLY READY FOR LAUNCH**

The codebase demonstrates strong security fundamentals with comprehensive PII scrubbing, proper authentication, and robust AI safety guardrails. However, there is one High severity issue (missing .env exclusion in .gitignore) and several Medium issues that should be addressed before production deployment.

---

## B. Detailed Findings

### 🟠 HIGH-1: .gitignore Missing `.env` Exclusion

**File:** `.gitignore`  
**Line:** N/A (missing entry)  
**Risk:** Secret leakage if `.env` is accidentally committed

**Evidence:**
```
# Current .gitignore only has:
.env*.local
# Missing:
.env
```

**Why It Matters:**
If a developer creates a `.env` file (not `.env.local`), it will be tracked by git. One `git add .` and your secrets are in version history forever.

**Reproduction Steps:**
```bash
cd c:\Dev\Noor-CBT
echo "SECRET=test" > .env
git status  # Shows .env as untracked but ready to add
```

**Patch (DO NOT COMMIT UNTIL APPROVED):**
```diff
--- a/.gitignore
+++ b/.gitignore
@@ -23,6 +23,9 @@ npm-debug.*
 yarn-debug.*
 yarn-error.*
 
+# Environment files with secrets
+.env
+
 # local env files
 .env*.local
```

---

### 🟡 MEDIUM-1: Rate Limiting Disabled by Default

**File:** `server/middleware/production.ts`  
**Line:** 52  
**Risk:** DoS, scraping, API abuse

**Evidence:**
```typescript
// Line 52
export function isRateLimitEnabled(): boolean {
  return process.env.RATE_LIMIT_ENABLED === "true";
}
```

**Why It Matters:**
Without rate limiting, the API is open to:
- Scraping user patterns via /api/analyze
- Bill shock from OpenAI API abuse
- DoS attacks overwhelming the server

**Reproduction Steps:**
```bash
# This will NOT be rate limited without RATE_LIMIT_ENABLED=true
for i in {1..1000}; do curl -X POST http://localhost:5000/api/analyze -H "Content-Type: application/json" -d '{"thought":"test"}'; done
```

**Recommendation:**
Change default to enabled in production, or ensure deployment documentation requires `RATE_LIMIT_ENABLED=true`.

**Patch (DO NOT COMMIT UNTIL APPROVED):**
```diff
--- a/server/middleware/production.ts
+++ b/server/middleware/production.ts
@@ -49,7 +49,8 @@ const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP
  * Check if rate limiting is enabled via environment variable.
  */
 export function isRateLimitEnabled(): boolean {
-  return process.env.RATE_LIMIT_ENABLED === "true";
+  // Default to enabled in production for safety
+  return process.env.RATE_LIMIT_ENABLED !== "false";
 }
```

---

### 🟡 MEDIUM-2: Client AsyncStorage Stores Unencrypted Sensitive Data

**File:** `client/lib/storage.ts`  
**Lines:** 1-52  
**Risk:** Local data extraction on compromised/rooted devices

**Evidence:**
```typescript
// Session data stored in plaintext
export interface Session {
  thought: string;      // Sensitive user content
  distortions: string[];
  reframe: string;      // Sensitive AI response
  intention: string;    // Sensitive user content
  practice: string;
  timestamp: number;
}

// Stored unencrypted via AsyncStorage.setItem
await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
```

**Why It Matters:**
- Device backups may include this data in plaintext
- Rooted/jailbroken devices can extract AsyncStorage
- Inconsistent with server-side encryption of same data

**Recommendation:**
Use `expo-secure-store` for sensitive session data, or implement client-side encryption similar to server.

**Note:** This is MEDIUM not HIGH because:
1. iOS/Android sandbox protects data from other apps
2. Only affects local device compromise scenarios
3. Server-side storage IS properly encrypted

---

### 🟡 MEDIUM-3: Server Encryption Has Risky Fallbacks

**File:** `server/encryption.ts`  
**Lines:** 10, 32-33  
**Risk:** Data stored unencrypted on configuration error

**Evidence:**
```typescript
// Line 10 - Falls back to random key (data lost on restart)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

// Lines 32-33 - Falls back to plaintext on error
  } catch (error) {
    console.error("[Encryption] Encryption failed:", error);
    return text; // Fallback to plaintext in dev
  }
```

**Why It Matters:**
- Random key fallback means encrypted data is unrecoverable after restart
- Plaintext fallback could silently store sensitive data unencrypted
- Failure should be loud, not silent

**Recommendation:**
In production, fail loudly if ENCRYPTION_KEY is not properly configured.

**Patch (DO NOT COMMIT UNTIL APPROVED):**
```diff
--- a/server/encryption.ts
+++ b/server/encryption.ts
@@ -7,7 +7,16 @@ import crypto from "crypto";
 
 const ENCRYPTION_KEY =
   process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
+
+// Validate encryption key on startup in production
+if (process.env.NODE_ENV === "production" && !process.env.ENCRYPTION_KEY) {
+  console.error("FATAL: ENCRYPTION_KEY not configured in production. Data encryption will fail.");
+  throw new Error("ENCRYPTION_KEY environment variable is required in production.");
+}
+
 const ALGORITHM = "aes-256-gcm";
```

---

### 🟢 LOW-1: Request Logging May Capture Truncated Sensitive Data

**File:** `server/index.ts`  
**Lines:** 72-80  
**Risk:** Minimal - truncated to 100 chars, but could leak partial content

**Evidence:**
```typescript
// Line 72-80
let logLine = `[${requestId}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
if (capturedJsonResponse) {
  logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
}
if (logLine.length > 100) {
  logLine = logLine.slice(0, 99) + "…";
}
log(logLine);
```

**Why It Matters:**
Response bodies are logged (truncated). For short responses, sensitive content could appear in logs.

**Recommendation:**
Consider not logging response bodies for /api/analyze, /api/reframe, /api/reflection/* endpoints.

---

### 🟢 LOW-2: Health Endpoint Reveals Service Configuration

**File:** `server/health.ts`  
**Lines:** 76-96  
**Risk:** Information disclosure (minimal)

**Evidence:**
```typescript
// Health endpoint reveals:
return {
  status,
  timestamp: new Date().toISOString(),
  version: process.env.npm_package_version || "1.0.0",
  uptime: process.uptime(),
  checks: {
    database: { configured: dbConfigured, connected: dbConnected },
    ai: { configured: aiConfigured },
    sentry: { configured: sentryConfigured },
    rateLimit: { enabled: rateLimitEnabled },
  },
};
```

**Why It Matters:**
Attackers can fingerprint the application and identify which services are configured.

**Recommendation:**
Consider a minimal /health that returns just `{ "status": "ok" }` for external load balancers, with detailed health on a separate admin endpoint.

---

## C. What Was Tested and Found Secure

### ✅ Secrets Management
- No real API keys found in codebase or git history
- .env.example files use `CHANGEME` placeholders
- GitHub workflows use proper `${{ secrets.EXPO_TOKEN }}`
- eas.json contains no secrets

### ✅ Sentry PII Scrubbing
- **Server:** `server/sentry.ts` properly scrubs:
  - thought, reframe, intention, belief, reflection, content, message, prompt
  - Cookies removed from events
  - Breadcrumbs scrubbed

- **Client:** `client/lib/sentry.ts` is currently disabled (not installed), safe by default

### ✅ Authentication & Authorization
- Session-based auth via `req.auth.userId`
- Routes properly check auth before accessing user data
- Admin endpoint requires ADMIN_TOKEN verification
- Admin endpoint disabled unless explicitly enabled

### ✅ CORS Configuration
- Whitelist-based CORS (only allows REPLIT_DOMAINS)
- If no domains configured, allows no origins (safe default)

### ✅ AI Safety Guardrails
- Crisis detection (emergency, urgent, concern levels)
- Religious scrupulosity detection (waswasa)
- Theological validation (blocks harmful religious content)
- Output validation (blocks spiritual bypassing, judgmental language)
- Input sanitization with XSS pattern detection
- Canonical orchestration with audit logging

### ✅ Data Encryption (Server-side)
- AES-256-GCM encryption for sensitive fields
- Unique IV per encryption operation
- Encrypted fields: thought, reframe, intention

### ✅ Data Retention
- Cleanup service runs every 24 hours
- Admin cleanup endpoint protected

### ✅ Test Coverage
- 79 tests passing
- Includes safety-system and e2e-journey tests

---

## D. Reproduction Commands

### Check for secrets in git history
```bash
git log --all -S "sk-proj" --oneline
git log --all -S "sk_live_" --oneline
git log --all -S "AKIA" --oneline
```

### Verify .gitignore effectiveness
```bash
git ls-files | findstr "\.env"
# Should only show .env.example files
```

### Run existing tests
```bash
npm test -- --watchAll=false
```

### Check rate limiting status
```bash
curl http://localhost:5000/health
# Look for rateLimit.enabled field
```

---

## E. Patch Plan (Priority Order)

### Immediate (Before Any Public Release)
1. **HIGH-1:** Add `.env` to `.gitignore`

### Before Production Launch
2. **MEDIUM-1:** Enable rate limiting by default in production
3. **MEDIUM-3:** Add encryption key validation for production

### Future Improvements
4. **MEDIUM-2:** Consider encrypting client-side AsyncStorage
5. **LOW-1:** Exclude response bodies from sensitive endpoint logs
6. **LOW-2:** Minimize health endpoint information

---

## F. Re-Test Checklist After Patches

After applying each patch, verify:

- [ ] `git status` shows .env as ignored (after HIGH-1)
- [ ] `npm test -- --watchAll=false` passes (79 tests)
- [ ] `npm run check:types` passes
- [ ] Server starts without errors
- [ ] Health endpoint responds at /health
- [ ] Rate limiting headers appear in API responses (after MEDIUM-1)
- [ ] Server fails to start without ENCRYPTION_KEY in production (after MEDIUM-3)

---

## Summary

**The codebase is well-architected with strong security fundamentals.** The PII scrubbing, authentication system, AI safety guardrails, and server-side encryption are all properly implemented.

**One HIGH issue requires immediate attention:** The missing `.env` exclusion in `.gitignore` is a ticking time bomb for secret leakage.

**Three MEDIUM issues should be addressed before production:** Rate limiting default, client storage encryption, and server encryption validation.

**You can start Apple submission with confidence** after fixing HIGH-1. The MEDIUM and LOW issues are improvements, not blockers.
