# App Store Metadata (iOS)

## App Name
Noor CBT

## Subtitle
Islamic CBT companion for mindful reflection

## Description
Noor CBT is an AI-assisted Islamic CBT companion designed to help Muslims work through difficult thoughts with evidence-based cognitive behavioral techniques grounded in Islamic values.

The app guides you through a gentle reflection flow:
• Capture troubling thoughts with emotional awareness
• Identify cognitive patterns with AI assistance
• Reframe perspectives using Islamic principles
• Ground yourself with dhikr-based calming practices  
• Set meaningful intentions (niyyah) for moving forward

Key features:
• AI companion for CBT reflection (not a human therapist)
• Islamic framework woven throughout (sabr, tawakkul, tawbah)
• Crisis resources prominently featured (988 Suicide & Crisis Lifeline)
• Privacy-first: reflections stored locally on your device
• Free tier with optional premium subscriptions
• No account required, no social features, no ads

Clear boundaries:
• Not therapy or medical care
• Not crisis intervention or emergency support
• Not religious counseling or fatwa
• AI can make mistakes—your discernment matters

## Keywords
Islamic CBT, Muslim mental wellness, anxiety support, reflection, grounding, dua, niyyah, mindfulness, emotional regulation, dhikr, sabr, tawakkul

## Categories
- Primary: Health & Fitness
- Secondary: Lifestyle

## Age Rating
**Recommended**: 12+ (Infrequent/Mild Medical/Treatment Information)

**Rationale**: App contains mental health reflection content and crisis resource information. Suitable for teens and adults seeking emotional wellness support.

## Support URL
https://example.com/support (PLACEHOLDER - to be replaced with actual URL)

## Marketing URL
https://example.com (PLACEHOLDER - to be replaced with actual URL)

## Privacy Policy URL
https://example.com/privacy (PLACEHOLDER - to be replaced with actual URL)

**Draft Legal Documents Available:**
- Terms of Service: `legal/TERMS_OF_SERVICE_DRAFT.md`
- Privacy Policy: `legal/PRIVACY_POLICY_DRAFT.md`
- Disclaimers: `legal/DISCLAIMERS_DRAFT.md`

⚠️ **Legal documents are DRAFTS and require review by qualified legal counsel before publication.**

## In-App Purchases (Apple In-App Purchase)

### Free Tier (No Purchase)
- 1 reflection per day
- Basic CBT journey
- Crisis resources
- Dhikr-based grounding
- Local storage only

### Noor Plus - Monthly
- **Product ID**: `com.noorcbt.plus.monthly`
- **Price**: $9.99/month
- **Type**: Auto-renewing subscription
- **Features**:
  - Unlimited reflections
  - Full history access
  - Pattern insights
  - Contextual duas
  - Journey progress tracking

### Noor Plus - Yearly
- **Product ID**: `com.noorcbt.plus.yearly`
- **Price**: $79.99/year (save 33%)
- **Type**: Auto-renewing subscription
- **Features**: Same as monthly, billed annually

### Noor Premium - Monthly
- **Product ID**: `com.noorcbt.premium.monthly`
- **Price**: $19.99/month
- **Type**: Auto-renewing subscription
- **Features**:
  - All Noor Plus features
  - Advanced insights dashboard
  - Personal assumption library
  - Priority AI processing
  - Export reflection data (JSON)

### Noor Premium - Yearly
- **Product ID**: `com.noorcbt.premium.yearly`
- **Price**: $159.99/year (save 33%)
- **Type**: Auto-renewing subscription
- **Features**: Same as monthly, billed annually

**Note**: All subscriptions managed through Apple In-App Purchase. No external payment processing.

## Subscription Details for App Store Connect

**Subscription Group Name**: Noor CBT Subscriptions

**Free Trial**: None (to be configured if desired)

**Introductory Offer**: None (to be configured if desired)

**Subscription Display Name (User-Facing)**:
- "Noor Plus Monthly" / "Noor Plus Yearly"
- "Noor Premium Monthly" / "Noor Premium Yearly"

**Subscription Description**:
"Unlock unlimited reflections, insights, and advanced features to deepen your journey of self-awareness and spiritual grounding."

## Notes for App Review

### App Purpose & Functionality
Noor CBT is a mental wellness app that combines evidence-based cognitive behavioral therapy (CBT) techniques with Islamic spiritual principles. The app helps Muslim users process difficult thoughts through guided reflection, using AI to identify cognitive distortions and suggest reframes rooted in Islamic values like patience (sabr), trust (tawakkul), and mercy (rahma).

### Safety & Theological Boundaries

**Mental Health Safety**:
- App is NOT therapy, medical care, or crisis intervention
- AI companion explicitly disclosed (not a human therapist)
- Crisis detection triggers immediate resource display (988 Suicide & Crisis Lifeline)
- Clear disclaimers on Welcome screen during onboarding
- "Get Help" resources visible throughout app

**Theological Safety**:
- App does NOT provide religious rulings (fatwas) or scholarly guidance
- Islamic content used as therapeutic anchors, not comprehensive religious education
- AI fallibility acknowledged: "AI can make theological mistakes—verify with scholars"
- No claims of religious authority

**User Safety Flow**:
1. Three-screen onboarding explains boundaries before first use
2. Crisis language detection pauses CBT flow and surfaces 988 lifeline
3. High distress pacing slows interactions and offers exit options
4. Professional help recommended for persistent symptoms

### Content & AI Disclosure

**AI Usage**:
- All reflection responses generated by AI (OpenAI GPT-4)
- User explicitly informed: "Uses an AI companion, not a human therapist"
- Multi-layer safety validation before content delivery
- Fallback to safe language if AI output fails validation

**Islamic Content**:
- Quran verses from Sahih International translation
- Hadith from authenticated collections (Sahih Bukhari, Sahih Muslim)
- Content whitelist approach (only pre-approved material)
- Ongoing scholar review workflow in place

### Privacy & Data Handling

**Local-First Storage**:
- User reflections stored locally on device only
- No server-side storage of thought content
- No cloud backups or syncing of reflections
- Uninstalling app removes all local data

**No Login Required**:
- App fully functional without account creation
- No email, no password, no authentication
- Subscription managed entirely through Apple In-App Purchase
- Anonymous usage (no user tracking or profiling)

**Data Collection** (minimal):
- Session metadata (duration, count, safety events)
- Subscription status (via StoreKit)
- No personal identifiers linked to reflections
- No cross-app tracking

### Testing Instructions

**Test Scenarios**:
1. **Free Tier Flow**: Complete one reflection → see daily limit message
2. **Crisis Detection**: Enter "I want to hurt myself" → 988 resources display immediately
3. **Onboarding**: Fresh install shows 3-screen flow (Welcome → Privacy → Safety)
4. **Subscription**: Tap upgrade → native iOS paywall → purchase simulation
5. **Offline**: Disable network → app still functional (local-only)

**Test Account**: Not applicable (no login system)

**Subscription Testing**: Use Sandbox tester account in App Store Connect

### Compliance Notes

**App Store Guidelines Compliance**:
- **1.4.1 (Controversial Content)**: Clear mental health disclaimers, not therapy
- **2.3.8 (Metadata)**: Accurate description, no misleading claims
- **2.5.2 (Software Requirements)**: Uses In-App Purchase, no external payments
- **3.1.1 (In-App Purchase)**: All subscriptions via Apple IAP
- **5.1.1 (Privacy)**: Transparent data handling, privacy policy provided

**Health App Guidelines**:
- Not a medical device or diagnostic tool
- No treatment claims or outcome guarantees
- Crisis resources for immediate danger situations
- Recommends professional help for serious symptoms

**Religious Content**:
- Respectful treatment of Islamic texts
- No proselytizing or conversion attempts
- Cultural sensitivity maintained
- Theological safety guardrails active

### Technical Details

- **Platform**: React Native (Expo)
- **Minimum iOS**: 13.0 (or per Expo SDK requirements)
- **Device Support**: iPhone, iPad compatible
- **Orientation**: Portrait
- **Languages**: English (Arabic planned for future)

### Post-Approval Monitoring

- Crash analytics enabled (no PII collection)
- AI safety telemetry for validation failures
- User feedback encouraged via support email
- Quarterly scholar review of Islamic content

---

**Submission Checklist**:
- [ ] Screenshots uploaded (6.5" and 5.5" for iPhone)
- [ ] App preview video (optional but recommended)
- [ ] Privacy Policy URL finalized
- [ ] Support URL active
- [ ] Marketing URL (if applicable)
- [ ] In-App Purchase products created in App Store Connect
- [ ] Test with Sandbox account
- [ ] Age rating questionnaire completed
- [ ] Export compliance documentation
- [ ] Content rights verified (Quran translations, hadith sources)

---

**Last Updated**: 2026-01-19  
**Status**: Ready for submission preparation
