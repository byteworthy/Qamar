# Final Submission Checklist - Noor iOS

**Use this immediately before clicking "Submit for Review" in App Store Connect**
**Last Updated:** January 2026

---

## ⚠️ STOP - Read This First

This is your final gate before submission. Complete every item in order. Do not skip.

**Expected Time:** 15-30 minutes for verification
**Result:** Clean first submission with minimal rejection risk

---

## 🔴 CRITICAL PRE-FLIGHT CHECKS

### 1. App Behavior Verification
- [ ] App launches successfully on a physical iOS device (not simulator)
- [ ] Onboarding screens display in correct order: Welcome → Safety → Privacy
- [ ] Safety screen shows crisis resources (988, 741741, 911)
- [ ] "Not therapy" and "Not for emergencies" text is visible on Safety screen
- [ ] Complete one full reflection session from start to finish
- [ ] Personalized response generates successfully (backend is working)
- [ ] App does not crash during normal use
- [ ] No console errors or warnings in production build

### 2. Backend Production Verification
- [ ] Backend is deployed to production environment
- [ ] Health check endpoint responds: `GET /health` returns 200 OK
- [ ] Production API URL is configured in `client/lib/config.ts`
- [ ] Anthropic API key is valid and has sufficient credits
- [ ] Sentry is capturing errors in production environment
- [ ] Database is accessible and data persists correctly

### 3. Legal & Safety Content Verification
- [ ] Open `https://byteworthy.github.io/Noor/legal/privacy.html` in browser
- [ ] Privacy Policy loads without 404 error
- [ ] Contact email `support@byteworthy.com` is correct
- [ ] Open `https://byteworthy.github.io/Noor/legal/terms.html` in browser
- [ ] Terms of Service loads without 404 error
- [ ] Email inbox `support@byteworthy.com` is monitored and can receive messages

---

## 📋 APP STORE CONNECT CHECKLIST

### In App Store Connect → My Apps → Noor

#### App Information Section
- [ ] **Name**: Noor
- [ ] **Subtitle**: Quran · Arabic Learning · Prayer · Reflection
- [ ] **Privacy Policy URL**: https://byteworthy.github.io/Noor/legal/privacy.html
- [ ] **Primary Category**: Lifestyle
- [ ] **Secondary Category**: Education
- [ ] **Content Rights**: "I own all rights" or appropriate declaration

#### Pricing and Availability
- [ ] **Price**: Free
- [ ] **Availability**: All territories (or specific territories you want)
- [ ] **Pre-order**: Disabled

#### App Privacy Section
Complete the questionnaire:

**Data Types Collected:**
- [ ] Contact Info → Email Address (only if user creates account)
  - Linked to User
  - Used for App Functionality
  - Not used for Tracking
  
- [ ] User Content → Other User Content (journal entries)
  - Linked to User
  - Used for App Functionality
  - Not used for Tracking
  
- [ ] Usage Data → Product Interaction (if using analytics)
  - Not Linked to User
  - Used for Analytics
  - Not used for Tracking

**Privacy Practices:**
- [ ] Data Used to Track You: **NO**
- [ ] Data Linked to You: Email (optional), User Content
- [ ] Data Not Linked to You: Usage Data (if applicable)

#### Age Rating
- [ ] Age Rating Questionnaire Completed
- [ ] Medical/Treatment Information: **Infrequent/Mild** (or None)
- [ ] Final Age Rating: **4+**

---

## 🖼️ MEDIA ASSETS VERIFICATION

### App Icon
- [ ] 1024x1024 PNG uploaded
- [ ] No transparency in icon
- [ ] Icon is recognizable at small sizes
- [ ] Icon matches in-app icon appearance

### Screenshots (iPhone 6.7" Display)
Upload in this order:
- [ ] **Screenshot 1**: Home screen (shows main navigation)
- [ ] **Screenshot 2**: Thought capture or reflection flow
- [ ] **Screenshot 3**: Personalized reflection response
- [ ] **Screenshot 4**: Safety screen with crisis resources (CRITICAL)
- [ ] **Screenshot 5**: History or insights (optional)

**Verify:**
- [ ] All screenshots are 1290 x 2796 pixels (portrait)
- [ ] No placeholder text visible
- [ ] All text is legible
- [ ] Safety disclaimer screenshot is included
- [ ] Screenshots show professional, appropriate content

### App Preview (Optional)
- [ ] Skip for first submission (not required)

---

## 📝 VERSION INFORMATION

### Version Section (App Store Connect)
- [ ] **Version Number**: 1.0.0 (or current version from app.json)
- [ ] **Build Number**: Matches uploaded build
- [ ] **Copyright**: © 2026 [Your Company/Name]
- [ ] **Description**: Paste from `APP_STORE_DESCRIPTION_FINAL.md`
  - Includes Quran, Arabic learning, prayer, and reflection features
  - Includes "Not therapy" statement
  - Includes "Not for emergencies" warning
  - Includes technology transparency section
  - Includes privacy commitments

---

## 🔐 APP REVIEW INFORMATION

### Contact Information
- [ ] **First Name**: [Your first name]
- [ ] **Last Name**: [Your last name]
- [ ] **Phone Number**: [Valid phone number where Apple can reach you]
- [ ] **Email**: support@byteworthy.com

### Sign-In Information
If app requires account:
- [ ] **Username/Email**: [Test account email]
- [ ] **Password**: [Test account password]
- [ ] **Other Notes**: Instructions for sign-in if needed

If app does NOT require account:
- [ ] Check "Sign-in not required"

### Notes
- [ ] Paste content from `APP_STORE_REVIEW_NOTES.md`
- [ ] Verify it includes:
  - App purpose (self-reflection and journaling)
  - Technology disclosure (uses Anthropic Claude)
  - NOT therapy statement
  - NOT crisis tool statement
  - Safety disclaimer location (onboarding)
  - Privacy Policy URL
  - Testing instructions

---

## 📦 BUILD INFORMATION

### Uploaded Build
- [ ] Build uploaded successfully to App Store Connect
- [ ] Build processing completed (status: "Ready to Submit")
- [ ] Build version matches app.json version
- [ ] Build tested on TestFlight (if possible)
- [ ] No TestFlight crashes reported

### Export Compliance
- [ ] Export Compliance Information completed
- [ ] Answer: **NO** (app does not use encryption beyond standard HTTPS)
  OR
- [ ] Answer: **YES** and submit required documentation (unlikely for this app)

---

## ⚡ FINAL REJECTION PREVENTION CHECK

Read each statement. ALL must be TRUE.

### Medical/Health Claims ✓
- [ ] App description does NOT claim to diagnose conditions
- [ ] App description does NOT claim to treat conditions
- [ ] App description does NOT claim to prevent conditions
- [ ] App description does NOT use words: "therapy", "treatment", "diagnosis"
- [ ] App description DOES say "not therapy" explicitly

### Crisis/Emergency Claims ✓
- [ ] App description does NOT promise emergency support
- [ ] App description does NOT promise crisis intervention
- [ ] App description DOES say "not for emergencies"
- [ ] App SHOWS crisis resources (988, 741741, 911) in Safety screen

### Technology Disclosure ✓
- [ ] App description mentions technology usage
- [ ] App description mentions content limitations
- [ ] App review notes explain content processing
- [ ] Safety/Privacy screens disclose content processing

### Privacy Requirements ✓
- [ ] Privacy Policy is publicly accessible (verified by opening URL)
- [ ] Privacy Policy URL is entered in App Store Connect
- [ ] Privacy Policy mentions content processing
- [ ] Privacy Policy has valid contact email
- [ ] App Privacy questionnaire completed in App Store Connect

### Functionality Claims ✓
- [ ] App description matches actual app features
- [ ] No promised features that don't exist yet
- [ ] Screenshots accurately represent app experience
- [ ] App works as described without crashes

---

## 🎯 FINAL CHECKLIST

All sections complete:
- [ ] App Information filled out
- [ ] Pricing set to Free
- [ ] Age rating completed (4+)
- [ ] App Privacy questionnaire completed
- [ ] Icon uploaded (1024x1024)
- [ ] Screenshots uploaded (minimum 3-5)
- [ ] Description pasted from approved document
- [ ] Review notes pasted from approved document
- [ ] Privacy Policy URL verified as live
- [ ] Contact email verified as monitored
- [ ] Build uploaded and "Ready to Submit"
- [ ] Export compliance answered
- [ ] All rejection prevention checks passed

---

## 🚀 READY TO SUBMIT

If every box above is checked:

1. **Click "Add for Review"** in App Store Connect
2. **Click "Submit for Review"**
3. **Wait for Apple's response** (typically 24-72 hours)

### After Submission

**DO:**
- Monitor `support@byteworthy.com` for App Review messages
- Check App Store Connect daily for status updates
- Respond to any reviewer questions within 24 hours
- Keep backend running and monitored

**DO NOT:**
- Make code changes unless requested by reviewer
- Submit updates during review
- Panic if you get questions from reviewer
- Over-explain if rejected (fix only what they ask)

---

## 📞 Emergency Contacts

**If rejected:**
1. Read rejection reason carefully
2. Fix ONLY what they mention
3. Respond in Resolution Center if you have questions
4. Re-submit when fixed

**If stuck:**
- Apple Developer Support: https://developer.apple.com/contact/
- App Review Board: Use "Request Review" if rejection seems incorrect

---

## ✅ SUBMISSION RECORD

Fill this out when you submit:

**Submission Date**: _______________
**Build Number**: _______________
**Version Number**: _______________
**Expected Review Time**: 24-72 hours

**Result**: 
- [ ] Approved on first submission
- [ ] Metadata Rejected (description/screenshots issue)
- [ ] Binary Rejected (app behavior issue)

**Notes**: _________________________________

---

**END OF CHECKLIST**

**Status**: Ready for use. Do not proceed past this step without user confirmation.
