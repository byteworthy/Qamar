# iOS App Store Pre-Launch Checklist - Noor (Revised Positioning)

**Date:** January 31, 2026
**App:** Noor - Islamic Reflection & Personal Growth
**CRITICAL CHANGE:** Positioned as reflection/growth tool, NOT therapy

---

## Key Positioning Changes

- ❌ Health & Fitness category → ✅ **Lifestyle category**
- ❌ Mental health app → ✅ **Personal growth & reflection tool**
- ❌ Age rating 17+ → ✅ **Age rating 12+**
- ❌ Medical/Treatment Info: Yes → ✅ **Medical/Treatment Info: NONE**

---

## Phase 1: Account & App Setup

- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect access
- [ ] Create app record: "Noor: Islamic Reflection"
- [ ] **Category: PRIMARY = Lifestyle**, Secondary = Education
- [ ] Bundle ID: com.noor.app
- [ ] Tax & banking info complete

---

## Phase 2: Metadata (Copy from APPLE_APP_STORE_METADATA.md)

- [ ] **Title:** Noor: Islamic Reflection (26/30)
- [ ] **Subtitle:** Islamic Growth & Guidance (27/30)
- [ ] **Keywords:** journaling,wisdom,mindfulness,dua,self-improvement,structured,halal,development,quran,spirituality (97/100)
- [ ] **Description:** 3,997/4,000 chars - VERIFY all "therapy" removed
- [ ] **Promotional Text:** "Not therapy—reflection" disclaimer included
- [ ] Privacy Policy URL: https://noor-app.com/privacy
- [ ] Support URL: https://noor-app.com/support

---

## Phase 3: Age Rating - CRITICAL CHANGE

**Rating: 12+** (was 17+)

Questionnaire:
- Violence: **None**
- Sexual Content: **None**
- Language: **None/Infrequent Mild**
- **Medical/Treatment Information: NONE** ← Critical change
- Religious Content: **Yes** (Islamic educational content)
- Unrestricted Web Access: **No** (or Yes if webview for resources)

**Rationale:** NOT a health app, so NO medical content flag

---

## Phase 4: Visual Assets

- [ ] App icon 1024x1024 PNG
- [ ] 6 iPhone screenshots (see SCREENSHOT_STRATEGY.md)
  - Screenshot text: "Islamic Growth Journey," "Reflection Tools," "Quran Wisdom"
  - NO text: "therapy," "treatment," "mental health"
- [ ] 2 iPad screenshots (optional)

---

## Phase 5: In-App Purchases

- [ ] Product: Noor Plus Monthly ($4.99/month)
- [ ] Product ID: com.noor.app.plus.monthly
- [ ] Description: "Advanced growth insights, full dua library, priority AI guidance"
- [ ] 7-day free trial enabled

---

## Phase 6: Privacy (Already Strong)

- [ ] PrivacyInfo.xcprivacy file exists ✅
- [ ] NSFaceIDUsageDescription: "Noor uses Face ID to securely protect your personal reflections"
- [ ] App Privacy Details:
  - Data Collection: Email, User Content (journal entries - encrypted)
  - Data Sharing: **NO third-party sharing**
  - Encryption: Yes (HTTPS + iOS Keychain)

---

## Phase 7: App Review Information - CRITICAL

### Demo Account
- Email: reviewer@noor-app.com
- Password: [Secure password]
- **Premium access enabled**

### Review Notes (UPDATED)
```
Noor is an Islamic reflection and personal growth app for everyday Muslims.

IMPORTANT POSITIONING:
Noor is NOT a mental health therapy app. We provide structured reflection
and personal growth tools grounded in Islamic values—NOT treatment or clinical intervention.

Core Features:
1. Structured Reflection Journal (examine thoughts with Islamic guidance)
2. Quran Wisdom & Authentic Hadith (daily spiritual content)
3. Islamic Calming Practices (dhikr, breathing, mindfulness)
4. Growth Insights (Premium - journey tracking)

Islamic Authenticity:
- Quran: Verified translations
- Hadith: Sahih Bukhari, Sahih Muslim only

Privacy:
- Encrypted via iOS Keychain
- Biometric auth (Face ID/Touch ID)
- No third-party tracking

AI Usage:
- Provider: Anthropic Claude API
- Purpose: Generate Islamic perspective (optional feature)
- Privacy: Real-time processing only, not stored

Safety Features:
- Detects serious concerns → provides professional resources
- NOT a crisis intervention tool

What Noor Is NOT:
- NOT therapy or clinical treatment
- NOT medical advice
- NOT suitable as primary support for serious concerns

Testing:
1. Complete onboarding
2. Create reflection entry
3. View Islamic guidance
4. Check Daily Content
5. Try Calming Practice
6. View Insights (Premium enabled)

Contact: support@noor-app.com
```

---

## Phase 8: Build & TestFlight

- [ ] Xcode: Release scheme (not Debug)
- [ ] Version: 1.0.0, Build: 1
- [ ] Archive → Validate → Upload
- [ ] TestFlight internal testing (1-2 weeks)
- [ ] Fix critical bugs before submission

---

## Phase 9: Pre-Submission Verification

- [ ] All metadata uses "reflection/growth" language (NOT "therapy")
- [ ] Category = Lifestyle ✅
- [ ] Age rating = 12+ ✅
- [ ] Review notes emphasize "NOT therapy" ✅
- [ ] Demo account tested 3x
- [ ] Screenshots match new positioning
- [ ] Privacy policy live and accessible

---

## Phase 10: Submit & Monitor

- [ ] Submit for review (24-48 hour wait typical)
- [ ] Monitor App Store Connect for status
- [ ] Respond to reviewer questions within 24 hours
- [ ] If rejected: Check common rejections (see APP_STORE_REVIEW_GUIDE.md)

---

## Common Rejection Responses (Updated)

**"This appears to be a mental health app"**
Response: "Noor is a lifestyle and personal growth app, not mental health treatment. We've categorized as Lifestyle (not Health & Fitness), rated 12+ (not 17+), and do not claim to treat any medical conditions. Our disclaimers clearly state we're NOT therapy."

**"Age rating should be 17+ due to health content"**
Response: "Noor does not contain medical/treatment information. We provide personal growth reflection tools grounded in Islamic values—not clinical health content. Age rating 12+ is appropriate."

---

## Success Metrics (First 30 Days)

- Downloads: 1,000-5,000
- Rating: 4.5+ average
- Reviews: 50+
- Keyword rankings: Islamic reflection (Top 10), Muslim personal growth (Top 5)

---

**Checklist: ___ / 50 items**

**STATUS: ✅ READY - REFLECTION & GROWTH POSITIONING**
