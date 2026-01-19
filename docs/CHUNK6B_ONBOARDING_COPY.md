# Chunk 6B: Onboarding Copy - Store-Safe & Truth-Aligned

## Purpose
Store-safe, user-clear onboarding text aligned with USER_TRANSPARENCY.md and store policies.

## Review Criteria Met
- ✅ Not medical care (explicit)
- ✅ Not crisis service (explicit with 988 prominently featured)
- ✅ Crisis help instructions clear
- ✅ Data handling matches USER_TRANSPARENCY.md
- ✅ Subscription disclosure included
- ✅ No clinical outcome claims
- ✅ No misleading statements
- ✅ Short, clear sentences
- ✅ AI nature disclosed
- ✅ Islamic framing boundaries clear

---

## Screen 1: Welcome Screen

### Header
**Icon:** Sun (☀️)  
**Title:** Welcome to Noor CBT  
**Tagline:** Light for the mind, rooted in Islam.

### Card 1: What This App Does
**Icon:** Check circle  
**Title:** What This App Does

**Bullets:**
- Guides you through reflection using CBT principles
- Uses an AI companion, not a human therapist
- Rooted in an Islamic framework of mercy and wisdom
- Helps you examine thought patterns and find clarity
- Free tier available, with optional Noor Plus subscription

### Card 2: Important Boundaries
**Icon:** Alert circle  
**Title:** Important Boundaries

**Bullets:**
- This is not therapy or medical care
- This is not crisis intervention or emergency support
- This is not religious counseling or fatwa
- AI can make mistakes—your discernment matters
- For serious concerns, seek qualified professional help

### Footer Disclaimer
A guided reflection tool. Not a substitute for professional care.

### Button
Continue →

---

## Screen 2: Privacy Screen

### Header
**Icon:** Shield (🛡️)  
**Title:** Your Privacy Matters  
**Subtitle:** We believe your reflections should stay yours

### Card 1: Local-First Storage
**Icon:** Smartphone  
**Title:** Local-First Storage

**Bullets:**
- Your reflections are stored on your device only
- We do not send your thoughts or reflections to a server
- Your reflection content never leaves your phone
- Account data (email, subscription) stored separately for login

### Card 2: What We Collect
**Icon:** Lock  
**Title:** What We Collect

**Bullets:**
- Session metadata (duration, interactions, safety events)
- Account email for login
- Subscription status if you upgrade
- No personal identifiers in your reflections
- No tracking across other apps or websites

### Card 3: Your Control
**Icon:** User check  
**Title:** Your Control

**Bullets:**
- Delete reflections anytime from History
- Export your data as JSON
- Delete your account from settings
- Uninstalling removes all local reflection data

### Footer Note
For full details, see our Privacy Policy in Settings after you begin.

### Buttons
← Back | Continue →

---

## Screen 3: Safety Screen

### Header
**Icon:** Heart (❤️)  
**Title:** Your Safety Comes First  
**Subtitle:** Please read this carefully before beginning

### Card 1: In Crisis? Get Help Now
**Background Color:** Amber (#FEF3E2)  
**Icon:** Phone (⚠️ color)  
**Title:** In Crisis? Get Help Now

**Body Text:**
If you are experiencing a mental health crisis or having thoughts of self-harm:

**Button (Amber):**
📞 Call 988 - Suicide & Crisis Lifeline

**Additional Text:**
Or call 911 for immediate emergency assistance

### Card 2: When to Seek Professional Help
**Icon:** Alert triangle  
**Title:** When to Seek Professional Help

**Bullets:**
- Persistent feelings of hopelessness or despair
- Thoughts of harming yourself or others
- Severe anxiety or panic that disrupts daily life
- Symptoms interfering with work, relationships, or health
- Any time you feel you need more support

### Card 3: Theological Safety
**Icon:** Compass  
**Title:** Theological Safety

**Bullets:**
- This app uses Islamic concepts as anchors for reflection
- It does not provide religious rulings or scholarly guidance
- AI can make theological mistakes—verify with scholars
- For religious questions, consult qualified Islamic scholars
- Mental health and spiritual care work together, not instead of each other

### Card 4: Ready to Begin?
**Icon:** Check circle  
**Title:** Ready to Begin?

**Body Text:**
This is an AI companion for gentle self-reflection. Use it alongside, not instead of, professional care when needed.

### Buttons
← Back | Get Started ✓

---

## Key Changes From Original Copy

### 1. AI Disclosure
- **Added:** "Uses an AI companion, not a human therapist"
- **Added:** "AI can make mistakes—your discernment matters"
- **Added:** "AI can make theological mistakes—verify with scholars"
- **Reason:** Store requirement + USER_TRANSPARENCY alignment

### 2. Crisis Language Consistency
- **Kept:** 988 Suicide & Crisis Lifeline (matches USER_TRANSPARENCY)
- **Kept:** Amber/orange crisis card styling
- **Reason:** Visual prominence for safety

### 3. Data Handling Accuracy
- **Changed:** "We don't send your thoughts or sessions to any server" → "We do not send your thoughts or reflections to a server"
- **Added:** "Account data (email, subscription) stored separately for login"
- **Changed:** "Basic app usage" → "Session metadata (duration, interactions, safety events)"
- **Reason:** Exact match to USER_TRANSPARENCY and DATA_HANDLING_SUMMARY

### 4. Subscription Disclosure
- **Added:** "Free tier available, with optional Noor Plus subscription"
- **Reason:** App Store requirement for in-app purchases

### 5. Medical Disclaimer
- **Changed:** "This is not a replacement for professional therapy" → "This is not therapy or medical care"
- **Reason:** Clearer, more direct, store-compliant

### 6. Theological Boundaries
- **Added:** "AI can make theological mistakes—verify with scholars"
- **Changed:** "It does not provide religious rulings" → more specific
- **Reason:** Accuracy and safety

### 7. Sentence Structure
- **Changed:** All long sentences broken into short, clear statements
- **Removed:** Contractions in formal statements (don't → do not)
- **Reason:** Store readability standards

### 8. No Outcome Claims
- **Confirmed:** No claims like "reduces anxiety" or "improves mental health"
- **Kept:** Descriptive language only ("helps you examine," "find clarity")
- **Reason:** Store compliance + truth alignment

---

## Store Safety Verification Checklist

- ✅ No medical claims (diagnosis, treatment, cure)
- ✅ No clinical outcome promises
- ✅ Crisis resources prominently featured
- ✅ Clear "not therapy" statement
- ✅ Clear "not crisis service" statement
- ✅ Clear "not religious authority" statement
- ✅ AI nature disclosed upfront
- ✅ Data collection accurately described
- ✅ Subscription disclosed
- ✅ Professional help recommended appropriately
- ✅ User agency and discernment emphasized
- ✅ No misleading simplification
- ✅ Consistent with USER_TRANSPARENCY.md
- ✅ Consistent with DATA_HANDLING_SUMMARY.md
- ✅ Consistent with APP_STORE_METADATA.md

---

## Implementation Notes

All copy is embedded directly in the screen components:
- `client/screens/onboarding/WelcomeScreen.tsx`
- `client/screens/onboarding/PrivacyScreen.tsx`
- `client/screens/onboarding/SafetyScreen.tsx`

No separate strings file needed for this small amount of static onboarding text.

---

**Last Updated:** January 19, 2026  
**Aligned With:** USER_TRANSPARENCY.md v1.0, DATA_HANDLING_SUMMARY.md, APP_STORE_METADATA.md
