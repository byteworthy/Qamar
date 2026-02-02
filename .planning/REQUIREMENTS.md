# Requirements: Noor App Technical Polish

**Defined:** 2026-01-26
**Core Value:** Production stability with systematic quality improvements

## v1 Requirements

Requirements for technical polish initiative. Mapped to roadmap phases.

### Security

- [x] **SEC-01**: Fix encryption fallback to throw error instead of returning plaintext
- [x] **SEC-02**: Replace custom CORS logic with established `cors` npm package
- [ ] **SEC-03**: Audit all API endpoints for input validation coverage
- [ ] **SEC-04**: Implement secrets scanning in CI/CD pipeline
- [ ] **SEC-05**: Add input sanitization for AI prompts (prompt injection prevention)

### Testing

- [ ] **TEST-01**: Add unit tests for server/routes.ts (target 80%+ coverage of 1,351 lines)
- [ ] **TEST-02**: Add tests for conversational-ai.ts (653 lines)
- [ ] **TEST-03**: Add tests for tone-compliance-checker.ts (589 lines)
- [x] **TEST-04**: Add tests for pacing-controller.ts (551 lines)
- [x] **TEST-05**: Add tests for canonical-orchestrator.ts (509 lines)
- [x] **TEST-06**: Add tests for toneClassifier.ts
- [x] **TEST-07**: Add tests for stateInference.ts (348 lines)
- [ ] **TEST-08**: Add integration tests for billing/Stripe webhooks
- [ ] **TEST-09**: Configure Detox E2E tests in CI/CD pipeline
- [ ] **TEST-10**: Achieve >70% overall test coverage

### Code Quality

- [ ] **REFACTOR-01**: Split ReframeScreen.tsx (1,020 lines) into smaller components
- [ ] **REFACTOR-02**: Split HomeScreen.tsx (869 lines) into smaller components
- [ ] **REFACTOR-03**: Split DistortionScreen.tsx (856 lines) into smaller components
- [ ] **REFACTOR-04**: Split HistoryScreen.tsx (791 lines) into smaller components
- [ ] **REFACTOR-05**: Modularize server/routes.ts (1,351 lines) into feature-based modules
- [ ] **REFACTOR-06**: Split islamic-content-mapper.ts (910 lines) into logical groupings
- [ ] **REFACTOR-07**: Split constants/theme.ts (637 lines) into separate files

### Type Safety

- [ ] **TYPE-01**: Replace `any` types with proper types in GradientBackground.tsx
- [ ] **TYPE-02**: Replace `any` types with proper types in LoadingSkeleton.tsx
- [ ] **TYPE-03**: Replace `any` types with proper types in ReflectionProgress.tsx
- [ ] **TYPE-04**: Replace `any` types with proper types in SessionCompleteScreen.tsx
- [ ] **TYPE-05**: Fix navigation type errors (@ts-expect-error in ScreenErrorBoundary.tsx)
- [ ] **TYPE-06**: Create proper TypeScript interfaces for all API responses
- [ ] **TYPE-07**: Use `unknown` instead of `any` in test files where appropriate

### Observability

- [ ] **OBS-01**: Replace all console.log with structured logging (83 instances in server)
- [ ] **OBS-02**: Implement logging service (Winston, Pino, or similar)
- [ ] **OBS-03**: Remove sensitive data from logs (user messages, thoughts)
- [ ] **OBS-04**: Add contextual information (requestId, userId, timestamp) to all errors
- [ ] **OBS-05**: Standardize error response format across API

### Infrastructure

- [x] **INFRA-01**: Fix Stripe webhook domain handling (brittle first-domain logic)
- [ ] **INFRA-02**: Add automated E2E tests to PR checks
- [ ] **INFRA-03**: Implement automated deployment to staging on PR
- [ ] **INFRA-04**: Add security scanning (SAST) to CI/CD
- [ ] **INFRA-05**: Enable Dependabot for automated dependency updates
- [ ] **INFRA-06**: Set coverage thresholds (70% for changed files)
- [ ] **INFRA-07**: Cache node_modules and build artifacts across workflows

### Performance

- [ ] **PERF-01**: Implement bundle size monitoring in CI
- [ ] **PERF-02**: Set API response time budgets (<500ms for AI routes)
- [ ] **PERF-03**: Add query performance monitoring for database operations
- [ ] **PERF-04**: Implement pagination for history screens
- [ ] **PERF-05**: Add performance profiling to development workflow

### Documentation

- [ ] **DOC-01**: Create API documentation (OpenAPI/Swagger specification)
- [ ] **DOC-02**: Create troubleshooting guide for common issues
- [ ] **DOC-03**: Add onboarding guide for new developers
- [ ] **DOC-04**: Document architecture decisions (ADRs)

### Configuration

- [ ] **CONFIG-01**: Centralize environment variable handling
- [ ] **CONFIG-02**: Document database migration strategy
- [ ] **CONFIG-03**: Configure database connection pooling explicitly
- [ ] **CONFIG-04**: Document backup strategy for HIPAA compliance

## v2 Requirements

Deferred improvements for future iterations.

### Advanced Observability

- **OBS-06**: Implement custom metrics for business logic (reflection completion rate)
- **OBS-07**: Add distributed tracing with spans
- **OBS-08**: Implement APM (Application Performance Monitoring) beyond Sentry

### Advanced Performance

- **PERF-06**: Implement code-splitting for large screen components
- **PERF-07**: Add optimistic updates to all mutations
- **PERF-08**: Implement service worker for offline support

### Advanced Security

- **SEC-06**: Implement rate limiting per user (not just global)
- **SEC-07**: Add frontend encryption library
- **SEC-08**: Implement RBAC (Role-Based Access Control)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Major architectural rewrites | Existing structure is sound, focus on targeted fixes |
| Rewriting working features | Polish existing code, don't rebuild |
| Changing core workflows | These are validated and working |
| Framework migrations | Stability over novelty |
| New feature development | This is a quality initiative, not feature work |

## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Complete |
| SEC-02 | Phase 1 | Complete |
| INFRA-01 | Phase 1 | Complete |
| TEST-01 | Phase 2 | Pending |
| TEST-02 | Phase 2 | Pending |
| TEST-03 | Phase 2 | Pending |
| TEST-04 | Phase 2 | Complete |
| TEST-05 | Phase 2 | Complete |
| TEST-06 | Phase 2 | Complete |
| TEST-07 | Phase 2 | Complete |
| TEST-08 | Phase 2 | Pending |
| TYPE-01 | Phase 3 | Pending |
| TYPE-02 | Phase 3 | Pending |
| TYPE-03 | Phase 3 | Pending |
| TYPE-04 | Phase 3 | Pending |
| TYPE-05 | Phase 3 | Pending |
| TYPE-06 | Phase 3 | Pending |
| TYPE-07 | Phase 3 | Pending |
| OBS-01 | Phase 4 | Pending |
| OBS-02 | Phase 4 | Pending |
| OBS-03 | Phase 4 | Pending |
| OBS-04 | Phase 4 | Pending |
| OBS-05 | Phase 4 | Pending |
| TEST-09 | Phase 5 | Pending |
| INFRA-02 | Phase 5 | Pending |
| INFRA-03 | Phase 5 | Pending |
| INFRA-04 | Phase 5 | Pending |
| INFRA-05 | Phase 5 | Pending |
| INFRA-06 | Phase 5 | Pending |
| INFRA-07 | Phase 5 | Pending |
| REFACTOR-01 | Phase 6 | Pending |
| REFACTOR-02 | Phase 6 | Pending |
| REFACTOR-03 | Phase 6 | Pending |
| REFACTOR-04 | Phase 6 | Pending |
| REFACTOR-05 | Phase 6 | Pending |
| REFACTOR-06 | Phase 6 | Pending |
| REFACTOR-07 | Phase 6 | Pending |
| PERF-01 | Phase 7 | Pending |
| PERF-02 | Phase 7 | Pending |
| PERF-03 | Phase 7 | Pending |
| PERF-04 | Phase 7 | Pending |
| PERF-05 | Phase 7 | Pending |
| TEST-10 | Phase 7 | Pending |
| SEC-03 | Phase 7 | Pending |
| DOC-01 | Phase 8 | Pending |
| DOC-02 | Phase 8 | Pending |
| DOC-03 | Phase 8 | Pending |
| DOC-04 | Phase 8 | Pending |
| CONFIG-01 | Phase 8 | Pending |
| CONFIG-02 | Phase 8 | Pending |
| CONFIG-03 | Phase 8 | Pending |
| CONFIG-04 | Phase 8 | Pending |
| SEC-04 | Phase 8 | Pending |
| SEC-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 50
- Unmapped (deferred to v2): 7 ✓

---
*Requirements defined: 2026-01-26*
*Last updated: 2026-01-26 after initial definition*
