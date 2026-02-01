# Phase 2: Server Test Coverage - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Add comprehensive unit and integration tests for untested server logic: API routes (routes.ts), AI orchestration modules (conversational-ai.ts, tone-compliance-checker.ts, pacing-controller.ts, canonical-orchestrator.ts, toneClassifier.ts, stateInference.ts), and billing/Stripe webhook integration.

Target: >70% overall server test coverage with all critical paths tested.

</domain>

<decisions>
## Implementation Decisions

### Test Priority (All Critical - Comprehensive Coverage)

User selected ALL modules for priority testing:
- **Billing/Stripe webhooks** - Money and subscriptions, business critical
- **AI orchestration** - conversational-ai, tone-checker, pacing-controller, canonical-orchestrator - Core product functionality
- **API routes** (routes.ts) - Entry points for all features, high traffic
- **Encryption/security** - HIPAA compliance, critical for trust

All modules get comprehensive coverage (not just happy paths).

### Claude's Discretion

The user has given Claude full discretion on the following areas:

#### Test Organization & Structure
- File location (co-located vs separate test directory)
- Test grouping strategy (by functionality, concern, or user journey)
- Test naming convention (should/action/given-when-then style)
- Follow existing patterns in codebase or industry best practices

#### Mocking Philosophy
- External API handling (mock vs test mode vs hybrid)
- Database mocking strategy (mocked queries vs in-memory vs test container)
- AI response realism (minimal vs realistic vs record/replay)
- Balance speed, isolation, and integration confidence

#### Test Data & Fixtures
- Data creation approach (factories, fixtures, or inline)
- Data realism level (minimal placeholder vs realistic vs synthetic)
- Sensitive/HIPAA content handling in test data
- Follow HIPAA best practices for test data

#### Coverage Thresholds & Strategy
- Overall coverage target (70-80% range specified in roadmap)
- Per-module threshold determination
- Coverage depth (happy path vs comprehensive)
- Risk-based depth matching (comprehensive for critical, pragmatic for utilities)

</decisions>

<specifics>
## Specific Ideas

**From Roadmap:**
- Target >70% overall server coverage
- Target 80%+ coverage for routes.ts specifically
- All API endpoints in routes.ts must have unit tests
- AI orchestration logic needs both happy path and error case coverage
- Billing integration tests must verify webhook handling
- CI pipeline must run all tests successfully on every PR

**Testing Philosophy:**
- Tests establish safety net for future refactoring (Phases 6, 7)
- Cannot safely modify server code without test coverage
- Phase 2 must complete before infrastructure/refactoring phases

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

All testing implementation details are left to Claude's discretion based on:
- Existing patterns in the codebase
- Testing best practices for Node.js/Express/Jest
- HIPAA compliance requirements for test data
- Balance between coverage depth and development velocity

</deferred>

---

*Phase: 02-server-test-coverage*
*Context gathered: 2026-02-01*
