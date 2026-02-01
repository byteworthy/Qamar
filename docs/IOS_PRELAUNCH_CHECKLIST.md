# iOS App Store Pre-Launch Checklist - Noor

**Date:** January 31, 2026
**Target Launch:** February 2026
**App:** Noor - Islamic Mental Health
**Category:** Health & Fitness → Mental Health

---

## Phase 1: Apple Developer Account Setup

- [ ] **Apple Developer Program membership** ($99/year)
  - Enroll at https://developer.apple.com/programs/
  - Business or individual account (individual OK for solo dev)
  - Verify identity (2-3 business days)

- [ ] **App Store Connect access**
  - Access at https://appstoreconnect.apple.com
  - Complete profile (name, email, phone)
  - Set up two-factor authentication

- [ ] **Create App ID**
  - Bundle ID: com.noor.app (or similar, must match Xcode)
  - Enable capabilities: In-App Purchase, Push Notifications

- [ ] **Tax & Banking information**
  - Complete Agreements, Tax, and Banking section
  - Required for paid apps or in-app purchases
  - W-9 (US) or equivalent tax form
  - Bank account for revenue payments

---

## Phase 2: App Store Connect Configuration

- [ ] **Create new app record**
  - Name: Noor: Islamic Mental Health
  - Primary Language: English (U.S.)
  - Bundle ID: Select from dropdown
  - SKU: NOOR-001 (or any unique identifier)

- [ ] **App Information**
  - Privacy Policy URL: https://noor-app.com/privacy
  - Category: Primary - Health & Fitness, Secondary - Lifestyle
  - Content Rights: You own all rights to content
  - Age Rating: 12+ (unrestricted web access, medical/treatment info)

- [ ] **Pricing and Availability**
  - Price: Free (with in-app purchases)
  - Availability: All territories (or select specific countries)
  - Pre-orders: No (launch immediately upon approval)

---

## Phase 3: App Store Metadata (Copy from APPLE_APP_STORE_METADATA.md)

- [ ] **App Title:** `Noor: Islamic Mental Health` (27/30 chars) ✅

- [ ] **Subtitle:** `CBT Therapy & Wellness App` (26/30 chars) ✅

- [ ] **Promotional Text:** (See metadata doc, 168/170 chars) ✅

- [ ] **Description:** (See metadata doc, 3,998/4,000 chars) ✅

- [ ] **Keywords:** `islamic,muslim,cbt,therapy,counseling,anxiety,depression,wellness,quran,mindfulness,halal,journal` (98/100 chars) ✅

- [ ] **Support URL:** https://noor-app.com/support

- [ ] **Marketing URL:** https://noor-app.com (optional)

---

## Phase 4: Visual Assets

### App Icon
- [ ] **1024x1024 PNG** (required, no transparency, no alpha channel)
  - Design: Noor logo/branding
  - No text (Apple may reject icons with readable text)
  - Test visibility at small sizes (60x60)

###

 Screenshots
- [ ] **iPhone 6.7" (1290x2796)** - 3 to 10 screenshots (5-6 recommended)
  - Screenshot 1: Welcome/Islamic greeting ✅
  - Screenshot 2: Thought Capture (CBT) ✅
  - Screenshot 3: AI-generated reframe + Quran verse ✅
  - Screenshot 4: Daily Islamic content ✅
  - Screenshot 5: Progress/journey levels ✅
  - Screenshot 6 (optional): Privacy features ✅

- [ ] **iPhone 6.5" (1284x2778)** - Same screenshots, resized

- [ ] **iPad Pro 12.9" (2048x2732)** - 2 to 5 screenshots (2-3 recommended)
  - iPad Screenshot 1: Home screen (optimized for iPad) ✅
  - iPad Screenshot 2: Journaling experience ✅

### App Preview Video (Optional)
- [ ] **iPhone 6.7" video** (15-30 seconds, .mp4 or .m4v, H.264/HEVC)
  - Show app in action (thought capture → AI reframe → Quranic verse)
  - No audio required (but recommended with Islamic background music)
  - Max file size: 500MB

---

## Phase 5: In-App Purchases (Noor Plus)

- [ ] **Create In-App Purchase**
  - Type: Auto-Renewable Subscription
  - Reference Name: Noor Plus Monthly
  - Product ID: com.noor.app.plus.monthly
  - Subscription Group: Noor Plus
  - Duration: 1 month
  - Price: $4.99/month (Tier 5)

- [ ] **Subscription Details**
  - Display Name: Noor Plus
  - Description: Unlock advanced insights, full dua library, and priority AI
  - Promotional Image: 1024x1024 (optional but recommended)

- [ ] **Subscription Options** (if offering multiple tiers)
  - Monthly: $4.99/month
  - Yearly: $39.99/year (save 33%)

- [ ] **Introductory Offer** (optional)
  - 7-day free trial (recommended for mental health apps)
  - Or: $0.99 for first month

---

## Phase 6: Privacy & Compliance

### Privacy Manifest (PrivacyInfo.xcprivacy)
- [ ] **File exists:** ios/PrivacyInfo.xcprivacy ✅ (already in codebase)

- [ ] **Verify contents:**
  - NSPrivacyTracking: false ✅
  - NSPrivacyTrackingDomains: [] ✅
  - NSPrivacyCollectedDataTypes: User Content (journal entries) ✅
  - NSPrivacyAccessedAPITypes: None or declare if using restricted APIs

### Info.plist Permissions
- [ ] **NSFaceIDUsageDescription** ✅
  ```
  Noor uses Face ID to securely protect your personal reflections and mental health journal.
  ```

- [ ] **NSCameraUsageDescription** (if adding photo feature later)
- [ ] **NSPhotoLibraryUsageDescription** (if adding export to photos)

### App Privacy Details (in App Store Connect)
- [ ] **Data Collection:**
  - Contact Info: Email address (for account)
  - User Content: Journal entries (encrypted, not shared)
  - Usage Data: Analytics (anonymized, optional)

- [ ] **Data Use:**
  - App Functionality: All collected data used only for app features
  - No third-party sharing or advertising

- [ ] **Data Security:**
  - Data encrypted in transit: Yes (HTTPS)
  - Data encrypted on device: Yes (iOS Keychain)
  - User can request deletion: Yes (account deletion)

---

## Phase 7: App Review Information

- [ ] **Demo Account for Reviewers**
  - Email: reviewer@noor-app.com
  - Password: [Create secure password, save in 1Password/LastPass]
  - Instructions: "1. Launch app 2. Tap 'Get Started' 3. Enter demo account 4. Explore Reflection → Calming Practice → Daily Content"

- [ ] **Review Notes** (see APP_STORE_REVIEW_GUIDE.md for full template)
  ```
  Noor is an Islamic mental wellness app combining Cognitive Behavioral Therapy (CBT)
  with authentic Quranic content and Hadith.

  Key Features to Test:
  1. Thought Capture → AI-generated Islamic reframe
  2. Daily Quranic verse (authentic sources: Sahih Bukhari, Sahih Muslim)
  3. Calming practices (dhikr, mindfulness)
  4. Progress insights (Premium feature - demo account has Premium access)

  Privacy & Security:
  - All journal entries encrypted (iOS Keychain)
  - Biometric authentication optional
  - No third-party tracking or ads

  AI Usage:
  - Claude API (Anthropic) for thought reframing
  - No user data sent to third parties beyond API call
  - Privacy policy: https://noor-app.com/privacy

  Islamic Content:
  - Quran text from verified sources
  - Hadith from Sahih collections
  - Content reviewed for Islamic accuracy
  ```

- [ ] **Contact Information**
  - First Name: [Your name]
  - Last Name: [Your name]
  - Phone: [Your phone number]
  - Email: support@noor-app.com

- [ ] **Attachments** (if explaining complex features)
  - Upload demo video or screenshot walkthrough (optional)

---

## Phase 8: Build Preparation & Upload

### Xcode Configuration
- [ ] **General Tab:**
  - Display Name: Noor
  - Bundle Identifier: com.noor.app (matches App Store Connect)
  - Version: 1.0.0
  - Build: 1

- [ ] **Signing & Capabilities:**
  - Team: Select your Apple Developer team
  - Automatically manage signing: ✅ (recommended)
  - Certificate: Apple Distribution
  - Provisioning Profile: Auto-generated

- [ ] **Info Tab:**
  - All required privacy descriptions present ✅
  - Bundle display name: Noor
  - Supported interface orientations: Portrait (lock landscape if not supported)

### Build Settings
- [ ] **Deployment Target:** iOS 14.0 or later (check React Native compatibility)
- [ ] **Architectures:** Standard (arm64 for devices, x86_64 for simulator)
- [ ] **Bitcode:** Disabled (not required for React Native Expo apps)

### App Icon Sets
- [ ] **AppIcon.appiconset** in Assets.xcassets
  - All required sizes: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024
  - Use Asset Catalog or Expo's icon generation

### Build for Release
- [ ] **Scheme:** Set to "Release" (not Debug)
- [ ] **Archive:** Product → Archive in Xcode
- [ ] **Validate:** Click "Validate App" before uploading (catches errors early)
- [ ] **Distribute:** Choose "App Store Connect" → Upload

### TestFlight Beta Testing (Recommended)
- [ ] **Internal Testing:**
  - Add internal testers (up to 100)
  - Test for 1-2 weeks before public release
  - Collect feedback on bugs, UX, Islamic content accuracy

- [ ] **External Testing (Optional):**
  - Submit for Beta App Review (similar process to full review)
  - Add external testers (Muslim community members for feedback)
  - Test for 2-4 weeks

---

## Phase 9: Final Pre-Submission Checks

### Legal & Compliance
- [ ] **Age Rating Questionnaire Completed:**
  - Violence: None
  - Sexual Content: None
  - Language: Infrequent/Mild (if any)
  - Substances: None
  - Medical/Treatment Information: Yes (mental health content)
  - Unrestricted Web Access: Yes (if app has web views or external links)
  - **Result:** 12+ rating ✅

- [ ] **Export Compliance:** Determine if app uses encryption
  - If using HTTPS only: No export compliance required (standard practice)
  - If custom encryption: May need ERN (Encryption Registration Number)
  - For Noor: HTTPS + iOS Keychain = **No export compliance filing** ✅

- [ ] **Content Rights:** Confirm ownership of all content
  - Quranic verses: Public domain ✅
  - Hadith: Public domain (Sahih collections) ✅
  - App code: Owned by developer ✅
  - Design assets: Owned or licensed ✅

### Testing
- [ ] **Device Testing:**
  - Test on physical iPhone (not just simulator)
  - Test on physical iPad (if supporting iPad)
  - Test on older devices (iPhone 11, 12 if possible)
  - Test on latest iOS version (iOS 17 as of January 2026)

- [ ] **Feature Testing:**
  - Onboarding flow works end-to-end
  - Thought capture → AI reframe → Quranic verse flow works
  - Daily content loads correctly
  - Calming practices playback correctly
  - Progress insights display (Premium feature)
  - In-app purchase flow works (test in Sandbox environment)
  - Biometric authentication works (Face ID / Touch ID)

- [ ] **Edge Cases:**
  - App works offline (journal entries saved locally)
  - App handles poor internet connection gracefully
  - App doesn't crash when API fails (Claude API timeout)
  - Logout / re-login works
  - Data persists after app restart

- [ ] **Security Testing:**
  - Journal entries encrypted (check iOS Keychain)
  - Screenshot prevention on sensitive screens works
  - Biometric prompt shows correct message
  - No console.logs in production build

### Performance
- [ ] **App Size:** <100MB (recommended for faster downloads)
- [ ] **Launch Time:** <3 seconds on average device
- [ ] **Memory Usage:** No memory leaks (test with Instruments)
- [ ] **Battery Usage:** Not excessive (no background processing unless needed)

---

## Phase 10: Submission

- [ ] **Submit for Review:**
  - Review all sections one final time
  - Click "Submit for Review" in App Store Connect
  - Wait for "Waiting for Review" status

- [ ] **Monitor Status:**
  - In Review (usually 24-48 hours)
  - Pending Developer Release (approved, waiting for your release)
  - Ready for Sale (live on App Store!)

- [ ] **Common Rejection Reasons (Be Prepared):**
  1. **Guideline 2.1 - App Completeness:** Demo account doesn't work
     - *Fix:* Test demo account thoroughly before submission
  2. **Guideline 4.3 - Spam:** App too similar to other mental health apps
     - *Response:* Emphasize Islamic + CBT unique positioning
  3. **Guideline 5.1.1 - Privacy:** Privacy policy incomplete
     - *Fix:* Ensure privacy policy URL works and covers all data collection
  4. **Guideline 2.3.8 - Metadata:** Screenshots misleading or not from actual app
     - *Fix:* Ensure all screenshots are from real app (not mockups)

---

## Phase 11: Post-Approval Launch

- [ ] **Release Strategy:**
  - **Option A:** Automatic release (app goes live immediately upon approval)
  - **Option B:** Manual release (you control when it goes live)
    - Recommended: Manual release for coordinated PR/marketing launch

- [ ] **Launch Day Checklist:**
  - [ ] Announce on social media (Twitter, Instagram, Facebook)
  - [ ] Email newsletter to waitlist (if applicable)
  - [ ] Post in Muslim community forums/groups
  - [ ] Reach out to Islamic influencers for reviews
  - [ ] Monitor App Store reviews (respond within 24 hours)
  - [ ] Track downloads in App Store Connect analytics

- [ ] **First Week Monitoring:**
  - [ ] Check crash reports daily (App Store Connect → App Analytics → Crashes)
  - [ ] Monitor reviews for bugs or issues
  - [ ] Track keyword rankings (use Sensor Tower or AppFollow)
  - [ ] Measure impression-to-install conversion rate (target: 8-12%)

---

## Success Metrics (First 30 Days)

### Downloads
- **Target:** 1,000-5,000 downloads (organic + word-of-mouth)
- **Stretch Goal:** 10,000 downloads (if PR/influencer marketing successful)

### Ratings
- **Target:** 4.5+ average rating
- **Target:** 50+ reviews (ask happy users to leave reviews)

### Conversion
- **Impression → Install:** 8-12%
- **Install → Active User (opened app 3+ times):** 40%+
- **Free → Premium Conversion:** 5-10%

### Keyword Rankings
- Islamic therapy: Top 10
- Muslim mental health: Top 10
- CBT Islamic: Top 3

---

## Troubleshooting Common Issues

### Build Upload Fails
- **Error:** Invalid provisioning profile
  - *Fix:* Regenerate certificates in Xcode (Preferences → Accounts → Manage Certificates)
- **Error:** Missing compliance info
  - *Fix:* Answer export compliance questions in App Store Connect

### App Review Rejection
- **Reason:** Demo account issues
  - *Fix:* Provide working demo account, test credentials 3 times before resubmission
- **Reason:** Privacy policy missing data types
  - *Fix:* Update privacy policy to explicitly mention all data collection

### TestFlight Build Not Appearing
- **Issue:** Build uploaded but not showing in TestFlight
  - *Wait:* Processing can take 10-60 minutes
  - *Check:* App Store Connect → TestFlight → Builds → Processing status

---

**Checklist Complete:** ___ / 85 items ✅

**Estimated Time to Complete:** 8-12 hours (spread over 2-3 days)

**Critical Path:**
1. Developer account setup (Day 1)
2. App metadata + assets (Day 2)
3. Build upload + TestFlight (Day 3)
4. Beta testing (Week 1-2)
5. Submission (Week 3)
6. Review process (1-7 days)
7. Launch! 🚀

---

**Document Version:** 1.0
**Created:** January 31, 2026
**Last Updated:** January 31, 2026

**READY FOR iOS APP STORE SUBMISSION** ✅
