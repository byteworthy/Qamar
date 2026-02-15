# Noor App Merger - Project Overview

**Project:** Merge Noor-AI (Flutter) + Noor-CBT (React Native) → Unified Islamic Companion App
**Status:** READY TO BEGIN
**Last Updated:** 2025-02-11

---

## Executive Summary

The PARANOID LEAD ENGINEER team has completed the comprehensive planning phase for the Noor app merger project. This document serves as the master index for all project documentation.

### What We're Building

A **unified Islamic companion super-app** that combines:
- ✅ **Therapeutic CBT workflows** (from Noor-CBT)
- ✅ **Quran Reader** with 6,236 verses (from Noor-AI)
- ✅ **Prayer Times & Qibla** (from Noor-AI)
- ✅ **Arabic Learning** with FSRS spaced repetition (from Noor-AI)
- ✅ **Adhkar Collections** (from Noor-AI)
- ✅ **Progress Tracking** (streaks, achievements)
- ✅ **Premium Features** (RevenueCat IAP)

### Strategic Decision

**Use Noor-CBT (React Native) as the foundation**, import all Noor-AI features.

**Rationale:**
- Noor-CBT has production-ready backend (Express.js + PostgreSQL)
- Existing authentication, billing, and security infrastructure
- Mature Claude AI integration
- Avoid complete backend rewrite

---

## Documentation Index

### Core Planning Documents

| Document | Location | Purpose | Status |
|----------|----------|---------|--------|
| **PRD (Product Requirements Document)** | `NOOR-MERGE-PRD.md` | Feature specs, technical architecture, API contracts, database schema | ✅ Complete |
| **Technical Architecture** | `ARCHITECTURE.md` | System diagrams, navigation, state management, offline-first, AI integration | ✅ Complete |
| **Implementation Plan** | `IMPLEMENTATION-PLAN.md` | 16-week timeline, skill injections, quality gates, drift detection | ✅ Complete |
| **Team Coordination Plan** | `TEAM-COORDINATION.md` | Agent responsibilities, integration points, code review standards | ✅ Complete |

---

## Key Metrics & Targets

### Technical Metrics

| Metric | Target | Current (Noor-CBT) | Current (Noor-AI) |
|--------|--------|-------------------|------------------|
| **App Launch Time** | <2s | ~2.5s | ~1.5s |
| **Bundle Size (iOS)** | <50MB | 35MB | N/A (Flutter) |
| **Test Coverage** | 80% | 60% | 40% |
| **Crash-Free Rate** | 99.5% | 98% | N/A |
| **API P95 Latency** | <500ms | 600ms | N/A |
| **Database Size** | 3.4MB (offline) | 0MB | 3.4MB |

### Product Metrics

| Metric | Target (6 months) |
|--------|------------------|
| **Daily Active Users (DAU)** | 10,000 |
| **Retention Rate (D7)** | 40% |
| **Retention Rate (D30)** | 25% |
| **Premium Conversion** | 5% |
| **App Store Rating** | 4.5+ stars |

---

## Implementation Timeline (16 Weeks)

### Phase 1: Foundation Setup (Weeks 1-2)
**Goals:**
- Set up React Native + Expo project
- Configure CI/CD pipeline
- Implement authentication
- Initialize databases (PostgreSQL + WatermelonDB)

**Exit Criteria:**
- ✅ TypeScript strict mode passes
- ✅ CI/CD pipeline green
- ✅ App runs on iOS + Android

---

### Phase 2: Core Features Migration (Weeks 3-6)
**Goals:**
- Migrate Quran reader (6,236 verses)
- Implement prayer times calculation
- Build Arabic learning system (FSRS flashcards)
- Port Adhkar collections
- Preserve existing CBT workflows

**Exit Criteria:**
- ✅ All Noor-AI features ported
- ✅ Offline database working
- ✅ Test coverage >70%

---

### Phase 3: Integration & Premium (Weeks 7-10)
**Goals:**
- Integrate Islamic content into CBT flows
- Implement progress tracking (streaks, achievements)
- Build premium features (RevenueCat integration)
- Implement offline sync strategy

**Exit Criteria:**
- ✅ Progress tracking working
- ✅ RevenueCat integration tested
- ✅ No data loss on sync

---

### Phase 4: Polish & Optimization (Weeks 11-14)
**Goals:**
- UI/UX refinement (design system, animations)
- Performance optimization (<2s launch time)
- Accessibility improvements (WCAG 2.1 AA)
- Bug fixes from beta testing

**Exit Criteria:**
- ✅ WCAG 2.1 AA compliant
- ✅ App launches <2s
- ✅ 60 FPS scrolling

---

### Phase 5: Launch Preparation (Weeks 15-16)
**Goals:**
- App Store submission (iOS + Android)
- Beta launch (TestFlight, Google Play Internal Testing)
- Monitoring dashboards (Sentry, PostHog)
- Support documentation

**Exit Criteria:**
- ✅ App approved by App Store
- ✅ Beta launched
- ✅ Crash-free rate >99%

---

## Technology Stack

### Frontend (Client)
- **Framework:** React Native 0.81.5 + Expo 54
- **Navigation:** React Navigation 7.x
- **State Management:** TanStack Query 5.x (server state) + Zustand (UI state)
- **Offline Database:** WatermelonDB (SQLite, 3.4MB)
- **Styling:** StyleSheet + custom theme system
- **Testing:** Jest + React Testing Library + Detox (E2E)

### Backend (Server)
- **Framework:** Express.js + Node.js
- **Database:** PostgreSQL + Drizzle ORM
- **AI:** Anthropic Claude API
- **Authentication:** Session cookies (signed)
- **Billing:** RevenueCat (iOS/Android IAP)
- **Error Tracking:** Sentry

### DevOps
- **CI/CD:** GitHub Actions
- **Build:** EAS Build (Expo Application Services)
- **Monitoring:** Sentry + PostHog (analytics)
- **Hosting:** Railway.app (backend)

---

## Team Structure (4 Agents + 1 Lead)

```
PARANOID LEAD ARCHITECT (You)
├── Frontend Agent (React Native UI, Navigation, State Management)
├── Backend Agent (Express.js API, AI Integration, Business Logic)
├── Database Agent (PostgreSQL, WatermelonDB, Data Migration)
└── Integration Agent (Sync, RevenueCat, Offline-First, Testing)
```

### Agent Responsibilities

| Agent | Primary Focus | Key Files |
|-------|--------------|-----------|
| **Frontend Agent** | Screens, components, navigation | `client/screens/`, `client/components/` |
| **Backend Agent** | API endpoints, Claude AI integration | `server/routes.ts`, `server/conversational-ai.ts` |
| **Database Agent** | PostgreSQL schema, WatermelonDB migration | `server/db/schema.ts`, `client/database/schema.ts` |
| **Integration Agent** | Sync service, RevenueCat, E2E tests | `client/services/syncService.ts`, `e2e/` |

---

## Skill Injection Strategy

### Skills to Invoke Throughout Project

| Skill | Purpose | Usage Frequency |
|-------|---------|----------------|
| `/clean-code` | Validate architecture, service patterns | Weekly |
| `/frontend-design` | Review UI/UX, accessibility | Every UI PR |
| `/react-patterns` | Review hooks, performance optimizations | Daily |
| `/database-design` | Review schema, query optimization | Every schema change |
| `/api-patterns` | Review RESTful API design | Every new endpoint |
| `/security-review` | Audit authentication, data encryption | Weekly |
| `/app-builder` | Review mobile app best practices | Phase milestones |
| `/devops-best-practices` | Review CI/CD, monitoring | Weekly |

---

## Quality Gates

### Pre-Commit (Husky Hooks)
- TypeScript strict mode passes (0 errors)
- ESLint passes (0 warnings)
- Related tests pass

### PR Review Checklist
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] Test coverage >70%
- [ ] Accessibility labels added
- [ ] Performance tested
- [ ] No console.log statements

### CI/CD Pipeline
- Type checking
- Linting
- Unit tests (70%+ coverage)
- Integration tests
- Build verification

---

## Risk Mitigation

### High-Risk Areas

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Database migration fails** | Medium | High | Incremental migration, rollback plan, extensive testing |
| **Performance degradation** | Medium | High | Performance budgets, monitoring, lazy loading |
| **User adoption lower than expected** | Medium | High | Early beta testing, user interviews, marketing |
| **Data breach** | Low | Critical | Encryption at rest/transit, security audit, pen testing |

---

## Next Steps (Week 1 - Day 1)

### Immediate Actions

1. **Set Up Project Tracking**
   - Create GitHub repository
   - Set up GitHub Projects board
   - Create milestones (Phase 1-5)
   - Create issues for Week 1 tasks

2. **Assign Agents**
   - Frontend Agent → Project setup, navigation skeleton
   - Backend Agent → Review existing Noor-CBT backend
   - Database Agent → Design WatermelonDB schema
   - Integration Agent → Set up CI/CD pipeline

3. **Initialize Project**
   ```bash
   # Create new Expo project
   npx create-expo-app@latest noor-unified --template expo-template-blank-typescript

   # Install core dependencies
   cd noor-unified
   npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
   npm install @tanstack/react-query zustand @nozbe/watermelondb
   npm install expo-local-authentication expo-notifications

   # Set up CI/CD
   mkdir -p .github/workflows
   # Copy test.yml from planning docs
   ```

4. **First Daily Standup**
   - Schedule: Tomorrow 9:00 AM
   - Each agent reports on Day 1 progress
   - Identify any blockers

---

## Success Criteria for Project

### Technical Success
- ✅ All Noor-AI features ported to React Native
- ✅ Zero breaking changes for existing Noor-CBT users
- ✅ App launches in <2s on budget devices
- ✅ 80%+ test coverage
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Crash-free rate >99%

### Product Success
- ✅ 10,000 DAU within 6 months
- ✅ 40% D7 retention rate
- ✅ 5% premium conversion rate
- ✅ 4.5+ stars on App Store

### Team Success
- ✅ All agents collaborate smoothly
- ✅ Zero merge conflicts
- ✅ Weekly drift reviews conducted
- ✅ All quality gates pass

---

## Contact Information

**Project Lead:** Paranoid Lead Architect
**Email:** [Your Email]
**Slack:** #noor-general
**GitHub:** [Repository URL]

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-02-11 | Initial creation | Paranoid Lead Architect |

---

## Appendix: Key Decisions

### ADR-001: Use React Native (not Flutter)
**Decision:** Use Noor-CBT (React Native) as foundation
**Rationale:** Preserve existing production backend, avoid complete rewrite
**Status:** ACCEPTED

### ADR-002: Use WatermelonDB (not Realm)
**Decision:** Use WatermelonDB for offline database
**Rationale:** Smaller bundle size (50KB vs 2MB), better React integration
**Status:** ACCEPTED

### ADR-003: Use TanStack Query + Zustand (not Redux)
**Decision:** Hybrid state management (TanStack Query for server state, Zustand for UI state)
**Rationale:** Better DX, simpler API, smaller bundle size
**Status:** ACCEPTED

### ADR-004: Offline-First Architecture
**Decision:** Core Islamic features (Quran, Prayer, Arabic) work 100% offline
**Rationale:** Target users in low-connectivity environments (mosques, travel, rural areas)
**Status:** ACCEPTED

---

**END OF PROJECT OVERVIEW**

---

**Prepared by:** Paranoid Lead Engineer & Architect Team
**Review Status:** APPROVED
**Document Version:** 1.0
**Last Updated:** 2025-02-11
