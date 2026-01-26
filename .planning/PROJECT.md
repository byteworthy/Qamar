# Noor CBT - Technical Polish & Bug Fix Initiative

## What This Is

A comprehensive quality improvement initiative for the Noor CBT mobile app, systematically addressing all documented technical concerns (P0-P3) while maintaining production stability. This includes critical security fixes, test coverage improvements, code quality enhancements, and infrastructure hardening - all delivered incrementally without breaking existing functionality.

## Core Value

**Production stability with systematic quality improvements.** Every fix must maintain backward compatibility and ship incrementally. The app serves users with therapeutic needs - stability and reliability cannot be compromised.

## Requirements

### Validated

The existing Noor CBT application already provides:

- ✓ React Native/Expo mobile app with Express.js backend — existing
- ✓ Islamic-integrated CBT therapeutic workflows (analyze → reframe → regulate → intend) — existing
- ✓ Session-based authentication with signed cookies — existing
- ✓ AI-powered cognitive assistance via Anthropic Claude API — existing
- ✓ Multi-step therapeutic session management with state inference — existing
- ✓ PostgreSQL database with Drizzle ORM — existing
- ✓ React Query for remote state management — existing
- ✓ Basic CI/CD with GitHub Actions — existing
- ✓ Error tracking with Sentry — existing
- ✓ Data retention compliance (90-day auto-deletion) — existing

### Active

#### P0: Critical Security & Stability (Must Fix Immediately)

- [ ] **SEC-01**: Fix encryption fallback to throw error instead of returning plaintext (HIPAA violation risk)
- [ ] **TEST-01**: Add comprehensive server route tests (target 80%+ coverage for routes.ts - currently untested 1,351 lines)
- [ ] **INFRA-01**: Fix Stripe webhook domain handling (currently fragile with first-domain-only logic)

#### P1: High Priority (Fix Within Sprint)

- [ ] **CI-01**: Add E2E tests (Detox) to CI/CD pipeline
- [ ] **OBS-01**: Implement structured logging to replace console.log (83 instances in server code)
- [ ] **TYPE-01**: Fix type safety gaps (replace `any` types, resolve navigation typing)
- [ ] **SEC-02**: Audit and strengthen input validation across all API endpoints

#### P2: Medium Priority (Code Quality & Performance)

- [ ] **REFACTOR-01**: Split oversized screen components (ReframeScreen 1,020 lines, HomeScreen 869 lines, DistortionScreen 856 lines)
- [ ] **REFACTOR-02**: Modularize server routes.ts (1,351 lines → feature-based modules)
- [ ] **PERF-01**: Add performance monitoring and set response time budgets (<500ms for AI routes)
- [ ] **PERF-02**: Implement bundle size monitoring in CI
- [ ] **TEST-02**: Add integration tests for billing/Stripe webhooks

#### P3: Low Priority (Infrastructure & Documentation)

- [ ] **DOC-01**: Create API documentation (OpenAPI/Swagger specification)
- [ ] **INFRA-02**: Add security scanning to CI/CD (SAST, dependency scanning, secrets detection)
- [ ] **INFRA-03**: Improve configuration management (centralize environment variable handling)
- [ ] **DOC-02**: Create troubleshooting guide for common issues

### Out of Scope

- Major architectural rewrites — Existing structure is sound
- Rewriting working features — Focus on fixing issues, not reimplementing
- Changing core therapeutic workflows — These are validated and working
- Migrating frameworks or libraries — Stability over novelty
- Adding new features — This is a polish initiative, not feature development

## Context

**Production Environment:**
- Noor CBT is a live production app serving users with therapeutic needs
- Islamic epistemology is foundational to the therapeutic approach
- HIPAA compliance is critical for handling sensitive health data
- Users rely on app stability during vulnerable therapeutic moments

**Current State:**
- Well-structured monorepo with clear client/server/shared separation
- TypeScript throughout with mostly good type safety
- React Query for efficient remote state management
- Express middleware pipeline with session authentication
- Some technical debt documented in `.planning/codebase/CONCERNS.md`

**What We Know:**
- 11 test files currently (insufficient coverage)
- Large files need refactoring but structure is good
- Console.log used instead of structured logging (83 instances)
- Encryption has risky fallback behavior
- CI/CD exists but needs enhancement

## Constraints

- **Backward Compatibility**: Must maintain all existing functionality
- **Incremental Shipping**: Deploy fixes progressively, not big-bang release
- **Production Stability**: Cannot break the app for existing users
- **Structure Preservation**: Existing architecture is sound, make targeted improvements
- **HIPAA Compliance**: All changes must maintain or improve compliance posture
- **Small Changes**: Focus on polish, not major refactoring

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Parallel workstreams | Address multiple priority levels simultaneously for faster resolution | — Pending |
| Incremental deployment | Ship fixes as completed to minimize risk and get value sooner | — Pending |
| Target 70%+ test coverage | Balance between thorough testing and effort investment | — Pending |
| Preserve existing structure | Codebase is well-organized, don't rebuild what works | — Pending |
| Structured logging over console | Production observability requires proper log aggregation | — Pending |
| Security-first approach | Start with P0 critical security issues before optimizations | — Pending |

---
*Last updated: 2026-01-26 after initialization*
