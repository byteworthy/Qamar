# Noor CBT Codebase - Technical Concerns & Debt Report

**Generated:** January 26, 2026
**Scope:** React Native/Expo client + Express backend analysis
**Focus Areas:** Technical debt, known issues, security concerns, performance gaps, testing coverage

---

## 1. TESTING GAPS - CRITICAL

### Insufficient Test Coverage
- **Only 11 test files** in the project (`client/` and `server/` combined):
  - Client: 9 test files (UI components & screens)
  - Server: 2 test files (safety system, e2e-journey)
- **Server logic largely untested:**
  - `routes.ts` (1,351 lines) - No unit tests for individual endpoints
  - `conversational-ai.ts` (653 lines) - Not tested
  - `tone-compliance-checker.ts` (589 lines) - Not tested
  - `pacing-controller.ts` (551 lines) - Not tested
  - `canonical-orchestrator.ts` (509 lines) - Not tested
  - `toneClassifier.ts` - Not tested
  - `stateInference.ts` (348 lines) - Not tested
  - Most AI safety logic (`ai-safety.ts`, 691 lines) - Partially tested
- **Client screen tests incomplete:**
  - Large screens tested at high level only (ReframeScreen 1,020 lines, HomeScreen 869 lines)
  - Critical user flows not tested end-to-end
- **No integration tests** for billing flows
- **E2E tests (Detox)** configured but minimal coverage

**Impact:** High risk of regression, undetected bugs in production-critical AI routing logic

**Recommendation:**
- Target 80%+ code coverage for `server/routes.ts` and `server/canonical-orchestrator.ts`
- Add integration tests for billing/Stripe webhooks
- Create end-to-end tests for complete reflection flows

---

## 2. LARGE FILES & CODE ORGANIZATION - TECH DEBT

### Oversized Components & Modules
| File | Size | Issue |
|------|------|-------|
| `client/screens/ReframeScreen.tsx` | 1,020 lines | Single-responsibility violation; multiple concerns (perspective selection, API calls, UI rendering) |
| `server/routes.ts` | 1,351 lines | All API routes in one file; needs modularization |
| `client/screens/HomeScreen.tsx` | 869 lines | Complex state management; needs extraction |
| `client/screens/DistortionScreen.tsx` | 856 lines | Too large; should split into smaller components |
| `client/screens/HistoryScreen.tsx` | 791 lines | Needs refactoring |
| `client/screens/RegulationScreen.tsx` | 696 lines | Large meditation screen; opportunity to extract |
| `server/islamic-content-mapper.ts` | 910 lines | Monolithic data mapper |
| `client/constants/theme.ts` | 637 lines | Overly large theme definition |

**Impact:**
- Harder to test individual components
- Increased cognitive load for maintenance
- Difficult to reuse logic across screens
- Higher chance of bugs when modifying large files

**Recommendation:**
- Split screens into smaller, composable components
- Extract common patterns (form handling, API calls) into hooks
- Move theme logic to separate utility files
- Consider feature-based folder structure for large domains

---

## 3. TYPE SAFETY ISSUES - MODERATE

### TypeScript Gaps
- **`any` type usage:**
  - `client/components/GradientBackground.tsx` - Uses `as any` for gradient colors
  - `client/components/LoadingSkeleton.tsx` - Uses `as any` for width
  - `client/components/ReflectionProgress.tsx` - `style?: any` parameter
  - `client/screens/SessionCompleteScreen.tsx` - `theme: any` prop
  - Multiple test files use `as any` to mock responses

- **`@ts-expect-error` and type suppressions:**
  - `client/components/ScreenErrorBoundary.tsx` - Navigation types not properly typed
  - Indicates incomplete type definitions or React Navigation typing issues

- **Untyped API responses:**
  - `client/lib/api.ts` - Response parsing relies on manual typing
  - Error handling doesn't fully leverage TypeScript's type system

**Impact:** Reduced compile-time safety, potential runtime errors

**Recommendation:**
- Use `unknown` instead of `any` where possible
- Create proper TypeScript interfaces for all API responses
- Resolve navigation typing issues in React Navigation setup
- Enable `noImplicitAny` in `tsconfig.json` if not already enabled

---

## 4. SECURITY CONCERNS - MODERATE

### Encryption Implementation Gaps
- **Location:** `server/encryption.ts`
- **Issue:** Fallback to plaintext on encryption failure
  ```typescript
  } catch (error) {
    console.error("[Encryption] Encryption failed:", error);
    return text; // Fallback to plaintext in dev
  }
  ```
- **Risk:** If encryption fails, sensitive data is stored unencrypted
- **Impact:** HIPAA/privacy compliance violation

### Environment Variable Handling
- **Placeholder detection:** Uses string matching for placeholder values (`CHANGEME`)
- **Session security:** `SESSION_SECRET` required but validation could be stronger
- **Production guard:** Encryption key throws error in production if missing, but gracefully fails in dev

### API Key Exposure
- **Sentry SDK:** Tokens exposed in error reports if not properly filtered
- **Anthropic API:** Key validated but no rate limiting per user at SDK level

### CORS Configuration
- **Location:** `server/index.ts` lines 62-94
- **Issue:** Custom CORS logic instead of using established library (`cors` package)
- **Risk:** Potential misconfiguration in edge cases
- **Current implementation validates origin against environment variables** - reasonable but manual

### Input Validation
- **Good:** Zod schemas used for request validation (`analyzeSchema`, etc.)
- **Gap:** Some endpoints may lack validation (need full audit of `routes.ts`)
- **Crisis detection:** Negation detection could be bypassed with creative phrasing

**Recommendations:**
- **CRITICAL:** Change encryption fallback to throw error, not return plaintext
- Use established `cors` npm package with proper configuration
- Add request rate limiting per user (not just global)
- Implement secrets scanning in CI/CD pipeline
- Add input sanitization for AI prompts (prompt injection prevention)
- Review all endpoints in `routes.ts` for validation coverage

---

## 5. ERROR HANDLING & LOGGING - GAPS

### Console Logging in Production
- **Found:** 83 console.log/error/warn calls across 15 server files
- **Issue:** No structured logging; mixes debug and production logs
- **Locations:**
  - `server/config.ts:1`
  - `server/index.ts:1` (logs include sensitive request data)
  - `server/routes.ts:20` calls
  - Multiple middleware files

- **Request Logging Gap:**
  - `server/index.ts` lines 108-147 - Logs sensitive data from AI routes
  - Excludes response bodies for sensitive routes but logs request data

### Error Recovery
- **Webhook handling:** Non-fatal errors logged but continue processing
  - `server/index.ts` lines 311-317 - Stripe webhook setup tolerates missing URL
- **Rate limiter:** Missing specific error handling for rate limit errors
- **Database errors:** Generic error messages; hard to debug issues

### Sentry Integration
- **Configured:** Yes (`server/sentry.ts`, `client/lib/sentry.ts`)
- **Gap:** Error context inconsistent across modules
- **Missing:** Custom context for request IDs in all error scenarios

**Recommendations:**
- Implement structured logging (Winston, Pino, or similar)
- Replace console.log with logging service
- Remove sensitive data from logs (thoughts, user messages)
- Add contextual information (requestId, userId, timestamp) to all errors
- Standardize error response format across API

---

## 6. MISSING CI/CD ISSUES

### Limited Pipeline
- **Files:** `.github/workflows/ci.yml`, `pr-check.yml`, `eas-build.yml`
- **Gaps:**
  - **No automated testing on PR:** `ci.yml` only runs `npm run release:check` (type check, lint, test)
  - **No deployment pipeline:** No automatic deploy on main branch merge
  - **No E2E testing in CI:** Detox E2E tests configured locally but not in CI
  - **No security scanning:** No SAST (static application security testing)
  - **No dependency scanning:** No Dependabot or similar for vulnerability detection
  - **Build optimization:** No cache reuse between workflows

### Testing Configuration
- **Jest configured** but limited integration
- **Detox E2E** configured but requires manual builds
- **Coverage reporting:** No coverage threshold enforcement

**Recommendations:**
- Add automated E2E tests to PR checks (at least on key flows)
- Implement automated deployment to staging on PR, production on merge
- Add security scanning (npm audit, Snyk, or similar)
- Enable Dependabot for automated dependency updates
- Set coverage thresholds (e.g., 70% for changed files)
- Cache node_modules and build artifacts across workflows

---

## 7. PERFORMANCE CONCERNS - GAPS

### Large Bundle Size
- Multiple large screen files (900+ lines each) not code-split
- Gradient and geometric pattern components may impact load time
- No analysis of bundle size or performance budgets

### State Management
- Client uses React Query + local state mixed
- Some screens show loading skeletons but no optimistic updates
- Reflection history screen may load all history at once (needs pagination check)

### Database Queries
- No query performance monitoring mentioned
- Risk of N+1 queries in reflection history retrieval
- Data retention cleanup runs every 24 hours but no performance baseline

### Network Performance
- Rate limiting present but no response time SLAs
- AI route timeouts not explicitly set (Claude API calls could hang)
- Notification service may batch requests inefficiently

**Recommendations:**
- Implement bundle size monitoring in CI
- Add performance profiling to development workflow
- Set API response time budgets (e.g., <500ms for AI routes)
- Implement pagination for history screens
- Add query performance monitoring for database operations

---

## 8. KNOWN ISSUES & FRAGILE AREAS

### Debug Comment
- **File:** `client/lib/billingProvider.ts:407`
- **Issue:** Leftover `// DEBUG` comment
- **Risk:** May indicate incomplete work or temporary code

### Incomplete Type Definitions
- **Navigation types:** `@ts-expect-error` in `ScreenErrorBoundary.tsx`
- **Platform-specific:** Multiple platform-specific hook definitions suggest possible typing gaps

### Stripe Webhook Configuration
- **Location:** `server/index.ts:300-310`
- **Issue:** Uses first domain from `REPLIT_DOMAINS` split - brittle
- **Risk:** If domain format changes, webhook fails silently
- **Mitigation:** Non-fatal error handling allows server to start, but feature is broken

### AI Rate Limiting
- **Two rate limiters:** `aiRateLimiter` and `insightRateLimiter` in routes.ts
- **Gap:** No validation that rates are appropriate for free vs. paid tiers
- **Risk:** Free users could hit insights endpoint more than intended

### Platform-Specific Handling
- Multiple platform-specific implementations:
  - `useColorScheme.ts` / `useColorScheme.web.ts`
  - Custom scroll hiding for web
  - Platform-specific fonts (Amiri for Islamic text)
- **Risk:** Untested on all platforms; web platform may have gaps

---

## 9. DEPENDENCY CONCERNS

### Outdated or Risky Dependencies
| Package | Version | Concern |
|---------|---------|---------|
| `react-native` | 0.81.5 | Recent version; stable |
| `react` | 19.1.0 | Cutting edge; may have undiscovered issues |
| `@anthropic-ai/sdk` | ^0.71.2 | Regular updates; monitor for breaking changes |
| `stripe` | ^20.0.0 | Major version; check upgrade compatibility |
| `@sentry/react-native` | ~7.2.0 | Pinned minor version; consider moving to latest |
| `expo` | ~54.0.32 | Recent; active maintenance |
| `drizzle-orm` | ^0.39.3 | Relatively new ORM; potential instability |

### Missing Dependencies
- **No input sanitization library** (e.g., `sanitize-html` for user content)
- **No encryption library** for frontend (relies on server-side only)
- **No structured logging** (using raw console)
- **No APM** (Application Performance Monitoring) beyond Sentry

---

## 10. CONFIGURATION & ENVIRONMENT MANAGEMENT

### Configuration Issues
- **Validation mode:** Good fallback mechanism but relies on manual testing
- **Environment variables:** Scattered across files (config.ts, index.ts, various modules)
- **Replit-specific configuration:** Hard-coded Replit environment assumptions
- **Session secret:** Must be set manually; no generation helper

### Database
- **No migration strategy visible:** `drizzle-kit push` in package.json but no versioning strategy
- **Connection pooling:** Not explicitly configured
- **Backup strategy:** Not mentioned; critical for HIPAA compliance

---

## 11. DOCUMENTATION & OBSERVABILITY GAPS

### Missing Documentation
- No API endpoint documentation (OpenAPI/Swagger)
- No architecture decision records (ADRs)
- No troubleshooting guide for common issues
- No onboarding guide for new developers

### Observability
- **Sentry:** Configured but error categorization unclear
- **Logging:** Only console-based; no log aggregation
- **Metrics:** No custom metrics for business logic (e.g., reflection completion rate)
- **Tracing:** Sentry profiling configured but spans unclear

---

## 12. REGULATORY & COMPLIANCE CONCERNS

### HIPAA Alignment
- **Encryption:** Implementation has fallback risk (see Security section)
- **Data retention:** 90-day auto-deletion implemented; good
- **Audit logging:** `OrchestrationAuditLogger` exists but scope unclear
- **Access control:** Session-based; no role-based access control (RBAC)

### Data Privacy
- **User data:** Encrypted at rest (with risk mentioned above)
- **API logs:** May contain sensitive therapy content (partially mitigated)
- **Sentry:** Will capture errors including partial user data

---

## Priority Ranking

### P0 (Critical - Fix Immediately)
1. **Encryption fallback to plaintext** - HIPAA violation risk
2. **Insufficient server route tests** - 1,351 line untested file
3. **Stripe webhook domain handling** - Fragile, silent failures

### P1 (High - Fix Within Sprint)
1. **No E2E tests in CI/CD** - Risk of regression to production
2. **Structured logging missing** - Hard to debug production issues
3. **Type safety gaps** (any types, untyped APIs) - Runtime errors

### P2 (Medium - Fix Within 2 Sprints)
1. **Large monolithic files** - Tech debt; harder to maintain
2. **Input validation audit** - Security hardening needed
3. **Performance monitoring** - No baselines or budgets set

### P3 (Low - Fix Within Quarter)
1. **API documentation** - Operational convenience
2. **Bundle size monitoring** - Long-term performance
3. **Configuration management** - Operational convenience

---

## Summary Statistics

| Metric | Value | Status |
|--------|-------|--------|
| Test Files | 11 | ⚠️ Low |
| Lines of Code (largest server file) | 1,351 | ⚠️ High |
| Lines of Code (largest client file) | 1,020 | ⚠️ High |
| `any` type usages | 6+ | ⚠️ Moderate |
| Console logs in server | 83 | ⚠️ High |
| CI/CD pipelines | 3 | ⚠️ Limited |
| Encryption error handling | Fallback | ❌ Critical |
| Type safety score | ~70% | ⚠️ Moderate |

---

## Next Steps

1. **This week:** Fix encryption fallback (P0)
2. **Next sprint:** Add server route tests and E2E to CI (P0, P1)
3. **Month 2:** Refactor large files and implement structured logging (P1, P2)
4. **Month 3:** Complete test coverage and performance monitoring (P2)
