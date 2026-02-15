<p align="center">
  <img src="assets/images/noor-icon.svg" width="140" alt="Noor logo" />
</p>

<h1 align="center">Noor</h1>

<p align="center"><strong>Your Islamic Companion — Quran, Prayer Times, Arabic Learning & Personal Reflection</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-2d6cdf?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-Enterprise%20Grade-00C853?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Data-Local%20First-7c3aed?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://github.com/byteworthy/Noor/actions/workflows/ci.yml"><img src="https://github.com/byteworthy/Noor/workflows/CI/badge.svg" alt="CI" /></a>
  <a href="https://github.com/byteworthy/Noor/actions/workflows/e2e.yml"><img src="https://github.com/byteworthy/Noor/workflows/E2E%20Tests/badge.svg" alt="E2E Tests" /></a>
  <a href="https://github.com/byteworthy/Noor/actions/workflows/security.yml"><img src="https://github.com/byteworthy/Noor/workflows/Security%20Analysis/badge.svg" alt="Security Analysis" /></a>
</p>

---

Noor is an all-in-one Islamic companion app that brings together the tools Muslims use every day: Quran reading with audio, accurate prayer times with Qibla compass, Arabic vocabulary learning, authentic hadith collections, daily adhkar, and AI-guided personal reflection — all in one beautifully designed app.

---

## Features

### Home

- Daily verse, hadith, and adhkar recommendations
- Hijri calendar with Islamic date display
- Personalized spiritual growth dashboard
- Quick access to all features

### Companion (Guided Reflection)

- Structured thought capture and journaling
- AI-powered thought pattern recognition (Claude by Anthropic)
- Islamic reframing grounded in Quranic wisdom
- Intention setting (Niyyah) for purposeful action
- Crisis detection with professional resource referrals

### Learn

- **Quran Reader** — All 114 surahs with English translations and authentic audio recitation
- **Arabic Vocabulary** — 356 words with FSRS spaced-repetition flashcards
- **Hadith Library** — 200+ authentic hadiths from Kutub al-Sittah

### Worship

- **Prayer Times** — Precise schedules using the Adhan library, adjusted for your location
- **Qibla Compass** — Device-sensor compass with calibration guidance
- **Adhkar & Duas** — 100+ morning, evening, and prayer adhkar with counters
- **Islamic Calendar** — Hijri date conversion and tracking

### Profile

- Spiritual growth statistics and streak tracking
- Premium subscription management (Free / Plus / Pro)
- Biometric lock and privacy settings
- Data export and account controls

---

## Screenshots

| Home | Companion | Learn | Worship | Profile |
|------|-----------|-------|---------|---------|
| ![Home](assets/screenshots/home.png) | ![Companion](assets/screenshots/companion.png) | ![Learn](assets/screenshots/learn.png) | ![Worship](assets/screenshots/worship.png) | ![Profile](assets/screenshots/profile.png) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.81 + Expo SDK 54 + TypeScript 5.9 |
| State | React Query + Zustand |
| Backend | Node.js 20 + Express + Drizzle ORM + PostgreSQL |
| AI | Claude by Anthropic (reflection analysis) |
| Auth | Biometric (Face ID / Touch ID) + HMAC-SHA256 sessions |
| Payments | RevenueCat (iOS + Android IAP) |
| Monitoring | Sentry (error tracking) + Winston (logging) |
| CI/CD | EAS Build + GitHub Actions |
| Deployment | Railway (backend) + Expo EAS (mobile builds) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
git clone https://github.com/byteworthy/Noor.git
cd Noor
npm install
cp .env.example .env
# Fill in your API keys in .env
```

### Development

```bash
# Start the backend server
npm run server:dev

# Start the Expo dev client (separate terminal)
npx expo start
```

### Testing

```bash
npm test              # Run server tests
npm run test:client   # Run client tests
npm run check:types   # TypeScript type checking
npm run verify        # Types + tests combined
```

### Building for Production

```bash
npm run eas:build:prod          # Build iOS + Android
npm run eas:submit:ios          # Submit to App Store
npm run eas:submit:android      # Submit to Google Play
npm run deploy:backend          # Deploy backend to Railway
```

---

## Architecture Overview

```
Noor/
  client/              # React Native mobile app
    components/        # Reusable UI components
    screens/           # Screen-level components (5 tabs)
    hooks/             # Custom React hooks
    stores/            # Zustand state stores
    services/          # API client and data services
  server/              # Express.js backend
    routes/            # API route handlers
    services/          # Business logic and AI integration
    db/                # Drizzle ORM schema and migrations
    scripts/           # Seeding scripts (Quran, hadith, vocab, adhkar)
  web/                 # Next.js marketing site
  assets/              # App icons, splash screens, screenshots
  scripts/             # Build, deploy, and utility scripts
  release/             # App Store submission materials
```

---

## Security and Privacy

- AES-256-GCM encryption for all stored reflections
- Biometric authentication (Face ID, Touch ID, Fingerprint)
- iOS Keychain / Android Keystore for sensitive data
- Screenshot prevention on sensitive screens
- Jailbreak and root detection warnings
- HTTPS-only with certificate validation
- 30-day automatic data retention policy
- Full data export and deletion support

See [SECURITY.md](SECURITY.md) and [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

---

## AI Use and Boundaries

Noor uses Claude by Anthropic for guided reflection, with strict safeguards:

- AI does not diagnose, prescribe, or replace professional therapy
- Crisis situations trigger immediate professional resource referrals
- Islamic content is reviewed for alignment with mainstream scholarship
- Anthropic does not train models on user reflections
- All AI interactions follow a documented safety charter

---

## Contributing

Noor is currently preparing for its 2.0 launch. Post-launch contribution areas:

- Arabic, Urdu, and Bahasa localization
- Accessibility improvements (VoiceOver, TalkBack)
- Additional Islamic content (more hadiths, scholars' quotes, duas)
- Android-specific optimizations
- Test coverage expansion

---

## License

[MIT License](LICENSE)

---

## Contact

- **Support**: scale@getbyteworthy.com
- **Security**: security@getbyteworthy.com
- **Privacy**: privacy@getbyteworthy.com

---

_Bismillah. May this project serve as a means of benefit for the ummah._

_"Allah does not burden a soul beyond that it can bear."_ — Quran 2:286
