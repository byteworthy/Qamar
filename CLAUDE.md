# CLAUDE.md — Noor

## What is Noor?

**Noor is a complete Islamic companion app** — one app instead of five. It brings together a full Quran reader, Arabic learning suite, prayer times, guided reflection, and Khalil (a conversational muhasaba companion) in a single offline-capable, ad-free experience.

> The name means "light" (نور) in Arabic. The tagline: *Your Complete Islamic Companion.*

Noor is **not** positioned as an AI product. Khalil is the app's named companion character — a spiritual conversation partner for muhasaba (self-reflection). Avoid "AI", "model", "language model", "algorithm", or clinical/therapeutic language anywhere in the app or in prompts. Use "companion", "guide", "Khalil", or simply describe what the feature does.

---

## Core Philosophy

| Principle | What it means in practice |
|-----------|---------------------------|
| Offline-first | Quran, prayer, Arabic, adhkar — all work 100% without network |
| Companion, not tool | Khalil is a spiritual companion, not an assistant or chatbot |
| Merciful tone | Every user-facing message is calm, non-judgmental, and non-clinical |
| Scholarly accuracy | Islamic content must reflect mainstream scholarly consensus |
| Privacy by default | Reflection data encrypted at rest and in transit; no PHI |
| Free core, premium depth | Core features free forever; depth features behind Plus/Pro |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native 0.83.1 + Expo SDK 54 |
| Web | React 19 + `react-native-web` (same codebase) |
| Navigation | React Navigation v7 (bottom tabs + native stack) |
| State | TanStack Query v5 (server), Zustand v5 (UI), AsyncStorage (prefs) |
| Offline DB | WatermelonDB (Quran, vocabulary, adhkar, hadith) |
| Backend | Express.js (Node.js) + TypeScript |
| Database | PostgreSQL on Railway + Drizzle ORM |
| Auth | JWT + `expo-secure-store` |
| Subscriptions | RevenueCat SDK + Stripe |
| Push | Expo Push Notifications |
| Error tracking | Sentry (React Native + Node) |
| Build/Deploy | EAS Build + EAS Submit |
| Testing | Jest 30 + Detox E2E |

**Bundle ID:** `com.byteworthy.noor`
**EAS Project ID:** `b3e205eb-b119-4976-a275-df7bcef85275`
**Backend:** Railway (PostgreSQL + Express)
**New architecture:** enabled (`newArchEnabled: true`, React Compiler, Hermes)

---

## Project Structure

```
noor/
  client/                    # React Native app
    App.tsx                  # Root component
    index.js                 # Entry point
    components/              # Shared components
    screens/                 # Route screens (see Screens section)
    navigation/              # Tab + stack navigators
    hooks/                   # Custom React hooks
    stores/                  # Zustand stores
    services/                # API client, device services
    lib/                     # Utilities
    constants/               # Tokens, config
    types/                   # TypeScript types
    data/                    # Static data (bundled)

  server/                    # Express.js API
    index.ts                 # Server entry
    config.ts                # Env config + VALIDATION_MODE
    routes.ts                # Route registration
    routes/                  # Route handlers (see Routes section)
    services/                # Business logic (companion-prompts, islamic-context, etc.)
    prompts/                 # Text prompt templates
    middleware/              # Auth, rate limiting, AI safety
    billing/                 # RevenueCat + Stripe
    db.ts                    # Drizzle DB client
    encryption.ts            # Reflection data encryption

  shared/
    schema.ts                # Drizzle schema (source of truth for DB)
    offline-schema.ts        # WatermelonDB schema
    types.ts                 # Shared types
    islamic-framework.ts     # Tone guidelines, distress levels
    seed-data/               # Seed content (hadith, vocabulary, adhkar)

  e2e/                       # Detox E2E tests
  scripts/                   # Build, seed, deploy scripts
  tools/                     # ship.mjs and other tooling
  docs/                      # Architecture, deployment, performance guides
```

---

## Development Commands

```bash
# Mobile dev server
npm run expo:dev              # Start Expo dev server (tunnel via REPLIT or localhost)
npm run android               # Run on Android emulator (requires dev build)
npm run ios                   # Run on iOS simulator (requires dev build)

# Backend
npm run server:dev            # Start Express server (tsx watch, port 5000)

# Database
npm run db:push               # Push schema to DB (Drizzle)
npm run db:verify             # Verify schema integrity
npm run db:seed:all           # Seed Quran metadata, hadiths, vocabulary, adhkar
npm run db:seed:quran         # Quran metadata only
npm run db:seed:hadiths       # 200+ hadith
npm run db:seed:vocabulary    # Arabic vocabulary
npm run db:seed:adhkar        # Adhkar collection

# Testing
npm test                      # Server tests (Jest, all must pass)
npm run test:client           # Client tests (Jest + jest-expo)
npm run test:watch            # Watch mode
npm run test:e2e:ios          # Detox E2E on iOS sim
npm run test:e2e:android      # Detox E2E on Android emu

# Quality
npm run typecheck             # TypeScript strict check (0 errors expected)
npm run lint                  # ESLint + Prettier check
npm run lint:fix              # Autofix
npm run format                # Prettier format all files

# EAS builds
npm run build:ios             # Production iOS build via EAS
npm run build:android         # Production Android build via EAS
npm run build:all             # Both platforms
npm run submit:ios            # Submit to App Store
npm run submit:android        # Submit to Play Store

# Shipping
npm run ship                  # Full ship flow (tools/ship.mjs)
npm run release:check         # Pre-release gate (types + lint + test)
npm run version:bump          # Bump version numbers
npm run sentry:release        # Create Sentry release
npm run bundle:analyze        # Inspect bundle size
```

---

## Environment Variables

```bash
# Backend (.env)
DATABASE_URL=                  # Railway PostgreSQL
ANTHROPIC_API_KEY=             # For Khalil + Arabic suite
PORT=5000
NODE_ENV=development

# Optional
VALIDATION_MODE=true           # Disables Claude API + billing; safe for testing
SENTRY_DSN=                    # Error tracking
REVENUECAT_WEBHOOK_SECRET=     # Subscription webhook validation
STRIPE_SECRET_KEY=             # Stripe billing
EXPO_PUSH_TOKEN=               # Expo push notifications

# Mobile (app.json / .env.local via expo-constants)
EXPO_PUBLIC_API_URL=           # Backend URL
EXPO_PUBLIC_SENTRY_DSN=        # Client-side Sentry
```

`VALIDATION_MODE=true` is the fastest way to run the server without any external dependencies — Claude API returns placeholders, billing is disabled.

---

## Key Screens

| Screen | Tab | What it does |
|--------|-----|--------------|
| `HomeScreen` | Home | Daily Noor summary, streaks, quick actions |
| `KhalilScreen` | Companion | Conversational muhasaba with Khalil |
| `ThoughtCaptureScreen` | Companion | Record a thought or feeling |
| `ReframeScreen` | Companion | Reframe a thought with Islamic perspective |
| `DistortionScreen` | Companion | Identify cognitive distortions |
| `InsightsScreen` | Companion | Patterns from reflection history |
| `IntentionScreen` | Companion | Set a daily niyyah |
| `QuranReaderScreen` | Quran | Full reader with audio, tajweed, word-by-word |
| `HifzDashboard` | Quran | Memorization tracking (FSRS v5 spaced repetition) |
| `TafsirPanel` | Quran | Classical tafsir (Ibn Kathir, Al-Tabari, etc.) |
| `ArabicTutor` | Learn | Conversational Arabic tutor (4 modes) |
| `PronunciationCoach` | Learn | Record → STT → personalized feedback |
| `Translator` | Learn | Translation with root word analysis |
| `DuaScreen` | Worship | 100+ adhkar with counters |
| `PrayerTimesScreen` | Worship | Precise prayer times + qibla compass |
| `RamadanHubScreen` | Worship | Fasting tracker, Ramadan calendar |
| `FastingTrackerScreen` | Worship | Fasting log |
| `ProfileScreen` | Profile | Settings, subscription, achievements |
| `PricingScreen` | — | Plus/Pro upgrade |

---

## Server Routes

```
/api/companion/*        Companion chat (Noor's general conversational companion)
/api/khalil/*           Khalil muhasaba (named reflection companion)
/api/quran/*            Quran text, audio, tajweed
/api/hifz/*             Memorization (FSRS scheduling, feedback)
/api/tafsir/*           Classical tafsir explanations
/api/verse/*            Verse discussion (multi-turn)
/api/duas/*             Dua recommendations
/api/prayer/*           Prayer times, qibla
/api/arabic/*           Arabic tutor, pronunciation, translation
/api/vocabulary/*       Flashcard vocabulary
/api/hadith/*           Hadith search and display
/api/adhkar/*           Adhkar collection
/api/reflection/*       Reflection storage (encrypted)
/api/progress/*         Gamification, streaks, achievements
/api/study-plan/*       Personalized study plans
/api/billing/*          RevenueCat + Stripe subscription management
/api/sync/*             Offline sync
/api/notifications/*    Expo push
/api/admin/health       Health check
```

---

## Content and Tone Rules

These rules are enforced via `server/charter-compliance.ts`, `server/tone-compliance-checker.ts`, and `server/failure-language.ts`. Read them before writing prompts or server responses.

**Never use:**
- "AI", "artificial intelligence", "language model", "algorithm", "machine learning"
- Clinical/therapeutic language: "therapy", "diagnosis", "treatment", "disorder", "patient", "symptom", "clinical"
- Judgmental or shame-based language
- Spiritual bypassing (dismissing distress with platitudes)
- False promises ("this will fix...", "guaranteed...")
- Unauthorized rulings on fiqh matters

**Always use:**
- Companion framing: "Khalil", "your companion", "we can reflect on..."
- Merciful, non-judgmental tone in every response
- Hedged language on scholarly matters: "according to mainstream scholars...", "many scholars hold..."
- De-escalation and referral when crisis indicators detected (see `server/ai-safety.ts`)

**Crisis protocol:** `server/ai-safety.ts` exports `detectCrisis()`. If called, the server must respond with `CRISIS_RESOURCES` content, not a companion response.

**Scrupulosity detection:** `detectScrupulosity()` handles Islamic OCD patterns — responds with reassurance, not theological debate.

---

## Subscription Tiers

| Feature | Free | Plus ($2.99/mo) | Pro ($7.99/mo) |
|---------|------|-----------------|-----------------|
| Quran reader, audio, tajweed | ✅ | ✅ | ✅ |
| Prayer times, adhkar, qibla | ✅ | ✅ | ✅ |
| Basic Arabic translation | ✅ | ✅ | ✅ |
| Khalil / companion (3/day) | ✅ | ✅ → unlimited | ✅ → unlimited |
| Arabic tutor (3/day) | ✅ | ✅ → unlimited | ✅ → unlimited |
| Hifz memorization | Limited | ✅ hifz_unlimited | ✅ |
| Hifz advanced analysis | ❌ | ✅ | ✅ |
| Hifz circles | ❌ | ❌ | ✅ |
| Tafsir explanations | ❌ | ✅ | ✅ |
| Personalized study plans | ❌ | ✅ | ✅ |

Premium features gate via `billingService` in `server/billing/`. Client checks `useSubscription()` store.

---

## Testing Conventions

- **707 tests passing** (Phase 6 + Phase 7 full suite)
- Run `npm test` (server) before any commit
- `VALIDATION_MODE=true npm test` for CI without Claude API or DB
- Test files: `server/__tests__/`, `client/__tests__/`, `client/screens/__tests__/`
- Mock Claude API in all server tests — never hit real endpoints
- Mock RevenueCat and Stripe in billing tests
- Detox for E2E (`npm run test:e2e:ios` — requires a connected sim + dev build)

---

## Offline-First Rules

Core features that **must** work without a network connection:
- Quran text, tajweed coloring
- Prayer times (calculated locally via `adhan` library)
- Qibla direction (device sensors)
- Adhkar and dua library
- Saved vocabulary flashcards
- Reflection history (read from WatermelonDB)

Features that require network:
- Khalil / companion conversations
- Audio streaming (EveryAyah CDN)
- Sync (offline → server)
- Subscription checks

---

## Performance Targets

- Launch: < 2s on iPhone 12 / Pixel 5
- JS bundle: < 5MB
- Total bundle: < 30MB
- FlatList: always use `maxToRenderPerBatch={8}`, `windowSize={5}`, `removeClippedSubviews={true}`
- `console.log` is stripped in production (babel plugin configured)

---

## Security

- Reflection data: encrypted at rest using `server/encryption.ts` (AES)
- JWT stored in `expo-secure-store` (not AsyncStorage)
- Jailbreak detection via `jail-monkey` (blocks screenshot capture on rooted devices)
- `expo-screen-capture` prevents screenshots on sensitive screens
- Helmet + express-rate-limit on all server routes
- No PHI — Noor never collects health or medical data

---

## Claude Code Skills Active for This Project

Given the stack, the following Claude Code plugins are most relevant:

- `expo-app-design:*` — Expo SDK 54 patterns, native UI, API routes, dev client
- `react-native-best-practices:*` — Callstack React Native conventions
- `upgrading-expo:*` — SDK upgrades
- `expo-deployment:*` — EAS build + CI/CD workflows
- `firebase` — if Firebase Auth or Cloud Messaging is added
- `stripe:*` — Stripe billing patterns
- `frontend-design:*` — Component and screen design
- `typescript-expert` — strict TypeScript patterns
- `vitest-test-creator` / `jest-test-generator` — test generation
- `sentry:*` — Sentry release management and error capture
- `security-sentinel` — Security audit before release
- `context7` — Expo/RN docs lookup

---

## Key Docs

- `ARCHITECTURE.md` — full system diagram, state management, data flow, module boundaries
- `CONTINUE.md` — phase-by-phase completion history (pick up from any clone)
- `CHANGELOG.md` — version history
- `SECURITY.md` — security posture and data handling
- `docs/performance.md` — bundle size, FlatList, launch time targets
- `docs/deployment/` — EAS, Railway, Sentry release docs
- `docs/plans/` — phase planning docs
- `server/charter-compliance.ts` — **read before writing any Khalil/companion prompts**
- `shared/islamic-framework.ts` — tone guidelines, distress levels, content rules
