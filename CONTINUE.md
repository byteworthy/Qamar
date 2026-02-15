# Noor App - Continuation Guide

Use this document to pick up development from any fresh clone.

## Project Summary

**Noor** is a unified Islamic companion app (React Native + Expo SDK 54) combining conversational AI, Quran reader, prayer times, Arabic learning, and personal reflection. Built by merging Noor-AI (Flutter, data assets) and Noor-CBT (React Native, AI interface).

- **Version**: 2.0.0
- **Bundle ID**: `com.byteworthy.noor` (iOS + Android)
- **EAS Project ID**: `b3e205eb-b119-4976-a275-df7bcef85275`
- **Backend**: Express.js + PostgreSQL (Railway) + Anthropic Claude
- **Tests**: 643/643 passing, zero TypeScript errors

## Current Status: CODE COMPLETE

All code-side work is done. The app is waiting on external setup steps before first build and store submission.

## Remaining Steps (In Order)

### 1. EAS Credentials (First-Time Build)

These must be run **interactively** in a terminal (not scripted):

```bash
# Android — generates keystore on first run
npx eas build --profile production --platform android

# iOS — generates distribution certificate on first run
npx eas build --profile production --platform ios
```

**Note**: `--non-interactive` will fail on first build because credentials don't exist yet.

### 2. Apple Developer Configuration

In `eas.json`, replace these placeholders:

```json
"ascAppId": "PLACEHOLDER_ASC_APP_ID"   // App Store Connect App ID
"appleTeamId": "PLACEHOLDER_TEAM_ID"   // Apple Developer Team ID
```

Get these from https://appstoreconnect.apple.com after creating the app listing.

### 3. RevenueCat Product Setup

Create 3 products in the RevenueCat dashboard (https://app.revenuecat.com):

| Product | Price | ID |
|---------|-------|----|
| Monthly | $2.99/mo | `com.byteworthy.noor.plus.monthly` |
| Yearly | $19.99/yr | `com.byteworthy.noor.plus.yearly` |
| Lifetime | $49.99 | `com.byteworthy.noor.plus.lifetime` |

These must also be created in App Store Connect (iOS) and Google Play Console (Android), then linked in RevenueCat.

### 4. Rotate RevenueCat API Key

The test key in `.env.production` was briefly tracked in git. Generate a new key in RevenueCat and update `.env.production` locally.

### 5. Android: Google Services Key

For automated Play Store submission, place `google-services-key.json` at project root. Create a service account in Google Cloud Console with "Service Account User" role and Play Store API access.

### 6. Test on Physical Device

Before submission, verify on real hardware:
- 988 crisis hotline tap-to-call works
- Biometric auth (Face ID / fingerprint)
- Prayer times with real GPS location
- Offline mode (airplane mode)
- IAP purchase flow (sandbox)

### 7. App Store Submission

Store metadata is pre-written in:
- `release/STORE_PACK/apple/APP_STORE_METADATA.md`
- `release/STORE_PACK/google/PLAY_STORE_METADATA.md`
- `release/STORE_PACK/FINAL_SUBMISSION_CHECKLIST.md`

Screenshots can be generated with Maestro:
```bash
bash scripts/take-screenshots.sh
```

## Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 54 |
| Navigation | React Navigation 7.x (tabs + stacks) |
| State | Zustand (client) + TanStack Query (server) |
| Backend | Express.js on Railway |
| Database | PostgreSQL (Railway) + SQLite (local, offline) |
| AI | Anthropic Claude API |
| Auth | Biometric (expo-local-authentication) |
| Payments | RevenueCat (mobile IAP) |
| Monitoring | Sentry (@sentry/react-native + @sentry/node) |
| OTA Updates | expo-updates (channels: development/preview/production) |
| Build | EAS Build + EAS Submit |

## Key Environment Variables

See `.env.example` and `server/.env.example` for full list. Critical ones:

```
ANTHROPIC_API_KEY=         # Claude API for AI companion
DATABASE_URL=              # PostgreSQL connection string
REVENUECAT_API_KEY=        # Mobile IAP (RevenueCat)
SENTRY_DSN=                # Error tracking
EXPO_PUBLIC_API_URL=       # Backend URL for mobile client
```

Stripe keys are **web billing only** — mobile uses RevenueCat exclusively.

## Project Structure

```
client/           # React Native app screens, components, hooks
server/           # Express.js backend (AI, API routes, middleware)
shared/           # Shared types, seed data (verses.json)
scripts/          # Build scripts, screenshot automation
e2e/              # Maestro E2E test flows
legal/            # Privacy Policy, Terms of Service
release/          # Store submission assets and metadata
docs/             # Deployment guides, checklists
web/              # Web export configuration
```

## Running Locally

```bash
npm install                     # Install dependencies
npx expo start                  # Start Expo dev server
npm run server                  # Start backend (separate terminal)
npm test                        # Run 643 tests
npx tsc --noEmit               # TypeScript check (0 errors)
```

## Legal URLs (Live)

- Privacy Policy: https://byteworthy.github.io/Noor/legal/privacy.html
- Terms of Service: https://byteworthy.github.io/Noor/legal/terms.html

## Important Notes

- **Not a therapy app** — Noor is an Islamic companion for education, worship tools, and personal reflection. No medical/clinical claims.
- **Safety system** — Built-in crisis detection routes users to 988 Suicide & Crisis Lifeline. This is a safety guardrail, not a therapy feature.
- **Offline-first** — Quran, Hadith, and prayer times work without internet. AI companion requires connectivity.
- **`.env.production`** is gitignored — never commit it.
