# Noor App - Continuation Guide

Use this document to pick up development from any fresh clone.

## Project Summary

**Noor** is a unified Islamic companion app (React Native + Expo SDK 54) combining conversational AI, Quran reader, prayer times, Arabic learning, and personal reflection. Built by merging Noor-AI (Flutter, data assets) and Noor-CBT (React Native, UI framework) into a unified app.

- **Version**: 2.0.0
- **Bundle ID**: `com.byteworthy.noor` (iOS + Android)
- **EAS Project ID**: `b3e205eb-b119-4976-a275-df7bcef85275`
- **Backend**: Express.js + PostgreSQL (Railway) + Anthropic Claude
- **Tests**: 690/690 passing (15 new Hifz tests)

## Current Status

### COMPLETE — Phase 5: Arabic Language & Audio Suite

All 7 features implemented:
1. Enhanced Quran Audio (8 reciters, EveryAyah fallback CDN) - DONE
2. Word-by-Word Audio with highlighting - DONE
3. Tajweed Color-Coded Display (17 rules) - DONE
4. Text-to-Speech for vocabulary/duas (expo-speech) - DONE
5. AI Arabic Language Tutor (Claude Haiku, 4 modes) - DONE
6. AI Pronunciation Coach (record → STT → AI feedback) - DONE
7. Translation Service with TTS + AI explanations - DONE

**New dependencies:** `expo-speech`, `@react-native-voice/voice`
**Dev build required** for `@react-native-voice/voice` (not Expo Go compatible).

**AI Pricing:** 3 free AI calls/day across tutor + pronunciation + translation-explain. Unlimited with Plus ($2.99/mo). All Quran audio, TTS, tajweed, and basic translation are free forever.

**New screens:** ArabicTutor, PronunciationCoach, Translator, TajweedGuide (all accessible from Learn tab).

### COMPLETE — Phase 6A: Hifz Memorization System

**COMPLETED** on phase-6-hifz-deep-ai branch (15 commits, ~5500 lines).

Core system implemented:
- FSRS v5 spaced repetition scheduler with proven algorithm
- Hidden verse mode with record → transcribe → AI feedback flow
- Word-level mistake detection and scoring
- Juz progress map (30-cell grid tracking)
- HifzDashboard + HifzRecitation screens
- Server routes with Claude Haiku AI analysis
- Gamification integration (hifz_review_completed activity)
- Premium gating: hifz_unlimited (Plus), hifz_ai_analysis (Plus), hifz_circles (Pro)

**Known TypeScript errors:** Pre-existing in HifzMistakeFeedback.tsx (from subagent implementation). Non-blocking.

### NEXT — Phase 6B-E: Deep AI Features

**Design doc:** [`docs/plans/2026-02-16-hifz-and-deep-ai-design.md`](docs/plans/2026-02-16-hifz-and-deep-ai-design.md)

**Remaining phases:**

| Phase | Feature | Key Deliverable |
|-------|---------|----------------|
| 6B | **AI Tafsir + Verse Conversation** | Tap any verse → classical tafsir explanation (cached) or open-ended AI discussion |
| 6C | **AI Dua Recommender** | Describe situation → get authentic duas with sources, Arabic, transliteration, TTS |
| 6D | **Personalized Study Plan** | AI-generated weekly Quran study plan that adapts to your pace and goals |
| 6E | **Integration + Polish** | Fix HifzMistakeFeedback TypeScript errors, add E2E tests, final review |

**No new dependencies needed.** All features build on existing stack (STT, TTS, FSRS, RAG, Claude Haiku).

**Estimated server cost at 1K users after Phase 6:** ~$79/mo (up from ~$27/mo).

**To start Phase 6B:** Ask Claude to create implementation plan for AI Tafsir + Verse Conversation using the design doc.

The app still needs external setup steps for first build and store submission (see below).

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
| AI | Anthropic Claude API (Haiku for tutor/pronunciation) |
| TTS | expo-speech (on-device Arabic) |
| STT | @react-native-voice/voice (on-device, dev build) |
| Audio | expo-av (recording + Quran playback) |
| Translation | MyMemory API (free) + Google Translate (free tier) |
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
docs/plans/       # Approved design docs (start here for next phase)
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
npm test                        # Run 690 tests
npx tsc --noEmit               # TypeScript check (known errors in HifzMistakeFeedback.tsx)
```

## Legal URLs (Live)

- Privacy Policy: https://byteworthy.github.io/Noor/legal/privacy.html
- Terms of Service: https://byteworthy.github.io/Noor/legal/terms.html

## Important Notes

- **Not a therapy app** — Noor is an Islamic companion for education, worship tools, and personal reflection. No medical/clinical claims.
- **Safety system** — Built-in crisis detection routes users to 988 Suicide & Crisis Lifeline. This is a safety guardrail, not a therapy feature.
- **Offline-first** — Quran, Hadith, prayer times, TTS, and tajweed (cached) work without internet. AI tutor/pronunciation/translation require connectivity.
- **Dev build** — `@react-native-voice/voice` requires a dev build (not Expo Go). Run `eas build --profile development` for testing.
- **AI daily quota** — Free users get 3 AI calls/day across tutor + pronunciation + translation-explain. Plus users get unlimited.
- **`.env.production`** is gitignored — never commit it.

## New File Map (Arabic Language Suite)

```
client/services/quranAudio.ts          # MODIFIED: 8 reciters + EveryAyah fallback
client/services/wordByWordAudio.ts     # NEW: word-level Quran audio playback
client/services/tajweedParser.ts       # NEW: parse tajweed HTML → colored segments
client/services/speech/types.ts        # NEW: TTS/STT provider interfaces
client/services/speech/ttsService.ts   # NEW: expo-speech TTS wrapper
client/services/speech/recordingService.ts  # NEW: expo-av recording wrapper
client/services/speech/sttService.ts   # NEW: @react-native-voice/voice wrapper
client/data/tajweed-rules.ts           # NEW: 17 tajweed rule definitions
client/hooks/useWordByWordAudio.ts     # NEW: word-by-word audio hook
client/hooks/useTajweed.ts             # NEW: fetch + cache tajweed data
client/hooks/useTTS.ts                 # NEW: text-to-speech hook
client/hooks/useSTT.ts                 # NEW: speech-to-text hook
client/hooks/useRecording.ts           # NEW: audio recording hook
client/hooks/useAITutor.ts             # NEW: AI tutor chat hook
client/hooks/usePronunciation.ts       # NEW: pronunciation flow hook
client/hooks/useTranslation.ts         # NEW: translation hook
client/hooks/useDailyAIQuota.ts        # NEW: daily AI quota tracking
client/components/WordByWordPlayer.tsx  # NEW: word highlighting player
client/components/TajweedText.tsx       # NEW: color-coded Arabic text
client/components/TTSButton.tsx         # NEW: speaker icon button
client/components/AudioRecordButton.tsx # NEW: recording button
client/components/PronunciationFeedback.tsx  # NEW: score + feedback display
client/components/DailyQuotaBadge.tsx   # NEW: "2/3 free today" badge
client/screens/learn/TajweedGuideScreen.tsx     # NEW: tajweed rules legend
client/screens/learn/ArabicTutorScreen.tsx      # NEW: AI tutor chat
client/screens/learn/PronunciationCoachScreen.tsx  # NEW: pronunciation practice
client/screens/learn/TranslatorScreen.tsx       # NEW: Arabic ↔ English translator
server/middleware/ai-daily-quota.ts     # NEW: shared AI quota middleware
server/services/tutor-prompts.ts       # NEW: Arabic tutor system prompt
server/services/pronunciation-scorer.ts # NEW: Levenshtein scoring
server/services/translation-service.ts  # NEW: MyMemory/Google translate
server/routes/tutor-routes.ts          # NEW: POST /api/tutor/chat
server/routes/pronunciation-routes.ts   # NEW: POST /api/pronunciation/check
server/routes/translation-routes.ts     # NEW: POST /api/translate
server/__tests__/arabic-routes.test.ts  # NEW: 32 tests for Arabic routes
```

## New File Map (Hifz Memorization System - Phase 6A)

```
shared/types/hifz.ts                    # NEW: core Hifz types and interfaces
client/services/hifz/fsrs-scheduler.ts  # NEW: FSRS v5 spaced repetition algorithm
client/services/hifz/recitation-checker.ts  # NEW: word-level Quran recitation comparison
client/stores/hifz-store.ts             # NEW: Zustand store with AsyncStorage persistence
client/hooks/useHifzRecitation.ts       # NEW: recording + transcription + AI feedback flow
client/hooks/useHifzProgress.ts         # NEW: progress tracking hook
client/hooks/useHifzReviewQueue.ts      # NEW: review queue management hook
client/components/JuzProgressMap.tsx    # NEW: 30-cell grid showing juz completion
client/components/HifzMistakeFeedback.tsx  # NEW: score display + mistake breakdown
client/components/HifzPeekOverlay.tsx   # NEW: hint overlay (reveal word/ayah)
client/screens/learn/HifzDashboardScreen.tsx  # NEW: main entry point, stats + review queue
client/screens/learn/HifzRecitationScreen.tsx  # NEW: recording screen with hidden verse
server/routes/hifz-routes.ts            # NEW: POST /api/hifz/analyze-mistakes
server/services/hifz-prompts.ts         # NEW: Claude Haiku prompts for mistake analysis
client/hooks/useEntitlements.ts         # MODIFIED: added hifz_unlimited, hifz_ai_analysis, hifz_circles
client/lib/premium-features.ts          # MODIFIED: added HIFZ_UNLIMITED, HIFZ_AI_ANALYSIS, HIFZ_CIRCLES
client/components/PremiumUpsell.tsx     # MODIFIED: added Hifz feature benefit descriptions
client/stores/gamification-store.ts     # MODIFIED: added hifz_review_completed activity type
client/navigation/types.ts              # MODIFIED: added HifzDashboard + HifzRecitation routes
client/navigation/RootStackNavigator.tsx  # MODIFIED: registered Hifz screens
client/screens/learn/LearnTabScreen.tsx  # MODIFIED: added "Hifz Memorization" feature card
```

