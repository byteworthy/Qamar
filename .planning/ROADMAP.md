# Noor App Technical Polish Roadmap

**Created:** 2026-01-26
**Project:** Noor App Technical Polish & Bug Fix Initiative
**Total Requirements:** 57 v1 requirements across 9 categories

---

## Overview

This roadmap addresses all documented technical concerns (P0-P3) through 8 phases organized by priority and dependency relationships. Each phase delivers independently deployable improvements while maintaining production stability.

**Delivery Approach:** Parallel workstreams with incremental shipping

---

## Phase Summary

| Phase | Focus | Requirements | Estimated Scope |
|-------|-------|--------------|-----------------|
| 1 | Critical Security Fixes | 3 | Small |
| 2 | Server Test Coverage | 8 | Large |
| 3 | Type Safety & Code Quality | 7 | Medium |
| 4 | Observability & Logging | 5 | Medium |
| 5 | Infrastructure & CI/CD | 7 | Large |
| 6 | Component Refactoring | 7 | Large |
| 7 | Performance & Monitoring | 5 | Medium |
| 8 | Documentation & Configuration | 8 | Medium |

**Total:** 8 phases | 50 requirements (7 deferred to v2)

---

## Phase 1: Critical Security Fixes

**Goal:** Eliminate P0 critical security vulnerabilities that pose immediate HIPAA and data exposure risk

**Priority:** P0 - Must fix immediately

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md - Fix encryption fallback to throw errors (SEC-01)
- [ ] 01-02-PLAN.md - Replace custom CORS with cors package (SEC-02)
- [ ] 01-03-PLAN.md - Fix Stripe webhook domain handling (INFRA-01)

**Requirements:**
- SEC-01: Fix encryption fallback to throw error instead of returning plaintext (P0 - HIPAA risk)
- SEC-02: Replace custom CORS logic with established `cors` npm package (P0 - misconfiguration risk)
- INFRA-01: Fix Stripe webhook domain handling (brittle first-domain logic) (P0 - production stability)

**Out of Scope for Phase 1:**
The following security requirements are deferred to later phases as they are P1/P2 priority:
- SEC-03: Audit all API endpoints for input validation coverage (Phase 7 - P2)
- SEC-04: Implement secrets scanning in CI/CD pipeline (Phase 8 - P3)
- SEC-05: Add input sanitization for AI prompts (Phase 8 - P3)

**Success Criteria:**
1. Encryption failures throw errors in all environments (no plaintext fallback)
2. Stripe webhook configuration handles multiple domains robustly
3. CORS middleware uses established `cors` package with proper configuration
4. All changes deployed to production without breaking existing functionality
5. Security audit confirms no critical vulnerabilities remain

**Why This Phase:**
These are P0 critical issues that pose immediate security and HIPAA compliance risks. Must be fixed before any other work.

**Dependencies:** None - can start immediately

---

## Phase 2: Server Test Coverage

**Goal:** Achieve comprehensive test coverage for untested server logic

**Priority:** P0/P1 - Critical for confidence in subsequent changes

**Requirements:**
- TEST-01: Add unit tests for server/routes.ts (target 80%+ coverage)
- TEST-02: Add tests for conversational-ai.ts
- TEST-03: Add tests for tone-compliance-checker.ts
- TEST-04: Add tests for pacing-controller.ts
- TEST-05: Add tests for canonical-orchestrator.ts
- TEST-06: Add tests for toneClassifier.ts
- TEST-07: Add tests for stateInference.ts
- TEST-08: Add integration tests for billing/Stripe webhooks

**Success Criteria:**
1. Server test coverage reaches >70% overall
2. All API endpoints in routes.ts have unit tests
3. AI orchestration logic has unit tests covering happy paths and error cases
4. Billing integration tests verify webhook handling
5. CI pipeline runs all tests successfully on every PR

**Why This Phase:**
Cannot safely refactor or modify server code without tests. This phase establishes the safety net for all subsequent work.

**Dependencies:** Should complete Phase 1 (security fixes) first to avoid test churn

---

## Phase 3: Type Safety & Code Quality

**Goal:** Eliminate type safety gaps and establish type-safe patterns

**Priority:** P1 - High priority for maintainability

**Requirements:**
- TYPE-01: Replace `any` types in GradientBackground.tsx
- TYPE-02: Replace `any` types in LoadingSkeleton.tsx
- TYPE-03: Replace `any` types in ReflectionProgress.tsx
- TYPE-04: Replace `any` types in SessionCompleteScreen.tsx
- TYPE-05: Fix navigation type errors (@ts-expect-error in ScreenErrorBoundary.tsx)
- TYPE-06: Create proper TypeScript interfaces for all API responses
- TYPE-07: Use `unknown` instead of `any` in test files

**Success Criteria:**
1. Zero `any` types in production code (test files acceptable with justification)
2. No `@ts-expect-error` suppressions without documented reasons
3. All API responses have properly typed interfaces
4. TypeScript compilation has zero errors in strict mode
5. Navigation types work correctly without suppressions

**Why This Phase:**
Type safety prevents bugs and improves developer experience. This phase should complete while server tests are being written (parallel work).

**Dependencies:** Can run in parallel with Phase 2

---

## Phase 4: Observability & Logging

**Goal:** Replace console logging with structured production-grade logging

**Priority:** P1 - Essential for production debugging

**Requirements:**
- OBS-01: Replace all console.log with structured logging (83 instances)
- OBS-02: Implement logging service (Winston, Pino, or similar)
- OBS-03: Remove sensitive data from logs
- OBS-04: Add contextual information to all errors (requestId, userId, timestamp)
- OBS-05: Standardize error response format across API

**Success Criteria:**
1. Zero console.log/error/warn calls in production server code
2. Structured logging library integrated and configured
3. All logs include request context (requestId, userId where applicable)
4. Sensitive data (user thoughts, messages) never appears in logs
5. Log aggregation works in production environment

**Why This Phase:**
Production debugging currently relies on scattered console logs. Structured logging is essential for understanding production issues.

**Dependencies:** Can run in parallel with Phases 2-3

---

## Phase 5: Infrastructure & CI/CD

**Goal:** Enhance CI/CD pipeline with automated testing and security scanning

**Priority:** P1/P2 - Critical for deployment confidence

**Requirements:**
- TEST-09: Configure Detox E2E tests in CI/CD pipeline
- INFRA-02: Add automated E2E tests to PR checks
- INFRA-03: Implement automated deployment to staging on PR
- INFRA-04: Add security scanning (SAST) to CI/CD
- INFRA-05: Enable Dependabot for automated dependency updates
- INFRA-06: Set coverage thresholds (70% for changed files)
- INFRA-07: Cache node_modules and build artifacts across workflows

**Success Criteria:**
1. Detox E2E tests run on every PR (at least key user flows)
2. PRs automatically deploy to staging environment
3. SAST scanner catches security issues before merge
4. Dependabot creates PRs for dependency updates weekly
5. CI fails if test coverage drops below thresholds

**Why This Phase:**
Automation prevents regressions and accelerates delivery. Should complete after tests are written (Phase 2).

**Dependencies:** Requires Phase 2 (tests must exist to run in CI)

---

## Phase 6: Component Refactoring

**Goal:** Break down oversized components into maintainable pieces

**Priority:** P2 - Medium priority, improves maintainability

**Requirements:**
- REFACTOR-01: Split ReframeScreen.tsx (1,020 lines)
- REFACTOR-02: Split HomeScreen.tsx (869 lines)
- REFACTOR-03: Split DistortionScreen.tsx (856 lines)
- REFACTOR-04: Split HistoryScreen.tsx (791 lines)
- REFACTOR-05: Modularize server/routes.ts (1,351 lines)
- REFACTOR-06: Split islamic-content-mapper.ts (910 lines)
- REFACTOR-07: Split constants/theme.ts (637 lines)

**Success Criteria:**
1. No component or module exceeds 500 lines
2. Each refactored component has isolated responsibility
3. Test coverage maintained or improved during refactoring
4. No functional regressions (E2E tests pass)
5. Code is more maintainable (subjective but reviewable)

**Why This Phase:**
Large files are hard to maintain and test. Must complete after test coverage (Phase 2) to refactor safely.

**Dependencies:** Requires Phases 2 and 3 (tests + type safety enable safe refactoring)

---

## Phase 7: Performance & Monitoring

**Goal:** Establish performance baselines and monitoring

**Priority:** P2 - Medium priority for long-term health

**Requirements:**
- PERF-01: Implement bundle size monitoring in CI
- PERF-02: Set API response time budgets (<500ms for AI routes)
- PERF-03: Add query performance monitoring for database operations
- PERF-04: Implement pagination for history screens
- PERF-05: Add performance profiling to development workflow
- TEST-10: Achieve >70% overall test coverage (carryover from Phase 2)
- SEC-03: Audit all API endpoints for input validation coverage

**Success Criteria:**
1. Bundle size tracked in CI with alerts on size increases
2. API response times monitored with alerts on budget violations
3. Database query performance logged and analyzed
4. History screen implements pagination (loads 20 items at a time)
5. Performance profiling tools integrated into dev workflow

**Why This Phase:**
Performance issues are easier to prevent than fix later. Should complete after major refactoring (Phase 6).

**Dependencies:** Can partially overlap with Phase 6, complete after refactoring

---

## Phase 8: Documentation & Configuration

**Goal:** Improve developer experience and operational documentation

**Priority:** P3 - Lower priority but valuable for team scaling

**Requirements:**
- DOC-01: Create API documentation (OpenAPI/Swagger)
- DOC-02: Create troubleshooting guide
- DOC-03: Add onboarding guide for new developers
- DOC-04: Document architecture decisions (ADRs)
- CONFIG-01: Centralize environment variable handling
- CONFIG-02: Document database migration strategy
- CONFIG-03: Configure database connection pooling explicitly
- CONFIG-04: Document backup strategy for HIPAA compliance
- SEC-04: Implement secrets scanning in CI/CD pipeline
- SEC-05: Add input sanitization for AI prompts

**Success Criteria:**
1. OpenAPI spec generated and accessible via /api/docs
2. Troubleshooting guide covers common production issues
3. New developer can onboard in <1 day using documentation
4. All major architectural decisions documented as ADRs
5. Environment variables centralized and documented

**Why This Phase:**
Documentation and configuration improvements have lower urgency but improve long-term maintainability.

**Dependencies:** Should complete after main technical work (Phases 1-7)

---

## Deferred to v2

The following 7 requirements are acknowledged but deferred to future iterations:

- **OBS-06**: Custom metrics for business logic
- **OBS-07**: Distributed tracing with spans
- **OBS-08**: APM beyond Sentry
- **PERF-06**: Code-splitting for large components
- **PERF-07**: Optimistic updates to all mutations
- **PERF-08**: Service worker for offline support
- **SEC-06**: Per-user rate limiting
- **SEC-07**: Frontend encryption library
- **SEC-08**: RBAC implementation

---

## Execution Strategy

**Parallel Workstreams:**
- Phases 2, 3, 4 can run simultaneously after Phase 1 completes
- Phase 5 depends on Phase 2 completion
- Phases 6, 7 can start after Phases 2-3-4 complete
- Phase 8 runs independently and can overlap with Phase 7

**Incremental Shipping:**
- Each phase ships independently to production
- No big-bang releases
- Monitor production after each phase before starting next

**Quality Gates:**
- All tests pass before deployment
- Code review required for all changes
- Production monitoring after each deployment

---

*Roadmap created: 2026-01-26*
*Last updated: 2026-01-26*
