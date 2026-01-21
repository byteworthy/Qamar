# Noor Launch Prep Checklist

**Created:** January 2026
**Purpose:** Final decisions and setup before App Store submission

---

## PART 1: Pricing Decision Lock

### Current State (Validation Build)

| Setting | Current Value | Location |
|---------|---------------|----------|
| App Price | Free | App Store Connect |
| In-App Purchases | Disabled | `VALIDATION_MODE = true` in config |
| Noor Plus | $6.99/month (hidden) | `client/lib/billingConfig.ts` |
| Noor Pro | $11.99/month (hidden) | `client/lib/billingConfig.ts` |

### v1.0 Launch Decision

**DECISION REQUIRED:** Choose one option

- [ ] **Option A: Free-only launch** (recommended for validation)
  - App Store price: Free
  - IAP: Disabled (`VALIDATION_MODE = true`)
  - Pros: Fastest to ship, no IAP review complexity
  - Cons: No revenue, need to re-submit for IAP later

- [ ] **Option B: Free with IAP at launch**
  - App Store price: Free
  - IAP: Enabled (`VALIDATION_MODE = false`, configure RevenueCat)
  - Pros: Revenue from day 1, single submission
  - Cons: IAP adds review complexity, need RevenueCat setup

### If Option A (Free-only):

```
✓ No changes needed to code
✓ Submit as-is
✓ Plan IAP enablement for v1.1
```

### If Option B (Free with IAP):

```
Before submission:
1. [ ] Set VALIDATION_MODE = false in client/lib/config.ts
2. [ ] Configure RevenueCat API keys
3. [ ] Create IAP products in App Store Connect
4. [ ] Test purchase flow on TestFlight
5. [ ] Update app description to mention subscription options
```

### Locked Decision

**Date:**  _______________
**Decision:** ☐ Option A (Free-only)  ☐ Option B (Free with IAP)
**Signed:** _______________

---

## PART 2: Apple Developer Identity Prep

### Required Information

Before you can submit to App Store, you need:

#### Account Setup

- [ ] **Apple Developer Account** ($99/year)
  - Already have: ☐ Yes  ☐ No
  - Account type: ☐ Individual  ☐ Organization
  - Login email: _________________________

- [ ] **Developer Portal Access**
  - URL: https://developer.apple.com
  - Logged in and verified: ☐

#### App Store Connect Setup

- [ ] **App Store Connect Access**
  - URL: https://appstoreconnect.apple.com
  - Logged in and verified: ☐

- [ ] **App Record Created**
  - Bundle ID: `com.byteworthy.noor` (or your bundle ID)
  - App created in App Store Connect: ☐

#### Certificates & Profiles

- [ ] **Distribution Certificate**
  - Valid iOS Distribution Certificate exists: ☐
  - Expiration date: _________________________

- [ ] **Provisioning Profile**
  - App Store provisioning profile created: ☐
  - Profile includes correct Bundle ID: ☐

#### Banking & Tax (for IAP)

If using Option B (IAP enabled):

- [ ] **Paid Apps Agreement**
  - Agreements, Tax, and Banking completed in App Store Connect: ☐

- [ ] **Bank Account Added**
  - Bank account linked for payments: ☐

- [ ] **Tax Forms**
  - W-9 (US) or W-8BEN (non-US) submitted: ☐

---

## PART 3: Pre-Submission Final Checklist

### Code Readiness

- [ ] App builds successfully with `eas build --platform ios`
- [ ] No TypeScript errors (`npm run check:types`)
- [ ] All tests pass (`npm test`)
- [ ] Version number set correctly in `app.json`

### Assets Ready

- [ ] App icon (1024x1024 PNG)
- [ ] Screenshots (1290x2796 for iPhone 15 Pro Max)
- [ ] Privacy Policy URL live and accessible
- [ ] Terms of Service URL live and accessible

### Environment

- [ ] Production API endpoint configured
- [ ] API keys are production keys (not dev/test)
- [ ] Sentry DSN is production DSN
- [ ] OpenAI API key is production key

### Legal

- [ ] Privacy Policy matches actual data collection
- [ ] App description matches actual functionality
- [ ] No misleading claims in marketing materials
- [ ] Crisis disclaimers are present and visible

---

## PART 4: Launch Day Checklist

### Day Before Submission

- [ ] Final build uploaded to App Store Connect
- [ ] Build processed and visible
- [ ] All metadata fields filled (use `UPLOAD_ORDER_CHECKLIST.md`)
- [ ] Screenshots uploaded
- [ ] App Review notes added

### Submission

- [ ] Click "Add for Review"
- [ ] Select build
- [ ] Submit for App Review
- [ ] Note submission time: _________________________

### Post-Submission

- [ ] Monitor email for App Review status
- [ ] Be ready to respond to reviewer questions
- [ ] Prepare for potential rejection and resubmission
- [ ] Expected review time: 24-48 hours (may vary)

### If Approved

- [ ] Set release date (immediate or scheduled)
- [ ] Announce launch
- [ ] Monitor initial user feedback
- [ ] Watch for crash reports in Sentry

### If Rejected

- [ ] Read rejection reason carefully
- [ ] Address specific issues mentioned
- [ ] Do NOT add new features in response
- [ ] Resubmit with minimal changes
- [ ] Contact App Review if clarification needed

---

## Quick Reference

### Bundle ID
```
com.byteworthy.noor
```
(Update if different in your app.json)

### SKU
```
noor-ios-2026
```

### Version
```
1.0.0
```

### Build Number
```
1
```
(Increment for each upload)

### Contact Email
```
support@byteworthy.com
```

### Privacy Policy URL
```
https://byteworthy.github.io/noor-legal/privacy-policy
```

### Terms URL
```
https://byteworthy.github.io/noor-legal/terms-of-service
```

---

## Timeline Estimate

| Task | Time |
|------|------|
| Apple Developer account setup (if needed) | 1-3 days (verification) |
| App Store Connect setup | 30 minutes |
| Build & upload | 30-60 minutes |
| Metadata entry | 15-30 minutes |
| App Review | 24-48 hours |
| **Total (existing account)** | **~2 days** |
| **Total (new account)** | **~5 days** |

---

**Status:** Ready to execute. Fill in decisions above, then proceed.
