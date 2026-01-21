# NOOR CBT - PROJECT ROADMAP

**Created:** 2026-01-19  
**Status:** Active  
**Last Updated:** 2026-01-19

---

## SECTION 1: CURRENT STATE SNAPSHOT

**Overall Completion: ~55%**

The codebase is functionally complete for local development. Core CBT journey works. Safety system passes 79 tests. TypeScript compiles clean. However, the product cannot ship because:
- No production backend deployed
- Mobile IAP not implemented (mock billing only)
- Data retention deletion not implemented
- Legal documents are drafts requiring review
- Store accounts and identifiers status unknown
- No observability infrastructure

**Top 3 Risks Holding Noor Back Today:**
1. **Mobile IAP not implemented** - Guaranteed store rejection. billingProvider.ts has `USE_MOCK_BILLING = true` and `StoreBillingProvider` throws "Store billing not configured yet"
2. **No production backend** - App cannot function end-to-end without hosted API
3. **Store account status unknown** - Cannot verify bundle ID reservation, IAP product IDs, or submission capability

---

## SECTION 2: VERIFIED FACTS VS UNKNOWNS

### VERIFIED FACTS (from repo)

| Fact | Source | Value |
|------|--------|-------|
| iOS Bundle ID | app.json | `com.noor.app` |
| Android Package | app.json | `com.noor.app` |
| App Version | app.json | `1.0.0` |
| EAS Build Profiles | eas.json | development, preview, production |
| Test Suite | PROJECT_STATUS.md | 79 tests pass |
| TypeScript Build | PROJECT_STATUS.md | Passes |
| High Vulnerabilities | PROJECT_STATUS.md | 0 |
| Moderate Vulnerabilities | PROJECT_STATUS.md | 4 (dev-only, drizzle-kit) |
| Onboarding Screens | PROJECT_STATUS.md | Complete (2026-01-19) |
| Safety System | PROJECT_STATUS.md | Canonical orchestrator active |
| Data Retention Service | data-retention.ts | Service exists, runs every 24h |
| Data Deletion | data-retention.ts | NOT IMPLEMENTED (TODO in code) |
| Mobile Billing | billingProvider.ts | Mock only, store billing throws error |
| Server Billing | billingService.ts | Stripe configured (web only) |
| Encryption | PROJECT_STATUS.md | AES-256-GCM for PII |
| Crisis Detection | PROJECT_STATUS.md | Active |
| AI Provider | PROJECT_STATUS.md | OpenAI GPT-4 |
| Legal Docs | legal/*.md | DRAFT - require legal review |

### UNKNOWNS (require external verification)

| Unknown | How to Verify |
|---------|---------------|
| Apple Developer Account exists | Log into App Store Connect |
| Bundle ID `com.noor.app` reserved | App Store Connect → App IDs |
| Google Play Console exists | Log into Play Console |
| Package `com.noor.app` reserved | Play Console → App list |
| iOS IAP product IDs created | App Store Connect → Subscriptions |
| Android IAP product IDs created | Play Console → Products |
| Domain `noorcbt.com` owned | Domain registrar dashboard |
| EAS account linked | Run `eas whoami` |
| Production hosting exists | Check AWS/GCP console |
| Scholar review completed | No repo artifact indicates status |

---

## SECTION 3: TOP 12 BLOCKERS (Ranked)

| Rank | Blocker | Severity | Category | Blocks |
|------|---------|----------|----------|--------|
| 1 | Mobile IAP not implemented | CRITICAL | Engineering | Store submission |
| 2 | No production backend deployed | CRITICAL | Infrastructure | App functionality |
| 3 | Store account status unknown | CRITICAL | Operations | Everything downstream |
| 4 | Data retention deletion not implemented | HIGH | Compliance | Privacy compliance claims |
| 5 | No observability (Sentry/logging) | HIGH | Operations | Debugging production issues |
| 6 | Legal docs are drafts | HIGH | Legal | Store submission |
| 7 | No HIPAA BAA signed | HIGH | Compliance | Health app claims |
| 8 | Crisis resources not verified live | HIGH | Safety | Mental health category |
| 9 | No health endpoint | MEDIUM | Infrastructure | Monitoring/uptime |
| 10 | No rate limiting | MEDIUM | Infrastructure | Abuse protection |
| 11 | Screenshots not captured | MEDIUM | Store | Store submission |
| 12 | No device reality testing | MEDIUM | QA | Crash discovery |

---

## SECTION 4: PHASES

### PHASE 1: STORE ACCOUNTS AND IDENTIFIERS

**Goal:** Lock in app identity and unblock all downstream work

**Why:** Every rebuild with wrong bundle ID wastes time. IAP product IDs must exist before billing code can reference them. Store accounts must exist before any submission.

**Tasks:**
1. Verify or create Apple Developer account ($99/year)
2. Verify or reserve bundle ID `com.noor.app` in App Store Connect
3. Verify or create Google Play Console account ($25 one-time)
4. Verify or reserve package name `com.noor.app` in Play Console
5. Create IAP product IDs in App Store Connect:
   - `com.noor.plus.monthly`
   - `com.noor.plus.yearly`
   - `com.noor.pro.monthly`
   - `com.noor.pro.yearly`
6. Create IAP product IDs in Play Console (same SKUs)
7. Verify EAS account linked: `eas whoami`
8. Document all IDs in STORE_IDENTIFIERS.md file

**Dependencies:** None

**Verification:**
- Can log into App Store Connect and see app entry
- Can log into Play Console and see app entry
- IAP products visible in both consoles
- `eas whoami` returns valid account

**Stop Point:** All identifiers documented and verified in both store consoles

**Detailed Checklist:** See `docs/PHASE1_STORE_SETUP.md`

---

### PHASE 2: OBSERVABILITY (MOBILE AND BACKEND)

**Goal:** Stop flying blind before any production deployment

**Why:** Without error tracking, production issues become user complaints with no debugging context. Must be in place before backend goes live.

**Tasks:**
1. Create Sentry account and project for backend
2. Create Sentry project for React Native (iOS + Android)
3. Add Sentry DSN to environment configuration
4. Integrate Sentry SDK in server code (error capture)
5. Integrate Sentry SDK in mobile client (crash reporting)
6. Configure source maps upload for mobile crashes
7. Verify error capture works in development
8. Set up Sentry alerts for error spikes

**Dependencies:** None

**Verification:**
- Trigger test error in backend, see it in Sentry
- Trigger test crash in mobile, see it in Sentry
- Stack traces are symbolicated

**Stop Point:** Both backend and mobile errors flow to Sentry dashboard

---

### PHASE 3: PRODUCTION BACKEND DEPLOY (GCP WITH HIPAA POSTURE)

**Goal:** Stable, secured API endpoint that mobile app can reach

**Why:** App cannot function without backend. Mental health app requires HIPAA-capable infrastructure even if not storing PHI directly.

**Hosting Decision:** Google Cloud Run is cheaper for this scale
- Cloud Run: Pay per request, ~$5-30/month at low traffic
- Cloud SQL PostgreSQL: $10-25/month (smallest instance)
- Total: ~$15-55/month vs AWS ECS + RDS at ~$50-100/month minimum

**HIPAA Posture Basics for GCP:**
- Sign BAA with Google Cloud (Cloud Run, Cloud SQL are BAA-covered)
- Enable Cloud SQL encryption at rest (default)
- Enable VPC Service Controls or private IP for Cloud SQL
- Enable Cloud Logging and Cloud Audit Logs
- Restrict IAM to least privilege
- Enable automated backups for Cloud SQL

**Tasks:**
1. Create GCP project for Noor
2. Enable Cloud Run, Cloud SQL, Secret Manager APIs
3. Sign BAA with Google Cloud
4. Provision Cloud SQL PostgreSQL instance (smallest tier)
5. Configure private connectivity or authorized networks
6. Run database migrations via Cloud SQL proxy
7. Store secrets in Secret Manager (DATABASE_URL, OPENAI_KEY, etc.)
8. Deploy backend to Cloud Run with secrets mounted
9. Configure custom domain with managed SSL
10. Implement health endpoint returning 200 if DB connected
11. Implement rate limiting middleware
12. Verify health endpoint responds over HTTPS
13. Enable Cloud Logging for request logs
14. Enable automated Cloud SQL backups (daily)

**Dependencies:** Phase 2 (Sentry DSN needed in secrets)

**Verification:**
- `curl https://api.noorcbt.com/health` returns 200
- Logs appear in Cloud Logging
- Sentry captures errors
- Database queries work
- Backups configured in Cloud SQL

**Stop Point:** Backend stable for 48 hours with no errors in Sentry

---

### PHASE 4: DATA RETENTION DELETION AND DATA CONTROLS

**Goal:** Fulfill privacy policy claims about 30-day retention

**Why:** Privacy policy states 30-day retention. Code shows deletion is TODO. This is a compliance gap. Also needed for GDPR right to deletion.

**Tasks:**
1. Implement `deleteExpiredReflections` in storage layer
2. Implement `deleteExpiredInsightSummaries` in storage layer
3. Wire deletion methods into data-retention.ts cleanup cycle
4. Implement `deleteAllUserData` for right-to-be-forgotten
5. Add admin endpoint to trigger manual cleanup
6. Test deletion locally: create old data, run cleanup, verify deleted
7. Deploy updated backend to Cloud Run
8. Run cleanup and verify in production logs

**Dependencies:** Phase 3 (backend deployed)

**Verification:**
- Create test reflection older than 30 days
- Run cleanup job
- Verify reflection deleted from database
- Production logs show deletion counts

**Stop Point:** Automated deletion runs successfully in production

---

### PHASE 5: MOBILE IAP IMPLEMENTATION AND SANDBOX VERIFICATION

**Goal:** Real Apple/Google billing that enables store submission

**Why:** Current billing is mock. Store submission will be rejected. Digital content unlocks must use Apple/Google IAP per App Store guidelines.

**Tasks:**
1. Install expo-in-app-purchases or react-native-iap
2. Remove or gate Stripe code for mobile (Stripe only for web if any)
3. Implement StoreBillingProvider for real IAP:
   - getProducts() - fetch from store
   - purchase() - initiate IAP flow
   - restore() - restore previous purchases
   - manage() - open subscription management
4. Handle purchase verification server-side (receipt validation)
5. Map store subscription status to app tier (free/plus/pro)
6. Update PricingScreen to use real IAP
7. Test in iOS Sandbox (TestFlight sandbox account)
8. Test in Google Play internal testing (license testing)
9. Verify subscription grants features
10. Verify restore works after app reinstall
11. Verify cancellation revokes features

**Dependencies:** Phase 1 (IAP product IDs created), Phase 3 (backend for receipt validation)

**Verification:**
- Purchase Plus monthly in iOS sandbox, features unlock
- Purchase Plus monthly in Play sandbox, features unlock
- Restore works on fresh install
- Cancel subscription, features revert after period ends

**Stop Point:** Both platforms complete purchase flow in sandbox

---

### PHASE 6: DEVICE REALITY TESTING AND STORE ASSETS

**Goal:** Catch real-world crashes and prepare submission materials

**Why:** Simulator testing misses memory issues, network edge cases, and device-specific bugs. Screenshots required for submission.

**Tasks:**
1. Build production iOS IPA via EAS
2. Build production Android AAB via EAS
3. Install on physical iPhone (TestFlight internal)
4. Install on physical Android (Play internal testing)
5. Complete full CBT journey on each device
6. Test offline mode (airplane mode after cache)
7. Test crisis flow (988 tap-to-call works)
8. Test IAP flow on each device
9. Monitor Sentry for crashes during testing
10. Fix any P0/P1 bugs discovered
11. Capture screenshots per SCREENSHOT_SHOTLIST.md
12. Prepare App Store metadata per APP_STORE_METADATA.md
13. Prepare Play Store metadata per PLAY_STORE_METADATA.md
14. Finalize legal documents (requires legal review)
15. Publish privacy policy to live URL
16. Publish terms of service to live URL

**Dependencies:** Phase 5 (IAP working), Phase 3 (backend stable)

**Verification:**
- Full journey works on physical iPhone
- Full journey works on physical Android
- Crash rate <0.1% in Sentry
- Screenshots match all required sizes
- Legal URLs return 200

**Stop Point:** 5+ testers complete journey with no P0/P1 bugs

---

### PHASE 7: SUBMISSION LOOP AND POST-LAUNCH HOTFIX CAPABILITY

**Goal:** Submit to stores and establish rapid response process

**Why:** First submission often rejected. Need process to fix, rebuild, resubmit quickly.

**Tasks:**
1. Submit iOS to App Store Review
2. Submit Android to Play Store Review
3. Monitor review status daily
4. If rejected: document rejection reason, fix, resubmit
5. Common rejection prep:
   - Medical claims language audit
   - AI disclosure language audit
   - Crisis handling verification
   - Data handling questionnaire accuracy
6. Once approved: staged rollout (10% Android)
7. Monitor Sentry and store crash reports
8. Establish hotfix process:
   - Branch from main
   - Fix bug
   - EAS build with bumped version
   - Submit for expedited review (Apple) or promote (Android)
9. Respond to first user reviews

**Dependencies:** Phase 6 (all assets ready)

**Verification:**
- Apps approved and live in stores
- Download and complete journey from store
- Sentry shows production traffic with low error rate
- Hotfix can be deployed within 4 hours

**Stop Point:** Apps live in stores, stable for 7 days, hotfix process tested

---

### PHASE LATER: CLAUDE-ONLY CUTOVER PLAN

**Goal:** Replace OpenAI with Claude as AI provider

**Why:** Long-term strategic direction. Not on critical path for v1 ship.

**Tasks (for future planning):**
1. Create Anthropic account and API key
2. Abstract AI provider interface if not already
3. Implement Claude adapter matching existing interface
4. Update safety prompts for Claude's style
5. Run safety test suite against Claude
6. Compare output quality for CBT reframes
7. Run A/B test internally
8. Gradual traffic shift: 10% → 50% → 100%
9. Monitor safety telemetry during transition
10. Deprecate OpenAI integration

**Dependencies:** v1 shipped and stable

**This phase is not required for initial launch.**

---

## SECTION 5: STORE REJECTION RISK LIST MAPPED TO TASKS

| Risk | Category | Consequence | Mapped Task |
|------|----------|-------------|-------------|
| Using Stripe for in-app digital content | IAP Policy | Rejection | Phase 5: Remove Stripe for mobile |
| Medical claims without license | Health Claims | Rejection | Phase 6: Audit copy for claims |
| No crisis resources | Mental Health | Rejection | Phase 6: Verify 988 tap-to-call |
| AI not disclosed | Transparency | Rejection | Phase 6: Verify AI disclosure in onboarding |
| Data handling form inaccurate | Privacy | Rejection | Phase 6: Verify Data Safety form |
| Privacy policy URL broken | Legal | Rejection | Phase 6: Publish to live URL |
| Crash on launch | Quality | Rejection | Phase 6: Device testing |
| Subscription terms unclear | IAP Policy | Rejection | Phase 5: Verify subscription screen copy |
| Missing screenshots | Metadata | Incomplete | Phase 6: Capture screenshots |
| Wrong bundle ID | Identity | Rebuild churn | Phase 1: Lock identifiers first |

---

## SECTION 6: EXACT EXECUTION ORDER

### Sequential Dependencies

```
Phase 1 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
          ↓
        Phase 2 (can start in parallel with Phase 1)
```

### What Can Overlap

| Phase | Can Overlap With | Notes |
|-------|------------------|-------|
| Phase 1 | Phase 2 | Both are setup, no code dependencies |
| Phase 2 | Phase 1, early Phase 3 | Sentry setup independent of hosting |
| Phase 6 Screenshots | Phase 6 Testing | Different people can do these |

### What Must Be Sequential

| Before | After | Why |
|--------|-------|-----|
| Phase 1 | Phase 5 | IAP product IDs must exist before IAP code can reference them |
| Phase 3 | Phase 4 | Deletion requires deployed backend to verify |
| Phase 3 | Phase 5 | Receipt validation requires backend |
| Phase 5 | Phase 6 | IAP must work before device testing covers billing |
| Phase 6 | Phase 7 | All assets and testing complete before submission |

### Recommended Timeline (Single Developer)

| Week | Focus |
|------|-------|
| Week 1 | Phase 1 (store accounts) + Phase 2 (observability) |
| Week 2 | Phase 3 (backend deploy) |
| Week 3 | Phase 4 (deletion) + Phase 5 start (IAP) |
| Week 4 | Phase 5 complete (IAP testing) |
| Week 5 | Phase 6 (device testing + assets) |
| Week 6 | Phase 7 (submit + respond to feedback) |

---

## CONSTRAINTS

1. **Hosting:** AWS or Google Cloud only (HIPAA capable, BAA signed)
2. **AI Provider:** OpenAI for v1, Claude cutover is Phase Later
3. **Mobile Billing:** Apple IAP and Google Play Billing only. No Stripe for mobile digital content.
4. **Scope:** No new features. Ship readiness only.

---

**End of Project Roadmap**
