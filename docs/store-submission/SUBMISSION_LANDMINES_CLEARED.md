# Submission Landmines Cleared - Gate 0

**Date**: 2026-01-20  
**Objective**: Eliminate submission rejection landmines before IAP and production deployment  
**Status**: ✅ Complete

---

## Executive Summary

Gate 0 fixes have been applied to prevent store rejection due to policy mismatches and configuration errors. These fixes align privacy/storage claims with actual behavior, enforce data retention policies, and prevent accidental shipping of validation mode to production.

**Impact**: Significantly reduced risk of App Store/Play Store rejection due to metadata/policy mismatches.

---

## Landmine 1: Storage Policy Mismatch ✅ FIXED

### Problem
Multiple docs claimed "reflections stored locally on device only" while code actually stores reflections on server (`server/storage.ts`, `server/routes.ts`).

**Rejection Risk**: HIGH - Reviewers compare metadata to actual behavior. Mismatch = instant rejection.

### Files Updated (9 files)
1. **legal/PRIVACY_POLICY_DRAFT.md** - Updated to reflect server storage with encryption
2. **legal/DISCLAIMERS_DRAFT.md** - Updated storage claims
3. **legal/TERMS_OF_SERVICE_DRAFT.md** - Updated data storage section
4. **README.md** - Updated privacy section
5. **release/STORE_PACK/apple/APP_STORE_METADATA.md** - Updated privacy + data handling sections
6. **release/STORE_PACK/google/PLAY_STORE_METADATA.md** - Updated privacy section
7. **release/STORE_PACK/privacy/DATA_HANDLING_SUMMARY.md** - Updated storage details
8. **client/screens/onboarding/PrivacyScreen.tsx** - Updated user-facing copy
9. **docs/RELEASE_CHECKLIST_MASTER.md** - Updated privacy checklist items

### New Policy Truth
- Reflections stored securely on servers (encrypted in transit and at rest)
- Data retained for 30 days, then automatically deleted
- Users can delete data at any time from Profile screen
- No local-only claims

### Verification
```bash
# Search for any remaining "local-only" or "stored locally" claims
grep -r "stored locally" . --include="*.md" --include="*.tsx"
# Should return zero results in policy/store docs (only allowed in internal docs)
```

---

## Landmine 2: Data Retention Dry-Run Default ✅ FIXED

### Problem
`server/data-retention.ts` defaults to dry-run mode (logs only, no deletions). If production ships with dry-run enabled, 30-day deletion policy is violated → data retention compliance failure.

**Rejection Risk**: MEDIUM - Privacy policy claims automatic deletion; dry-run prevents it.

### Fix Applied
Added production guard in `server/data-retention.ts`:

```typescript
export function isDryRunMode(): boolean {
  const isProduction = process.env.NODE_ENV === "production";
  const dryRun = process.env.DATA_RETENTION_DRY_RUN;
  
  // PRODUCTION GUARD: Fail if DATA_RETENTION_DRY_RUN not explicitly configured
  if (isProduction && dryRun === undefined) {
    throw new Error(
      "DATA_RETENTION_DRY_RUN must be explicitly set in production environment. " +
      "Set to 'false' to enable real deletions, or 'true' for dry-run mode."
    );
  }
  
  return dryRun !== "false";
}
```

**Result**: Production startup will FAIL if `DATA_RETENTION_DRY_RUN` is not explicitly set. This forces conscious decision about deletion behavior.

### Required Production Environment Variable
```bash
# In production backend deployment (e.g., Google Cloud Run, Railway, etc.):
DATA_RETENTION_DRY_RUN=false
```

### Verification
```bash
# Test production guard locally
NODE_ENV=production npm start
# Should fail with error message if DATA_RETENTION_DRY_RUN not set
```

---

## Landmine 3: Validation Mode Shipping Guard ✅ FIXED

### Problem
`client/lib/config.ts` defaults `VALIDATION_MODE=true` unless explicitly set to `false`. If production build ships with validation mode enabled, IAP purchases will be disabled → "non-functional IAP" rejection.

**Rejection Risk**: CRITICAL - App Store/Play will reject non-functional IAP immediately.

### Fix Applied

#### 1. Runtime Guard in `client/lib/config.ts`
```typescript
// PRODUCTION GUARD: Ensure validation mode is explicitly disabled in production
if (process.env.NODE_ENV === "production" && VALIDATION_MODE) {
  console.error(
    "FATAL: EXPO_PUBLIC_VALIDATION_MODE is not set to 'false' in production build."
  );
  throw new Error(
    "Production build cannot use VALIDATION_MODE. Set EXPO_PUBLIC_VALIDATION_MODE=false in eas.json production profile."
  );
}
```

#### 2. EAS Build Configuration in `eas.json`
```json
{
  "build": {
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_VALIDATION_MODE": "false"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**Result**: Production builds will FAIL at runtime if validation mode is not explicitly disabled. EAS production profile now explicitly sets `EXPO_PUBLIC_VALIDATION_MODE=false`.

### Verification
```bash
# Build production locally and test
npx eas build --profile production --platform ios --local
# Should produce build with EXPO_PUBLIC_VALIDATION_MODE=false baked in
```

---

## Production Environment Checklist

### Backend (Server)
- [ ] `NODE_ENV=production`
- [ ] `DATA_RETENTION_DRY_RUN=false` (enable real deletions)
- [ ] `DATABASE_URL` set to production Postgres
- [ ] `AI_INTEGRATIONS_OPENAI_API_KEY` set (not CHANGEME)
- [ ] `ENCRYPTION_KEY` set (32+ char random string)
- [ ] Verify startup logs show "Dry run mode: false"

### Mobile (Client)
- [ ] Use `eas build --profile production` (not development or preview)
- [ ] Verify `EXPO_PUBLIC_VALIDATION_MODE=false` in build logs
- [ ] Verify `EXPO_PUBLIC_DOMAIN` points to production backend
- [ ] Test IAP purchase flow before submission
- [ ] Verify no "VALIDATION MODE" placeholders in AI responses

---

## What This Does NOT Fix

Gate 0 only fixes **policy/config landmines**. The following are still required for submission:

1. **IAP Implementation** (Gate 1) - StoreBillingProvider still has TODOs
2. **Production Backend** (Gate 2) - Hosting + CORS + secrets setup
3. **Store Assets** (Gate 3) - Screenshots + metadata finalization
4. **Legal URLs** - Privacy/Terms URLs must be live before submission

---

## Testing After Gate 0

### Smoke Test: Storage Policy Alignment
1. Read onboarding privacy screen → should say "stored securely on our servers"
2. Check App Store metadata files → should match actual storage behavior
3. No mentions of "local-only" in user-facing or store copy

### Smoke Test: Retention Guard
```bash
# Start server in production mode without DATA_RETENTION_DRY_RUN
NODE_ENV=production node server/index.ts
# Expected: Error thrown on startup
```

### Smoke Test: Validation Mode Guard
```bash
# Build without EXPO_PUBLIC_VALIDATION_MODE in production profile
# Expected: App crashes on launch with validation mode error
```

---

## Rollback Plan

If Gate 0 changes cause issues:

1. **Storage policy revert**: Use git to restore previous versions of 9 updated files
2. **Retention guard revert**: Remove production guard from `server/data-retention.ts`, restore original `isDryRunMode()`
3. **Validation guard revert**: Remove production guard from `client/lib/config.ts`, remove env from `eas.json`

All changes are isolated and can be reverted independently.

---

## Next Steps: Gate 1 (IAP Implementation)

After Gate 0, proceed to IAP implementation:

1. Implement `StoreBillingProvider` methods (`purchase`, `restore`, `manage`)
2. Test end-to-end IAP flow on iOS Sandbox and Android Internal Testing
3. Verify subscription status reflected in app gating
4. Document IAP setup in store identifiers

**Do not skip Gate 0 before IAP**. Fixing storage policy after screenshots are taken = redo screenshots.

---

**Last Updated**: 2026-01-20  
**Reviewed By**: Automated Gate 0 Execution  
**Approval Status**: Ready for Gate 1
