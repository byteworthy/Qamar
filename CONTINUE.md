# Noor App - Continuation Guide

Use this document to pick up development from any fresh clone.

## Project Summary

**Noor** is a unified Islamic companion app (React Native + Expo SDK 54) combining an interactive companion, Quran reader, prayer times, Arabic learning, and personal reflection. Built from a clean merge of foundational data assets and React Native framework.

- **Version**: 2.0.0
- **Bundle ID**: `com.byteworthy.noor` (iOS + Android)
- **EAS Project ID**: `b3e205eb-b119-4976-a275-df7bcef85275`
- **Backend**: Express.js + PostgreSQL (Railway) + Anthropic Claude
- **Tests**: 707/707 passing (all Phase 6 + Phase 7 unit tests included)

## Current Status

### COMPLETE — Phase 5: Arabic Language & Audio Suite

All 7 features implemented:
1. Enhanced Quran Audio (8 reciters, EveryAyah fallback CDN) - DONE
2. Word-by-Word Audio with highlighting - DONE
3. Tajweed Color-Coded Display (17 rules) - DONE
4. Text-to-Speech for vocabulary/duas (expo-speech) - DONE
5. Arabic Language Tutor (Claude Haiku, 4 modes) - DONE
6. Pronunciation Coach (record → STT → personalized feedback) - DONE
7. Translation Service with TTS + detailed explanations - DONE

**New dependencies:** `expo-speech`, `@react-native-voice/voice`
**Dev build required** for `@react-native-voice/voice` (not Expo Go compatible).

**Interactive Features Pricing:** 3 free calls/day across tutor + pronunciation + translation explanations. Unlimited with Plus ($2.99/mo). All Quran audio, TTS, tajweed, and basic translation are free forever.

**New screens:** ArabicTutor, PronunciationCoach, Translator, TajweedGuide (all accessible from Learn tab).

### COMPLETE — Phase 6A: Hifz Memorization System

**COMPLETED** on phase-6-hifz-deep-ai branch (15 commits, ~5500 lines).

Core system implemented:
- FSRS v5 spaced repetition scheduler with proven algorithm
- Hidden verse mode with record → transcribe → feedback flow
- Word-level mistake detection and scoring
- Juz progress map (30-cell grid tracking)
- HifzDashboard + HifzRecitation screens
- Server routes with Claude Haiku analysis
- Gamification integration (hifz_review_completed activity)
- Premium gating: hifz_unlimited (Plus), hifz_advanced_analysis (Plus), hifz_circles (Pro)

**Known TypeScript errors:** Pre-existing in HifzMistakeFeedback.tsx (from subagent implementation). Non-blocking.

### COMPLETE — Phase 6B: Tafsir + Verse Conversation

**COMPLETED** on phase-6-hifz-deep-ai branch (10 commits, ~3000 lines).

Core features:
- Tafsir explanations with classical sources (Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di)
- Multi-turn verse discussions with conversation history
- AsyncStorage caching for tafsir (cache-first strategy)
- TafsirPanel slide-up component with 5 sections (context, key terms, scholarly views, cross-references, takeaway)
- VerseDiscussionScreen chat UI with optimistic updates
- Server endpoints: POST /api/tafsir/explain, POST /api/verse/discuss
- 7 new server tests (tafsir + verse-conversation routes)

### COMPLETE — Phase 6C: Dua Finder

**COMPLETED** on phase-6-hifz-deep-ai branch (5 commits, ~2000 lines).

Core features:
- Intelligent dua search with 15 authentic duas from Quran and Sahih collections
- DuaFinderScreen with category chips (Anxiety, Gratitude, Travel, etc.)
- DuaCard component with Arabic (Amiri font), transliteration, TTS playback, favorites
- Favorites persistence with AsyncStorage Zustand store
- Server endpoint: POST /api/duas/recommend
- 25 new tests (4 server routes + 21 store tests)

### COMPLETE — Phase 6D: Personalized Study Plan

**COMPLETED** on main branch (10 commits, ~2500 lines).

Core features:
- 3-step onboarding (goal, time commitment, skill level)
- Personalized weekly study plans with Claude Haiku
- Daily task cards with deep link navigation to app screens
- Completion tracking with AsyncStorage persistence
- Weekly stats: completion rate, streak, week start date
- Server endpoint: POST /api/study-plan/generate
- 4 new tests (generator + routes + store)

### COMPLETE — Phase 6E: Integration + Polish

**COMPLETED** on main branch (2 commits).

Polish work:
- Fixed Phase 6D TypeScript errors in study-plan-store and PremiumUpsell
- Added Phase 6B-D feature descriptions to premium upsell component
- Verified premium feature gating for all 4 phases
- Updated documentation
- Final test coverage: 707/707 passing

### IN PROGRESS — Phase 7: Production Readiness

All 5 tracks dispatched. Current status:

**Track 1: E2E Test Suite — DONE**
- Fixed `.detoxrc.js` (myapp → Noor)
- `e2e/shared/helpers.js` — waitFor, tap, type, scroll, reload utilities
- `e2e/shared/selectors.js` — centralized testID constants for all screens
- `e2e/flows/` — 7 flow tests: quran-reader, hifz, prayer-times, onboarding, subscription, offline-mode, arabic-tutor
- `e2e/regression.test.js` — master smoke suite for CI (< 10 min)
- `.github/workflows/e2e-ios.yml` — Detox on macos-14 simulator
- `.github/workflows/e2e-android.yml` — Detox on ubuntu emulator
- **DONE**: All `testID` props added to all screens (see list below). `tsc --noEmit` passes clean.

**Track 2: Performance Optimization — DONE**
- `scripts/compress-assets.sh` — pngquant PNG compression script
- `docs/performance.md` — performance budget and optimization notes
- FlatList optimizations verified in VerseReaderScreen
- Hermes + New Architecture already enabled

**Track 3: App Store Content — DONE (committed)**
- `docs/app-store/ios/description.md` — Full App Store listing
- `docs/app-store/ios/keywords.txt` — 100-char keyword string
- `docs/app-store/ios/privacy-labels.md`
- `docs/app-store/ios/screenshot-specs.md`
- `docs/app-store/android/` — short/long descriptions, screenshot specs
- `docs/app-store/video/script.md` — 30-second promotional video script
- `docs/app-store/submission-checklist.md`

**Track 4: Visual Polish — DONE**
- `client/components/ErrorState.tsx` — inline error display with retry
- `client/components/SkeletonLoader.tsx` — thin wrapper over LoadingSkeleton
- `client/navigation/RootStackNavigator.tsx` — added OfflineBanner above Stack.Navigator

**Track 5: UX Polish — DONE**
- `client/components/OfflineBanner.tsx` — animated offline indicator
- `client/hooks/useTooltip.ts` — first-time tooltip tracking via AsyncStorage
- `client/components/Tooltip.tsx` — Modal-based tooltip overlay
- `client/components/FeaturePreviewCarousel.tsx` — auto-scrolling onboarding carousel
- `client/screens/onboarding/WelcomeScreen.tsx` — replaced static features with carousel
- `client/screens/learn/PronunciationCoachScreen.tsx` — permission priming (canAskAgain, priming card, settings redirect)

**Remaining before App Store submission:**
- ~~Add `testID` props to screens~~ — **DONE** (all screens complete, tsc clean)
- ~~Add `Tooltip` to VerseReaderScreen (first-time tajweed hint)~~ — **DONE** (Tooltip component + useTooltip hook integrated)
- ~~Add permission priming to `PronunciationCoachScreen`~~ — **DONE** (priming card + canAskAgain + settings redirect)
- Generate screenshots with EAS dev build (see `docs/app-store/ios/screenshot-specs.md`)
- Complete Apple Developer + RevenueCat configuration (see Remaining Steps below)

**testID coverage (all screens complete as of 2026-02-26):**
- `TabNavigator.tsx` — tab-home, tab-history, tab-learn, tab-worship, tab-settings
- `WelcomeScreen.tsx` — get-started-button
- `SessionCompleteScreen.tsx` — session-complete-screen
- `DuaFinderScreen.tsx` — dua-finder-screen, dua-search-input, dua-list
- `HifzDashboardScreen.tsx` — hifz-dashboard-screen, hifz-start-session
- `ThoughtCaptureScreen.tsx` — thought-input, intensity-{1-5}, continue-button
- `HistoryScreen.tsx` — reflection-list, history-empty-state, reflection-item-{index}
- `QuranReaderScreen.tsx` — surah-list, surah-item-{id}
- `ArabicTutorScreen.tsx` — arabic-tutor-screen, tutor-message-list, tutor-chat-input, tutor-send-button, daily-quota-badge
- `ProfileScreen.tsx` — settings-screen, subscription-status, upgrade-button
- `PricingScreen.tsx` — features-list, plan-monthly, plan-annual, subscribe-button, restore-purchases-button
- `PrayerTimesScreen.tsx` — prayer-times-screen, prayer-fajr, prayer-dhuhr, prayer-asr, prayer-maghrib, prayer-isha
- `LearnTabScreen.tsx` — learn-screen, learn-quran-card, learn-hifz-card, learn-arabic-tutor-card, learn-pronunciation-card, learn-translator-card, learn-study-plan-card
- `VerseReaderScreen.tsx` — quran-reader-screen, verse-list, verse-item-{n}, tajweed-toggle, word-by-word-toggle, reciter-picker, audio-play-button / audio-pause-button
- `HomeScreen.tsx` — streak-display, daily-noor-card, stats-card, begin-reflection-button
- `OfflineBanner.tsx` — offline-banner, offline-banner-dismiss
- `FeaturePreviewCarousel.tsx` — feature-preview-carousel

**Estimated server cost at 1K users after Phase 6:** ~$79/mo (up from ~$27/mo).

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
| Language Model | Anthropic Claude API (Haiku for tutor/pronunciation) |
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
ANTHROPIC_API_KEY=         # Claude API for companion
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
npm test                        # Run 707 tests
npx tsc --noEmit               # TypeScript check (0 errors expected; known pre-existing errors in HifzMistakeFeedback.tsx are suppressed)
```

## Legal URLs (Live)

- Privacy Policy: https://byteworthy.github.io/Noor/legal/privacy.html
- Terms of Service: https://byteworthy.github.io/Noor/legal/terms.html

## Important Notes

- **Not a therapy app** — Noor is an Islamic companion for education, worship tools, and personal reflection. No medical/clinical claims.
- **Safety system** — Built-in crisis detection routes users to 988 Suicide & Crisis Lifeline. This is a safety guardrail, not a therapy feature.
- **Offline-first** — Quran, Hadith, prayer times, TTS, and tajweed (cached) work without internet. Interactive features (tutor/pronunciation/translation) require connectivity.
- **Dev build** — `@react-native-voice/voice` requires a dev build (not Expo Go). Run `eas build --profile development` for testing.
- **Daily quota** — Free users get 3 calls/day across tutor + pronunciation + translation explanations. Plus users get unlimited.
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
client/hooks/useAITutor.ts             # NEW: tutor chat hook
client/hooks/usePronunciation.ts       # NEW: pronunciation flow hook
client/hooks/useTranslation.ts         # NEW: translation hook
client/hooks/useDailyAIQuota.ts        # NEW: daily quota tracking
client/components/WordByWordPlayer.tsx  # NEW: word highlighting player
client/components/TajweedText.tsx       # NEW: color-coded Arabic text
client/components/TTSButton.tsx         # NEW: speaker icon button
client/components/AudioRecordButton.tsx # NEW: recording button
client/components/PronunciationFeedback.tsx  # NEW: score + feedback display
client/components/DailyQuotaBadge.tsx   # NEW: "2/3 free today" badge
client/screens/learn/TajweedGuideScreen.tsx     # NEW: tajweed rules legend
client/screens/learn/ArabicTutorScreen.tsx      # NEW: tutor chat
client/screens/learn/PronunciationCoachScreen.tsx  # NEW: pronunciation practice
client/screens/learn/TranslatorScreen.tsx       # NEW: Arabic ↔ English translator
server/middleware/ai-daily-quota.ts     # NEW: shared quota middleware
server/services/tutor-prompts.ts       # NEW: Arabic tutor system prompt
server/services/pronunciation-scorer.ts # NEW: Levenshtein scoring
server/services/translation-service.ts  # NEW: MyMemory/Google translate
server/routes/tutor-routes.ts          # NEW: POST /api/tutor/chat
server/routes/pronunciation-routes.ts   # NEW: POST /api/pronunciation/check
server/routes/translation-routes.ts     # NEW: POST /api/translate
server/__tests__/arabic-routes.test.ts  # NEW: 32 tests for Arabic routes
```

## New File Map (Tafsir + Verse Conversation - Phase 6B)

```
server/services/tafsir-prompts.ts       # NEW: prompts for classical tafsir explanations
server/services/verse-conversation-prompts.ts  # NEW: prompts for verse Q&A discussions
server/routes/tafsir-routes.ts          # NEW: POST /api/tafsir/explain
server/routes/verse-conversation-routes.ts  # NEW: POST /api/verse/discuss
server/__tests__/tafsir-routes.test.ts  # NEW: 3 tests for tafsir endpoint
server/__tests__/verse-conversation-routes.test.ts  # NEW: 4 tests for discussion endpoint
client/stores/tafsir-cache-store.ts     # NEW: AsyncStorage cached tafsir by verse
client/stores/verse-conversation-store.ts  # NEW: persisted chat history per verse
client/hooks/useTafsir.ts               # NEW: cache-first tafsir fetching hook
client/hooks/useVerseConversation.ts    # NEW: multi-turn discussion hook with optimistic UI
client/components/TafsirPanel.tsx       # NEW: animated slide-up panel with 5 sections
client/screens/learn/VerseDiscussionScreen.tsx  # NEW: chat UI for verse Q&A
client/screens/learn/VerseReaderScreen.tsx  # MODIFIED: added Explain + Discuss buttons
client/navigation/types.ts              # MODIFIED: added VerseDiscussion route
client/navigation/RootStackNavigator.tsx  # MODIFIED: registered VerseDiscussionScreen
```

## New File Map (Dua Finder - Phase 6C)

```
server/services/dua-recommender.ts      # NEW: RAG search with 15 authentic duas
server/routes/dua-routes.ts             # NEW: POST /api/duas/recommend
server/__tests__/dua-routes.test.ts     # NEW: 4 tests for dua endpoint
client/stores/dua-favorites-store.ts    # NEW: AsyncStorage persisted favorites
client/stores/__tests__/dua-favorites-store.test.ts  # NEW: 21 store tests
client/hooks/useDuaRecommender.ts       # NEW: dua recommendation API hook
client/components/DuaCard.tsx           # NEW: GlassCard with Arabic, TTS, bookmark
client/screens/learn/DuaFinderScreen.tsx  # NEW: search input + category chips + results
client/navigation/types.ts              # MODIFIED: added DuaFinder route
client/navigation/RootStackNavigator.tsx  # MODIFIED: registered DuaFinderScreen
client/screens/learn/LearnTabScreen.tsx  # MODIFIED: added "Find a Dua" feature card
server/routes.ts                        # MODIFIED: registered tafsir, verse-conversation, dua routes
```

## New File Map (Personalized Study Plan - Phase 6D)

```
shared/types/study-plan.ts              # NEW: TypeScript types for plans and tasks
server/services/study-plan-generator.ts # NEW: personalized plan generation
server/routes/study-plan-routes.ts      # NEW: POST /api/study-plan/generate
server/__tests__/study-plan-generator.test.ts  # NEW: 1 test for generator
server/__tests__/study-plan-routes.test.ts     # NEW: 3 tests for routes
client/stores/study-plan-store.ts       # NEW: Zustand store with AsyncStorage
client/stores/__tests__/study-plan-store.test.ts  # NEW: 2 store tests (Phase 6D agent may add)
client/hooks/useStudyPlan.ts            # NEW: plan generation and completion hook
client/components/StudyPlanOnboarding.tsx  # NEW: 3-step goal/time/level picker
client/components/DailyTaskCard.tsx     # NEW: task card with deep link navigation
client/screens/learn/StudyPlanScreen.tsx  # NEW: weekly calendar view
client/navigation/types.ts              # MODIFIED: added StudyPlan route
client/navigation/RootStackNavigator.tsx  # MODIFIED: registered StudyPlanScreen
client/screens/learn/LearnTabScreen.tsx  # MODIFIED: added "My Study Plan" card
server/routes.ts                        # MODIFIED: registered study-plan routes
client/lib/premium-features.ts          # MODIFIED: added Phase 6D features to enum and tiers
client/components/PremiumUpsell.tsx     # MODIFIED: added Phase 6D feature descriptions
```

## New File Map (Hifz Memorization System - Phase 6A)

```
shared/types/hifz.ts                    # NEW: core Hifz types and interfaces
client/services/hifz/fsrs-scheduler.ts  # NEW: FSRS v5 spaced repetition algorithm
client/services/hifz/recitation-checker.ts  # NEW: word-level Quran recitation comparison
client/stores/hifz-store.ts             # NEW: Zustand store with AsyncStorage persistence
client/hooks/useHifzRecitation.ts       # NEW: recording + transcription + feedback flow
client/hooks/useHifzProgress.ts         # NEW: progress tracking hook
client/hooks/useHifzReviewQueue.ts      # NEW: review queue management hook
client/components/JuzProgressMap.tsx    # NEW: 30-cell grid showing juz completion
client/components/HifzMistakeFeedback.tsx  # NEW: score display + mistake breakdown
client/components/HifzPeekOverlay.tsx   # NEW: hint overlay (reveal word/ayah)
client/screens/learn/HifzDashboardScreen.tsx  # NEW: main entry point, stats + review queue
client/screens/learn/HifzRecitationScreen.tsx  # NEW: recording screen with hidden verse
server/routes/hifz-routes.ts            # NEW: POST /api/hifz/analyze-mistakes
server/services/hifz-prompts.ts         # NEW: prompts for mistake analysis
client/hooks/useEntitlements.ts         # MODIFIED: added hifz_unlimited, hifz_advanced_analysis, hifz_circles
client/lib/premium-features.ts          # MODIFIED: added HIFZ_UNLIMITED, HIFZ_ADVANCED_ANALYSIS, HIFZ_CIRCLES
client/components/PremiumUpsell.tsx     # MODIFIED: added Hifz feature benefit descriptions
client/stores/gamification-store.ts     # MODIFIED: added hifz_review_completed activity type
client/navigation/types.ts              # MODIFIED: added HifzDashboard + HifzRecitation routes
client/navigation/RootStackNavigator.tsx  # MODIFIED: registered Hifz screens
client/screens/learn/LearnTabScreen.tsx  # MODIFIED: added "Hifz Memorization" feature card
```

