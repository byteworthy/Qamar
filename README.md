<p align="center">
  <img src="assets/images/noor-icon.svg" width="140" alt="Noor logo" />
</p>

<h1 align="center">Noor</h1>

<p align="center"><strong>Noor is a structured reflection practice for Muslims who want clarity before action.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-React%20Native-2d6cdf?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-Enterprise%20Grade-00C853?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Data-Local%20First-7c3aed?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-App%20Store%20Ready-FF6B35?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://github.com/byteworthy/Noor/actions/workflows/ci.yml"><img src="https://github.com/byteworthy/Noor/workflows/CI/badge.svg" alt="CI" /></a>
  <a href="https://github.com/byteworthy/Noor/actions/workflows/e2e.yml"><img src="https://github.com/byteworthy/Noor/workflows/E2E%20Tests/badge.svg" alt="E2E Tests" /></a>
  <a href="https://github.com/byteworthy/Noor/actions/workflows/security.yml"><img src="https://github.com/byteworthy/Noor/workflows/Security%20Analysis/badge.svg" alt="Security Analysis" /></a>
  <a href="https://github.com/byteworthy/Noor/actions/workflows/deploy-preview.yml"><img src="https://github.com/byteworthy/Noor/workflows/Deploy%20Preview/badge.svg" alt="Deploy Preview" /></a>
</p>

Noor helps users slow down their thinking, examine inner dialogue with discipline, and reconnect intention with action using calm, guided reflection rooted in Islamic values.

---

## 🎯 Project Status

**App Store Ready** - Production-ready with enterprise mobile security

- ✅ Core reflection flows (thought capture, CBT reframe, intention setting)
- ✅ AI-powered cognitive distortion analysis (Claude integration)
- ✅ Enterprise mobile security (biometric auth, secure storage, jailbreak detection)
- ✅ Backend deployed to Railway (production environment live)
- ✅ Backend encryption (AES-256-GCM)
- ✅ Comprehensive test suite (277 tests passing)
- ✅ Type-safe codebase (zero `any` types in production code)
- ✅ App Store documentation (SECURITY.md, PRIVACY_POLICY.md)
- ✅ App icon finalized (1024x1024 PNG)
- ✅ RevenueCat IAP integration (Plus & Pro tiers)
- 🎨 Screenshots in progress for App Store submission

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone repository
git clone https://github.com/byteworthy/Noor.git
cd Noor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key

# Start backend server
npm run dev

# In another terminal, start mobile app
cd client
npm start
```

---

## ✨ Features

### Spiritual Wellness
- **CBT-based reflection** - Structured thought capture, AI-powered cognitive distortion analysis, and Islamic reframing
- **Progress dashboard** - Track spiritual growth and reflection patterns over time
- **Intention setting (Niyyah)** - Ground actions in Islamic values with clarity and purpose

### Islamic Content & Tools
- **Quran Reader** - Complete 114 surahs with translations and authentic audio recitation
- **Prayer Times** - Precise prayer schedules using Adhan library with Qibla compass and calibration
- **Hadith Library** - 200+ authentic hadiths from Kutub al-Sittah (six most authentic collections)
- **Arabic Learning** - 356 vocabulary words with FSRS spaced repetition flashcards
- **Adhkar & Duas** - 100+ authentic morning, evening, and prayer adhkar
- **Islamic Calendar** - Hijri date conversion and Islamic date tracking

### Technical Features
- **Offline-first** - SQLite caching for seamless offline access
- **Premium tiers** - Free / Plus / Pro subscriptions via RevenueCat
- **Enterprise security** - Biometric auth, secure storage, jailbreak detection
- **Encrypted storage** - AES-256-GCM encryption for all user data

---

## 📱 What Noor Helps With

- **Slowing repetitive or circular thinking** - Break free from rumination patterns
- **Clarifying intention before decisions** - Align actions with Islamic values
- **Examining assumptions without judgment** - Identify cognitive distortions
- **Practicing disciplined inner dialogue** - Structured reflection with AI guidance

---

## 🛠️ How Noor Works

Noor guides users through short, structured reflection sessions:

1. **Thought Capture** - Record a distressing or intrusive thought
2. **AI Analysis** - Claude identifies cognitive distortions (catastrophizing, black-and-white thinking, etc.)
3. **Islamic Reframe** - Receive an alternative perspective rooted in CBT + Islamic principles
4. **Intention Setting** - Set a grounded niyyah (intention) for action
5. **Progress Tracking** - View insights and patterns over time

---

## 🕌 Faith and Grounding

Noor is designed with Islamic values at its core:

- **Amanah (Trust)** - Your data is a sacred trust we protect with encryption
- **Sitr (Concealment)** - Your reflections remain private (no sharing without consent)
- **Ihsan (Excellence)** - We strive for the highest security and UX standards
- **Tawakkul (Reliance on Allah)** - AI provides guidance, but Allah alone heals

Concepts such as intention, patience, accountability, and trust are used as grounding lenses for reflection rather than as instruction or religious authority.

---

## 🤖 AI Use and Boundaries

Noor uses AI (Claude by Anthropic) carefully and ethically:

- ✅ **Safety-First**: AI responses are constrained by safety charter and Islamic content framework
- ✅ **Therapeutic Boundaries**: AI does NOT diagnose, prescribe, or replace therapy
- ✅ **Crisis Detection**: Identifies crisis situations and suggests professional help
- ✅ **Islamic Accuracy**: Content reviewed for alignment with mainstream Islamic scholarship
- ✅ **No Training on Your Data**: Anthropic does NOT train models on user reflections

---

## ⚠️ What Noor Is Not

- ❌ **Not therapy** - Noor is a wellness tool, not a substitute for professional mental health care
- ❌ **Not medical care** - Does not diagnose or treat mental health conditions
- ❌ **Not diagnosis** - AI cannot diagnose psychological or spiritual conditions
- ❌ **Not religious authority** - Islamic content is educational, not fatwa

If you're experiencing a mental health crisis, please contact a professional immediately.

---

## 🔒 Security & Privacy

### Mobile Security Features

- **Biometric Authentication** - Face ID, Touch ID, Fingerprint (optional)
- **Secure Storage** - iOS Keychain / Android Keystore for journal entries
- **Screenshot Prevention** - Sensitive screens cannot be captured
- **Jailbreak Detection** - Warns users about compromised devices
- **Session Timeout** - Re-authenticate after 5 minutes in background

### Data Protection

- **Client-Side**: Journal entries encrypted in device secure storage
- **Server-Side**: AES-256-GCM encryption for all reflections
- **Transit**: HTTPS-only with certificate validation
- **Retention**: 30-day automatic deletion policy
- **User Control**: Export and delete your data anytime

For comprehensive security details, see [SECURITY.md](SECURITY.md)

For privacy policy, see [PRIVACY_POLICY.md](PRIVACY_POLICY.md)

---

## 🏗️ Architecture Overview

### Mobile App (Client)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React Native + Expo | Cross-platform iOS/Android app |
| State | React Query + Zustand | Server state caching + local state |
| Storage | expo-secure-store | Encrypted journal entries |
| Auth | expo-local-authentication | Biometric authentication |
| Security | jail-monkey, expo-screen-capture | Device security checks |
| UI | React Native Paper | Material Design components |
| Navigation | React Navigation | Stack-based navigation |

### Backend (Server)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 20 + TypeScript | Type-safe server logic |
| Framework | Express.js | RESTful API endpoints |
| AI | Claude by Anthropic | Cognitive distortion analysis |
| Encryption | crypto (AES-256-GCM) | At-rest data encryption |
| Session Management | HMAC-SHA256 signed tokens | Secure authentication |
| Rate Limiting | express-rate-limit | Prevent abuse (5 auth/15min, 10 AI/min) |
| Logging | Winston | Structured logging with PII redaction |
| Error Tracking | Sentry | Production error monitoring |

### Testing

- **Unit Tests**: Jest (277 tests passing)
- **E2E Tests**: Supertest for API endpoints
- **Type Safety**: TypeScript strict mode (zero `any` types)
- **Coverage**: ~28% (Phase 2 focus was security, Phase 3 will increase coverage)

### Deployment

- **Backend**: Railway (Production environment live at railway.app)
- **Mobile**: Expo EAS Build (iOS + Android)
- **CI/CD**: Husky pre-commit hooks (type checking, tests)
- **IAP**: RevenueCat (subscription management)

---

## 📂 Documentation

### Security & Privacy

- [Security Policy](SECURITY.md) - Enterprise-grade mobile security implementation
- [Privacy Policy](PRIVACY_POLICY.md) - GDPR/CCPA/COPPA compliant policy

### App Store Submission

- [Launch Status](release/LAUNCH_STATUS.md) - Current App Store submission progress
- [Build Commands](release/BUILD_COMMANDS.md) - EAS build and deployment commands
- [Backend Deployment Guide](release/BACKEND_DEPLOYMENT_GUIDE.md) - Railway deployment
- [IAP Setup Guide](release/STORE_PACK/IAP_SETUP_GUIDE.md) - RevenueCat configuration
- [Final Submission Checklist](release/STORE_PACK/FINAL_SUBMISSION_CHECKLIST.md)

### ASO & Metadata

- [App Store Metadata](release/STORE_PACK/apple/APP_STORE_METADATA.md)
- [Play Store Metadata](release/STORE_PACK/google/PLAY_STORE_METADATA.md)
- [App Store Review Notes](release/STORE_PACK/APP_STORE_REVIEW_NOTES.md)
- [Pricing Strategy](release/STORE_PACK/PRICING_STRATEGY_OPTION_C.md)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run type checking
npm run check:types

# Run security verification
bash scripts/verify-security.sh

# Pre-commit verification (runs automatically)
npm run verify:local
```

**Current Status**: 277 tests passing, 0 TypeScript errors, all security checks passing ✅

---

## 📊 Recent Updates (February 2026)

### App Store Submission (In Progress 🚀)

- **Icon Design**: Finalized 1024x1024 app icon with Yemeni-inspired Islamic arches
- **UI Differentiation**: Twilight/gold theme with glassmorphism and Islamic patterns
- **Backend Deployment**: Production environment live on Railway
- **RevenueCat IAP**: Plus ($6.99/mo) and Pro ($11.99/mo) tiers configured
- **Security**: Enterprise-grade mobile security (biometric, secure storage, jailbreak detection)
- **Documentation**: Complete App Store submission package ready
- **Current Status**: 75% complete - screenshots in progress

### Phase 4: Mobile Security Hardening (Complete ✅)

- **Secure Storage**: iOS Keychain / Android Keystore integration
- **Biometric Auth**: Face ID, Touch ID, Fingerprint authentication
- **Jailbreak Detection**: Device security warnings
- **Screenshot Prevention**: Sensitive screen protection
- **Test Coverage**: 277 tests passing, zero TypeScript errors

---

## 📖 Technology Stack

### Frontend (Mobile)
- React Native 0.76.6
- Expo SDK 52
- TypeScript 5.7.3
- React Query 5.68.3
- React Navigation 7.0.16
- React Native Paper 5.12.5
- expo-secure-store 13.0.2
- expo-local-authentication 14.0.1
- jail-monkey 2.8.4
- expo-screen-capture 6.0.2

### Backend
- Node.js 20+
- Express 5.1.0
- TypeScript 5.7.3
- Anthropic SDK 0.38.1
- Winston 3.18.0
- Zod 3.24.1
- express-rate-limit 7.5.0

### Development
- Jest 30.0.0-alpha.7
- Supertest 7.0.0
- ESLint 9.18.0
- Prettier 3.4.2

---

## 🤝 Contributing

Noor is currently in App Store submission phase. Once launched, we'll welcome community contributions!

**Post-launch priorities:**

- Increasing test coverage (current: 277 tests, target: comprehensive E2E coverage)
- Arabic/Urdu localization for global Muslim community
- Accessibility improvements (VoiceOver, TalkBack support)
- Additional Islamic content (Hadith, scholars' quotes, du'as)
- Android optimization and testing

---

## 📄 License

[MIT License](LICENSE) - See LICENSE file for details

---

## 📞 Contact

- **Support**: scale@getbyteworthy.com
- **Security**: security@getbyteworthy.com
- **Privacy**: privacy@getbyteworthy.com

---

## 🙏 Acknowledgments

- **Claude by Anthropic** - AI-powered cognitive distortion analysis
- **Islamic Scholars** - Content review and guidance
- **Mental Health Professionals** - Safety charter and crisis detection design
- **Beta Testers** - Early feedback and testing

---

**Bismillah!** May Allah bless this project and make it a means of healing for the ummah.

_"Allah does not burden a soul beyond that it can bear."_ - Quran 2:286
