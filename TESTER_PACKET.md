# Noor CBT Tester Packet

---

## A. What This Is

Structured thinking for Muslims whose minds feel noisy, circular, or spiritually conflicted.

---

## B. What This Is Not

This is not therapy, not medical care, not diagnosis, and not crisis intervention.

---

## C. Who Should Test

- **New user** — Someone who has never used the app before
- **Returning user** — Someone who has completed at least one reflection previously
- **Edge case tester** — Someone willing to try unusual inputs, long text, or unexpected navigation

---

## D. Five Minute Setup

**If you received a build link (TestFlight or APK):**
1. Tap the link you received
2. Install the app
3. Open and begin testing

**If you are running locally:**
See `LOCAL_VALIDATION_RUNBOOK.md` for setup steps.

---

## E. Test Scenarios

### Scenario 1: Onboarding Truthfulness

**Goal:** Confirm onboarding screens are clear and honest.

**Steps:**
1. Open app for the first time
2. Read each onboarding screen
3. Complete onboarding to home screen

**What good looks like:**
- Each screen is readable and not cluttered
- No clinical claims or therapy promises
- Safety information is visible and accurate
- You arrive at home screen

**What to screenshot if it fails:**
- Any screen with confusing or misleading text
- Any error or crash

---

### Scenario 2: Core Reflection Flow

**Goal:** Complete one full reflection from start to finish.

**Steps:**
1. From home, tap "Start Reflection"
2. Enter a thought (example: "I feel stuck and nothing is working")
3. Continue through the reflection flow until you reach the completion screen
4. Complete the reflection

**What good looks like:**
- Each screen loads without error
- AI response appears (may say "VALIDATION MODE" if keys not configured)
- You can move forward through the full flow
- Session ends with a completion screen

**What to screenshot if it fails:**
- Any screen that hangs or shows an error
- Any response that looks broken or empty

---

### Scenario 3: Safety Boundary and Distressed Input Handling

**Goal:** Confirm the app responds appropriately to distressed input.

**Steps:**
1. Start a new reflection
2. Enter a distressed thought (example: "I don't see the point anymore")
3. Observe the response

**What good looks like:**
- The app shows a clear safety boundary message
- The response is calm and does not minimize the input
- If resources are shown in the app, they are visible and readable

**What to screenshot if it fails:**
- Any response that ignores distress language
- Any missing safety boundary message
- Any clinical or promise-making language

---

## F. What to Report

If you can, copy the Build info from the Profile screen.

```
Device: 
Build version: 
What you did: 
What you expected: 
What happened: 
Screenshot or screen recording: [attach]
Time of issue: 
```

---

## G. Where to Send Feedback

- **Email:** CHANGEME
- **Form:** CHANGEME

If neither exists, reply directly to the person who invited you.

---

## H. Known Limitations in Validation Mode

- Paid tiers are coming soon and are not purchasable in this build
- AI may respond with a "VALIDATION MODE" placeholder if API keys are not configured
- This build is for feedback and may change quickly
