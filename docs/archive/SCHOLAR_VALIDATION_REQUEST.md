# Islamic Content Validation Request

**Date**: January 24, 2026
**App Name**: Noor - Islamic Personal Development
**Purpose**: Beta Launch Content Review
**Requested By**: Noor Development Team

---

## Overview

Noor is an Islamic personal development app that helps Muslims identify and reframe cognitive distortions (negative thought patterns) using Islamic teachings. We've built a database of Quranic ayat and hadith mapped to specific emotional states and thought patterns, and we need scholarly validation before launch.

## What We're Asking You to Review

### 1. Content Database
- **40 Quranic ayat** with Sahih International translations
- **23 hadith** from Sahih Bukhari, Sahih Muslim, or Agreed Upon sources
- All content mapped to specific cognitive patterns and emotional states

### 2. Key Questions We Need Answered

#### Theological Correctness
1. Are the Quranic translations (Sahih International) acceptable for this therapeutic context?
2. Are the hadith citations authentic and properly attributed?
3. Is the Arabic text accurate for all content?

#### Therapeutic Application
4. Is it appropriate to use these ayat/hadith in the context of mental health and thought reframing?
5. Are the therapeutic explanations ("whenToUse", "therapeuticContext") respectful of the sacred texts?
6. Are we staying within the boundaries of Islamic guidance without overstepping into unsound interpretation?

#### Representation
7. Does the content accurately represent Islamic teachings on:
   - Emotional wellness (sabr, tawakkul, shukr)?
   - Self-compassion vs. self-criticism?
   - Dealing with anxiety, grief, and shame?
   - Hope and mercy in times of difficulty?

#### Sensitive Areas
8. **Crisis content**: We intentionally do NOT show Quranic verses when crisis language is detected (per Charter Part 8). Is this approach appropriate?
9. **Scrupulosity**: We have special handling for religious anxiety (waswas). Is our approach sound?
10. **Mental health boundary**: We make clear we're NOT therapy. Is our positioning appropriate?

---

## Content Location

All content is in the file: `shared/islamic-content-expansion.ts`

### Example Entry (Catastrophizing)

```typescript
{
  reference: "Surah Al-Baqarah 2:286",
  arabicText: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
  translation: "Allah does not burden a soul beyond that it can bear.",
  therapeuticContext: "When catastrophizing predicts you cannot handle the outcome, this ayah reminds you that Allah has already factored in your capacity.",
  whenToUse: [
    "Fear of overwhelming outcomes",
    "Predicting disaster",
    "Feeling unable to cope with future events"
  ],
}
```

### Example Entry (Shame/Mercy)

```typescript
{
  narrator: "Abu Hurairah",
  source: "Sahih Muslim 2675",
  arabicText: "لَوْ يَعْلَمُ الْمُؤْمِنُ مَا عِنْدَ اللَّهِ مِنَ الْعُقُوبَةِ مَا طَمِعَ بِجَنَّتِهِ أَحَدٌ",
  translation: "If the believer knew what punishment is with Allah, none would have hope of His Paradise. And if the disbeliever knew what mercy is with Allah, none would despair of His Paradise.",
  therapeuticContext: "When shame tells you that you are beyond Allah's mercy, remember that Allah's mercy encompasses all things. Balance fear with hope.",
  authenticity: "Sahih Muslim",
}
```

---

## How Content Is Used

### In the App Flow

1. **User writes a distressing thought**: "I'm going to fail and disappoint everyone"
2. **AI detects pattern**: Catastrophizing + high emotional intensity
3. **Islamic content is selected**: Relevant ayah about tawakkul + trust
4. **AI generates response**: Compassionate reframe incorporating the Islamic content
5. **User sees**: Both the therapeutic insight AND the Islamic wisdom

### Integration Method

The Islamic content is injected into the AI system prompt like this:

```
ISLAMIC CONTEXT FOR THIS RESPONSE:

Primary Concept: Tawakkul (توكل) - Trust in Allah
Therapeutic Application: Releasing the need to control outcomes
CBT Connection: Challenges catastrophic thinking and fortune-telling

Quranic Reminder (Surah At-Talaq 65:3):
"And whoever relies upon Allah - then He is sufficient for him."
Therapeutic Context: You cannot predict the future with certainty...

RESPONSE GUIDANCE:
- Tone: Gentle and hopeful
- Response Length: Concise
- Emphasis: Balance realism with trust
```

The AI then generates a response that naturally weaves this Islamic wisdom into the therapeutic reframe.

---

## What We Need From You

### Validation Checklist

Please review and provide feedback on:

- [ ] **Accuracy**: Are translations, citations, and Arabic text correct?
- [ ] **Appropriateness**: Is using these texts for mental health support appropriate?
- [ ] **Respect**: Do the therapeutic contexts respect the sacred nature of the texts?
- [ ] **Boundaries**: Are we staying within proper Islamic guidance?
- [ ] **Gaps**: Are we missing important ayat/hadith that should be included?
- [ ] **Concerns**: Any theological or ethical concerns we should address?

### Feedback Format

For each concern, please provide:
1. **Issue**: What's the problem?
2. **Location**: Which ayah/hadith or pattern?
3. **Suggestion**: How should we fix it?
4. **Severity**: Critical (must fix) / Important (should fix) / Minor (consider fixing)

---

## Important Context

### What Noor Is
- Personal development tool with Islamic foundation
- Helps identify cognitive distortions using CBT principles
- Reframes thoughts using Islamic teachings
- Encourages spiritual practices (sabr, shukr, dua)

### What Noor Is NOT
- Not therapy or medical treatment
- Not a Quran app or Islamic reference tool
- Not claiming scholarly authority
- Not interpreting Quran (using established translations only)

### Our Theological Position
- We use only:
  - Sahih International translation for Quran
  - Sahih Bukhari, Sahih Muslim, or Agreed Upon hadith
  - Established Islamic concepts (sabr, tawakkul, tazkiyah, etc.)
- We avoid:
  - Novel interpretations
  - Weak or fabricated hadith
  - Claims of spiritual authority
  - Replacing professional mental health care

### Safety Measures
- **Crisis detection**: Professional help recommended immediately
- **No verses in crisis**: Only compassionate support messages
- **Scrupulosity handling**: Gentle redirection away from religious anxiety loops
- **Clear disclaimers**: "Not medical advice or therapy"

---

## Review Timeline

**Ideal Timeline**: 1 week
**Minimum Needed**: Core theological accuracy (2-3 days)
**Can Launch Without**: Deep scholarly review (but preferred to have)

**Urgency**: We're targeting App Store submission in 1-2 weeks. Your review would help us ensure we're representing Islamic teachings respectfully and accurately.

---

## Questions to Consider

1. **Can this content cause harm?** (Spiritual, psychological, theological)
2. **Will scholars in the community find this respectful?**
3. **Are we staying within our lane?** (Personal development, not fatwa/scholarship)
4. **What are we missing?** (Essential ayat/hadith for this purpose)

---

## How to Access the Full Content

### Option 1: Read the File
Open `shared/islamic-content-expansion.ts` in the codebase to see all 40 ayat and 23 hadith with full context.

### Option 2: Request Formatted Document
We can provide a formatted PDF with all content organized by pattern (catastrophizing, shame, anxiety, etc.) for easier review.

### Option 3: See It In Action
We can provide demo access to the beta app so you can see how the content appears to users in real scenarios.

---

## Contact & Questions

If you have any questions about:
- How the content is used
- The therapeutic approach
- Islamic framework integration
- Technical implementation
- Specific use cases

Please reach out and we'll provide clarification.

---

## Compensation

We understand this is specialized work requiring Islamic knowledge and time. Please let us know:
- Your standard consultation rate
- Estimated time for review
- Preferred format for feedback

We're happy to compensate appropriately for your expertise.

---

## Thank You

JazakAllahu Khayran for considering this review. The goal of Noor is to help Muslims integrate their faith with personal growth in a way that's both therapeutically sound and Islamically respectful. Your guidance will help ensure we achieve this balance.

May Allah reward your efforts in reviewing this work for the benefit of the Muslim community.

---

**Next Steps**:
1. Review content in `shared/islamic-content-expansion.ts`
2. Provide feedback using the checklist above
3. Flag any critical concerns for immediate attention
4. Suggest additions or improvements

**Timeline**: Feedback needed by: [Your target date - suggest 1 week from now]
