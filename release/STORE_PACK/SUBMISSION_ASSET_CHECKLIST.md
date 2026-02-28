# App Store Submission Asset Checklist - Qamar

**iOS App Store Connect Requirements**
**Last Updated:** January 2026

---

## STEP 4: Pre-Submission Asset Verification

Use this checklist to ensure all required assets are ready before clicking "Submit for Review."

---

## 📱 App Icon Requirements

### Required Sizes for iOS
- [x] **1024x1024 pixels** - App Store icon (PNG, no alpha channel)
  - Location: `assets/images/icon.png`
  - Must be square, no rounded corners (Apple adds them)
  - RGB color space (not CMYK)
  - No transparency

### Icon Content Requirements
- [ ] Icon does NOT contain text
- [ ] Icon does NOT duplicate iOS interface elements
- [ ] Icon is clear and recognizable at small sizes
- [ ] Icon matches brand identity

**Current icon location:** `assets/images/icon.png` (verify this is 1024x1024)

---

## 📸 Screenshot Requirements

### iPhone Required Screenshots (MINIMUM 1 SET)

**6.7" Display (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max)**
- Resolution: **1290 x 2796 pixels** (portrait) or 2796 x 1290 (landscape)
- Minimum: 3 screenshots
- Maximum: 10 screenshots
- Format: PNG or JPG

**Alternative: 6.5" Display (iPhone 11 Pro Max, XS Max)**
- Resolution: **1242 x 2688 pixels** (portrait)

### Recommended Screenshot Sequence

**Screenshot 1: Home Screen / Welcome**
- Shows: Main interface with daily content
- Purpose: First impression of app layout
- Screen: `HomeScreen.tsx`
- Key elements: Navigation, daily reflection prompt, Quran reading access

**Screenshot 2: Quran Reader**
- Shows: Quran reader with Arabic text and translation
- Purpose: Demonstrates core Quran reading functionality
- Screen: `QuranReaderScreen.tsx`
- Key elements: Arabic text, English translation, surah navigation

**Screenshot 3: Daily Reflection**
- Shows: Personalized reflection response
- Purpose: Shows personalized reflection features
- Screen: `ReflectionScreen.tsx`
- Key elements: Reflective response, clear formatting

**Screenshot 4: Arabic Learning**
- Shows: Arabic language learning interface
- Purpose: Demonstrates vocabulary and language features
- Screen: `ArabicLearningScreen.tsx`
- Key elements: Arabic vocabulary, pronunciation, learning progress

**Screenshot 5: Prayer & History (Optional)**
- Shows: Prayer support and past reflections
- Purpose: Shows daily practice support and long-term value
- Screen: `PrayerScreen.tsx` or `HistoryScreen.tsx`

### Screenshot Preparation Tools
- Use iOS Simulator (Xcode)
- Device: iPhone 15 Pro Max
- Command: `Cmd + S` to save screenshot
- Ensure screenshots show real content (not placeholder text)
- Remove any test data that looks unprofessional

### Screenshot Content Rules
- [ ] No personal/sensitive information visible
- [ ] All text is legible
- [ ] UI is clean (no debug overlays)
- [ ] Status bar shows full signal/battery (or hide it)
- [ ] Example journal entries are appropriate and safe
- [ ] Safety disclaimer screenshot is included

---

## 📝 App Metadata Checklist

### App Information
- [x] **App Name**: Qamar
- [x] **Subtitle**: Quran · Arabic Learning · Prayer · Reflection
- [x] **Privacy Policy URL**: https://byteworthy.github.io/Qamar/legal/privacy.html
- [x] **Category**: Lifestyle (primary)
- [ ] **Category**: Education (optional secondary)
- [x] **Support URL**: mailto:support@byteworthy.com or website with contact form

### Age Rating
- [x] **Age Rating**: 4+
  
**Questionnaire Answers:**
- Simulated Gambling: NO
- Unrestricted Web Access: NO
- Medical/Treatment Information: **NO** (education and personal development content)
- Frequent/Intense Mature/Suggestive Themes: NO
- Horror/Fear Themes: NO
- Violence: NO
- Profanity or Crude Humor: NO

**Result: 4+** (educational and lifestyle content suitable for all ages)

### Pricing
- [ ] **Free with In-App Purchases** (if Qamar Plus is active)
  OR
- [ ] **Free** (if no IAP at launch)

### App Review Information
- [x] **Contact Email**: support@byteworthy.com
- [x] **Phone Number**: [Add if available]
- [x] **Review Notes**: Use `APP_STORE_REVIEW_NOTES.md` content
- [ ] **Demo Account**: Create if app requires login for full functionality
  - Email: [if needed]
  - Password: [if needed]

---

## 🔒 Privacy & Compliance

### App Privacy Questionnaire (App Store Connect)

**Data Collection:**
- [x] Contact Info → Email Address (if account created)
- [x] User Content → Other User Content (journal entries)
- [x] Usage Data → Product Interaction (session data for improvements)

**Data Use:**
- [x] App Functionality (content storage, content processing)
- [x] Analytics (crash reports via Sentry)

**Third-Party Partners:**
- [x] Anthropic (content processing)
- [x] Sentry (error tracking)

**Data Linked to User:**
- Email (if account created)
- Journal entries

**Tracking:**
- [ ] NO tracking for advertising
- [ ] NO data sold to third parties

---

## ✅ Pre-Submission Verification

### Technical Requirements
- [ ] App builds successfully with production config
- [ ] App runs on physical iOS device (not just simulator)
- [ ] All API endpoints use production URLs
- [ ] API keys are production keys (not test keys)
- [ ] Sentry is configured for production
- [ ] Backend is live and health checks pass

### Content Requirements
- [x] App description written and approved
- [x] App Store review notes prepared
- [x] Safety disclaimers visible in app
- [x] Privacy Policy publicly accessible
- [x] Crisis resources displayed (988, 741741, 911)

### Asset Requirements
- [ ] App icon (1024x1024) ready
- [ ] 3-5 screenshots captured and exported
- [ ] Screenshots show safety disclaimer screen
- [ ] Screenshots show real app content (not placeholders)

### Legal Requirements
- [x] Privacy Policy URL active
- [x] Terms of Service URL active (optional but recommended)
- [x] Contact email valid and monitored
- [x] No medical claims in description
- [x] No therapy claims in description
- [x] No crisis intervention claims

---

## 🎯 Common Rejection Traps - Double Check

Before clicking "Submit for Review," verify:

- [ ] ✓ NO claims of medical diagnosis or treatment
- [ ] ✓ NO claims of being therapy or counseling
- [ ] ✓ NO claims of HIPAA compliance
- [ ] ✓ NO emergency or crisis support promises
- [ ] ✓ Technology usage IS disclosed in description
- [ ] ✓ Content limitations ARE disclosed to users
- [ ] ✓ Safety disclaimer IS visible during onboarding
- [ ] ✓ Privacy Policy IS publicly accessible
- [ ] ✓ App DOES work without login (or demo account provided)
- [ ] ✓ Screenshots DO include safety disclaimer
- [ ] ✓ App description MATCHES actual functionality

---

## 📦 Build Requirements

### Before Building for Submission
1. Update version in `app.json`
2. Update build number (increment from previous)
3. Switch to production API endpoint
4. Use production Sentry DSN
5. Remove any debug logs
6. Test on physical device

### EAS Build Commands (if using EAS)
```bash
# Production build for iOS
eas build --platform ios --profile production

# After build completes, download .ipa or submit directly
eas submit --platform ios
```

---

## 🚦 Ready to Submit?

Complete this final checklist:

- [ ] Icon uploaded (1024x1024)
- [ ] Screenshots uploaded (3-5 minimum)
- [ ] App description copied from `APP_STORE_DESCRIPTION_FINAL.md`
- [ ] Privacy Policy URL entered
- [ ] Age rating set to 4+
- [ ] Category set to Lifestyle
- [ ] Review notes pasted from `APP_STORE_REVIEW_NOTES.md`
- [ ] Contact information verified
- [ ] Build uploaded to App Store Connect
- [ ] Build status: "Ready to Submit"
- [ ] Export compliance answered (NO if no encryption beyond standard HTTPS)

**When all boxes checked: STOP and verify with user before submission.**

---

**Status**: Checklist ready. Proceed to manual asset creation.
