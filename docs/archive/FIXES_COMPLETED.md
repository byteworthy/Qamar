# Fixes Completed & Action Plan

**Date:** 2026-01-25
**Status:** Backend production-ready | Client needs IAP configuration

---

## ✅ COMPLETED FIXES (Production-Ready)

### 1. Database Connection Pooling ✅
**File:** `server/db.ts`
- Added max 20 connections, 30s idle timeout
- Graceful shutdown on SIGTERM
- Error logging on pool errors
- **Impact:** Railway PostgreSQL won't exhaust under load

### 2. Enhanced Health Check ✅
**File:** `server/routes.ts`
- Tests both database AND Claude API
- Returns 503 if either service degrades
- Uses Haiku for minimal cost ($0.00025/check)
- **Impact:** Railway monitoring can detect AI provider outages

### 3. Per-Endpoint Rate Limiting ✅
**Files:** `server/middleware/ai-rate-limiter.ts`, `server/routes.ts`
- 10 req/min on analyze, reframe, practice, duas
- 3 req/5min on insights (expensive operation)
- **Impact:** Protected against API cost attacks

### 4. Comprehensive Audit Document ✅
**File:** `docs/audits/2026-01-25-comprehensive-audit.md`
- 79 backend tests passing
- Detailed findings for all systems
- Prioritized fix roadmap

---

## 🎯 YOUR CRITICAL P0 TASKS (Cannot Ship Without)

### Task 1: Configure In-App Purchases (2-3 days)

**Step 1: Apple App Store Connect**
1. Create app in https://appstoreconnect.apple.com
2. Get Team ID (Apple Developer account)
3. Get App ID from App Store Connect
4. Create "Noor Subscriptions" subscription group
5. Add products:
   - `com.noor.plus.monthly` - $2.99/month
   - `com.noor.plus.yearly` - $29.99/year
   - `com.noor.pro.monthly` - $6.99/month (coming soon)
   - `com.noor.pro.yearly` - $69.99/year (coming soon)
6. Create sandbox tester account for testing

**Step 2: Google Play Console**
1. Create app in https://play.google.com/console
2. Get Application ID
3. Create subscription products:
   - `noor_plus_monthly` - $2.99/month
   - `noor_plus_yearly` - $29.99/year
4. Configure base plans (monthly, yearly)
5. Create license tester account

**Step 3: EAS Configuration**
1. Create Expo account: `npx eas-cli login`
2. Initialize project: `npx eas-cli init`
3. Note the account name and project ID

**Step 4: Fill STORE_IDENTIFIERS.json**
Open `release/STORE_IDENTIFIERS.json` and fill all `null` values with real IDs from steps 1-3.

**Step 5: Test IAP**
```bash
# iOS - Use sandbox tester account
eas build --profile development --platform ios
# Install on device, test purchase with sandbox account

# Android - Use license tester
eas build --profile development --platform android
# Install on device, test purchase with license tester
```

---

### Task 2: Verify Railway Deployment (30 min)

**Check 1: Health Endpoint**
```bash
curl https://<your-railway-domain>/api/health
# Should return: {"status":"healthy","checks":{"database":true,"ai":true}}
```

**Check 2: Environment Variables**
Verify these are set in Railway dashboard:
- ✅ `ANTHROPIC_API_KEY`
- ✅ `DATABASE_URL`
- ✅ `SESSION_SECRET`
- ✅ `ENCRYPTION_KEY`
- ✅ `NODE_ENV=production`

**Check 3: Mobile App Connection**
Update `client/.env`:
```
EXPO_PUBLIC_DOMAIN=your-railway-domain.railway.app
```

Test from mobile app that API calls work.

**Check 4: Database Migrations**
```bash
npm run db:push
```

---

### Task 3: Create App Store Assets (1 day)

**Screenshots Needed:**
- iPhone 15 Pro (6.7"): 6 screenshots
- iPhone 15 (6.1"): 6 screenshots
- iPad Pro 12.9": 6 screenshots (optional but recommended)

**Recommended screens to capture:**
1. Home screen with journey progress
2. Thought capture with niyyah banner
3. Emotional intensity + somatic awareness
4. Distortion analysis results
5. Reframe with Islamic anchors
6. Pricing screen (Noor Plus)

**Tools:**
- iOS Simulator for screenshots
- Figma/Canva for adding marketing overlays
- https://www.appscreenshots.dev/ for templates

**Copy to Write:**
- **App Name:** "Noor - Islamic CBT Journal"
- **Subtitle:** "Find clarity through reflection"
- **Description:** (Draft in audit doc - focus on Islamic grounding + CBT principles + safety-first)
- **Keywords:** "islamic,cbt,mental health,reflection,journal,anxiety,muslim,mindfulness,dua"
- **Promotional Text:** "Early access: Lock in $2.99/month forever. Increases to $6.99 after launch."

**Play Store Additional:**
- Feature graphic (1024x500)
- Short description (80 chars): "Islamic reflection journaling with CBT principles"
- Data Safety form (describe session data, thought storage, Claude API processing)

---

## 📊 NICE TO HAVE (Can Defer to v1.1)

### Client-Side Testing (Deferred)
- React Native + Expo testing is complex
- **Recommendation:** Use Maestro for E2E testing instead
- Install: `brew install maestro` or `npm install -g @maestro-cli/cli`
- Much faster than unit test mocking for React Native
- Example flow:
```yaml
# maestro/reflection-flow.yaml
appId: com.noor.app
---
- tapOn: "Reflection"
- inputText: "I always fail at everything"
- tapOn: "3"  # Intensity
- tapOn: "Continue"
- assertVisible: "cognitive distortions"
```

### Screen-Level Error Boundaries (P2)
- Can add in v1.0.1
- Prevents full app crashes from component errors

### Accessibility Audit (P1-P2)
- VoiceOver testing
- Color contrast fixes
- Dynamic Type support
- Can iterate post-launch

---

## 🚀 LAUNCH CHECKLIST

### Week 1: IAP + Backend (5-7 days)
- [ ] Configure Apple App Store Connect
- [ ] Configure Google Play Console
- [ ] Configure EAS
- [ ] Fill STORE_IDENTIFIERS.json
- [ ] Test IAP purchase flow (iOS sandbox)
- [ ] Test IAP purchase flow (Android license test)
- [ ] Verify Railway deployment health
- [ ] Test mobile app → Railway API connection

### Week 2: Store Assets (1-2 days)
- [ ] Create 6 screenshots per platform
- [ ] Write App Store description
- [ ] Write Play Store description
- [ ] Fill Play Store Data Safety form
- [ ] Prepare App Review notes (explain Islamic content)

### Week 3: Submit (1-2 days)
- [ ] Submit to App Store Review
- [ ] Submit to Play Store Review
- [ ] Set up support email monitoring
- [ ] Monitor Railway logs for errors
- [ ] Prepare incident response plan

---

## 🔧 HOW TO TEST YOUR CHANGES

### Test Backend Health
```bash
curl https://your-railway-domain/api/health
```

Should return:
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "ai": true
  },
  "timestamp": "2026-01-25T...",
  "version": "1.0.0",
  "mode": "production"
}
```

### Test Rate Limiting
```bash
# Make 11 requests in 1 minute - should get rate limited
for i in {1..11}; do
  curl -X POST https://your-railway-domain/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"thought":"test"}' \
    -w "\n%{http_code}\n"
done
# Last request should return 429 Too Many Requests
```

### Test Database Connection Pool
Check Railway logs for:
```
[DB] Connection pool closed successfully
```
on deployment/restart.

---

## 📝 WHAT YOU CAN SKIP (For MVP)

These are documented as P2/P3 in the audit but can wait:

- ❌ Comprehensive client test suite (use Maestro E2E instead)
- ❌ Screen-level error boundaries (add in v1.0.1)
- ❌ Full accessibility audit (iterate post-launch)
- ❌ Sentry crash reporting setup (nice to have, not blocking)
- ❌ Analytics (PostHog/Mixpanel - add after launch)
- ❌ Dynamic Type support (accessibility enhancement for v1.1)

---

## 💡 KEY INSIGHTS FROM AUDIT

### Your Strengths (World-Class)
1. **Safety System:** 617 lines of tests, 8-stage validation pipeline, crisis detection with negation handling
2. **UX Design:** Emotional anchoring, somatic awareness, Islamic grounding (niyyah), journey progression
3. **Security:** Proper session management, encryption at rest, HMAC signatures

### Critical Gaps (Now Fixed or Actionable)
1. ✅ **Database pooling** - FIXED
2. ✅ **Health checks** - FIXED
3. ✅ **Rate limiting** - FIXED
4. 🎯 **IAP configuration** - YOUR TASK (2-3 days)
5. 🎯 **Store assets** - YOUR TASK (1 day)

### Recommendation
**Ship the MVP with:**
- ✅ Backend fixes (done)
- ✅ IAP working (your task)
- ✅ Store assets ready (your task)
- ✅ Basic smoke testing (manual)

Then iterate weekly based on user feedback.

---

## 🆘 IF YOU GET STUCK

**IAP Issues:**
- Apple: https://developer.apple.com/documentation/storekit/in-app_purchase
- Google: https://developer.android.com/google/play/billing
- react-native-iap docs: https://github.com/dooboolab-community/react-native-iap

**Railway Issues:**
- Dashboard: https://railway.app/
- Docs: https://docs.railway.app/

**Store Submission:**
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Store Policies: https://play.google.com/about/developer-content-policy/

---

**Next Step:** Start with Task 1 (IAP Configuration). This is your launch blocker.

The backend is production-ready. Your safety system is exceptional. Now execute the IAP configuration and store assets, and you'll be ready to ship! 🚀
