# App Store Connect Upload Order Checklist

**Created:** January 2026
**Purpose:** Linear step-by-step guide for filling App Store Connect

---

## Pre-Submission Checklist

- [ ] Build uploaded to App Store Connect via Xcode/Transporter
- [ ] Build processed and visible in "TestFlight" or "App Store" tab
- [ ] Screenshots ready (4-5 images at 1290x2796 for iPhone 15 Pro Max)
- [ ] App icon ready (1024x1024 PNG)
- [ ] Have `APP_STORE_CONNECT_FIELDS.md` open in another window

---

## App Store Connect Fill Order

### Step 1: App Information (General)

1. **App Name** → Paste: `Noor`
2. **Subtitle** → Paste: `Quran · Arabic Learning · Prayer`
3. **Primary Language** → Select: `English (U.S.)`
4. **Bundle ID** → Should auto-populate from build
5. **SKU** → Use: `noor-ios-2026` (or your preference)

### Step 2: Pricing and Availability

1. **Price** → Select: `Free` (no in-app purchases for validation build)
2. **Availability** → Select countries (or "All countries")

### Step 3: App Privacy

1. Navigate to **App Privacy** section
2. Click **"Get Started"** or **"Edit"**
3. **Does your app collect data?** → Yes
4. Follow the questionnaire using Section L of `APP_STORE_CONNECT_FIELDS.md`:
   - Contact Info (Email) → Yes, linked to user, App Functionality
   - User Content → Yes, linked to user, App Functionality
   - Identifiers (User ID) → Yes, linked to user, App Functionality
   - Diagnostics → Yes, not linked to user, Analytics
5. **Data used for tracking?** → No
6. Click **Save** and **Publish**

### Step 4: Category and Age Rating

1. **Primary Category** → Select: `Lifestyle`
2. **Secondary Category** → Select: `Lifestyle` (optional)
3. **Age Rating** → Click **"Set Age Rating"**
   - Answer all questions "None" or "No" (see Section K)
   - Result should be: `4+`
4. **Save**

### Step 5: Version Information (for new version/submission)

Navigate to **App Store** → Select your build → **Version Information**

1. **What's New** → For v1.0: Leave blank or write "Initial release"
2. **Promotional Text** → Paste from Section C:
   ```
   Your Islamic companion for Quran reading, Arabic learning, prayer support, and daily reflection. Grow through faith.
   ```
3. **Description** → Paste FULL description from Section D
4. **Keywords** → Paste: `quran,islamic,arabic,prayer,reflection,muslim,dua,learning,spiritual,faith`
5. **Support URL** → Paste: `mailto:support@byteworthy.com`
6. **Marketing URL** → Leave blank (optional)

### Step 6: App Review Information

1. **Contact Information**:
   - First Name: [Your first name]
   - Last Name: [Your last name]
   - Email: `support@byteworthy.com`
   - Phone: [Your phone number]

2. **Notes** → Paste FULL reviewer notes from Section I

3. **Sign-In Required** → Select: `No` (app works without login)

### Step 7: Screenshots and App Preview

1. Navigate to **App Store** → **Screenshots**
2. Select device: **iPhone 6.7" Display** (iPhone 15 Pro Max)
3. Upload screenshots in this order:
   1. Home Screen - "Your daily Islamic companion."
   2. Quran Reader - "Read and reflect on the Quran with translation."
   3. Arabic Learning - "Build your Arabic vocabulary step by step."
   4. Daily Reflection - "Personalized reflections rooted in Islamic wisdom."
   5. Prayer & History - "Support your daily practice and track your growth."
4. Repeat for other device sizes if required (or use Media Manager to copy)

### Step 8: URLs (App Information)

1. **Privacy Policy URL** → Paste: `https://byteworthy.github.io/Noor/legal/privacy.html`
2. **Terms of Service URL** (if field exists) → Paste: `https://byteworthy.github.io/Noor/legal/terms.html`

### Step 9: Export Compliance

When prompted (during submission or in build details):

1. **Does your app use encryption?** → Yes
2. **Does your app qualify for exemption?** → Yes (HTTPS/TLS only)
3. **Proprietary encryption?** → No
4. ⚠️ Confirm this answer with compliance team if uncertain

### Step 10: Final Review

1. Review all fields in **App Store** tab
2. Verify screenshots uploaded correctly
3. Verify description looks correct in preview
4. Verify age rating shows 4+
5. Verify privacy nutrition labels show correct data types

### Step 11: Submit for Review

1. Click **"Add for Review"**
2. Select the build version
3. Click **"Submit to App Review"**
4. Confirm submission

---

## Post-Submission

- [ ] Note submission date and time
- [ ] Monitor email for App Review status updates
- [ ] Expect 24-48 hours for review (first submission may take longer)
- [ ] If rejected, read rejection reason carefully and address

---

## Quick Reference - What Goes Where

| Field | Location | Source |
|-------|----------|--------|
| App Name | App Information | Section A |
| Subtitle | App Information | Section B |
| Promotional Text | Version Information | Section C |
| Description | Version Information | Section D |
| Keywords | Version Information | Section E |
| Support URL | Version Information | Section F |
| Privacy Policy URL | App Information | Section G |
| Reviewer Notes | App Review Information | Section I |
| Category | App Information | Section J |
| Age Rating | App Information | Section K |
| Privacy Labels | App Privacy | Section L |
| Export Compliance | Build Details | Section M |

---

## Time Estimate

- Screenshots preparation: 30-60 minutes (if not already done)
- Form filling: 15-20 minutes (with this checklist)
- Total: Under 1 hour with all assets ready

---

**Status:** Ready to execute
