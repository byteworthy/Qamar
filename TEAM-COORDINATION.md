# Noor App Merger - Team Coordination Plan

**Last Updated:** 2025-02-11
**Status:** ACTIVE

---

## Table of Contents

1. [Team Structure](#team-structure)
2. [Agent Responsibilities](#agent-responsibilities)
3. [Integration Points](#integration-points)
4. [Communication Protocols](#communication-protocols)
5. [Code Review Standards](#code-review-standards)
6. [Merge Conflict Prevention](#merge-conflict-prevention)
7. [Daily Standup Format](#daily-standup-format)
8. [Decision-Making Framework](#decision-making-framework)

---

## Team Structure

### Core Team (4 Specialized Agents + 1 Lead)

```
                    ┌──────────────────────┐
                    │  PARANOID LEAD       │
                    │  ARCHITECT           │
                    │  (You)               │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼─────────┐
         │  FRONTEND  │ │  BACKEND   │ │  DATABASE    │
         │  AGENT     │ │  AGENT     │ │  AGENT       │
         └──────┬─────┘ └─────┬──────┘ └────┬─────────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
                        ┌──────▼─────────┐
                        │  INTEGRATION   │
                        │  AGENT         │
                        └────────────────┘
```

---

## Agent Responsibilities

### 1. Frontend Agent

**Primary Focus:** React Native UI, Navigation, State Management

**Responsibilities:**
- Build all screens and components
- Implement navigation structure
- Configure TanStack Query hooks
- Implement Zustand UI state
- Create WatermelonDB models
- Write component tests (Jest + RTL)
- Ensure accessibility (WCAG 2.1 AA)
- Performance optimization (60 FPS)

**Key Files:**
- `client/screens/`
- `client/components/`
- `client/navigation/`
- `client/hooks/`
- `client/database/models/`

**Skills to Invoke:**
- `/frontend-design` - UI/UX review
- `/react-patterns` - Component patterns, hooks
- `/app-builder` - Mobile app best practices

**Daily Checklist:**
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] Component tests written
- [ ] Accessibility labels added
- [ ] Performance tested (no re-renders)

---

### 2. Backend Agent

**Primary Focus:** Express.js API, AI Integration, Business Logic

**Responsibilities:**
- Implement API endpoints
- Integrate Claude AI (Anthropic)
- Implement CBT orchestration logic
- Write server-side tests (Jest)
- Ensure API security (rate limiting, validation)
- Implement data encryption
- Monitor API performance

**Key Files:**
- `server/routes.ts`
- `server/conversational-ai.ts`
- `server/canonical-orchestrator.ts`
- `server/ai-safety.ts`
- `server/middleware/`

**Skills to Invoke:**
- `/api-patterns` - RESTful API design
- `/clean-code` - Service architecture
- `/security-review` - API security audit

**Daily Checklist:**
- [ ] API endpoints documented (OpenAPI)
- [ ] Input validation (Zod schemas)
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] API tests written (70%+ coverage)

---

### 3. Database Agent

**Primary Focus:** PostgreSQL Schema, WatermelonDB, Data Migration

**Responsibilities:**
- Design PostgreSQL schema
- Write Drizzle ORM migrations
- Design WatermelonDB schema
- Migrate Noor-AI data (3.4MB SQLite)
- Implement data retention policies
- Write database tests
- Optimize queries (<100ms target)

**Key Files:**
- `server/db/schema.ts`
- `server/db/migrations/`
- `client/database/schema.ts`
- `client/database/models/`
- `scripts/migrate-noor-ai-data.ts`

**Skills to Invoke:**
- `/database-design` - Schema review
- `/clean-code` - Query optimization

**Daily Checklist:**
- [ ] Migrations tested (up/down)
- [ ] Indexes created for performance
- [ ] Row-level security configured
- [ ] Data encryption verified
- [ ] Query performance tested

---

### 4. Integration Agent

**Primary Focus:** Sync, RevenueCat, Offline-First, Testing

**Responsibilities:**
- Implement sync service (offline → online)
- Integrate RevenueCat IAP
- Implement background tasks
- Write integration tests
- Write E2E tests (Detox)
- Monitor app stability (Sentry)

**Key Files:**
- `client/services/syncService.ts`
- `client/lib/billingProvider.ts`
- `client/services/backgroundTasks.ts`
- `e2e/*.e2e.ts`

**Skills to Invoke:**
- `/app-builder` - IAP integration
- `/devops-best-practices` - CI/CD, monitoring

**Daily Checklist:**
- [ ] Sync tested (offline → online)
- [ ] Purchase flow tested (sandbox)
- [ ] E2E tests written
- [ ] CI/CD pipeline green
- [ ] No Sentry errors

---

### Paranoid Lead Architect (You)

**Primary Focus:** Architecture Decisions, Code Review, Quality Gates

**Responsibilities:**
- Review all PRs before merge
- Make architecture decisions
- Enforce code quality standards
- Conduct weekly drift reviews
- Resolve conflicts between agents
- Communicate with stakeholders

**Skills to Invoke:**
- All skills (as needed for review)
- `/clean-code` - Architecture review
- `/security-review` - Security audit

**Daily Checklist:**
- [ ] Review all PRs
- [ ] Check quality gates pass
- [ ] Monitor team progress
- [ ] Resolve blockers
- [ ] Update stakeholders

---

## Integration Points

### Critical Integration Points (Where Agents Collaborate)

| Integration Point | Agents Involved | Coordination Required |
|------------------|-----------------|----------------------|
| **API Contracts** | Frontend + Backend | Agree on request/response schemas (Zod) |
| **Database Schema** | Backend + Database | Align PostgreSQL schema with API needs |
| **Offline Sync** | Frontend + Integration | Ensure WatermelonDB → PostgreSQL sync works |
| **RevenueCat IAP** | Frontend + Integration | Coordinate purchase flow + entitlement checks |
| **CBT + Quran** | Backend + Database | Map emotional states to Quran verses |
| **Performance** | Frontend + Integration | Ensure app launches <2s |
| **Testing** | All Agents | Write tests for their respective layers |

---

### Integration Workflow

**Example: Implement "Bookmark Verse" Feature**

1. **Frontend Agent:**
   - Creates `BookmarkButton` component
   - Adds bookmark icon to `VerseReaderScreen`
   - Implements `useBookmarkVerse` mutation hook

2. **Backend Agent:**
   - Creates `POST /api/sync/bookmarks` endpoint
   - Validates bookmark data (Zod schema)
   - Inserts bookmark into PostgreSQL

3. **Database Agent:**
   - Adds `bookmarks` table to PostgreSQL schema
   - Adds `bookmarks` collection to WatermelonDB schema
   - Writes migration script

4. **Integration Agent:**
   - Implements `syncBookmarks()` in `SyncService`
   - Tests offline → online sync
   - Handles conflict resolution (last-write-wins)

5. **Lead Architect:**
   - Reviews all PRs
   - Ensures alignment with architecture
   - Approves merge

---

## Communication Protocols

### Daily Standups (15 minutes)

**Format:**
- **When:** 9:00 AM daily
- **Where:** GitHub Discussions or Slack
- **Duration:** Max 15 minutes

**Each Agent Reports:**
1. What I completed yesterday
2. What I'm working on today
3. Any blockers

**Example:**
```markdown
## Frontend Agent - 2025-02-11

### Completed Yesterday
- [x] Implemented SurahListScreen
- [x] Added search/filter functionality
- [x] Wrote component tests

### Working On Today
- [ ] Implement VerseReaderScreen
- [ ] Add bookmark functionality
- [ ] Performance optimization

### Blockers
- Waiting for Backend Agent to create `/api/sync/bookmarks` endpoint
```

---

### Weekly Planning (1 hour)

**Format:**
- **When:** Monday 10:00 AM
- **Duration:** 1 hour

**Agenda:**
1. Review last week's accomplishments
2. Plan this week's tasks (assign to agents)
3. Identify dependencies between agents
4. Set quality gates for week

---

### Ad-Hoc Communication

**Slack Channels:**
- `#noor-general` - General discussion
- `#noor-frontend` - Frontend-specific
- `#noor-backend` - Backend-specific
- `#noor-database` - Database-specific
- `#noor-questions` - Quick questions
- `#noor-blockers` - Urgent blockers

**Response Time Expectations:**
- Urgent blockers: <1 hour
- Normal questions: <4 hours
- Code reviews: <24 hours

---

## Code Review Standards

### PR Template

**File:** `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description

[Describe what this PR does]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] Testing

## Checklist

- [ ] TypeScript strict mode passes (0 errors)
- [ ] ESLint passes (0 warnings)
- [ ] Tests written (70%+ coverage)
- [ ] Accessibility labels added
- [ ] Performance tested (no memory leaks)
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code

## Screenshots (if UI change)

[Add screenshots]

## Testing

How to test:
1. Step 1
2. Step 2
3. Expected result

## Related Issues

Closes #123
```

---

### Code Review Process

1. **Agent Opens PR** → Assigns Lead Architect as reviewer
2. **Lead Architect Reviews** → Within 24 hours
3. **Feedback Provided** → Agent addresses comments
4. **Re-Review** → Lead approves or requests more changes
5. **Merge** → Lead merges PR (squash and merge)

**Review Checklist (for Reviewer):**
- [ ] Code follows architecture (no drift)
- [ ] TypeScript types are correct (no `any`)
- [ ] Tests are comprehensive
- [ ] Performance is acceptable
- [ ] Security is not compromised
- [ ] Code is simple (not over-engineered)

---

### Review Comments Format

**Use Conventional Comments:**

```markdown
# Suggestion (Non-Blocking)
**suggestion:** Consider using `useMemo` here to avoid re-renders

# Issue (Blocking)
**issue:** This creates a memory leak. Must be fixed before merge.

# Question
**question:** Why did you choose this approach over X?

# Nitpick (Non-Blocking)
**nitpick:** Consider renaming `data` to `verses` for clarity

# Praise
**praise:** Love how you handled this edge case!
```

---

## Merge Conflict Prevention

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code (protected, requires PR)
- `develop` - Integration branch (all features merge here first)

**Feature Branches:**
- `feature/frontend-quran-reader` - Frontend Agent
- `feature/backend-prayer-api` - Backend Agent
- `feature/db-watermelondb-migration` - Database Agent
- `feature/integration-sync-service` - Integration Agent

**Branch Naming Convention:**
```
feature/<agent>-<feature-name>
bugfix/<agent>-<bug-description>
refactor/<agent>-<refactor-description>
```

---

### Merge Workflow

```
┌────────────────────────────────────────────────────────────┐
│  1. Agent creates feature branch from `develop`            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│  2. Agent commits code, pushes to GitHub                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│  3. Agent opens PR to `develop`                            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│  4. CI/CD runs (tests, lint, typecheck)                    │
└────────────────┬───────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
      Pass            Fail
         │               │
         ▼               ▼
┌─────────────┐   ┌──────────────┐
│ 5. Lead     │   │ 5. Agent     │
│ reviews PR  │   │ fixes issues │
└─────┬───────┘   └──────┬───────┘
      │                  │
      │                  └─────────┐
      ▼                            │
┌─────────────┐                    │
│ 6. Approved │                    │
└─────┬───────┘                    │
      │                            │
      ▼                            │
┌─────────────┐                    │
│ 7. Merge to │◄───────────────────┘
│ `develop`   │
└─────────────┘
```

---

### Conflict Prevention Strategies

1. **Small PRs** - Max 500 lines changed per PR
2. **Frequent Merges** - Merge to `develop` at least 2x/week
3. **Communicate Dependencies** - Alert other agents if you're changing shared files
4. **Rebase Before PR** - Always rebase on latest `develop` before opening PR
5. **Code Ownership** - Each agent owns specific folders (avoid overlap)

**Code Ownership Matrix:**

| Folder | Owner | Others Can Edit? |
|--------|-------|------------------|
| `client/screens/` | Frontend Agent | No |
| `client/components/` | Frontend Agent | No |
| `client/navigation/` | Frontend Agent | No |
| `client/services/` | Integration Agent | Yes (with coordination) |
| `client/database/` | Database Agent | No |
| `server/routes.ts` | Backend Agent | No |
| `server/db/` | Database Agent | No |
| `server/middleware/` | Backend Agent | Yes (with coordination) |

---

## Decision-Making Framework

### Decision Hierarchy

```
┌──────────────────────────────────────────────────────────┐
│  Level 1: Autonomous Decisions (Agent decides)           │
│  - Code implementation details                           │
│  - Variable naming                                       │
│  - Component structure                                   │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Level 2: Team Decisions (Discuss with Lead)             │
│  - New dependencies                                      │
│  - API contract changes                                  │
│  - Database schema changes                               │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Level 3: Architecture Decisions (Lead decides)          │
│  - Tech stack changes                                    │
│  - Navigation structure changes                          │
│  - Security architecture changes                         │
└──────────────────────────────────────────────────────────┘
```

---

### Decision Documentation

**File:** `docs/decisions/ADR-001-use-watermelondb.md`

```markdown
# ADR-001: Use WatermelonDB for Offline Database

## Status
ACCEPTED

## Context
We need an offline-first database for Quran verses (6,236 rows), Arabic letters, and flashcards.

## Decision
Use WatermelonDB with SQLite backend.

## Rationale
- Optimized for React Native
- Small bundle size (50KB vs Realm 2MB)
- Excellent TypeScript support
- Built-in encryption (SQLCipher)

## Consequences
- Positive: Better performance than Realm for our use case
- Negative: Smaller community than Realm
- Mitigation: We have expertise with SQLite

## Date
2025-02-11
```

---

## Conclusion

This coordination plan ensures:

1. ✅ **Clear responsibilities** - Each agent owns specific areas
2. ✅ **Integration points** - Well-defined collaboration points
3. ✅ **Communication protocols** - Daily standups, weekly planning
4. ✅ **Code review standards** - Consistent PR process
5. ✅ **Merge conflict prevention** - Branch strategy, code ownership
6. ✅ **Decision-making framework** - Hierarchical decision-making

**Next Steps:**
1. Assign agents to Phase 1 tasks
2. Schedule first daily standup
3. Create GitHub repository with branch protection
4. Set up Slack channels

---

**Prepared by:** Paranoid Lead Architect
**Status:** ACTIVE
**Document Version:** 1.0
**Last Updated:** 2025-02-11
