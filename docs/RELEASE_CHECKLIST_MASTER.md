# Release Checklist Master

**Purpose**: Master checklist for alpha testing and app store submission  
**Last Updated**: 2026-01-19  
**Owner**: Release Management

---

## Internal Alpha Checklist

### Pre-Alpha Preparation

**Backend Deployment:**
- [ ] Backend deployed to production on Google Cloud (Cloud Run)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Health endpoint responding: `curl https://api.noorcbt.com/health`
- [ ] Database migrations run successfully (Cloud SQL Postgres)
- [ ] All secrets stored in Secret Manager (not environment files)
- [ ] AI provider key configured in production
- [ ] Rate limiting enabled
- [ ] Error tracking configured (Cloud Error Reporting or Sentry)
- [ ] Uptime monitoring configured (Cloud Monitoring)

**Mobile Build:**
- [ ] All tests passing (`npm test` - 79/79 tests)
- [ ] Type check passing (`npm run check:types`)
- [ ] Production build profile configured in eas.json
- [ ] EXPO_PUBLIC_DOMAIN set to production domain
- [ ] No localhost or development URLs in code
- [ ] App version bumped in app.json

**Build and Submit to Internal Testing:**
- [ ] iOS build created: `npx eas build --profile production --platform ios`
- [ ] Android build created: `npx eas build --profile production --platform android`
- [ ] iOS submitted to TestFlight Internal: `npx eas submit --platform ios`
- [ ] Android submitted to Play Internal: `npx eas submit --platform android`

### Alpha Testing

**Recruit Testers:**
- [ ] 5-10 internal testers identified
- [ ] Testers added to TestFlight (iOS)
- [ ] Testers added to Play Internal Testing (Android)
- [ ] Test instructions shared with testers
- [ ] Feedback mechanism established (email, form, etc.)

**Alpha Test Duration:**
- [ ] Minimum 1 week of alpha testing
- [ ] All critical bugs fixed
- [ ] No P0/P1 bugs remaining
- [ ] Crash rate < 0.1%

**Alpha Exit Criteria:**
- [ ] At least 5 testers completed full CBT journey
- [ ] At least 3 testers tested subscription flow
- [ ] All critical feedback addressed
- [ ] No showstopper bugs
- [ ] Smoke tests passing (see SMOKE_TESTS_MOBILE.md)

---

## Apple App Store Submission Checklist

### Pre-Submission (Code Complete)

**App Requirements:**
- [ ] All tests passing
- [ ] No crash on launch
- [ ] No console errors or warnings
- [ ] HTTPS-only connections (ATS compliant)
- [ ] No localhost URLs in production build
- [ ] App works offline (local storage functional)
- [ ] Crisis resources accessible (988 button works)
- [ ] Onboarding shows on first launch only

**Legal Documents:**
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Support URL active and responding
- [ ] Privacy Policy URL: https://noorcbt.com/privacy (update placeholder)
- [ ] Terms URL: https://noorcbt.com/terms (update placeholder)
- [ ] Support URL: https://noorcbt.com/support (update placeholder)

**App Store Connect Setup:**
- [ ] Developer account active (enrollment complete)
- [ ] App created in App Store Connect
- [ ] Bundle ID matches app.json: com.noorcbt.app (or actual)
- [ ] App name reserved: "Noor"
- [ ] Primary language set: English
- [ ] Category set: Health & Fitness

**In-App Purchases (Subscriptions):**
- [ ] Subscription group created: "Noor Subscriptions"
- [ ] Product IDs created in App Store Connect:
  - [ ] `com.noor.plus.monthly` ($6.99/month)
  - [ ] `com.noor.plus.yearly` ($69/year)
  - [ ] `com.noor.pro.monthly` ($11.99/month)
  - [ ] `com.noor.pro.yearly` ($119/year)
- [ ] Subscription descriptions written
- [ ] Pricing configured for all regions
- [ ] Subscription reviewed and approved (may take 24-48 hours)

**Metadata:**
- [ ] App name: "Noor"
- [ ] Subtitle: "Islamic CBT companion for mindful reflection"
- [ ] Description written (see release/STORE_PACK/apple/APP_STORE_METADATA.md)
- [ ] Keywords entered (10 max)
- [ ] Support URL entered
- [ ] Marketing URL entered (optional)
- [ ] Privacy Policy URL entered

**Screenshots:**
- [ ] 10 screenshots captured (6.5" iPhone and 5.5" iPhone)
- [ ] Screenshots uploaded in correct order
- [ ] Screenshot captions written
- [ ] App preview video uploaded (optional but recommended)

**App Review Information:**
- [ ] Contact information provided
- [ ] Demo account info (N/A - no login required)
- [ ] Review notes written (see release/STORE_PACK/apple/APP_STORE_METADATA.md)
- [ ] Age rating completed: 12+
- [ ] Content rights verified

**Build Upload:**
- [ ] Production build created: `npx eas build --profile production --platform ios`
- [ ] Build uploaded to App Store Connect
- [ ] Build processing complete (can take 10-30 minutes)
- [ ] Build selected for submission

### Submission

- [ ] All sections marked as complete (green checkmarks)
- [ ] "Submit for Review" button clicked
- [ ] Submission confirmation received
- [ ] Status shows "Waiting for Review"

### Post-Submission

**Monitor Status:**
- [ ] Check status daily in App Store Connect
- [ ] Respond to any App Review questions within 24 hours
- [ ] Address rejection reasons if rejected

**If Rejected:**
- [ ] Read rejection reason carefully
- [ ] Fix issues identified
- [ ] Update build if code changes required
- [ ] Resubmit with response to reviewer

**If Approved:**
- [ ] Verify app appears in App Store
- [ ] Test download and installation
- [ ] Test in-app purchases in production
- [ ] Monitor crash reports
- [ ] Monitor user reviews

---

## Google Play Store Submission Checklist

### Pre-Submission (Code Complete)

**App Requirements:**
- [ ] All tests passing
- [ ] No crash on launch
- [ ] HTTPS-only connections
- [ ] Cleartext traffic disabled (cleartextTrafficPermitted="false")
- [ ] No localhost URLs in production build
- [ ] App works offline
- [ ] Crisis resources accessible

**Legal Documents:**
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Privacy Policy URL: https://noorcbt.com/privacy
- [ ] Terms URL: https://noorcbt.com/terms

**Google Play Console Setup:**
- [ ] Developer account active ($25 one-time fee paid)
- [ ] App created in Play Console
- [ ] App name set: "Noor"
- [ ] Package name: com.noorcbt.app (must match app.json)
- [ ] Category: Health & Fitness
- [ ] Tags added

**In-App Products (Subscriptions):**
- [ ] Subscription products created in Play Console:
  - [ ] `noor_plus_monthly` ($6.99/month)
  - [ ] `noor_plus_yearly` ($69/year)
  - [ ] `noor_pro_monthly` ($11.99/month)
  - [ ] `noor_pro_yearly` ($119/year)
- [ ] Base plans configured
- [ ] Pricing set for all countries
- [ ] Subscription activated

**Store Listing:**
- [ ] App name: "Noor"
- [ ] Short description (80 chars): See release/STORE_PACK/google/PLAY_STORE_METADATA.md
- [ ] Full description (4000 chars): See metadata file
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Screenshots uploaded (minimum 2, recommend 8)
- [ ] Privacy Policy URL entered
- [ ] Contact details entered (email, phone optional)

**Content Rating:**
- [ ] Content rating questionnaire completed
- [ ] Rating assigned (likely "Everyone" or "Teen")
- [ ] Rating certificate downloaded

**Data Safety:**
- [ ] Data safety form completed (see release/STORE_PACK/google/PLAY_STORE_METADATA.md)
- [ ] Data collection disclosed accurately
- [ ] Data sharing disclosed (third-party AI processing partner)
- [ ] Data security practices documented
- [ ] Data retention disclosed

**App Content:**
- [ ] Target audience: Ages 13+
- [ ] News app: No
- [ ] COVID-19 app: No
- [ ] Ads: No

**Build Upload:**
- [ ] Production build created: `npx eas build --profile production --platform android`
- [ ] AAB file uploaded to Play Console (Internal Testing first)
- [ ] Version code incremented
- [ ] Release notes written

### Internal Testing (Recommended)

- [ ] Internal testing track created
- [ ] Build uploaded to Internal Testing
- [ ] Testers invited (email addresses)
- [ ] At least 5 testers complete full flow
- [ ] All critical issues fixed

### Production Submission

**Production Track:**
- [ ] Build promoted from Internal Testing to Production
- [ ] OR new build uploaded directly to Production
- [ ] Release name: e.g., "Version 1.0.0"
- [ ] Release notes written (user-facing)
- [ ] Countries/regions selected (or "All countries")
- [ ] Staged rollout percentage: 10% (recommended for first release)

**Review and Publish:**
- [ ] All sections complete
- [ ] "Review release" button clicked
- [ ] "Start rollout to Production" confirmed
- [ ] Submission status: "Pending publication"

### Post-Submission

**Monitor Status:**
- [ ] Check status in Play Console
- [ ] Respond to any questions from Google
- [ ] Address rejection if rejected

**If Rejected:**
- [ ] Read rejection reason
- [ ] Fix issues
- [ ] Resubmit

**If Approved:**
- [ ] Monitor staged rollout (10% → 50% → 100%)
- [ ] Check crash reports in Play Console
- [ ] Monitor ANR (App Not Responding) rate
- [ ] Monitor user reviews and ratings
- [ ] Increase rollout percentage gradually

---

## Security Checklist

**Code Security:**
- [ ] No secrets in code (API keys, passwords)
- [ ] All secrets in environment variables
- [ ] No console.log() of sensitive data
- [ ] Error messages sanitized (no secrets exposed)
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (using Drizzle ORM)
- [ ] XSS prevention (React Native auto-escapes)

**Network Security:**
- [ ] All API calls use HTTPS
- [ ] SSL certificate valid and trusted
- [ ] TLS 1.2 or higher
- [ ] Certificate pinning (optional, advanced)
- [ ] Timeout handling on network requests
- [ ] Retry logic with exponential backoff

**Data Security:**
- [ ] PII encrypted at rest (AES-256-GCM)
- [ ] User IDs hashed
- [ ] No plaintext passwords stored (no auth currently)
- [ ] Local storage encrypted (AsyncStorage + encryption)
- [ ] Session tokens secured (if added later)

**Backend Security:**
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] SQL parameterized queries only
- [ ] Authentication middleware (if adding auth)
- [ ] Authorization checks on protected routes
- [ ] Database backups enabled
- [ ] Secrets rotated before launch

**Vulnerability Scanning:**
- [ ] `npm audit` shows 0 high vulnerabilities
- [ ] Dependencies up to date
- [ ] Known CVEs patched

---

## Privacy Checklist

**Data Collection Transparency:**
- [ ] Privacy Policy accurately describes data collection
- [ ] Users informed during onboarding
- [ ] No hidden data collection
- [ ] Data Safety forms match actual behavior

**Data Minimization:**
- [ ] Only collect necessary data
- [ ] No tracking IDs (advertising ID, etc.)
- [ ] No location data collected
- [ ] No contacts access
- [ ] No unnecessary permissions requested

**Data Storage:**
- [x] Reflections stored on server (encrypted, 30-day retention)
- [x] Session metadata stored for 30 days max
- [ ] No PII in server logs
- [ ] Encryption at rest for server data
- [ ] Database access restricted

**Data Sharing:**
- [ ] Third-party AI processing disclosed
- [ ] No data sold to third parties
- [ ] No data shared with advertisers
- [ ] Apple/Google billing only (no external payments)
- [ ] Privacy Policy lists all third parties accurately

**User Rights:**
- [ ] Users can delete reflections locally
- [ ] Users can export data (Premium feature)
- [ ] No account deletion needed (no account)
- [ ] Uninstall removes all local data

**Compliance:**
- [ ] COPPA compliant (ages 13+)
- [ ] GDPR considerations documented
- [ ] CCPA considerations documented
- [ ] Apple Privacy Manifest created (iOS 17+, if applicable)

---

## Crisis and Safety Checklist

**Crisis Detection:**
- [ ] Crisis language detection active
- [ ] 988 Suicide & Crisis Lifeline displayed
- [ ] Crisis resources screen accessible from all screens
- [ ] "Get Help" button visible in navigation

**Crisis Resources Verification:**
- [ ] 988 number tap-to-call works (iOS and Android)
- [ ] Crisis Text Line (741741) works
- [ ] Crisis resources screen tested manually
- [ ] Resources display immediately on crisis detection
- [ ] No delay in showing resources

**Safety Boundaries:**
- [ ] Onboarding clearly states app is not therapy
- [ ] Onboarding states app is not crisis intervention
- [ ] AI disclosure: "Uses an AI companion, not a human therapist"
- [ ] Warning on SafetyScreen about AI fallibility
- [ ] No medical or diagnostic claims in copy

**AI Safety:**
- [ ] Canonical orchestrator active on all AI endpoints
- [ ] Charter compliance validation enabled
- [ ] Tone compliance checking enabled
- [ ] Fallback language triggers on validation failure
- [ ] Safety telemetry logging safety events
- [ ] All 79 safety tests passing

**Scrupulosity Handling:**
- [ ] Scrupulosity detection active
- [ ] Mercy-focused responses for high distress
- [ ] Pacing controller slows interactions appropriately
- [ ] Reassurance vs. engagement balance maintained

**Islamic Content Safety:**
- [ ] Only whitelisted Quran verses used
- [ ] Hadith from authenticated collections only
- [ ] No fatwas or religious rulings generated
- [ ] Disclaimer: "Verify with scholars" present
- [ ] Content reviewed by Islamic scholar (pending)

---

## Subscription Checklist

### Free Tier (Default)

**Features:**
- [ ] 1 reflection per day limit enforced
- [ ] Basic CBT journey accessible
- [ ] Crisis resources available
- [ ] Dhikr-based grounding practices available
- [ ] Onboarding accessible
- [ ] Profile screen accessible

**Testing:**
- [ ] Complete 1 reflection successfully
- [ ] Attempt 2nd reflection same day → see upgrade prompt
- [ ] Verify daily limit resets next day
- [ ] Upgrade prompt shows correct pricing

### Noor Plus (Monthly: $6.99/mo, Yearly: $69/yr)

**Features:**
- [ ] All rooms accessible
- [ ] Full journaling
- [ ] Full history access
- [ ] Basic insights available
- [ ] One persona

**Purchase Flow:**
- [ ] Tap "Upgrade" from free tier limit screen
- [ ] Pricing screen shows both Monthly and Yearly options
- [ ] Price displays correctly for user's region
- [ ] Terms and Privacy Policy links work
- [ ] "Restore Purchases" button visible
- [ ] Purchase via Apple IAP (iOS) or Google Play Billing (Android)
- [ ] Success screen shows after purchase
- [ ] Features unlock immediately after purchase

**Testing:**
- [ ] Purchase Plus Monthly in sandbox
- [ ] Verify unlimited reflections unlocked
- [ ] Verify History screen now shows all reflections
- [ ] Test subscription renewal (sandbox)
- [ ] Test subscription cancellation

### Noor Pro (Monthly: $11.99/mo, Yearly: $119/yr)

**Features:**
- [ ] All Plus features included
- [ ] All personas accessible
- [ ] Advanced insights dashboard
- [ ] Deeper pattern tracking
- [ ] Export reflection data (JSON)
- [ ] Priority features

**Purchase Flow:**
- [ ] Can upgrade from Free → Pro directly
- [ ] Can upgrade from Plus → Pro
- [ ] Price difference handled correctly (proration)
- [ ] All Pro features unlock after purchase

**Testing:**
- [ ] Purchase Pro Monthly in sandbox
- [ ] Verify all Pro features accessible
- [ ] Test export data functionality
- [ ] Test all personas
- [ ] Verify Plus features still work

### Subscription Management

**Restore Purchases:**
- [ ] "Restore Purchases" button on Pricing screen
- [ ] Restoring works after reinstall
- [ ] Restoring works on new device with same Apple ID/Google account
- [ ] Loading indicator shows during restore
- [ ] Success/failure message displayed

**Subscription Status:**
- [ ] Current tier displayed in Profile screen
- [ ] Renewal date shown (if subscribed)
- [ ] Manage Subscription button links to App Store/Play Store
- [ ] Free tier shown correctly after cancellation

**Sandbox Testing:**
- [ ] iOS: Sandbox tester account created in App Store Connect
- [ ] Android: Test license uploaded to Play Console
- [ ] Purchases work in sandbox
- [ ] Subscriptions can be canceled in sandbox
- [ ] Time acceleration works (iOS sandbox: 1 day = 5 minutes)

---

## Rollback Checklist

### Pre-Rollback Decision

**Severity Assessment:**
- [ ] P0 (Critical): Immediate rollback required
- [ ] P1 (High): Rollback within 1 hour
- [ ] P2 (Medium): Fix forward or schedule rollback
- [ ] P3 (Low): Fix in next release

**Rollback Triggers:**
- [ ] App crashes on launch for all users
- [ ] Data loss or corruption
- [ ] Security vulnerability exposed
- [ ] Payment flow completely broken
- [ ] Critical AI safety failure

### Backend Rollback

**Google Cloud Rollback:**
- [ ] Identify last known good container revision in Cloud Run
- [ ] Roll back to previous revision via Console or CLI
- [ ] Verify deployment: `curl https://api.noorcbt.com/health`
- [ ] Monitor Cloud Logging for errors
- [ ] Run smoke tests
- [ ] If database issue: restore from Cloud SQL automated backup

### Mobile Rollback

**iOS:**
- [ ] Note: App Store does not support rollback
- [ ] Option 1: Submit expedited hotfix (24-48 hours)
- [ ] Option 2: Remove app temporarily (extreme measure)
- [ ] Communicate with users via app store description update
- [ ] Prepare hotfix build immediately
- [ ] Request expedited review from Apple

**Android:**
- [ ] Note: Play Store does not support automatic rollback
- [ ] Option 1: Halt staged rollout immediately (if in progress)
- [ ] Option 2: Submit hotfix
- [ ] If halted: Fix issue, resume rollout
- [ ] If hotfix: Submit new build with increased version code
- [ ] Monitor crash reports during recovery

### Post-Rollback

**Communication:**
- [ ] Notify team of rollback
- [ ] Update status page (if applicable)
- [ ] Respond to user support requests
- [ ] Update app store reviews acknowledging issue

**Post-Mortem:**
- [ ] Document what went wrong
- [ ] Identify root cause
- [ ] Create action items to prevent recurrence
- [ ] Update testing procedures
- [ ] Update this checklist with lessons learned

**Recovery:**
- [ ] Fix identified issue
- [ ] Add regression test
- [ ] Test thoroughly in staging
- [ ] Gradual rollout (10% → 50% → 100%)
- [ ] Monitor closely during recovery

---

## Final Launch Checklist

**T-7 Days (One Week Before Launch):**
- [ ] All checklists above completed
- [ ] Legal review complete
- [ ] Scholar review complete
- [ ] All documentation finalized
- [ ] Monitoring configured
- [ ] Support email configured
- [ ] Emergency contact list created

**T-3 Days (Three Days Before):**
- [ ] Final smoke tests passing
- [ ] No P0/P1 bugs outstanding
- [ ] Crash rate < 0.1%
- [ ] Backend stable for 7 days
- [ ] App Store/Play Store metadata finalized
- [ ] Screenshots uploaded
- [ ] Subscriptions configured and tested

**T-1 Day (Day Before):**
- [ ] Builds submitted to stores
- [ ] Status: "Waiting for Review"
- [ ] Team notified of submission
- [ ] Support team prepared
- [ ] Announcement materials ready

**Launch Day:**
- [ ] Apps approved and live
- [ ] Test downloads from stores
- [ ] Test in-app purchases in production
- [ ] Monitor crash reports
- [ ] Monitor API logs
- [ ] Respond to first user reviews
- [ ] Celebrate! 🎉

---

**Last Updated**: 2026-01-19  
**Next Review**: After first production launch
