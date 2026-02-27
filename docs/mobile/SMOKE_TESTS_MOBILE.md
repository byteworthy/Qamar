# Mobile Smoke Tests

**Purpose**: Manual smoke test procedures for Qamar mobile app
**Last Updated**: 2026-01-19  
**Owner**: QA / Release Management

---

## Overview

These are step-by-step manual tests to verify core functionality before release. Perform these tests on both iOS and Android devices.

**Test Environment:**
- Real devices (not just simulators/emulators)
- Production backend (or staging if testing pre-launch)
- Sandbox/test billing accounts

---

## Test 1: Free Tier Flow

**Objective**: Verify free tier works with 1 reflection/day limit

### Prerequisites
- Fresh app install (or clear app data)
- No active subscription

### Steps

1. **Launch App**
   - Tap app icon
   - **Expected**: Onboarding Welcome screen appears

2. **Complete Onboarding**
   - Tap "Continue" on Welcome screen
   - **Expected**: Privacy screen appears
   - Tap "Continue" on Privacy screen
   - **Expected**: Safety screen appears
   - Tap "Get Started" on Safety screen
   - **Expected**: Home screen appears with "Start Reflection" button

3. **Start First Reflection**
   - Tap "Start Reflection" button on Home screen
   - **Expected**: ThoughtCapture screen appears with text input

4. **Enter Thought**
   - Type: "I am worried about the future"
   - Select emotional state: "Anxious" (or any emotion)
   - Tap "Analyze" button
   - **Expected**: Loading indicator appears
   - **Expected**: Navigate to Distortion screen with detected distortions

5. **Review Distortions**
   - **Expected**: At least one distortion listed (e.g., "Fortune-telling")
   - Tap "Continue" button
   - **Expected**: Navigate to BeliefInspection screen

6. **Review Beliefs**
   - **Expected**: Underlying beliefs displayed
   - Tap "Continue" button
   - **Expected**: Navigate to Reframe screen

7. **Review Reframe**
   - **Expected**: Islamic-grounded reframe suggestions displayed
   - Tap "Continue" button
   - **Expected**: Navigate to Regulation screen

8. **Practice Calming**
   - Tap "Try a Practice" button
   - **Expected**: Navigate to CalmingPractice screen
   - **Expected**: Dhikr-based practice displayed
   - Tap "Continue" or "Skip"
   - **Expected**: Navigate to Intention screen

9. **Set Intention**
   - Type: "Remember Allah's plan" (or any intention)
   - Tap "Complete" button
   - **Expected**: Navigate to SessionComplete screen
   - **Expected**: Summary displayed with completion message

10. **Complete Reflection**
    - Tap "Done" button
    - **Expected**: Navigate back to Home screen
    - **Expected**: "Start Reflection" button available

11. **Attempt Second Reflection (Same Day)**
    - Tap "Start Reflection" button again
    - **Expected**: Modal or screen showing daily limit reached
    - **Expected**: "Upgrade to Qamar Plus" or "Upgrade" button shown
    - **Expected**: Message: "Free tier: 1 reflection per day"

12. **Check History (Free Tier)**
    - Tap "History" tab at bottom
    - **Expected**: Navigate to History screen
    - **Expected**: See 1 completed reflection listed
    - **Expected**: "Upgrade for full history" message shown

### Result
- [ ] PASS: Free tier works as expected
- [ ] FAIL: (Describe issue)

---

## Test 2: Qamar Plus Purchase and Unlock

**Objective**: Verify Plus subscription purchase and feature unlock

### Prerequisites
- Sandbox tester account configured (iOS: App Store Connect, Android: Play Console)
- App in test mode (sandbox billing)

### Steps

1. **Trigger Upgrade Flow**
   - Complete Test 1 (reach daily limit)
   - Tap "Upgrade" button from daily limit screen
   - **Expected**: Navigate to Pricing screen

2. **Review Pricing Screen**
   - **Expected**: Three tiers shown: Free, Plus, Premium
   - **Expected**: Plus Monthly price: $9.99/month
   - **Expected**: Plus Yearly price: $79.99/year
   - **Expected**: "Restore Purchases" button visible at bottom
   - **Expected**: Terms and Privacy Policy links visible

3. **Select Plus Monthly**
   - Tap "Plus Monthly" card or "Subscribe" button
   - **Expected**: Native payment sheet appears (Apple/Google)
   - **Expected**: Price shown correctly ($9.99/month)
   - **Expected**: Subscription details displayed

4. **Complete Purchase (Sandbox)**
   - Confirm purchase in sandbox payment sheet
   - **Expected**: Purchase processes
   - **Expected**: Navigate to BillingSuccess screen
   - **Expected**: Success message displayed
   - **Expected**: "Continue" button shown

5. **Verify Unlock**
   - Tap "Continue" button
   - **Expected**: Navigate back to Home or previous screen
   - Tap "Profile" tab
   - **Expected**: Subscription status shows "Qamar Plus"
   - **Expected**: Renewal date displayed (sandbox accelerated time)

6. **Test Unlimited Reflections**
   - Navigate to Home screen
   - Tap "Start Reflection" button
   - **Expected**: ThoughtCapture screen appears (no daily limit)
   - Complete reflection (follow steps from Test 1)
   - Return to Home
   - Tap "Start Reflection" button again immediately
   - **Expected**: ThoughtCapture screen appears again (no limit message)

7. **Test Full History Access**
   - Complete 2-3 reflections
   - Tap "History" tab
   - **Expected**: All reflections listed
   - **Expected**: No "upgrade" message
   - **Expected**: Can tap and view each reflection

8. **Test Insights (Plus Feature)**
   - Tap "Insights" tab
   - **Expected**: Pattern insights displayed
   - **Expected**: No paywall or upgrade prompt

### Result
- [ ] PASS: Plus subscription works as expected
- [ ] FAIL: (Describe issue)

---

## Test 3: Qamar Premium Purchase and Unlock

**Objective**: Verify Premium subscription purchase and advanced features

### Prerequisites
- Sandbox tester account
- Fresh app install (or start from Free tier)

### Steps

1. **Navigate to Pricing**
   - From Home, tap "Profile" tab
   - Tap "Upgrade" button (or navigate via daily limit)
   - **Expected**: Pricing screen appears

2. **Select Premium Monthly**
   - Tap "Premium Monthly" card or "Subscribe" button
   - **Expected**: Native payment sheet shows $19.99/month
   - Confirm purchase
   - **Expected**: Success screen appears

3. **Verify Premium Status**
   - Navigate to Profile tab
   - **Expected**: Subscription shows "Qamar Premium"
   - **Expected**: Renewal date displayed

4. **Test Premium Features**
   
   **A. Advanced Insights Dashboard**
   - Tap "Insights" tab
   - **Expected**: Advanced insights visible (more detailed than Plus)
   - **Expected**: Charts or visualizations shown (if implemented)
   
   **B. Assumption Library**
   - Tap "Explore" tab
   - Tap "Assumption Library" section (if visible)
   - **Expected**: Personal assumption library accessible
   - **Expected**: Can add/edit assumptions
   
   **C. Data Export**
   - Tap "Profile" tab
   - Tap "Export Data" button (if available)
   - **Expected**: Export process initiates
   - **Expected**: JSON file generated
   - **Expected**: Share sheet appears (iOS) or download notification (Android)

5. **Verify Plus Features Still Work**
   - Tap "Start Reflection" (should be unlimited)
   - Complete reflection
   - Check History (all visible)
   - Check Insights (accessible)

### Result
- [ ] PASS: Premium subscription works as expected
- [ ] FAIL: (Describe issue)

---

## Test 4: Restore Purchases

**Objective**: Verify subscription restoration after reinstall

### Prerequisites
- Active subscription (Plus or Premium) from Test 2 or 3
- Same device with same Apple ID/Google account

### Steps

1. **Delete App**
   - Long press app icon → Delete/Uninstall
   - Confirm deletion
   - **Expected**: App removed from device

2. **Reinstall App**
   - Download from TestFlight (iOS) or Play Internal (Android)
   - Open app after installation
   - **Expected**: Onboarding screens appear (fresh install)

3. **Complete Onboarding**
   - Go through Welcome → Privacy → Safety screens
   - **Expected**: Reach Home screen

4. **Check Subscription Status**
   - Tap "Profile" tab
   - **Expected**: Shows "Free" tier (subscription not restored yet)
   - **Expected**: "Upgrade" button visible

5. **Navigate to Pricing**
   - Tap "Upgrade" button
   - **Expected**: Pricing screen appears

6. **Restore Purchases**
   - Tap "Restore Purchases" button at bottom
   - **Expected**: Loading indicator appears
   - **Expected**: Native billing check happens
   - **Expected**: Success message: "Purchases restored" or similar
   - **Expected**: Navigate back or show confirmation

7. **Verify Restoration**
   - Navigate to Profile tab
   - **Expected**: Subscription status shows correct tier (Plus or Premium)
   - **Expected**: Renewal date displayed
   - Test unlimited reflections
   - **Expected**: No daily limit
   - Check History
   - **Expected**: Full access (no upgrade prompt)

### Result
- [ ] PASS: Restore purchases works
- [ ] FAIL: (Describe issue)

---

## Test 5: Onboarding One-Time Behavior

**Objective**: Verify onboarding shows once only

### Prerequisites
- Fresh app install

### Steps

1. **First Launch**
   - Launch app
   - **Expected**: Onboarding Welcome screen appears

2. **Complete Onboarding**
   - Go through all 3 screens (Welcome → Privacy → Safety)
   - Tap "Get Started" on final screen
   - **Expected**: Navigate to Home screen

3. **Close App Completely**
   - Swipe up to close app (iOS) or force stop (Android)
   - **Expected**: App closed

4. **Relaunch App**
   - Tap app icon to open
   - **Expected**: Home screen appears directly
   - **Expected**: NO onboarding screens shown

5. **Verify Onboarding Flag**
   - Storage should have flag: `@noor_onboarding_completed: "true"`
   - (This is internal - verify by behavior only)

### Result
- [ ] PASS: Onboarding shows once only
- [ ] FAIL: (Describe issue)

---

## Test 6: Crisis Flow Behavior

**Objective**: Verify crisis detection and resource display

### Prerequisites
- App installed and onboarding complete

### Steps

1. **Navigate to Thought Capture**
   - Tap "Start Reflection" from Home
   - **Expected**: ThoughtCapture screen appears

2. **Enter Crisis Language**
   - Type: "I want to hurt myself"
   - Select emotional state: "Hopeless" or "Anxious"
   - Tap "Analyze" button
   - **Expected**: Loading indicator appears briefly

3. **Crisis Resources Display**
   - **Expected**: Crisis detected
   - **Expected**: Modal or screen appears with 988 resources
   - **Expected**: "988 Suicide & Crisis Lifeline" prominently displayed
   - **Expected**: "Call 988" button visible
   - **Expected**: "Text HELLO to 741741" option visible
   - **Expected**: Message: "If you are in immediate danger, call 911"

4. **Test Call Button (Do Not Actually Call)**
   - Tap "Call 988" button
   - **Expected**: Phone dialer opens with 988 pre-filled
   - **Cancel** the call immediately
   - Return to app

5. **Access Crisis Resources Anytime**
   - From any screen, check navigation
   - Look for "Get Help" or crisis resources button
   - Tap it
   - **Expected**: Crisis resources screen appears
   - **Expected**: 988 and other resources listed

6. **Continue After Crisis Screen**
   - Dismiss crisis resources modal/screen
   - **Expected**: Return to previous screen or Home
   - **Expected**: Can continue using app normally

### Result
- [ ] PASS: Crisis detection and resources work
- [ ] FAIL: (Describe issue)

---

## Test 7: Offline Behavior

**Objective**: Verify app functions without internet

### Prerequisites
- App installed with at least 1 completed reflection

### Steps

1. **Enable Airplane Mode**
   - Turn on Airplane Mode on device
   - **Expected**: No internet connection

2. **Launch App**
   - Open Qamar app
   - **Expected**: App launches successfully
   - **Expected**: Home screen appears

3. **View History (Offline)**
   - Tap "History" tab
   - **Expected**: Previously completed reflections visible
   - **Expected**: Can tap and view reflection details
   - **Expected**: All local data accessible

4. **Start Reflection (Offline)**
   - Tap "Start Reflection" button
   - Type a thought
   - Tap "Analyze" button
   - **Expected**: Error message appears
   - **Expected**: Message: "No internet connection" or similar
   - **Expected**: Graceful error handling (no crash)

5. **View Profile (Offline)**
   - Tap "Profile" tab
   - **Expected**: Profile screen loads
   - **Expected**: Subscription status may show cached value
   - **Expected**: No crash

6. **View Insights (Offline)**
   - Tap "Insights" tab
   - **Expected**: Screen loads with cached/local data if available
   - **Expected**: Or shows message about needing connection
   - **Expected**: No crash

7. **Disable Airplane Mode**
   - Turn off Airplane Mode
   - Wait for connection to restore
   - Return to app
   - Start reflection again
   - **Expected**: AI processing works normally

### Result
- [ ] PASS: Offline behavior is graceful
- [ ] FAIL: (Describe issue)

---

## Test 8: Error Handling Behavior

**Objective**: Verify graceful error handling for common failures

### Test 8A: Backend Down

**Steps:**
1. Stop backend server (if you have control) or block API domain
2. Open app and attempt reflection
3. Tap "Analyze" button
4. **Expected**: Error message appears
5. **Expected**: Message: "Server error" or "Try again later"
6. **Expected**: App does not crash
7. **Expected**: Can return to Home and try again

### Test 8B: Slow Network

**Steps:**
1. Enable network throttling (iOS: Xcode → Debug → Network Link Conditioner set to "3G" or "Edge")
2. Start reflection
3. Tap "Analyze" button
4. **Expected**: Loading indicator appears
5. **Expected**: Request eventually completes or times out
6. **Expected**: If timeout, error message shown
7. **Expected**: No app freeze or crash

### Test 8C: Invalid Response

**Steps:**
1. Enter unusual thought text: "!!@#$%^&*()" or very long text (>2000 chars)
2. Tap "Analyze"
3. **Expected**: Either processes normally or shows validation error
4. **Expected**: Error message if length exceeded: "Thought too long (max 2000 characters)"
5. **Expected**: No crash

### Test 8D: Subscription Error

**Steps:**
1. While in Pricing screen, turn on Airplane Mode
2. Attempt to purchase subscription
3. **Expected**: Error message about connection
4. **Expected**: Purchase does not complete
5. **Expected**: User remains on Pricing screen
6. **Expected**: No crash

### Result
- [ ] PASS: All error scenarios handled gracefully
- [ ] FAIL: (Describe issues)

---

## Quick Smoke Test (5 Minutes)

**For rapid verification before each build:**

1. **Launch** → Onboarding appears (first time) or Home (subsequent)
2. **Complete Reflection** → Full journey from thought to completion
3. **View History** → Can see completed reflection
4. **Test Crisis** → Enter crisis language, see 988 resources
5. **Test Subscription** → Open Pricing screen, see tiers
6. **Offline** → Enable airplane mode, verify no crash

**Pass Criteria**: All 6 steps work without crashes

---

## Device Matrix

**Test on these devices minimum:**

**iOS:**
- [ ] iPhone 13 or newer (iOS 16+)
- [ ] iPhone SE (iOS 15+)
- [ ] iPad (optional but recommended)

**Android:**
- [ ] Pixel 6 or Samsung Galaxy (Android 12+)
- [ ] Mid-range device (Android 11+)

**OS Versions:**
- [ ] iOS: Test on iOS 15, 16, 17
- [ ] Android: Test on Android 10, 11, 12, 13, 14

---

## Test Results Template

```
Date: YYYY-MM-DD
Tester: [Name]
Build: [Version number]
Platform: iOS / Android
Device: [Model]
OS Version: [Version]

Test 1 (Free Tier): PASS / FAIL
Test 2 (Plus Purchase): PASS / FAIL
Test 3 (Premium Purchase): PASS / FAIL
Test 4 (Restore Purchases): PASS / FAIL
Test 5 (Onboarding): PASS / FAIL
Test 6 (Crisis Flow): PASS / FAIL
Test 7 (Offline): PASS / FAIL
Test 8 (Error Handling): PASS / FAIL

Notes:
[Any issues or observations]

Overall: PASS / FAIL
```

---

**Last Updated**: 2026-01-19  
**Next Review**: After first beta testing round
