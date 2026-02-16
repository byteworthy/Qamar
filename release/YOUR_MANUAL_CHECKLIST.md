# YOUR MANUAL ACTION CHECKLIST - Noor App Launch

**Created:** 2026-02-01 Evening
**Updated:** 2026-02-16
**Status:** Apple enrollment pending (1-3 days wait)

This is YOUR checklist. Everything I can do automatically has been done. These are the tasks that require your manual action.

---

## COMPLETED (No Action Needed)

I've already handled these for you:

- Backend logger fixed (Railway now deploys successfully)
- `.env.production` file created with correct values
- Pricing strategy finalized and documented
- Launch status tracker updated
- All code committed to git with passing tests (277 tests)

**Backend Status:** LIVE at `https://noor-production-9ac5.up.railway.app`

---

## PHASE 1: DO NOW (While Waiting for Apple - Today/Tomorrow)

These tasks you can complete immediately while waiting for Apple to approve your developer account (1-3 days).

### Task 1: Generate App Icon PNG -- 30 minutes

**What:** Convert your SVG icon to 1024x1024 PNG for App Store submission.

**Why:** App Store requires PNG format, not SVG.

**Source File:** `assets/images/icon-source.svg`

**Target File:** `assets/images/icon.png` (replace existing placeholder)

**Instructions:**

#### Option A: Online Converter (Easiest)

1. Go to: [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png)
2. Upload: `assets/images/icon-source.svg`
3. Settings:
   - Width: 1024
   - Height: 1024
4. Click "Convert"
5. Download the PNG
6. Save as: `assets/images/icon.png` (overwrite existing)

#### Option B: Figma (Best Quality)

1. Go to: [figma.com](https://figma.com) (create free account if needed)
2. Create new file
3. Drag `icon-source.svg` into canvas
4. Resize to exactly 1024x1024 (lock aspect ratio)
5. Select icon -> Export -> PNG -> 1x -> Export
6. Save as: `assets/images/icon.png`

**Verify:**
- Should show: 1024 x 1024 pixels
- File size: ~200-500 KB
- No transparency (solid background)

**After completion:** Commit the new icon:
```bash
git add assets/images/icon.png
git commit -m "feat(assets): add production app icon 1024x1024 PNG"
git push origin main
```

**Detailed Guide:** See `release/STORE_PACK/ICON_GENERATION.md`

---

### Task 2: Create App Screenshots -- 4-5 hours (OR hire on Fiverr)

**What:** Create 5 screenshots at 1290x2796 pixels (iPhone 15 Pro Max size) for App Store listing.

**Why:** App Store requires screenshots to showcase your app.

**Required Screenshots:**

1. **Home Screen** - Main dashboard with daily content
2. **Quran Reader** - Quran text with Arabic and translation
3. **Arabic Learning** - Vocabulary and language learning interface
4. **Daily Reflection** - Personalized reflection response
5. **Prayer & History** - Prayer support and past reflections

**Choose Your Approach:**

#### Option A: Do It Yourself (4-5 hours)

**Pros:** Free, full control
**Cons:** Time-consuming

**Steps:**
1. Run: `npm start`
2. Open iPhone 15 Pro Max simulator
3. Navigate to each screen
4. Take screenshots (Cmd+S in simulator)
5. Export at 1290x2796 pixels
6. Save in: `release/STORE_PACK/screenshots/`

**Detailed Guide:** See `release/STORE_PACK/screenshots/SCREENSHOT_SHOTLIST.md`

#### Option B: Hire on Fiverr (Recommended)

**Pros:** Fast (24-48 hours), professional quality
**Cons:** $20-50 cost

**Steps:**
1. Go to: [fiverr.com](https://fiverr.com)
2. Search: "iOS app screenshots"
3. Find seller with good reviews (5 stars, 100+ reviews)
4. Provide:
   - Your TestFlight build link (after you build it) OR
   - Video walkthrough of your app OR
   - Simulator access
   - Screenshot shotlist from `release/STORE_PACK/screenshots/SCREENSHOT_SHOTLIST.md`
5. Specify: 5 screenshots, iPhone 15 Pro Max size (1290x2796)
6. Receive professional screenshots in 24-48 hours

**My Recommendation:** If budget allows, use Fiverr. Saves you 4-5 hours and often looks more professional.

---

### Task 3: Monitor Email for Apple Approval -- Passive (check 2x/day)

**What:** Watch for Apple's developer enrollment approval email.

**Email to Monitor:** The email address you used for Apple Developer enrollment (Order #W1638152040)

**What to Look For:**

Subject line: **"Welcome to Apple Developer Program"**

**Action When Received:**
1. Mark calendar: "Apple Approved!"
2. Move to Phase 2 tasks (below)
3. Let me know - I'll guide you through the next steps

**Timeline:** Typically 1-3 days, occasionally up to 7 days

**Pro Tips:**
- Check email 2x per day (morning and evening)
- Check spam folder
- Keep phone accessible (Apple may call for verification)
- Respond to ANY Apple emails within 24 hours

---

## PHASE 2: AFTER APPLE APPROVAL (Day 3-5)

These tasks can ONLY be done after Apple approves your developer account. When you receive the "Welcome to Apple Developer Program" email, complete these in order.

### Task 4: Sign Agreements & Add Payment Info -- 30 minutes

**When:** Immediately after receiving Apple approval email

**What:** Sign legal agreements and add banking/tax info to receive IAP revenue.

**Critical:** You cannot create IAP products until this is done.

**Steps:**

1. **Go to:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Sign in** with your Apple Developer account
3. **Navigate to:** Agreements, Tax, and Banking
4. **Request Contracts:**
   - Click "Request" next to "Paid Apps"
   - Review agreement
   - Click "Agree"
   - Status should change to "Active"

5. **Add Banking Information:**
   - Click "Banking" tab
   - Click "Add Bank Account"
   - Enter:
     * Bank name
     * Routing number (9 digits)
     * Account number
     * Account holder name (must match your legal entity name)
   - Save

6. **Complete Tax Forms:**
   - Click "Tax Forms" tab
   - **U.S. users:** Fill out W-9 form
   - Provide:
     * Legal name
     * Tax ID (SSN or EIN)
     * Address
   - Submit

**Verify:** All three sections (Contracts, Banking, Tax) should show green checkmarks.

---

### Task 5: Create App in App Store Connect -- 15 minutes

**When:** After Task 4 is complete

**What:** Create the official app record for Noor in App Store Connect.

**Steps:**

1. **Go to:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Navigate to:** My Apps
3. **Click:** + (plus icon) -> New App
4. **Fill out:**
   - **Platform:** iOS
   - **Name:** Noor
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select `com.noor.app` (from dropdown)
   - **SKU:** `noor-app-001` (your internal reference ID)
   - **User Access:** Full Access

5. **Click:** Create

**Result:** You'll see "Prepare for Submission" screen.

**Important:** Copy the **App Store Connect App ID** (10-digit number in the URL, like `6234567890`)

**Save this ID** - you'll need it in Task 7.

---

### Task 6: Create IAP Products -- 30 minutes

**When:** After Task 5 is complete

**What:** Create in-app purchase products in App Store Connect.

**Critical:** Follow the exact product IDs and prices below.

**Products to Create:**

| Product ID | Type | Price | Duration |
|-----------|------|-------|----------|
| `noor_plus_monthly` | Auto-renewable | $2.99 | 1 Month |
| `noor_plus_yearly` | Auto-renewable | $19.99 | 1 Year |
| `noor_lifetime` | Non-consumable | $49.99 | N/A |

**Steps:**

#### Create Subscription Group First

1. **Navigate to:** Your App -> Features -> In-App Purchases
2. **Click:** + -> Subscription Group
3. **Name:** "Noor Premium Subscriptions"
4. **Create**

#### Create Product 1: Plus Monthly

1. **Click:** + -> Auto-Renewable Subscription
2. **Product ID:** `noor_plus_monthly` (exactly as written)
3. **Reference Name:** Noor Plus Monthly
4. **Subscription Group:** Noor Premium Subscriptions
5. **Subscription Duration:** 1 Month
6. **Subscription Prices:**
   - Click "Add Subscription Price"
   - Select: United States
   - Price: $2.99
   - Click "Next" -> "Create"
7. **Subscription Level:** Level 1
8. **Localizations:**
   - **Language:** English (U.S.)
   - **Display Name:** Noor Plus
   - **Description:** "Enhanced Quran reading, Arabic learning tools, extended reflections, and personalized insights rooted in Islamic wisdom."
9. **Review Information:**
    - **Screenshot:** Upload any app screenshot showing Plus features
10. **Save**

#### Create Product 2: Plus Yearly

1. **Click:** + -> Auto-Renewable Subscription
2. **Product ID:** `noor_plus_yearly`
3. **Reference Name:** Noor Plus Yearly
4. **Subscription Group:** Noor Premium Subscriptions
5. **Subscription Duration:** 1 Year
6. **Subscription Prices:**
   - Price: $19.99
7. **Subscription Level:** Level 1
8. **Localizations:**
   - **Display Name:** Noor Plus (Annual)
   - **Description:** "Enhanced Quran reading, Arabic learning tools, extended reflections, and personalized insights rooted in Islamic wisdom. Save with annual billing."
9. **Review Information:** Upload screenshot
10. **Save**

#### Create Product 3: Lifetime

1. **Click:** + -> Non-Consumable
2. **Product ID:** `noor_lifetime`
3. **Reference Name:** Noor Lifetime
4. **Subscription Prices:**
   - Price: $49.99
5. **Localizations:**
   - **Display Name:** Noor (Lifetime)
   - **Description:** "One-time payment for lifetime access. Full Quran reader, Arabic learning, unlimited reflections, personalized insights, and all future features. Never pay again."
6. **Review Information:** Upload screenshot
7. **Save**

**Verify:** All 3 products should show "Ready to Submit" status.

---

### Task 7: Update eas.json with Real IDs -- 2 minutes

**When:** After Task 5 is complete

**What:** Replace placeholder IDs in `eas.json` with your real App Store Connect IDs.

**You Need:**
- **App Store Connect App ID** (10-digit number from Task 5)
- **Apple Team ID** (find at: [developer.apple.com/account](https://developer.apple.com/account) -> Membership Details)

**Steps:**

1. **Open:** `eas.json`
2. **Find the submit section** (around line 48)
3. **Replace:**

```json
"ascAppId": "PLACEHOLDER_ASC_APP_ID",
"appleTeamId": "PLACEHOLDER_TEAM_ID"
```

**With:**

```json
"ascAppId": "1234567890",  // Your 10-digit App ID from Task 5
"appleTeamId": "ABCD1234EF"  // Your Team ID from developer.apple.com/account
```

4. **Save the file**
5. **Commit:**

```bash
git add eas.json
git commit -m "chore: add real App Store Connect IDs"
git push origin main
```

---

### Task 8: Configure RevenueCat with App Store Products -- 30 minutes

**When:** After Task 6 is complete (all IAP products created)

**What:** Link your App Store products to RevenueCat entitlements.

**Steps:**

1. **Go to:** [app.revenuecat.com](https://app.revenuecat.com)
2. **Sign in** with your ByteWorthy account
3. **Select Project:** Noor
4. **Navigate to:** Apps -> iOS
5. **Configure App Store Connection:**
   - **Bundle ID:** com.noor.app
   - **Shared Secret:** Get from App Store Connect -> Your App -> General -> App Information -> App-Specific Shared Secret
     * If you don't see it, click "Generate" to create one
     * Copy and paste into RevenueCat
   - **Save**

6. **Create Entitlements:**

   a. **Click:** Entitlements (left sidebar) -> + New
      - **Identifier:** `noor_plus_access`
      - **Display Name:** Noor Plus Access
      - **Description:** Access to all Noor Plus features
      - **Create**

7. **Add Products:**

   **Click:** Products (left sidebar) -> Import from App Store
   - RevenueCat will automatically import your 3 products
   - Wait ~30 seconds for sync

   **Link Products to Entitlements:**

   a. Click on `noor_plus_monthly`
      - Entitlement: Select `noor_plus_access`
      - Save

   b. Click on `noor_plus_yearly`
      - Entitlement: Select `noor_plus_access`
      - Save

   c. Click on `noor_lifetime`
      - Entitlement: Select `noor_plus_access`
      - Save

8. **Create Offering:**
   - **Click:** Offerings (left sidebar) -> + New
   - **Identifier:** `default`
   - **Description:** Default Noor pricing
   - **Add Packages:**
     * Click "+ Add Package"
     * **Package 1:**
       - Type: $rc_monthly
       - Product: noor_plus_monthly
     * **Package 2:**
       - Type: $rc_annual
       - Product: noor_plus_yearly
     * **Package 3:**
       - Type: lifetime
       - Product: noor_lifetime
   - **Make Current:** Toggle ON
   - **Save**

9. **Get Production API Key:**
   - **Navigate to:** API Keys (left sidebar)
   - **Find:** Public API keys section
   - **Copy:** iOS key (starts with `appl_`)

   **IMPORTANT:** This is different from your test key!

10. **Update .env.production:**
    - Open: `.env.production`
    - Replace the test key line:

    ```bash
    # OLD (test key):
    EXPO_PUBLIC_REVENUECAT_API_KEY=test_oNGgdjrRcYgXwzONWCbHvAlTHTW

    # NEW (production key):
    EXPO_PUBLIC_REVENUECAT_API_KEY=appl_your_real_production_key_here
    ```

    - **Save**

---

## PHASE 3: BUILD & TEST (Day 6-7)

### Task 9: Run Production Build -- 1-2 hours (mostly waiting)

**When:** After Task 8 is complete and `.env.production` has real production RevenueCat key

**What:** Build the production iOS app with EAS.

**Verify Before Building:**
- `.env.production` has real RevenueCat production key (appl_...)
- `eas.json` has real App Store Connect IDs
- All IAP products created in App Store Connect
- All tests passing: `npm test` (should see 277 tests pass)

**Steps:**

1. **Verify environment:**
   ```bash
   npm run check:types
   # Should complete with no errors
   ```

2. **Ensure all changes are committed:**
   ```bash
   git status
   # Should show "nothing to commit, working tree clean"
   ```

3. **Run production build:**
   ```bash
   eas build --platform ios --profile production
   ```

4. **EAS will ask questions:**
   - **Generate credentials?** -> YES (if first time)
   - **Apple ID:** -> Use your Apple Developer email
   - **Apple password:** -> Use your Apple ID password (or app-specific password)
   - **Team ID:** -> Should auto-detect

5. **Wait for build to complete:**
   - Build time: ~30-60 minutes
   - EAS will show build progress in terminal
   - You'll get a URL to view build logs
   - You can close terminal - build continues in cloud

6. **When build completes:**
   - EAS will send email notification
   - Terminal will show: "Build finished"
   - You'll get a download link for the `.ipa` file

7. **Download the IPA file:**
   - Click the download link OR
   - Run: `eas build:list` to see recent builds
   - Run: `eas build:view [BUILD_ID]` to get download link

**Build Reference:** See `release/BUILD_COMMANDS.md`

---

### Task 10: Test on Physical iPhone -- 1-2 hours

**When:** After Task 9 build completes

**What:** Test the production app on a real iPhone (not simulator) to verify IAP works.

**Why:** IAP (in-app purchases) do NOT work in iOS Simulator. You must test on a physical device.

**Prerequisites:**
- Physical iPhone (any model, iOS 15+)
- iPhone connected to your Mac with cable OR
- TestFlight app installed on iPhone

**Steps:**

#### Option A: Direct Install (via Xcode)

1. **Connect iPhone to Mac** with USB cable
2. **Open Xcode**
3. **Window -> Devices and Simulators**
4. **Select your iPhone** from left sidebar
5. **Drag the `.ipa` file** from Task 9 into the "Installed Apps" section
6. **Wait for installation** (~1 minute)
7. **App appears on iPhone home screen**

#### Option B: TestFlight Install (Easier)

1. **Submit build to TestFlight:**
   ```bash
   eas submit --platform ios --profile preview --latest
   ```

2. **Wait for TestFlight processing** (~10-15 minutes)
3. **You'll receive email** when ready for testing
4. **On your iPhone:**
   - Install TestFlight app from App Store (if not already installed)
   - Open email invitation
   - Click "View in TestFlight"
   - Click "Install"
5. **App appears on iPhone home screen**

**Testing Checklist:**

Test ALL of these on your physical iPhone:

- [ ] **App launches** without crash
- [ ] **Complete onboarding** flow (name, preferences)
- [ ] **Quran reader** displays correctly with Arabic text and translation
- [ ] **Arabic learning** interface works (vocabulary, exercises)
- [ ] **Create a test reflection**
  - Tap "New Reflection"
  - Write a thought
  - Submit
- [ ] **Personalized response generates** successfully
  - Should see response within 5-10 seconds
  - Should be relevant to your thought
  - Should include Islamic guidance
- [ ] **Safety screen displays** correctly
  - Should show "Not professional counseling" disclaimer
  - Should show crisis resources
- [ ] **View history** of past reflections
  - Tap "History"
  - Should see your test reflection
  - Tap to view details
- [ ] **Test subscription paywall** (Sandbox mode)
  - Tap "Upgrade" or navigate to subscription screen
  - Should see all 3 pricing options:
    * Plus Monthly ($2.99)
    * Plus Yearly ($19.99)
    * Lifetime ($49.99)
- [ ] **Test purchase flow** (Sandbox - won't charge!)
  - Tap any subscription
  - Use Sandbox test account (create in App Store Connect -> Users and Access -> Sandbox Testers)
  - Complete purchase flow
  - **Verify entitlement:** Check that Plus features unlock
  - **Note:** Subscription renews every ~5 minutes in Sandbox (not monthly)
- [ ] **No console errors** (check Xcode console if using Option A)
- [ ] **No crashes** during 10-minute usage test

**If ANY test fails:**
- Note the exact issue
- Check Xcode console logs or Railway backend logs
- Fix the issue
- Re-run Task 9 (production build)
- Re-test

**If ALL tests pass:** You're ready for App Store submission!

---

## PHASE 4: APP STORE SUBMISSION (Day 7-8)

### Task 11: Fill Out App Store Connect Information -- 45-60 minutes

**When:** After Task 10 testing passes

**What:** Complete all required information in App Store Connect for your app listing.

**Prerequisites:**
- 5 screenshots created (from Task 2)
- App icon PNG 1024x1024 (from Task 1)
- Production build passing all tests (from Task 10)

**Steps:**

1. **Go to:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Navigate to:** My Apps -> Noor
3. **Click:** + Version or Release -> 1.0.0

**Fill Out Each Section:**

#### A. App Information (General Tab)

**Name:**
```
Noor
```

**Subtitle:**
```
Quran · Arabic Learning · Prayer · Reflection
```

**Privacy Policy URL:**
```
https://byteworthy.github.io/Noor/legal/privacy.html
```

**Category:**
- **Primary:** Lifestyle
- **Secondary:** Education

**Content Rights:**
- Select: "No, it does not contain, show, or access third-party content"

**Age Rating:**
- Click "Edit"
- Complete questionnaire honestly
- Expected rating: 4+
- Save

**Support URL:**
```
https://byteworthy.github.io/Noor/legal/
```

**Marketing URL:** (leave blank)

**Save**

---

#### B. Pricing and Availability

**Price:**
- Select: Free

**Availability:**
- All countries and regions

**Save**

---

#### C. Version Information (1.0.0)

**Screenshots:**
1. Click "iPhone 15 Pro Max" display size
2. Upload all 5 screenshots:
   - Screenshot 1: Home screen with daily content
   - Screenshot 2: Quran reader with Arabic text and translation
   - Screenshot 3: Arabic learning interface
   - Screenshot 4: Daily reflection with personalized response
   - Screenshot 5: Prayer support and history
3. Ensure they're in the correct order

**App Icon:**
- Upload your 1024x1024 PNG (from Task 1)
- Should upload automatically if you updated `assets/images/icon.png`

**Description:**
```
Noor is your Islamic companion for Quran reading, Arabic language learning, daily reflections, and prayer support.

Engage with the Quran in Arabic with English translation, build your Arabic vocabulary step by step, reflect on your spiritual growth, and strengthen your daily practice.

KEY FEATURES:
- Quran reader with Arabic text and translation
- Arabic language learning and vocabulary building
- Daily reflections rooted in Islamic wisdom
- Prayer support and reminders
- Personalized insights from Quran & Hadith
- Progress tracking and growth patterns
- Beautiful, calming design

IMPORTANT: Noor is a personal development and education tool, not professional counseling or therapy. For mental health emergencies, please contact a licensed professional or crisis helpline.

Your data is private and secure. We use Anthropic Claude to provide personalized responses, but never share your personal content.

Choose from flexible plans:
- Noor Plus: Enhanced features and daily guidance ($2.99/mo or $19.99/yr)
- Noor Lifetime: Full access forever ($49.99 one-time)

Grow through reflection. Guided by faith.
```

**Keywords:**
```
quran,islamic,arabic,prayer,reflection,muslim,dua,learning,spiritual,faith
```

**Promotional Text:** (optional, leave blank for now)

**What's New in This Version:**
```
Welcome to Noor 1.0.0 - Your Islamic companion for Quran, Arabic, prayer, and reflection.

- Quran reader with Arabic and English
- Arabic language learning tools
- Personalized spiritual reflections
- Prayer support
- Flexible subscription options

Begin your journey of growth and self-discovery today.
```

**Save**

---

#### D. App Privacy

**Click:** App Privacy -> Edit

**Does your app collect data?**
- Select: **Yes**

**Data Types You Collect:**

**Contact Info:**
- [x] Email Address
  - **Used for:** Account creation
  - **Linked to user:** Yes
  - **Used for tracking:** No

**User Content:**
- [x] Other User Content
  - **Description:** Reflections, learning progress, and reading activity
  - **Used for:** App functionality (personalized responses)
  - **Linked to user:** Yes
  - **Used for tracking:** No

**Usage Data:**
- [x] Product Interaction
  - **Used for:** Analytics
  - **Linked to user:** No
  - **Used for tracking:** No

**Third Parties with Access:**
- Anthropic Claude (content processing)
- RevenueCat (subscription management)
- Sentry (error tracking)

**Save**

---

#### E. App Review Information

**Contact Information:**
```
First Name: [Your first name]
Last Name: [Your last name]
Phone Number: [Your phone]
Email Address: scale@getbyteworthy.com
```

**Demo Account:** (if app requires login)
- Create a test account for Apple reviewers
- Provide username and password here

**Notes:**
```
IMPORTANT INFORMATION FOR REVIEW:

Technology Usage: This app uses Anthropic Claude to provide personalized Islamic guidance based on user interactions. The technology has been configured to:
- Provide thoughtful reflections rooted in Quran and Hadith
- Support Arabic language learning with translations and vocabulary
- Avoid medical, legal, or therapeutic advice
- Refer users to professional help when needed

NOT Professional Counseling: This app is explicitly positioned as a personal development and education tool, NOT professional counseling, therapy, or medical treatment. We include prominent disclaimers in:
- Onboarding flow
- Safety screen (visible in screenshots)
- App description
- Terms of service

Safety Features:
- Crisis resources prominently displayed
- Clear disclaimers about limitations
- Encouragement to seek professional help when needed

Subscription Testing:
- All in-app purchases are configured and ready for testing
- Sandbox test account available if needed

Privacy:
- All user data is encrypted
- Personal content is private and secure
- Privacy policy: https://byteworthy.github.io/Noor/legal/privacy.html

The app is ready for review. Thank you!
```

**Attachment:** (optional - can upload screenshot of Safety screen here)

**Save**

---

#### F. Build

**Select a Build:**
1. Click "+ " next to Build
2. Select your production build from Task 9
3. Click "Done"
4. Wait ~5 minutes for processing

**Export Compliance:**
- When prompted: "Does your app use encryption?"
- Select: "No" (if true) OR "Yes" (if using HTTPS, which you are)
- If Yes: Select "App uses standard encryption" -> No export compliance required
- Save

---

#### G. Version Release

**Select:**
- "Manually release this version"
- (This lets you control when app goes live after approval)

**Save**

---

### Final Verification

Before submitting, verify ALL sections have green checkmarks:
- App Information
- Pricing and Availability
- 1.0.0 Version (with screenshots, description, build)
- App Privacy
- App Review Information

**If ANY section has a red warning:** Click into it and complete missing fields.

---

### Submit for Review

1. **Click:** "Submit for Review" (top right)
2. **Review summary** of your submission
3. **Click:** "Submit"
4. **Status changes to:** "Waiting for Review"

**Congratulations!** Your app is submitted!

---

### Task 12: Monitor Review Status -- 24-48 hours (passive)

**When:** After Task 11 submission

**What:** Wait for Apple to review your app.

**Timeline:**
- **Waiting for Review:** 12-48 hours (typically)
- **In Review:** 1-4 hours
- **Result:** Approved OR Rejected

**What to Do:**

1. **Check App Store Connect 2x per day:**
   - Morning and evening
   - Watch for status changes

2. **If Apple requests more info:**
   - Check "Resolution Center" in App Store Connect
   - Respond within 24 hours with requested info
   - Provide screenshots, explanations, or demo videos as needed

3. **If REJECTED:**
   - Read rejection reason carefully
   - Common reasons:
     * Missing safety disclaimers -> Ensure screenshots show them
     * Technology usage not disclosed -> Ensure review notes mention Anthropic Claude
     * Content concerns -> Explain it's personal development, not therapy
   - Fix the issue in your app
   - Re-run Task 9 (production build)
   - Re-submit (Tasks 11-12)

4. **If APPROVED:**
   - Status changes to "Pending Developer Release"
   - Click "Release This Version"
   - App goes live in 2-4 hours!

**Pro Tips:**
- Submitting Tuesday-Thursday often gets faster review
- Avoid submitting on weekends or holidays
- Respond to Apple within 24 hours if they contact you
- Be polite and professional in all communications

---

## PHASE 5: LAUNCH DAY!

When Apple approves and you click "Release":

### You'll See:
- App status: "Ready for Sale"
- App is live on App Store within 2-4 hours
- Users can search "Noor" and find your app

### Immediate Actions:
1. **Test the live app:**
   - Download from App Store on a fresh device
   - Complete full flow
   - Test a purchase (this will charge! Use a test card or your own)

2. **Share the App Store link:**
   - Format: `https://apps.apple.com/us/app/noor/id[YOUR_APP_ID]`
   - Post on social media, website, etc.

3. **Monitor:**
   - Reviews and ratings
   - Crash reports (Sentry dashboard)
   - Revenue (RevenueCat dashboard)
   - User feedback

---

## SUMMARY CHECKLIST

Print this and check off as you go:

### Phase 1: NOW (While Waiting for Apple)
- [ ] Task 1: Generate app icon PNG (30 min)
- [ ] Task 2: Create 5 screenshots OR hire on Fiverr (4-5 hours OR $20-50)
- [ ] Task 3: Monitor email for Apple approval (passive, 1-3 days)

### Phase 2: AFTER APPLE APPROVAL
- [ ] Task 4: Sign agreements & add payment info (30 min)
- [ ] Task 5: Create app in App Store Connect (15 min)
- [ ] Task 6: Create all 3 IAP products (30 min)
- [ ] Task 7: Update eas.json with real IDs (2 min)
- [ ] Task 8: Configure RevenueCat (30 min)

### Phase 3: BUILD & TEST
- [ ] Task 9: Run production build (1-2 hours)
- [ ] Task 10: Test on physical iPhone (1-2 hours)

### Phase 4: SUBMISSION
- [ ] Task 11: Fill out App Store Connect info (45-60 min)
- [ ] Task 12: Monitor review status (24-48 hours passive)

### Phase 5: LAUNCH
- [ ] Release to App Store!
- [ ] Test live app
- [ ] Share App Store link
- [ ] Monitor performance

---

## TIME INVESTMENT

| Phase | Hands-On Time | Wait Time | Total |
|-------|---------------|-----------|-------|
| Phase 1 | 5-6 hours | 1-3 days | 1-3 days |
| Phase 2 | 2 hours | - | 2 hours |
| Phase 3 | 2-3 hours | 1-2 hours | 3-5 hours |
| Phase 4 | 1 hour | 1-2 days | 1-2 days |
| **TOTAL** | **10-12 hours** | **2-5 days** | **3-7 days** |

**Best Case:** App live in 5 days (if Apple approves in 1 day)
**Realistic:** App live in 7-10 days (typical Apple approval: 2-3 days)

---

## NEED HELP?

**Stuck on a task?** Message me with:
- Task number (e.g., "Task 6: IAP products")
- What you tried
- Error message or screenshot

**Questions about strategy?** Ask anytime!

**Apple rejected your app?** Send me the rejection reason and I'll help you fix it.

---

## KEY DOCUMENTS

Save these links - you'll need them:

- Pricing strategy details: `release/STORE_PACK/PRICING_STRATEGY_OPTION_C.md`
- IAP setup guide: `release/STORE_PACK/IAP_SETUP_GUIDE.md`
- Icon generation: `release/STORE_PACK/ICON_GENERATION.md`
- Screenshot guide: `release/STORE_PACK/screenshots/SCREENSHOT_SHOTLIST.md`
- Build commands: `release/BUILD_COMMANDS.md`
- Master status: `release/LAUNCH_STATUS.md`

---

Everything is configured and ready. Now it's just execution.

Start with Task 1 (icon) and Task 2 (screenshots) while you wait for Apple.

Let me know when you complete each phase!
