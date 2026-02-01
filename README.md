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

Noor helps users slow down their thinking, examine inner dialogue with discipline, and reconnect intention with action using calm, guided reflection rooted in Islamic values.

---

## 🎯 Project Status

**95% Complete** - Production-ready with enterprise mobile security

- ✅ Core reflection flows (thought capture, CBT reframe, intention setting)
- ✅ AI-powered cognitive distortion analysis (Claude integration)
- ✅ Enterprise mobile security (biometric auth, secure storage, jailbreak detection)
- ✅ Backend encryption (AES-256-GCM)
- ✅ Comprehensive test suite (277 tests passing, ~28% coverage)
- ✅ Type-safe codebase (zero `any` types in production code)
- ✅ App Store documentation (SECURITY.md, PRIVACY_POLICY.md)
- ⏳ Device testing (iOS/Android biometric auth, screenshot prevention)
- ⏳ App Store submission (ready to submit)

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
git clone https://github.com/yourusername/Noor-CBT.git
cd Noor-CBT

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see docs/deployment/ENVIRONMENT.md)

# Start development server
npm run dev

# In another terminal, start mobile app
cd client
npm start
```

For detailed setup instructions, see [docs/development/QUICK_START.md](docs/development/QUICK_START.md)

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

- **Backend**: Railway (SOC 2 Type II compliant)
- **Mobile**: Expo EAS Build (iOS + Android)
- **CI/CD**: GitHub Actions (type checking, tests, security audits)

For architecture diagrams, see [docs/development/ARCHITECTURE.md](docs/development/ARCHITECTURE.md)

---

## 📂 Documentation

### Getting Started
- [Quick Start Guide](docs/development/QUICK_START.md) - Get Noor running in 10 minutes
- [Development Setup](docs/development/SETUP.md) - Detailed development environment setup
- [Testing Guide](docs/development/TESTING.md) - Run and write tests

### Deployment
- [Railway Deployment](docs/deployment/RAILWAY.md) - Backend deployment to Railway
- [Expo Build](docs/mobile/EXPO_BUILD.md) - Build mobile apps for iOS/Android
- [Environment Variables](docs/deployment/ENVIRONMENT.md) - Required environment configuration

### Mobile Development
- [Mobile Security](docs/mobile/MOBILE_SECURITY.md) - Security implementation details
- [Biometric Auth](docs/mobile/BIOMETRIC_AUTH.md) - Face ID, Touch ID, Fingerprint setup
- [Screenshot Prevention](docs/mobile/SCREENSHOT_PROTECTION.md) - Sensitive screen protection

### App Store Submission
- [iOS App Store](docs/store-submission/IOS_APP_STORE.md) - App Store Connect submission guide
- [Google Play Store](docs/store-submission/GOOGLE_PLAY.md) - Play Console submission guide
- [Security Policy](SECURITY.md) - Required for App Store review
- [Privacy Policy](PRIVACY_POLICY.md) - GDPR/CCPA/COPPA compliant policy

### Contributing
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to Noor
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines
- [Security Reporting](SECURITY.md#reporting-a-vulnerability) - Report security issues

For complete documentation index, see [docs/README.md](docs/README.md)

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run type checking
npm run check:types

# Run mobile security verification
bash scripts/verify-mobile-security.sh
```

**Current Status**: 277 tests passing, ~28% coverage, 0 TypeScript errors

---

## 📊 Recent Updates (January 2026)

### Phase 4: Mobile Security Hardening (Complete ✅)

- **Secure Storage**: Migrated sensitive data to iOS Keychain / Android Keystore
- **Biometric Auth**: Face ID, Touch ID, Fingerprint authentication
- **Jailbreak Detection**: Warn users about compromised devices
- **Screenshot Prevention**: Protect journal entries from screenshots
- **Documentation**: SECURITY.md, PRIVACY_POLICY.md for App Store submission
- **Verification**: 28/28 security checks passing

**Impact**: Noor now has enterprise-grade mobile security suitable for mental health data (HIPAA-aligned).

For detailed changelog, see [CHANGELOG.md](CHANGELOG.md)

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

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas where we need help:
- Increasing test coverage (current: ~28%, target: 80%+)
- Arabic/Urdu localization
- Accessibility improvements (screen reader support)
- Additional CBT techniques (exposure therapy, behavioral activation)
- Islamic content expansion (more Hadith, scholars' quotes)

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
