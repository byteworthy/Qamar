# Noor App Store Launch Status

**Last Updated:** 2026-02-01 (Late Evening - Icon Complete!)
**Version:** 1.0.0
**Launch Strategy:** Option C - Hybrid (Plus: $6.99/mo or $69.99/yr, Pro: $11.99/mo or $119.99/yr or $299.99 lifetime)

---

## ✅ COMPLETED

### Code & Configuration
- [x] IAP functionality enabled (REVENUECAT_CONFIG in config.ts)
- [x] app.json updated (version 1.0.0, correct URLs, no clinical language)
- [x] EAS Build configuration created (eas.json with production/preview/development profiles)
- [x] Production environment variables template (.env.production.example)
- [x] RevenueCat initialization code (client/lib/revenuecat.ts)
- [x] useSubscription hook for entitlement checking (client/hooks/useSubscription.ts)
- [x] react-native-purchases dependency installed
- [x] TypeScript compilation passes ✓

### Design & Assets
- [x] Noor differentiation complete (twilight/gold theme, unique from Niyyah)
- [x] Yemeni-inspired Islamic patterns (lighter, gender-neutral)
- [x] Clinical language removed (no therapy/health claims)
- [x] App icon source SVG created (assets/images/icon-source.svg)
- [x] **App icon PNG finalized (assets/images/icon.png - 1024x1024)**

### Documentation
- [x] Backend deployment guide (release/BACKEND_DEPLOYMENT_GUIDE.md)
- [x] IAP setup guide (release/STORE_PACK/IAP_SETUP_GUIDE.md)
- [x] Icon generation instructions (release/STORE_PACK/ICON_GENERATION.md)
- [x] Build commands reference (release/BUILD_COMMANDS.md)
- [x] Legal URLs live (https://byteworthy.github.io/Noor/legal/)
- [x] Final submission checklist (release/STORE_PACK/FINAL_SUBMISSION_CHECKLIST.md)
- [x] App Store review notes (release/STORE_PACK/APP_STORE_REVIEW_NOTES.md)
- [x] Pricing strategy Option C documented (release/STORE_PACK/PRICING_STRATEGY_OPTION_C.md)

### External Services Setup (Today's Progress!)
- [x] Apple Developer enrollment submitted (Order #W1638152040, $99 paid)
- [x] RevenueCat account created (ByteWorthy project)
- [x] RevenueCat test API key obtained
- [x] Railway backend deployed successfully (logger fix applied)
- [x] .env.production file created with correct values

---


## 🚧 REQUIRED BEFORE SUBMISSION

### 1. Apple Developer Account Setup
- [ ] Apple Developer Program membership ($99/year) - [Sign up](https://developer.apple.com/programs/)
- [ ] App Store Connect access verified
- [ ] App record created with bundle ID: `com.noor.app`
- [ ] Distribution certificate generated
- [ ] Provisioning profile created
- [ ] Paid Apps Agreement signed (for IAP)
- [ ] Banking and tax information completed

**Time Estimate:** 1-3 days (includes Apple verification)

### 2. Backend Deployment
- [ ] Deploy backend to Railway or Vercel
- [ ] Configure production environment variables
  - OPENAI_API_KEY (with sufficient credits)
  - DATABASE_URL (Postgres)
  - SENTRY_DSN (error tracking)
  - REVENUECAT_SECRET_KEY (webhook verification)
- [ ] Run database migrations
- [ ] Verify health check endpoint (GET /health returns 200 OK)
- [ ] Test API endpoints work correctly
- [ ] Update client/.env.production with production API URL

**Guide:** [release/BACKEND_DEPLOYMENT_GUIDE.md](release/BACKEND_DEPLOYMENT_GUIDE.md)
**Time Estimate:** 2-4 hours

### 3. RevenueCat Setup (For IAP)
- [ ] Create RevenueCat account - [Sign up](https://app.revenuecat.com/signup)
- [ ] Create new app in RevenueCat
- [ ] Get public API key (starts with "appl_")
- [ ] Create entitlements (noor_plus_access, noor_pro_access)
- [ ] Configure products in RevenueCat
- [ ] Create offering (default)
- [ ] Update client/.env.production with RevenueCat API key

**Guide:** [release/STORE_PACK/IAP_SETUP_GUIDE.md](release/STORE_PACK/IAP_SETUP_GUIDE.md)
**Time Estimate:** 1-2 hours

### 4. App Store Connect IAP Products
- [ ] Create subscription group: "Noor Premium Subscriptions"
- [ ] Create subscription: noor_plus_monthly ($6.99/month)
  - Duration: 1 month
  - Localization: "Noor Plus" with description
  - Screenshot of Plus features
- [ ] Create subscription: noor_pro_monthly ($11.99/month)
  - Duration: 1 month
  - Localization: "Noor Pro" with description
  - Screenshot of Pro features
- [ ] Set subscription levels (Level 1: Plus, Level 2: Pro)

**Guide:** [release/STORE_PACK/IAP_SETUP_GUIDE.md](release/STORE_PACK/IAP_SETUP_GUIDE.md#part-3-app-store-connect-iap-products)
**Time Estimate:** 1 hour

### 5. Assets Creation
- [ ] Convert icon-source.svg to icon.png (1024x1024)
  - Use online converter or Figma
  - Verify no transparency
  - Replace assets/images/icon.png
- [ ] Create 5 screenshots (1290x2796 pixels)
  - Screenshot 1: Home screen
  - Screenshot 2: Thought capture
  - Screenshot 3: AI reflection response
  - Screenshot 4: Safety screen (CRITICAL - shows disclaimers)
  - Screenshot 5: History screen

**Guides:**
- Icon: [release/STORE_PACK/ICON_GENERATION.md](release/STORE_PACK/ICON_GENERATION.md)
- Screenshots: [release/STORE_PACK/screenshots/SCREENSHOT_SHOTLIST.md](release/STORE_PACK/screenshots/SCREENSHOT_SHOTLIST.md)
**Time Estimate:** 3-6 hours

### 6. Build & Test
- [ ] Create .env.production with actual values (copy from .env.production.example)
- [ ] Build production app: `eas build --platform ios --profile production`
- [ ] Test on physical device (NOT simulator)
  - Complete onboarding flow
  - Create test reflection
  - Verify AI response generates
  - Check Safety screen displays correctly
  - Test subscription flow (sandbox)
- [ ] No crashes or console errors

**Commands:** [release/BUILD_COMMANDS.md](release/BUILD_COMMANDS.md)
**Time Estimate:** 2-4 hours

### 7. App Store Connect Submission
- [ ] Fill out app information (name, subtitle, category: Lifestyle)
- [ ] Upload icon (1024x1024)
- [ ] Upload screenshots (5 images)
- [ ] Enter description (from APP_STORE_CONNECT_FIELDS.md)
- [ ] Complete App Privacy questionnaire
- [ ] Complete age rating (17+)
- [ ] Add review notes (from APP_STORE_REVIEW_NOTES.md)
- [ ] Select production build
- [ ] Submit for review

**Checklist:** [release/STORE_PACK/FINAL_SUBMISSION_CHECKLIST.md](release/STORE_PACK/FINAL_SUBMISSION_CHECKLIST.md)
**Time Estimate:** 30-60 minutes

---

## 📋 COMPLETE TIMELINE

| Task | Est. Time | Dependencies |
|------|-----------|--------------|
| Apple Developer setup | 1-3 days | None (start immediately) |
| Backend deployment | 2-4 hours | Apple account not required |
| RevenueCat setup | 1-2 hours | None |
| IAP products in App Store Connect | 1 hour | Apple Developer account, Paid Apps Agreement |
| Icon generation | 30 min | None |
| Screenshot creation | 3-6 hours | None (can do in parallel) |
| Production build | 2-4 hours | Backend deployed, RevenueCat configured |
| App Store Connect submission | 30-60 min | All assets ready, build complete |
| **Total (existing account):** | **~2-3 days** | - |
| **Total (new account):** | **~5-7 days** | Includes Apple verification wait time |

---

## 🎯 QUICKEST PATH TO LAUNCH

### Day 1 (In Parallel)
1. **Start Apple Developer enrollment** (if needed) - verification takes 1-3 days
2. **Deploy backend to Railway** - 2 hours
3. **Create RevenueCat account** - 1 hour
4. **Generate app icon** - 30 minutes

### Day 2 (After Backend is Ready)
1. **Create screenshots** - 4 hours
2. **Set up IAP products in App Store Connect** - 1 hour (requires Developer account)
3. **Configure .env.production** - 15 minutes

### Day 3 (Build & Submit)
1. **Run production build** - 1 hour (build time + download)
2. **Test on physical device** - 1 hour
3. **Submit to App Store Connect** - 30 minutes
4. **Wait for App Review** - 24-48 hours

### Day 4-5 (Review)
- Apple reviews app (24-48 hours typical)
- Respond to any reviewer questions within 24 hours
- If approved: App goes live! 🎉

---

## 🚀 CRITICAL SUCCESS FACTORS

### Must-Haves for Approval
1. **Safety Screen Visible** - Screenshot 4 MUST show "Not professional counseling" and crisis resources
2. **No Clinical Language** - All checked and removed ✓
3. **AI Disclosure** - In app description, review notes, and onboarding ✓
4. **Privacy Policy Live** - URLs accessible and accurate ✓
5. **App Works** - No crashes, AI responses generate successfully
6. **IAP Configured** - Products created and working in sandbox

### Common Rejection Reasons (Avoided)
- ✅ Medical claims (none - positioned as personal development)
- ✅ Emergency intervention claims (explicit disclaimers present)
- ✅ Missing privacy policy (URLs live and correct)
- ✅ Hidden AI usage (disclosed prominently)
- ✅ App crashes (test thoroughly before submission)

---

## 📞 SUPPORT RESOURCES

### Documentation
- All guides in `release/` and `release/STORE_PACK/`
- Build commands: [release/BUILD_COMMANDS.md](release/BUILD_COMMANDS.md)
- Complete checklists in STORE_PACK directory

### External Resources
- **Apple Developer:** https://developer.apple.com
- **App Store Connect:** https://appstoreconnect.apple.com
- **RevenueCat Docs:** https://docs.revenuecat.com
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Railway Docs:** https://docs.railway.app

### Support Contacts
- **App Email:** scale@getbyteworthy.com
- **Apple Developer Support:** https://developer.apple.com/contact/
- **RevenueCat Support:** support@revenuecat.com

---

## ✅ CURRENT STATUS

**Ready for:** Screenshot creation (in progress)

**Blocked on:** Apple Developer account enrollment (Order #W1638152040 pending)

**Next Actions:**

1. **Create 5 App Store screenshots** (1290x2796) - IN PROGRESS
2. Wait for Apple Developer approval (1-3 days)
3. Set up IAP products in App Store Connect
4. Create production build and test

**Progress:** ~75% complete (icon done! screenshots in progress)

---

**Use the checklists in `release/STORE_PACK/` to track remaining tasks step-by-step.**
