# Chunk 6: Onboarding Flow - Manual Test Checklist

## Purpose
This checklist provides step-by-step manual testing procedures for the onboarding flow since there is no UI test framework configured for React Native in this project.

## Test Environment Setup
- Device/Simulator: iOS or Android
- Build: Development build with fresh app state
- Storage: AsyncStorage accessible for manual clearing

---

## Test Case 1: Fresh Install - First Launch

### Objective
Verify that a fresh app install shows the onboarding flow.

### Prerequisites
- Clean installation (no previous app data)
- OR manually clear AsyncStorage (developer mode)

### Steps
1. Launch the app for the first time
2. Observe the initial screen

### Expected Results
- ✅ App displays the **Welcome** screen (Onboarding_Welcome)
- ✅ Welcome screen shows:
  - Sun icon
  - "Welcome to Noor CBT" title
  - Brand tagline
  - "What This App Does" card
  - "Important Boundaries" card
  - Disclaimer
  - "Continue" button at bottom
- ✅ No app crash or error
- ✅ No flicker or navigation jump

### Pass/Fail: ___________

---

## Test Case 2: Navigate Through Onboarding Flow

### Objective
Verify user can navigate through all onboarding screens.

### Prerequisites
- Start from Welcome screen (fresh install or cleared storage)

### Steps
1. From **Welcome Screen**, tap "Continue"
2. Verify **Privacy Screen** appears
3. Read content, then tap "Continue"
4. Verify **Safety Screen** appears
5. Review all content

### Expected Results

**Privacy Screen:**
- ✅ Shield icon displayed
- ✅ "Your Privacy Matters" title
- ✅ Three cards: Local-First Storage, What We Collect, Your Control
- ✅ "Back" and "Continue" buttons visible
- ✅ Back button navigates to Welcome screen
- ✅ Continue button navigates to Safety screen

**Safety Screen:**
- ✅ Heart icon displayed
- ✅ "Your Safety Comes First" title
- ✅ Crisis card with 988 lifeline (amber/orange background)
- ✅ "When to Seek Professional Help" card
- ✅ "Theological Safety" card
- ✅ "Ready to Begin?" card
- ✅ "Back" and "Get Started" buttons visible
- ✅ Back button navigates to Privacy screen

### Pass/Fail: ___________

---

## Test Case 3: Complete Onboarding and Enter App

### Objective
Verify completing onboarding saves flag and enters main app.

### Prerequisites
- Be on the Safety screen (final onboarding screen)

### Steps
1. From **Safety Screen**, tap "Get Started"
2. Wait for navigation
3. Observe destination screen

### Expected Results
- ✅ App navigates to the **Home Screen** (inside Main/TabNavigator)
- ✅ Home screen shows normal content:
  - Greeting (Salaam, Friend)
  - Today's Anchor card
  - Journey Progress card
  - Tools for Your Journey section
- ✅ Tab bar is visible at bottom
- ✅ No loading state or delay
- ✅ Navigation is clean (no flicker)

### Pass/Fail: ___________

---

## Test Case 4: Subsequent Launch - Onboarding Bypassed

### Objective
Verify that once onboarding is completed, subsequent app launches skip it.

### Prerequisites
- Onboarding has been completed (Test Case 3 passed)
- App is fully closed (force quit from multitasking)

### Steps
1. Completely close the app (swipe away from multitasking)
2. Re-launch the app from home screen
3. Observe the first screen shown

### Expected Results
- ✅ App launches directly to **Home Screen** (Main tab)
- ✅ Onboarding screens are NOT shown
- ✅ No visible delay or loading screen
- ✅ User goes straight to main app experience

### Pass/Fail: ___________

---

## Test Case 5: Back Navigation Within Onboarding

### Objective
Verify back navigation works correctly within onboarding flow.

### Prerequisites
- Start with cleared storage to see onboarding

### Steps
1. From **Welcome**, tap Continue → arrives at **Privacy**
2. From **Privacy**, tap Back → should return to **Welcome**
3. From **Welcome**, tap Continue → arrives at **Privacy**
4. From **Privacy**, tap Continue → arrives at **Safety**
5. From **Safety**, tap Back → should return to **Privacy**

### Expected Results
- ✅ Back button always returns to previous onboarding screen
- ✅ Navigation stack preserves state
- ✅ No crashes or blank screens
- ✅ Animations are smooth

### Pass/Fail: ___________

---

## Test Case 6: Crisis Lifeline Link (Optional Feature Test)

### Objective
Verify the 988 crisis link on Safety screen works.

### Prerequisites
- Be on Safety screen
- Device has phone capabilities (physical device, not simulator)

### Steps
1. Navigate to **Safety Screen**
2. Tap the amber button "Call 988 - Suicide & Crisis Lifeline"
3. Observe system behavior

### Expected Results
- ✅ System prompts to call 988
- ✅ OR opens phone dialer with 988 pre-filled
- ✅ No app crash
- ✅ User can cancel if they don't want to place call

### Pass/Fail: ___________

---

## Test Case 7: Developer - Reset Onboarding (Manual)

### Objective
Verify developers can manually reset onboarding to test again.

### Prerequisites
- Developer tools/console access
- OR ability to clear AsyncStorage manually

### Steps
1. Close the app
2. Clear AsyncStorage key `@noor_onboarding_completed`
   - iOS: Delete app data or use dev tools
   - Android: Clear app data in settings
3. Re-launch app

### Expected Results
- ✅ App shows Welcome screen again
- ✅ Onboarding flow restarts from beginning
- ✅ Can complete flow again

### Pass/Fail: ___________

---

## Test Case 8: TypeScript & Build Verification

### Objective
Verify code compiles without errors.

### Steps
1. Run `npm run typecheck`
2. Observe output

### Expected Results
- ✅ TypeCheck passes with no errors
- ✅ All onboarding screen imports resolve
- ✅ RootStackParamList includes onboarding routes
- ✅ Navigation types are correct

### Pass/Fail: ___________

---

## Test Case 9: Jest Test Suite

### Objective
Verify existing tests still pass.

### Steps
1. Run `npm test`
2. Review output

### Expected Results
- ✅ All existing tests pass
- ✅ No new test failures introduced
- ✅ No import errors for new files

### Pass/Fail: ___________

---

## Edge Cases & Additional Checks

### Visual Checks
- [ ] All text is readable in both light and dark themes (if applicable)
- [ ] Icons render correctly
- [ ] Cards have proper spacing and padding
- [ ] Buttons are easily tappable (44x44pt minimum)
- [ ] Safe area insets respected on iPhone notch/Android gesture bar

### Content Checks
- [ ] All crisis resources are accurate (988 number)
- [ ] Privacy information is truthful
- [ ] Boundaries are clear and appropriate
- [ ] No typos or grammatical errors

### Accessibility Checks (Optional)
- [ ] Screen reader can read all content
- [ ] Buttons have accessible labels
- [ ] Color contrast meets WCAG standards

---

## Final Acceptance Criteria

Before marking this chunk complete, verify:

- ✅ App boots successfully
- ✅ Fresh launch shows onboarding Welcome screen
- ✅ User can navigate through all 3 onboarding screens
- ✅ Completing onboarding stores flag and shows main app
- ✅ Subsequent launches bypass onboarding
- ✅ No changes to existing CBT flow screens
- ✅ No changes to backend
- ✅ `npm run typecheck` passes
- ✅ `npm test` passes

---

## Notes Section

**Tester Name:** ___________________  
**Date:** ___________________  
**Device/Simulator:** ___________________  
**OS Version:** ___________________

**Additional Observations:**




**Issues Found:**




**Overall Status:** PASS / FAIL / NEEDS REVIEW
