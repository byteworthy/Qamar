# Noor CBT - Project Status

## Purpose
Noor CBT is an Islamic-integrated cognitive behavioral therapy mobile application designed to help Muslim users manage anxiety, distress, and negative thought patterns through evidence-based CBT techniques grounded in Islamic principles. The app provides a safe, culturally sensitive environment where therapeutic interventions are filtered through an Islamic epistemological framework, ensuring all AI-generated content respects theological boundaries.

## Tech Stack
- **Frontend**: React Native (Expo), TypeScript
- **Backend**: Express.js, TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4 with multi-layer safety validation
- **Security**: AES-256-GCM encryption for all PII
- **Testing**: Jest with comprehensive E2E and safety system tests
- **Payment**: Stripe integration for Noor Plus subscriptions

## Current Major Features

### Core CBT Journey
- **Thought Capture**: Record distressing thoughts with emotional state tracking
- **Distortion Analysis**: AI-powered identification of cognitive distortions
- **Islamic Reframing**: Theologically-safe CBT reframes using Islamic principles
- **Grounding Practices**: Guided breathing exercises, dhikr integration
- **Intention Setting**: Action planning with accountability
- **Session History**: Encrypted storage of user sessions

### Safety & Islamic Governance

#### Multi-Layer AI Safety System
1. **Charter Compliance Checker**: Enforces 8-part Islamic AI Safety Charter
2. **Tone Compliance Checker**: Prevents dismissive, condescending, or minimizing language
3. **State Machine Validation**: Ensures appropriate responses for emotional states
4. **Pacing Controller**: Adapts interaction intensity to distress levels
5. **Islamic Content Mapper**: Context-aware selection of Quranic verses and hadith
6. **Crisis Detection**: Identifies and intervenes in emergency situations
7. **Scrupulosity Detection**: Special handling to avoid reinforcing OCD patterns

#### Canonical Orchestrator Enforcement
All AI endpoints route through the `CanonicalOrchestrator` which enforces the complete safety pipeline:
- `/api/chat/analyze` - ✅ Enforced
- `/api/chat/reframe` - ✅ Enforced  
- `/api/chat/practice` - ✅ Enforced
- `/api/chat/general` - ✅ Enforced

**Fallback Language**: When AI responses fail validation, theologically-safe fallback language is used instead.

### Data Privacy & Security
- **Encryption at Rest**: All PII encrypted with AES-256-GCM
- **Automatic Deletion**: Sessions older than 90 days auto-deleted
- **Retention Policy**: Clear documented data lifecycle
- **No Cleartext Storage**: User thoughts, sessions, and analysis never stored in plaintext

### Subscription & Billing
- **Noor Plus**: Premium subscription with Stripe integration
- **Free Tier**: Basic CBT journey access
- **Webhook Handling**: Automated subscription lifecycle management

## Production Readiness Status

### Test Suite: ✅ ALL PASS
- **Test Suites**: 2 passed
- **Total Tests**: 79 passed
- **Coverage Areas**:
  - Safety System (70 tests): Charter compliance, tone validation, crisis detection, scrupulosity handling
  - E2E Journey (9 tests): Complete user flows through canonical orchestration
- **Exit Code**: 0 (clean pass)

### TypeScript Build: ✅ PASS
- **Command**: `npm run check:types`
- **Status**: All type checks pass with no errors

### Security Audit Status
- **Command**: `npm audit`
- **High Severity Vulnerabilities**: 0 (all fixed)
  - ✅ Fixed `qs` DoS vulnerability (≥6.14.1)
  - ✅ Fixed `tar` file overwrite vulnerability
  - ✅ Fixed `undici` resource exhaustion
- **Remaining**: 4 moderate (dev-only `esbuild` in `drizzle-kit`, would require breaking changes)

### Code Quality
- ✅ No debug logs in tests (CI output clean)
- ✅ ESLint compliant
- ✅ No unused imports
- ✅ Consistent formatting

## How to Run

### Installation
```bash
npm install
```

### Type Checking
```bash
npm run check:types
```

### Run Tests
```bash
npm test
```

### Development Server
```bash
npm start
```

### Run Database Migrations
```bash
npm run db:push
```

## Next Work Before Launch

### High Priority
1. **Scholar Review**: Submit Islamic content mapper and reframing logic to qualified Islamic scholar for theological review
2. **Crisis Resources**: Finalize and verify crisis intervention resource links (988, local mental health)
3. **User Onboarding**: Build welcome flow explaining Islamic CBT approach
4. **Terms of Service**: Legal review of liability, theological disclaimers
5. **Privacy Policy**: GDPR/CCPA compliance documentation

### Medium Priority  
6. **Session Export**: Allow users to export their encrypted sessions
7. **Insights Dashboard**: Aggregate pattern recognition across user's history
8. **Dua Integration**: Curated du'as relevant to emotional states
9. **Progress Tracking**: Visualize thought pattern changes over time
10. **Offline Mode**: Local session storage when network unavailable

### Nice to Have
11. **Voice Input**: Speech-to-text for thought capture
12. **Notification System**: Gentle reminders for intention follow-through
13. **Community Features**: Anonymous shared experiences (heavily moderated)
14. **Multi-language**: Arabic, Urdu translation support

## Risk Register

### Theological Safety Risks
- **Mitigation**: Multi-layer validation, scholar review workflow, clear disclaimers that app is not Islamic legal authority

### User Safety Risks (Mental Health Crisis)
- **Mitigation**: Crisis detection, 988 resource surfacing, clear limitations on app's scope

### Data Privacy Risks
- **Mitigation**: End-to-end encryption, auto-deletion, minimal data collection

### AI Reliability Risks
- **Mitigation**: Fallback language when validation fails, audit trails, telemetry for monitoring

---

**Last Updated**: 2026-01-17  
**Version**: MVP 1 (Release Candidate)  
**Status**: ✅ Production-Ready for Beta Launch
