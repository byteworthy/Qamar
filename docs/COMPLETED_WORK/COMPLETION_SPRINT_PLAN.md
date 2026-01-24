# Noor Completion Sprint Plan
**Created:** 2026-01-22
**Goal:** Cross the finish line for all major buckets

---

## SUMMARY: What's Left

| Bucket | Current | Target | Gap |
|--------|---------|--------|-----|
| CBT Flow | 95% | 100% | 2 screens missing exit modals |
| Docs & Governance | 70% | 90% | Scholar review workflow, safety docs |
| Mobile Build | 60% | 85% | Privacy manifest, build scripts |
| Observability | 20% | 70% | Health checks, structured logging |
| Legal & Compliance | 0% | 50% | Draft ToS/Privacy docs for review |

---

## PHASE 1: CBT FLOW → 100%

### Gap Analysis
After reviewing all screens:

| Screen | Status | Missing |
|--------|--------|---------|
| ThoughtCaptureScreen | ✅ 100% | Nothing |
| DistortionScreen | ✅ 100% | Nothing |
| ReframeScreen | ✅ 100% | Nothing |
| RegulationScreen | ⚠️ 95% | Exit confirmation modal |
| IntentionScreen | ⚠️ 95% | Exit confirmation modal |
| SessionCompleteScreen | ✅ 100% | Nothing |

### Tasks

#### 1.1 Add Exit Modal to RegulationScreen
**Time:** 15 minutes
**File:** `client/screens/RegulationScreen.tsx`

```tsx
// Add to imports
import { ExitConfirmationModal } from "@/components/ExitConfirmationModal";
import { Pressable, useLayoutEffect } from "react-native";

// Add state
const [showExitModal, setShowExitModal] = useState(false);

// Add header button in useLayoutEffect
useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <Pressable
        onPress={() => setShowExitModal(true)}
        style={{ marginRight: Spacing.sm }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
      </Pressable>
    ),
  });
}, [navigation, theme.primary]);

// Add handler
const handleExit = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  setShowExitModal(false);
  // Clear any running intervals
  if (hapticIntervalRef.current) {
    clearInterval(hapticIntervalRef.current);
  }
  navigation.navigate("Home");
};

// Add modal before closing </KeyboardAwareScrollViewCompat>
<ExitConfirmationModal
  visible={showExitModal}
  onConfirm={handleExit}
  onCancel={() => setShowExitModal(false)}
/>
```

#### 1.2 Add Exit Modal to IntentionScreen
**Time:** 15 minutes
**File:** `client/screens/IntentionScreen.tsx`

Same pattern as above - add ExitConfirmationModal with header cancel button.

---

## PHASE 2: ARCHIVE STRIPE BILLING

### Why Archive (Not Delete)
- Preserves code for potential web version
- Keeps reference for IAP implementation
- Clean git history
- Easy to restore if needed

### Tasks

#### 2.1 Create Archive Directory & Move Files
**Time:** 10 minutes

```bash
# Create archive structure
mkdir -p archive/stripe-billing/server
mkdir -p archive/stripe-billing/client

# Move server billing files
mv server/billing archive/stripe-billing/server/

# Move client billing screens (keep but disable)
cp client/screens/PricingScreen.tsx archive/stripe-billing/client/
cp client/screens/BillingSuccessScreen.tsx archive/stripe-billing/client/
```

#### 2.2 Create Placeholder Files
**Time:** 20 minutes

Replace with IAP placeholders that show "Coming Soon" or link to App Store subscriptions.

#### 2.3 Update Navigation
**Time:** 10 minutes

Comment out or conditionally hide billing routes until IAP is implemented.

---

## PHASE 3: DOCS & GOVERNANCE → 90%

### Current State
- ✅ AI_ISLAMIC_SAFETY_CHARTER.md
- ✅ POSITIONING_DISCIPLINE.md  
- ✅ USER_TRANSPARENCY.md
- ✅ SCHOLAR_REVIEW_WORKFLOW.md
- ⚠️ Legal docs drafts exist but incomplete

### Tasks

#### 3.1 Create SAFETY_SYSTEM_DOCUMENTATION.md
**Time:** 45 minutes
**Purpose:** Document the 8-stage safety pipeline for governance review

```markdown
# Noor Safety System Documentation

## Overview
Complete documentation of the multi-layer AI safety system.

## Components
1. Charter Compliance Checker
2. Tone Compliance Checker
3. Conversation State Machine
4. Pacing Controller
5. Islamic Content Mapper
6. Crisis Detection
7. Scrupulosity Detection
8. Canonical Orchestrator

## Test Coverage
- 70 safety tests
- 9 E2E journey tests
- Crisis detection accuracy metrics

## Audit Trail
- All AI calls logged (PII redacted)
- Safety violations tracked
- Telemetry for monitoring
```

#### 3.2 Create CRISIS_RESOURCES_VERIFICATION.md
**Time:** 30 minutes
**Purpose:** Evidence log for crisis resource verification

```markdown
# Crisis Resources Verification Log

## Verification Process
1. Manual verification of each resource
2. Check link/phone functionality
3. Confirm 24/7 availability
4. Document verification date

## Resources Verified

### 988 Suicide & Crisis Lifeline
- **Contact:** 988 (call or text)
- **Website:** https://988lifeline.org
- **Verified:** [DATE]
- **Status:** ✅ Active

### Crisis Text Line
- **Contact:** Text HOME to 741741
- **Website:** https://crisistextline.org
- **Verified:** [DATE]
- **Status:** ✅ Active

### NAMI Helpline
- **Contact:** 1-800-950-NAMI
- **Website:** https://nami.org
- **Verified:** [DATE]
- **Status:** ✅ Active

## Next Verification Date
[90 days from last verification]
```

#### 3.3 Complete Legal Doc Drafts
**Time:** 60 minutes
**Files:** `legal/PRIVACY_POLICY_DRAFT.md`, `legal/TERMS_OF_SERVICE_DRAFT.md`

Fill in all `[PLACEHOLDER]` sections with:
- Company name: Byteworthy LLC
- Contact email
- Data retention periods (30 days)
- GDPR/CCPA compliance statements
- Mental health disclaimers
- Islamic authority disclaimers

---

## PHASE 4: MOBILE BUILD → 85%

### Tasks

#### 4.1 Add iOS Privacy Manifest
**Time:** 30 minutes
**File:** `app.json`

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "This allows Noor to provide personalized reflections.",
        "NSCameraUsageDescription": "Not used in this version.",
        "NSPhotoLibraryUsageDescription": "To export your reflections as images."
      }
    }
  }
}
```

#### 4.2 Add Build Scripts to package.json
**Time:** 15 minutes

```json
{
  "scripts": {
    "build:dev:ios": "eas build --platform ios --profile development",
    "build:dev:android": "eas build --platform android --profile development",
    "build:preview:ios": "eas build --platform ios --profile preview",
    "build:preview:android": "eas build --platform android --profile preview",
    "build:prod:ios": "eas build --platform ios --profile production",
    "build:prod:android": "eas build --platform android --profile production",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android"
  }
}
```

#### 4.3 Configure Production API URL
**Time:** 20 minutes
**File:** `client/lib/config.ts`

Add production API endpoint configuration for release builds.

---

## PHASE 5: OBSERVABILITY → 70%

### Tasks

#### 5.1 Add Health Check Endpoint
**Time:** 30 minutes
**File:** `server/health.ts`

```typescript
import { Router } from "express";
import { db } from "./db";

const router = Router();

router.get("/health", async (req, res) => {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: "unknown",
      uptime: process.uptime(),
    },
  };

  try {
    // Simple DB connectivity check
    await db.execute("SELECT 1");
    checks.checks.database = "connected";
  } catch (error) {
    checks.status = "degraded";
    checks.checks.database = "disconnected";
  }

  const statusCode = checks.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(checks);
});

export default router;
```

#### 5.2 Add Structured Logging
**Time:** 45 minutes
**File:** `server/logger.ts`

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["thought", "reframe", "intention", "*.thought", "*.reframe"],
    censor: "[REDACTED]",
  },
});

// Usage: logger.info({ userId: hashedId, action: "reflection_saved" }, "Reflection saved");
```

#### 5.3 Add Request ID Tracing
**Time:** 20 minutes
**File:** `server/middleware/requestId.ts`

```typescript
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers["x-request-id"] as string || uuidv4();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
```

#### 5.4 Create Sentry Setup Instructions
**Time:** 15 minutes
**File:** `docs/SENTRY_SETUP.md`

Step-by-step guide for setting up Sentry when ready for production.

---

## PHASE 6: LEGAL & COMPLIANCE → 50%

### Tasks

#### 6.1 Complete Privacy Policy Draft
**Time:** 45 minutes
**File:** `legal/PRIVACY_POLICY_DRAFT.md`

Key sections to complete:
- Data collected (thoughts, intentions - encrypted)
- Data retention (30 days auto-delete)
- No third-party sharing
- User rights (export, delete)
- Contact information

#### 6.2 Complete Terms of Service Draft
**Time:** 45 minutes
**File:** `legal/TERMS_OF_SERVICE_DRAFT.md`

Key sections to complete:
- Service description (Islamic CBT companion)
- NOT a substitute for therapy
- NOT an Islamic legal authority
- Liability limitations
- User responsibilities

#### 6.3 Create App Store Legal URLs Structure
**Time:** 15 minutes

```
release/STORE_PACK/
├── privacy-policy.md     # For GitHub Pages hosting
├── terms-of-service.md   # For GitHub Pages hosting
└── LEGAL_URLS.md         # URL mapping for app stores
```

---

## EXECUTION ORDER

### Day 1 (3-4 hours)
1. ✅ CBT Flow completion (30 min)
   - RegulationScreen exit modal
   - IntentionScreen exit modal
2. ✅ Archive Stripe billing (40 min)
3. ✅ Mobile build scripts (15 min)

### Day 2 (4-5 hours)
4. ✅ Privacy manifest (30 min)
5. ✅ Health check endpoint (30 min)
6. ✅ Structured logging (45 min)
7. ✅ Request ID tracing (20 min)

### Day 3 (3-4 hours)
8. ✅ Safety system documentation (45 min)
9. ✅ Crisis resources verification (30 min)
10. ✅ Privacy policy draft (45 min)
11. ✅ Terms of service draft (45 min)

### Day 4 (2-3 hours)
12. ✅ Sentry setup guide (15 min)
13. ✅ Final testing & verification
14. ✅ Update PROJECT_STATUS.md with new scores

---

## SUCCESS CRITERIA

After completing this sprint:

| Bucket | Before | After |
|--------|--------|-------|
| CBT Flow | 95% | **100%** |
| Docs & Governance | 70% | **90%** |
| Mobile Build | 60% | **85%** |
| Observability | 20% | **70%** |
| Legal & Compliance | 0% | **50%** |

**Overall MVP Score:** 79% → **~88%**

---

## REMAINING BLOCKERS (Post-Sprint)

After this sprint, these items still require external action:

1. **Scholar Review** - 2-6 weeks, requires qualified scholar
2. **Legal Review** - 2-4 weeks, requires attorney
3. **Production Deployment** - 1 week, requires hosting decision
4. **App Store Setup** - 1 week, requires store accounts
5. **IAP Implementation** - Replace Stripe with Apple/Google IAP

---

## NOTES

- All code changes follow existing patterns in codebase
- No new dependencies unless absolutely necessary
- Focus on completion, not perfection
- Document as we go

**Let's cross the finish line!** 🏁
