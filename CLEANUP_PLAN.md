# Noor Documentation Cleanup Plan

**Date:** January 31, 2026
**Purpose:** Clean up stale, redundant, and outdated documentation

---

## Current State

**Total .md files:** 260+ files
**Issues:**
- Duplicate documentation
- Outdated guides (Railway fixes, migration guides)
- Completed work logs (should be archived)
- Stale checklists and action plans
- Unnecessary plugin docs (awesome-slash)
- Anthropic cookbook (not needed in repo)

---

## Cleanup Strategy

### 1. KEEP (Essential Documentation)

#### Root Level
- ✅ README.md (main project readme - UPDATE)
- ✅ CHANGELOG.md (version history)
- ✅ SECURITY.md (App Store requirement)
- ✅ PRIVACY_POLICY.md (App Store requirement)
- ✅ OVERNIGHT_SECURITY_SUMMARY.md (recent work)
- ✅ PROJECT_OVERVIEW.md (high-level overview)

#### /docs (Current Useful Docs)
- ✅ docs/TESTING_GUIDE.md
- ✅ docs/DEPLOYMENT_CHECKLIST.md
- ✅ docs/MONITORING_PLAN.md
- ✅ docs/PROJECT_ROADMAP.md

#### /legal (Legal Requirements)
- ✅ legal/PRIVACY_POLICY.md
- ✅ legal/TERMS_OF_SERVICE.md

#### /release (App Store Submission)
- ✅ release/STORE_PACK/* (all files)

#### E2E Testing
- ✅ e2e/README.md
- ✅ e2e/QUICK_START.md
- ✅ e2e/TESTID_GUIDE.md

#### Planning (Current)
- ✅ .planning/PROJECT.md
- ✅ .planning/ROADMAP.md
- ✅ .planning/REQUIREMENTS.md
- ✅ .planning/STATE.md

### 2. ARCHIVE (Historical Documentation)

Create `/docs/archive/` and move:

#### Completed Work
- docs/COMPLETED_WORK/* (entire directory)
- APP_STORE_FIXES.md
- APPLE_COMPLIANCE_AUDIT*.md
- FIXES_COMPLETED.md
- POLISH_COMPLETE.md
- COMPLIANCE_AUDIT_COMPLETED.md
- DARK_MODE_AUDIT.md
- TECHNICAL_AUDIT.md
- ACCESSIBILITY_PROGRESS.md

#### Old Migration/Setup Guides
- RAILWAY_*.md (all Railway troubleshooting)
- MIGRATION_OPENAI_TO_CLAUDE.md
- MANUAL_MIGRATION_STEPS.md
- INSTALLATION_STATUS.md
- AWESOME_SLASH_*.md

#### Completed Action Plans
- BETA_LAUNCH_ACTION_PLAN.md
- LAUNCH_NEXT_STEPS.md
- LAUNCH_READINESS.md
- LAUNCH_READY_SUMMARY.md
- EXECUTE_THIS_NOW.md
- NEXT_STEPS.md

#### Old Test Reports
- test-reports/app-store-readiness-test-report.md
- test-reports/mobile-test-summary.md

#### Stale Checklists
- HUMAN_TASKS_CHECKLIST.md
- UX_POLISH_CHECKLIST.md
- LOCAL_VALIDATION_RUNBOOK.md
- VALIDATION_DISTRIBUTION_RUNBOOK.md

#### Old Documentation from docs/
- docs/audits/2026-01-25-comprehensive-audit.md
- docs/SECURITY_AUDIT_REPORT.md (superseded by root SECURITY.md)
- docs/TEST_BASELINE_REPORT.md

### 3. DELETE (Unnecessary/Duplicate)

#### Plugin/External Repos (Not Core to Noor)
- .claude/awesome-slash/* (entire directory - not needed)
- anthropic-cookbook/* (entire directory - not needed)

#### Duplicates
- legal/PRIVACY_POLICY_DRAFT.md (have final version)
- legal/TERMS_OF_SERVICE_DRAFT.md (have final version)
- legal/DISCLAIMERS_DRAFT.md (not used)

#### Outdated Templates
- BUG_REPORT_TEMPLATE.md (use GitHub templates instead)
- CHANGES_SUMMARY.md (old change log)

#### Scholar Validation (One File is Enough)
- SCHOLAR_VALIDATION_REQUEST.md (keep SCHOLAR_VALIDATION_CHECKLIST.md only)
- SCHOLAR_REVIEW_WORKFLOW.md (redundant)

#### Marketing Old Docs
- marketing/SEO_IMPLEMENTATION_SUMMARY.md (completed)

### 4. REORGANIZE

Create proper structure:

```
Noor-CBT/
├── README.md (UPDATED)
├── CHANGELOG.md
├── SECURITY.md
├── PRIVACY_POLICY.md
├── OVERNIGHT_SECURITY_SUMMARY.md
├── PROJECT_OVERVIEW.md
├── QUICK_START.md (UPDATED)
│
├── docs/
│   ├── README.md (index of all docs)
│   ├── development/
│   │   ├── TESTING_GUIDE.md
│   │   ├── TESTING_QUICK_START.md
│   │   └── AI_ISLAMIC_SAFETY_CHARTER.md
│   ├── deployment/
│   │   ├── DEPLOYMENT_CHECKLIST.md
│   │   ├── DEPLOY_RUNBOOK.md
│   │   ├── PRODUCTION_ENV_CONFIG.md
│   │   └── MONITORING_PLAN.md
│   ├── mobile/
│   │   ├── MOBILE_TESTING_PLAN.md
│   │   ├── SMOKE_TESTS_MOBILE.md
│   │   └── RELEASE_MOBILE.md
│   ├── store-submission/
│   │   ├── APP_STORE_NETWORKING_NOTES.md
│   │   ├── STORE_COMPLIANCE_AUDIT.md
│   │   └── SUBMISSION_LANDMINES_CLEARED.md
│   └── archive/ (all old/completed docs)
│
├── legal/
│   ├── PRIVACY_POLICY.md
│   └── TERMS_OF_SERVICE.md
│
├── release/
│   └── STORE_PACK/ (all App Store assets)
│
├── e2e/
│   ├── README.md
│   ├── QUICK_START.md
│   └── TESTID_GUIDE.md
│
├── marketing/
│   ├── comparison-pages/
│   └── competitor-research/
│
└── scripts/
    └── verify-mobile-security.sh
```

---

## Implementation Steps

1. Create `/docs/archive/` directory
2. Move completed/stale docs to archive
3. Delete unnecessary directories (awesome-slash, anthropic-cookbook)
4. Reorganize remaining docs into categories
5. Update README.md with current status
6. Update QUICK_START.md with latest setup
7. Create docs/README.md as index

---

## Updated README.md Outline

```markdown
# Noor

Islamic CBT mobile app for structured reflection practice.

## Quick Start
- Installation
- Development setup
- Running tests

## Project Status
- ✅ Core features complete
- ✅ Security hardened (mobile-grade)
- ✅ 277 tests passing
- ⏳ App Store submission pending

## Key Documentation
- [Testing Guide](docs/development/TESTING_GUIDE.md)
- [Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [Security Policy](SECURITY.md)
- [Privacy Policy](PRIVACY_POLICY.md)

## Tech Stack
- React Native + Expo
- Express.js + PostgreSQL
- Anthropic Claude API
- Sentry monitoring

## Architecture
- [Project Overview](PROJECT_OVERVIEW.md)
- [Testing Guide](docs/development/TESTING_GUIDE.md)
- [Islamic Safety Charter](docs/development/AI_ISLAMIC_SAFETY_CHARTER.md)

## License
[Your License]
```

---

## Verification After Cleanup

Run these checks:
- [ ] No duplicate documentation
- [ ] Clear docs/ directory structure
- [ ] Archive directory organized
- [ ] README.md up to date
- [ ] All links in docs work
- [ ] No broken references

---

## Estimated Time

- Archive creation: 5 minutes
- Moving files: 10 minutes
- Deleting unnecessary: 5 minutes
- README update: 10 minutes
- docs/README.md creation: 5 minutes

**Total:** ~35 minutes
