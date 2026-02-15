# Noor App Merger - Product Requirements Document (PRD)

**Document Version:** 1.0
**Last Updated:** 2025-02-11
**Project:** Noor-AI + Noor-CBT Merger
**Lead Architect:** Paranoid Engineering Team
**Status:** DRAFT - UNDER REVIEW

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Mission](#vision--mission)
3. [Feature Specifications](#feature-specifications)
4. [Technical Architecture](#technical-architecture)
5. [API Contracts](#api-contracts)
6. [Database Schema Design](#database-schema-design)
7. [Security Requirements](#security-requirements)
8. [UI/UX Specifications](#uiux-specifications)
9. [Testing Strategy](#testing-strategy)
10. [Success Metrics & KPIs](#success-metrics--kpis)
11. [Risk Mitigation](#risk-mitigation)
12. [Implementation Timeline](#implementation-timeline)

---

## Executive Summary

### Project Overview

**Objective:** Merge Noor-AI (Flutter) and Noor-CBT (React Native) into a unified **Islamic companion super-app** that combines therapeutic CBT workflows with comprehensive Islamic education features.

**Strategic Decision:** Use **Noor-CBT as the foundation** (React Native + Expo), import all Noor-AI features.

**Rationale:**
- Noor-CBT has production-ready architecture (Express.js backend, PostgreSQL, Stripe/RevenueCat IAP)
- React Native ecosystem provides better cross-platform consistency
- Existing Claude AI integration provides foundation for conversational features
- Mature authentication, billing, and security infrastructure

### What We're Merging

**From Noor-CBT (Base):**
- ✅ React Native/Expo mobile app with Express.js backend
- ✅ Islamic-integrated CBT workflows (analyze → reframe → regulate → intend)
- ✅ Session-based authentication with signed cookies
- ✅ AI-powered assistance via Anthropic Claude API
- ✅ PostgreSQL database with Drizzle ORM
- ✅ React Query for remote state management
- ✅ RevenueCat/Stripe billing integration
- ✅ Sentry error tracking and monitoring

**From Noor-AI (Import):**
- 📚 **3.4MB SQLite database** (6,236 Quran verses, Hadith, Arabic alphabet, vocabulary)
- 🕌 **Prayer Times Module** (Adhan calculation, Qibla compass, location-based)
- 📖 **Quran Reader** (114 Surahs, translations, verse-by-verse, thematic search)
- 🔤 **Arabic Learning System** (28-letter alphabet, FSRS spaced repetition, pronunciation)
- 📿 **Adhkar/Dhikr Collections** (morning/evening, situational invocations)
- 📊 **Progress Tracking** (streaks, achievements, daily goals)
- 💎 **Premium Features System** (RevenueCat integration ready)

### Key Metrics

| Metric | Current Noor-CBT | Current Noor-AI | Target Merged App |
|--------|------------------|-----------------|-------------------|
| **Features** | CBT workflows only | 7 Islamic modules | 8 integrated modules |
| **Database Size** | PostgreSQL only | 3.4MB SQLite | PostgreSQL + 3.4MB SQLite |
| **Screens** | 17 screens | ~35 screens | 45+ screens |
| **Tech Stack** | React Native | Flutter | React Native (unified) |
| **Backend** | Express.js | None | Express.js + offline SQLite |
| **Auth** | Session cookies | Firebase Auth | Session cookies (primary) |
| **Billing** | Stripe/RevenueCat | RevenueCat planned | RevenueCat (unified) |
| **AI Integration** | Claude API | Planned | Claude + RAG (Ollama local) |

### Success Criteria

✅ **Zero Breaking Changes** - Existing Noor-CBT users experience no disruption
✅ **Feature Parity** - All Noor-AI features functional in React Native
✅ **Performance Target** - App launches in <2s on budget devices
✅ **Offline-First** - Core features work without internet (Quran, Prayer times, Arabic learning)
✅ **Bundle Size** - Total app size <50MB (excluding SQLite databases)
✅ **Test Coverage** - 80%+ code coverage across critical paths
✅ **Accessibility** - WCAG 2.1 AA compliance
✅ **Security** - Pass OWASP Mobile Top 10 audit

---

## Vision & Mission

### Vision Statement

**"Become the single Islamic companion app that Muslims worldwide rely on for spiritual growth, mental wellness, and daily Islamic practice."**

### Mission

1. **Holistic Islamic Wellness** - Combine therapeutic mental health support with Islamic education and spiritual practice
2. **Accessible Knowledge** - Make Quran, Hadith, and Arabic learning accessible to beginners and advanced learners
3. **Privacy-First** - Handle sensitive therapeutic and spiritual data with HIPAA-level security
4. **Offline-First** - Work seamlessly in low-connectivity environments (mosques, travel, rural areas)
5. **Scientifically Grounded** - Use evidence-based CBT and spaced repetition (FSRS) algorithms

### Core Principles

- **Islamic Epistemology First** - Not a secular app with Islamic themes bolted on
- **No Over-Engineering** - Simple, maintainable, performant code
- **Mobile-First Design** - Optimized for 4" to 7" screens, one-handed use
- **Universal Accessibility** - Usable by elderly, visually impaired, and non-technical users
- **Cultural Sensitivity** - Respectful of diverse Islamic traditions and schools of thought

---

## Feature Specifications

### Module 1: Home Dashboard (New - Unified)

**Priority:** P0 (Critical - First Implementation)

#### User Stories

- **US-1.1:** As a user, I want to see my daily prayer times, next prayer countdown, and CBT journal entry prompt on the home screen
- **US-1.2:** As a user, I want quick access to "Start Reflection" (CBT), "Read Quran", and "Arabic Lesson" from home
- **US-1.3:** As a user, I want to see my current streak (days active) and today's progress towards daily goals

#### Screens

**HomeScreen.tsx** (Enhanced from Noor-CBT)
- **Header:** Salutation based on time of day ("Assalamu Alaikum - Good Morning")
- **Prayer Times Card:** Next prayer countdown, all 5 daily prayers
- **Quick Actions Grid:**
  - Start Reflection (CBT workflow)
  - Read Quran
  - Arabic Lesson
  - Adhkar Collections
- **Progress Summary:**
  - Current streak (e.g., "🔥 7 Day Streak!")
  - Daily goal progress (e.g., "2/3 goals completed")
  - Recent achievement badge
- **Recent Activity Feed:** Last 3 reflections, Quran verses read, lessons completed

#### Acceptance Criteria

- [ ] Home screen loads in <1s on 3-year-old device
- [ ] Prayer times update automatically based on user location
- [ ] Quick actions trigger correct navigation flows
- [ ] Streak data persists offline and syncs when online
- [ ] Accessibility: All cards have semantic labels, VoiceOver compatible

---

### Module 2: Companion (AI-Powered CBT) - Existing

**Priority:** P0 (Critical - Preserve Existing)

#### Overview

This is the **core Noor-CBT feature** - already implemented and production-ready. We preserve it exactly as-is, with minor UI polish.

#### User Flows (Preserved)

1. **Thought Capture** → 2. **Distortion Analysis** → 3. **Belief Inspection** → 4. **Reframe** → 5. **Regulation** → 6. **Intention Setting** → 7. **Session Complete**

#### Enhancements (Phase 2)

- **Islamic Knowledge Injection:** When user expresses grief, inject relevant Quran verses from SQLite database
- **RAG Integration:** Use local Ollama + Quran/Hadith embeddings for context-aware responses (no internet required)
- **Voice Journaling:** Record thoughts via speech-to-text (optional)

#### Screens (Existing - No Changes Phase 1)

- ThoughtCaptureScreen.tsx
- DistortionScreen.tsx
- BeliefInspectionScreen.tsx
- ReframeScreen.tsx
- RegulationScreen.tsx
- IntentionScreen.tsx
- SessionCompleteScreen.tsx

---

### Module 3: Learn (Arabic Learning System)

**Priority:** P1 (High - Core Educational Feature)

#### Overview

Import Noor-AI's **Arabic Learning System** with FSRS spaced repetition, built from scratch in React Native.

#### Features

##### 3.1 Arabic Alphabet Learning

**Source:** `Noor-AI/lib/features/arabic_learning/`

**User Stories:**
- **US-3.1.1:** As a beginner, I want to browse all 28 Arabic letters with audio pronunciation
- **US-3.1.2:** As a learner, I want to see letter forms (isolated, initial, medial, final)
- **US-3.1.3:** As a user, I want to practice writing letters with visual feedback

**Screens:**
- **AlphabetGridScreen** - 28-letter grid with letter names
- **LetterDetailScreen** - Letter forms, pronunciation guide, example words
- **LetterPracticeScreen** (New) - Tracing practice with haptic feedback

**Data Source:** `arabic_alphabet.json` (13KB) → Import to PostgreSQL or local SQLite

**Acceptance Criteria:**
- [ ] All 28 letters display correctly with Arabic script
- [ ] Audio pronunciation plays on tap (preloaded, no network)
- [ ] Letter forms (isolated/initial/medial/final) render correctly
- [ ] Practice mode provides real-time feedback

##### 3.2 Vocabulary Learning (FSRS Spaced Repetition)

**Source:** `Noor-AI/lib/features/arabic_learning/data/services/fsrs_service.dart`

**User Stories:**
- **US-3.2.1:** As a learner, I want flashcards that adapt to my retention rate
- **US-3.2.2:** As a user, I want to rate my recall (Again, Hard, Good, Easy)
- **US-3.2.3:** As a learner, I want to see due cards for today's review

**Screens:**
- **FlashcardReviewScreen** - FSRS-powered flashcard review
- **VocabularyListScreen** - Browse all vocabulary words
- **VocabularyStatsScreen** (New) - Review history, retention rate

**Data Source:** `noor_ai_vocabulary.db` (56KB SQLite) → Import to WatermelonDB or PostgreSQL

**Algorithm:** FSRS v4.5 (Free Spaced Repetition Scheduler)
- TypeScript implementation: Use `ts-fsrs` package
- Card states: New, Learning, Review, Relearning
- Intervals calculated based on user performance

**Acceptance Criteria:**
- [ ] FSRS algorithm correctly schedules next review dates
- [ ] Rating buttons (Again/Hard/Good/Easy) trigger proper interval calculations
- [ ] Due card count displays accurately
- [ ] Review sessions save progress offline

##### 3.3 Conversation Scenarios

**Source:** `Noor-AI/lib/features/arabic_learning/presentation/screens/conversation_screen.dart`

**User Stories:**
- **US-3.3.1:** As a learner, I want to practice real-world Arabic conversations
- **US-3.3.2:** As a user, I want AI-powered pronunciation feedback

**Screens:**
- **ConversationScenarioListScreen** - Browse scenarios (greetings, shopping, mosque)
- **ConversationPracticeScreen** - Dialogue practice with speech recognition

**Data Source:** `conversation_scenarios.json` (18KB)

**Acceptance Criteria:**
- [ ] Scenarios load from JSON with Arabic text and transliteration
- [ ] Speech-to-text captures user's Arabic pronunciation
- [ ] AI provides feedback on pronunciation accuracy

---

### Module 4: Worship (Prayer Times & Qibla)

**Priority:** P1 (High - Daily Use Feature)

#### Overview

Import Noor-AI's **Prayer Times Module** with Adhan calculation and Qibla compass.

#### Features

##### 4.1 Prayer Times

**Source:** `Noor-AI/lib/features/prayer/`

**User Stories:**
- **US-4.1.1:** As a Muslim, I want to see accurate prayer times for my location
- **US-4.1.2:** As a user, I want notifications 10 minutes before each prayer
- **US-4.1.3:** As a traveler, I want prayer times to update automatically based on GPS

**Screens:**
- **PrayerTimesScreen** - 5 daily prayers with countdown to next
- **PrayerSettingsScreen** (New) - Calculation method, notification preferences

**Calculation Library:** `adhan-js` (React Native port of adhan-dart)
- Calculation methods: Muslim World League, ISNA, Umm al-Qura, etc.
- Adjust for high-latitude locations (twilight angle method)

**Data Flow:**
1. User grants location permission → GPS coordinates retrieved
2. Calculate prayer times using `adhan-js` + selected calculation method
3. Store times in local state (AsyncStorage)
4. Schedule notifications using `expo-notifications`

**Acceptance Criteria:**
- [ ] Prayer times accurate within ±2 minutes of local mosque times
- [ ] Notifications trigger 10 minutes before prayer (user configurable)
- [ ] Times update when user changes location (>50km difference)
- [ ] Works offline (uses last known location + stored times)

##### 4.2 Qibla Compass

**Source:** `Noor-AI/lib/features/prayer/presentation/screens/qibla_screen.dart`

**User Stories:**
- **US-4.2.1:** As a Muslim, I want to find the Qibla direction using my device compass
- **US-4.2.2:** As a user, I want visual feedback when aligned with Qibla

**Screens:**
- **QiblaCompassScreen** - Compass UI with Kaaba icon, degree indicator

**Libraries:**
- `expo-sensors` (magnetometer, accelerometer)
- `react-native-qibla-compass` or custom implementation

**Acceptance Criteria:**
- [ ] Compass points to Mecca with ±5° accuracy
- [ ] Calibration prompt appears if magnetometer is uncalibrated
- [ ] Haptic feedback when aligned within 5° of Qibla
- [ ] Works on both iOS and Android

---

### Module 5: Quran (Reading & Memorization)

**Priority:** P1 (High - Core Islamic Feature)

#### Overview

Import Noor-AI's **Quran Reader** with 6,236 verses from `noor_ai_seed.db` (3.4MB SQLite).

#### Features

##### 5.1 Quran Reading

**Source:** `Noor-AI/lib/features/quran/`

**User Stories:**
- **US-5.1.1:** As a reader, I want to browse all 114 Surahs with metadata
- **US-5.1.2:** As a user, I want to read verses with translations (English, Urdu, etc.)
- **US-5.1.3:** As a reader, I want to bookmark verses and create reading lists

**Screens:**
- **SurahListScreen** - 114 Surahs with revelation type (Makki/Madani), verse count
- **VerseReaderScreen** - Verse-by-verse reading with Arabic text, translation, transliteration
- **BookmarksScreen** (New) - Saved verses, reading history

**Data Source:** `noor_ai_seed.db` → Import to WatermelonDB (offline-first)
- **Schema:**
  - `surahs` table (114 rows)
  - `verses` table (6,236 rows)
  - `translations` table (multiple languages)

**Typography:**
- **Arabic:** Uthmanic Script (KFGQPC font or Amiri)
- **Transliteration:** Latin alphabet with diacritics
- **Translation:** Inter font (clean, readable)

**Acceptance Criteria:**
- [ ] All 114 Surahs load from offline database
- [ ] Verses display with correct Arabic typography
- [ ] Translations switch dynamically (English/Urdu/etc.)
- [ ] Bookmarks persist across app restarts
- [ ] Search finds verses by keyword (Arabic or translation)

##### 5.2 Thematic Search

**Source:** `Noor-AI/lib/features/quran/presentation/screens/thematic_search_screen.dart`

**User Stories:**
- **US-5.2.1:** As a seeker, I want to find verses about specific topics (patience, gratitude)
- **US-5.2.2:** As a user, I want AI-powered semantic search across Quran

**Screens:**
- **ThematicSearchScreen** - Search by theme/emotion (grief, hope, justice)
- **SearchResultsScreen** - Verses matching theme with relevance score

**Implementation:**
- **Phase 1:** Keyword-based search (SQLite FTS5 full-text search)
- **Phase 2:** Semantic search using local embeddings (Ollama + all-MiniLM model)

**Acceptance Criteria:**
- [ ] Keyword search returns relevant verses in <500ms
- [ ] Search works offline (local database)
- [ ] Results sorted by relevance

##### 5.3 Memorization Helper (Photo Recognition)

**Source:** `Noor-AI/lib/features/quran/presentation/screens/memorization_screen.dart`

**User Stories:**
- **US-5.3.1:** As a memorizer, I want to recite verses and check accuracy
- **US-5.3.2:** As a user, I want to photograph a Mushaf page and get verse highlighting

**Screens:**
- **MemorizationScreen** - Record recitation, get accuracy feedback
- **QuranPhotoScreen** (New) - Scan Mushaf page, detect verses

**Libraries:**
- **OCR:** `react-native-vision-camera` + `react-native-text-recognition`
- **Audio Matching:** Tajweed rules + fuzzy matching against verse text

**Acceptance Criteria:**
- [ ] Camera scans Mushaf page and detects Arabic text
- [ ] OCR extracts verse text with 85%+ accuracy
- [ ] Audio recording compares recitation to verse text
- [ ] Feedback highlights mistakes (missing words, incorrect pronunciation)

---

### Module 6: Adhkar & Dhikr

**Priority:** P2 (Medium - Daily Practice Feature)

#### Overview

Import Noor-AI's **Adhkar Collections** with morning/evening invocations, situational duas.

#### Features

**Source:** `Noor-AI/lib/features/adhkar/`

**User Stories:**
- **US-6.1:** As a Muslim, I want to read morning/evening adhkar with Arabic and translation
- **US-6.2:** As a user, I want a counter for repeated dhikr (e.g., SubhanAllah 33x)
- **US-6.3:** As a practitioner, I want notifications to remind me of morning/evening adhkar

**Screens:**
- **AdhkarCollectionListScreen** - Categories (morning, evening, sleep, travel)
- **AdhkarReaderScreen** - Individual adhkar with audio, counter, progress
- **DhikrCounterScreen** (New) - Haptic counter with vibration on each tap

**Data Source:** `adhkar.json` (44KB) → Import to PostgreSQL or local storage

**Acceptance Criteria:**
- [ ] All adhkar display with Arabic text, transliteration, translation
- [ ] Counter increments on tap with haptic feedback
- [ ] Completion checkmark appears when finished
- [ ] Notifications trigger at configured times (sunrise, sunset)

---

### Module 7: Progress & Achievements

**Priority:** P2 (Medium - Gamification)

#### Overview

Import Noor-AI's **Progress Tracking System** with streaks, achievements, daily goals.

#### Features

**Source:** `Noor-AI/lib/features/progress/`

**User Stories:**
- **US-7.1:** As a user, I want to see my current streak (consecutive days active)
- **US-7.2:** As a learner, I want to unlock achievements (e.g., "7-Day Streak", "100 Verses Read")
- **US-7.3:** As a user, I want to set daily goals (3 prayers logged, 1 reflection, 1 lesson)

**Screens:**
- **ProgressDashboardScreen** (New) - Streak, achievements, daily goals
- **AchievementsScreen** - Grid of unlocked/locked achievements
- **GoalSettingsScreen** (New) - Configure daily targets

**Data Schema (PostgreSQL):**
```sql
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_reflections INT DEFAULT 0,
  total_verses_read INT DEFAULT 0,
  total_lessons_completed INT DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_type VARCHAR(50), -- 'streak_7', 'verses_100', etc.
  unlocked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_goals (
  user_id UUID PRIMARY KEY,
  prayers_logged_target INT DEFAULT 5,
  reflections_target INT DEFAULT 1,
  lessons_target INT DEFAULT 1,
  verses_read_target INT DEFAULT 10
);
```

**Acceptance Criteria:**
- [ ] Streak increments when user completes 1+ activity per day
- [ ] Streak resets if user misses a day (grace period: 1 day)
- [ ] Achievements unlock automatically when criteria met
- [ ] Daily goals reset at midnight local time

---

### Module 8: Profile & Settings

**Priority:** P2 (Medium - User Preferences)

#### Overview

Unified **Profile Screen** combining Noor-CBT account settings with Noor-AI preferences.

#### Features

**User Stories:**
- **US-8.1:** As a user, I want to manage my account (email, password, delete account)
- **US-8.2:** As a user, I want to configure app preferences (theme, language, notifications)
- **US-8.3:** As a subscriber, I want to manage my premium subscription

**Screens:**
- **ProfileScreen** (Enhanced) - Account info, settings, subscription status
- **SettingsScreen** (New) - Theme (light/dark/auto), language, prayer calculation method
- **NotificationSettingsScreen** (New) - Prayer reminders, adhkar reminders, reflection prompts
- **AccountSettingsScreen** (New) - Change email/password, delete account

**Settings Stored in AsyncStorage:**
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar' | 'ur';
  prayerCalculationMethod: 'MWL' | 'ISNA' | 'UmmAlQura';
  notificationsEnabled: boolean;
  prayerReminders: boolean;
  adhkarReminders: boolean;
  reflectionPrompts: boolean;
}
```

**Acceptance Criteria:**
- [ ] Settings persist across app restarts
- [ ] Theme changes apply immediately without restart
- [ ] Account deletion triggers data cleanup (90-day retention for legal compliance)

---

### Module 9: Premium Features & Subscriptions

**Priority:** P3 (Low - Monetization)

#### Overview

Unified **Premium System** using RevenueCat for iOS/Android in-app purchases.

#### Features

**User Stories:**
- **US-9.1:** As a user, I want to see which features require premium (photo recognition, unlimited reflections)
- **US-9.2:** As a subscriber, I want to purchase monthly/yearly subscriptions via App Store/Play Store
- **US-9.3:** As a user, I want to restore purchases across devices

**Premium Features:**
- ✅ Unlimited CBT reflections (free tier: 5/month)
- ✅ Quran photo recognition & memorization helper
- ✅ Advanced thematic search (semantic AI search)
- ✅ Voice journaling & pronunciation feedback
- ✅ Offline AI (local Ollama model, no internet required)
- ✅ Ad-free experience
- ✅ Priority support

**Pricing Tiers:**
- **Free:** 5 reflections/month, basic features, ads
- **Premium Monthly:** $4.99/month, all features unlocked
- **Premium Yearly:** $39.99/year (33% discount)

**Screens:**
- **PaywallScreen** - Feature comparison, pricing, purchase CTA
- **PremiumFeaturesScreen** - Showcase premium-only features
- **SubscriptionManagementScreen** (New) - Active subscription, cancel/restore

**RevenueCat Integration:**
- Product IDs: `noor_premium_monthly`, `noor_premium_yearly`
- Offerings: `default` (monthly/yearly)
- Entitlements: `premium_access`

**Acceptance Criteria:**
- [ ] Paywall appears when user taps premium-locked feature
- [ ] Purchase flow completes via App Store/Play Store
- [ ] Subscription status syncs via RevenueCat webhooks
- [ ] Restore purchases works across devices (same Apple ID/Google account)

---

## Technical Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Noor Unified App (React Native)             │
├─────────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                             │
│  ┌──────────────┬──────────────┬──────────────┬───────────────┐│
│  │ Home Tab     │ Companion    │ Learn Tab    │ Worship Tab   ││
│  │ (Dashboard)  │ (CBT Flow)   │ (Arabic)     │ (Prayer/Qibla)││
│  └──────────────┴──────────────┴──────────────┴───────────────┘│
│  ┌──────────────┬──────────────┬──────────────────────────────┐│
│  │ Quran Reader │ Adhkar       │ Profile & Settings           ││
│  └──────────────┴──────────────┴──────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  STATE MANAGEMENT LAYER                                         │
│  ┌──────────────────┬────────────────────┬───────────────────┐ │
│  │ TanStack Query   │ Zustand (UI State) │ AsyncStorage      │ │
│  │ (Server State)   │                    │ (Persistence)     │ │
│  └──────────────────┴────────────────────┴───────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                     │
│  ┌───────────────────┬──────────────────┬───────────────────┐  │
│  │ WatermelonDB      │ API Client       │ RevenueCat SDK    │  │
│  │ (Offline SQLite)  │ (REST/HTTP)      │ (Subscriptions)   │  │
│  └───────────────────┴──────────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services                            │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                    │
│  ┌──────────────┬──────────────┬──────────────┬───────────────┐│
│  │ Auth API     │ CBT AI API   │ Billing API  │ Sync API      ││
│  │ (Sessions)   │ (Claude)     │ (RevenueCat) │ (Progress)    ││
│  └──────────────┴──────────────┴──────────────┴───────────────┘│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                      │  │
│  │ - Users, Sessions, Reflections, Progress, Achievements   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ External Services                                        │  │
│  │ - Anthropic Claude API (CBT conversations)               │  │
│  │ - RevenueCat (subscription management)                   │  │
│  │ - Sentry (error tracking)                                │  │
│  │ - Expo Notifications (push notifications)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Optional: Local AI (Phase 2)                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Ollama (on-device LLM)                                   │  │
│  │ - Quran/Hadith RAG (embeddings)                          │  │
│  │ - Offline conversation (no internet)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Navigation Architecture

**Pattern:** React Navigation 7.x with **5-Tab Bottom Navigation** + Modal Stacks

```
RootNavigator (Stack)
├── Onboarding Flow (if first launch)
│   ├── WelcomeScreen
│   ├── PermissionsScreen (Location, Notifications)
│   └── SetupScreen (Language, Prayer Method)
│
└── Main (TabNavigator)
    ├── Tab 1: Home 🏠
    │   └── HomeScreen (Dashboard)
    │
    ├── Tab 2: Companion 💬
    │   ├── CompanionScreen (Entry point)
    │   └── CBT Modal Stack (Thought Capture → Session Complete)
    │
    ├── Tab 3: Learn 📚
    │   ├── LearnScreen (Arabic + Quran hub)
    │   ├── Stack: Arabic Learning
    │   │   ├── AlphabetGridScreen
    │   │   ├── LetterDetailScreen
    │   │   ├── FlashcardReviewScreen
    │   │   └── ConversationPracticeScreen
    │   └── Stack: Quran Reader
    │       ├── SurahListScreen
    │       ├── VerseReaderScreen
    │       └── ThematicSearchScreen
    │
    ├── Tab 4: Worship 🕌
    │   ├── WorshipScreen (Hub)
    │   ├── PrayerTimesScreen
    │   ├── QiblaCompassScreen
    │   └── AdhkarCollectionListScreen
    │
    └── Tab 5: Profile 👤
        ├── ProfileScreen
        ├── SettingsScreen
        ├── ProgressDashboardScreen
        └── SubscriptionManagementScreen
```

**Design Principles:**
- **Flat Hierarchy:** Max 3 levels deep (Tab → Hub → Detail)
- **Persistent Tabs:** Bottom tabs always visible except in modal flows
- **Gesture Navigation:** Swipe back on iOS, hardware back on Android
- **Deep Linking:** Support `noor://learn/quran/surah/1` style URLs

---

### State Management Strategy

**Hybrid Approach:**

1. **Server State:** TanStack Query (React Query)
   - API responses (reflections, progress, user data)
   - Automatic caching, refetching, background sync
   - Optimistic updates for mutations

2. **UI State:** Zustand (lightweight)
   - Current tab, modal visibility
   - Form input state
   - Ephemeral UI flags

3. **Offline Data:** WatermelonDB
   - Quran verses, Hadith, Arabic content (3.4MB)
   - Prayer times cache
   - Adhkar collections
   - Sync with PostgreSQL when online

4. **Persistent Settings:** AsyncStorage
   - User preferences (theme, language)
   - Onboarding completion flag
   - Last known location (for prayer times)

**Data Flow Example (Quran Reader):**

```typescript
// 1. User opens SurahListScreen
// 2. Query WatermelonDB (offline-first)
const { data: surahs } = useQuery({
  queryKey: ['surahs'],
  queryFn: async () => {
    const db = await getWatermelonDB();
    return db.collections.get('surahs').query().fetch();
  },
  staleTime: Infinity, // Never refetch (static data)
});

// 3. User taps Surah → Navigate to VerseReaderScreen
navigation.navigate('VerseReader', { surahId: 1 });

// 4. Query verses from WatermelonDB
const { data: verses } = useQuery({
  queryKey: ['verses', surahId],
  queryFn: async () => {
    const db = await getWatermelonDB();
    return db.collections.get('verses')
      .query(Q.where('surah_id', surahId))
      .fetch();
  },
});

// 5. User bookmarks a verse → Sync to PostgreSQL
const bookmarkMutation = useMutation({
  mutationFn: async (verseId) => {
    // Optimistic update (local)
    await localDB.bookmarks.create({ verse_id: verseId });

    // Background sync to server
    return apiClient.post('/api/bookmarks', { verseId });
  },
});
```

---

### Offline-First Architecture

**Philosophy:** App must work **100% offline** for core features (Quran, Prayer, Arabic, Adhkar).

#### Offline Capabilities

| Feature | Offline Status | Sync Requirement |
|---------|---------------|------------------|
| Quran Reading | ✅ Full | None (embedded SQLite) |
| Prayer Times | ✅ Full | None (calculated locally) |
| Arabic Learning | ✅ Full | Progress sync when online |
| Adhkar/Dhikr | ✅ Full | Counter sync when online |
| CBT Reflections | ⚠️ Partial | Requires Claude API (online) |
| Thematic Search | ✅ Basic (keyword) | Semantic search requires online |
| Progress/Streaks | ✅ Full | Sync when online |

#### Offline Implementation Strategy

**1. Embedded SQLite Database (WatermelonDB)**

```typescript
// schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'surahs',
      columns: [
        { name: 'number', type: 'number' },
        { name: 'name_arabic', type: 'string' },
        { name: 'name_english', type: 'string' },
        { name: 'revelation_type', type: 'string' }, // Makki/Madani
        { name: 'verse_count', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'verses',
      columns: [
        { name: 'surah_id', type: 'number', isIndexed: true },
        { name: 'verse_number', type: 'number' },
        { name: 'text_arabic', type: 'string' },
        { name: 'text_english', type: 'string' },
        { name: 'text_transliteration', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'bookmarks',
      columns: [
        { name: 'verse_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'synced', type: 'boolean' }, // false = needs sync
      ],
    }),
  ],
});
```

**2. Background Sync Strategy**

```typescript
// syncService.ts
export class SyncService {
  async syncBookmarks() {
    const unsyncedBookmarks = await localDB.bookmarks
      .query(Q.where('synced', false))
      .fetch();

    if (unsyncedBookmarks.length === 0) return;

    try {
      await apiClient.post('/api/sync/bookmarks', {
        bookmarks: unsyncedBookmarks.map(b => ({
          verse_id: b.verse_id,
          created_at: b.created_at,
        })),
      });

      // Mark as synced
      await localDB.write(async () => {
        for (const bookmark of unsyncedBookmarks) {
          await bookmark.update(b => b.synced = true);
        }
      });
    } catch (error) {
      // Retry later
      console.error('Sync failed, will retry', error);
    }
  }

  // Run on app foreground + every 15 minutes
  startPeriodicSync() {
    setInterval(() => this.syncBookmarks(), 15 * 60 * 1000);
  }
}
```

**3. Prayer Times Offline Calculation**

```typescript
// prayerService.ts
import { PrayerTimes, CalculationMethod, Coordinates } from 'adhan';

export class PrayerService {
  async getPrayerTimes(date: Date): Promise<PrayerTimesData> {
    // Get last known location from AsyncStorage
    const location = await AsyncStorage.getItem('last_location');
    if (!location) throw new Error('Location not available');

    const { latitude, longitude } = JSON.parse(location);
    const coords = new Coordinates(latitude, longitude);

    // Get calculation method from settings
    const method = await AsyncStorage.getItem('prayer_method') || 'MWL';
    const params = CalculationMethod[method]();

    // Calculate prayer times (100% offline)
    const prayerTimes = new PrayerTimes(coords, date, params);

    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
    };
  }
}
```

---

### AI Integration Pattern

**Dual AI Strategy:**

1. **Cloud AI (Anthropic Claude)** - For CBT conversations, complex reasoning
2. **Local AI (Ollama)** - For Quran/Hadith RAG, offline privacy

#### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  User Input (Thought, Question, Search Query)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Routing Logic       │
              │  (Based on Feature)  │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  Cloud AI Path  │            │  Local AI Path  │
│  (CBT Therapy)  │            │  (Quran Search) │
└────────┬────────┘            └────────┬────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│ Anthropic API   │            │ Ollama Engine   │
│ - Claude 3.5    │            │ - Llama 3.2 3B  │
│ - GPT-4 fallback│            │ - MiniLM embed  │
└────────┬────────┘            └────────┬────────┘
         │                               │
         │                               ▼
         │                      ┌─────────────────┐
         │                      │ Vector Search   │
         │                      │ (FAISS/Hnswlib) │
         │                      └────────┬────────┘
         │                               │
         │                               ▼
         │                      ┌─────────────────┐
         │                      │ WatermelonDB    │
         │                      │ (Quran/Hadith)  │
         │                      └─────────────────┘
         │
         └───────────────┬───────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Response to User    │
              └──────────────────────┘
```

#### Implementation Examples

**Cloud AI (CBT Conversation):**

```typescript
// aiService.ts
export class AIService {
  async analyzeThought(thought: string): Promise<AnalysisResult> {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought }),
      credentials: 'include', // Include session cookie
    });

    return response.json();
  }

  async reframeThought(context: ReframeContext): Promise<ReframeResult> {
    const response = await fetch(`${API_URL}/api/reframe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
      credentials: 'include',
    });

    return response.json();
  }
}
```

**Local AI (Quran RAG):**

```typescript
// localAIService.ts
import Ollama from 'ollama-react-native';

export class LocalAIService {
  private ollama: Ollama;

  async initialize() {
    this.ollama = new Ollama({
      model: 'llama3.2:3b', // 2GB model, runs on-device
    });
  }

  async searchQuranThematic(query: string): Promise<Verse[]> {
    // 1. Generate embedding for query
    const queryEmbedding = await this.ollama.embed({ input: query });

    // 2. Vector search against pre-computed verse embeddings
    const db = await getWatermelonDB();
    const nearestVerses = await db.collections.get('verse_embeddings')
      .query(Q.sortBy('distance', queryEmbedding))
      .fetch({ limit: 10 });

    // 3. Retrieve full verse data
    const verseIds = nearestVerses.map(v => v.verse_id);
    const verses = await db.collections.get('verses')
      .query(Q.where('id', Q.oneOf(verseIds)))
      .fetch();

    return verses;
  }

  async summarizeVerses(verses: Verse[]): Promise<string> {
    const context = verses.map(v => v.text_english).join('\n\n');

    const response = await this.ollama.generate({
      prompt: `Summarize the key themes in these Quranic verses:\n\n${context}`,
      stream: false,
    });

    return response.text;
  }
}
```

---

### Security Architecture

**Threat Model:** Handling sensitive CBT reflections + Islamic practice data

#### Security Layers

1. **Transport Security**
   - ✅ TLS 1.3 for all API calls
   - ✅ Certificate pinning (prevent MITM)
   - ✅ No plaintext HTTP allowed

2. **Authentication**
   - ✅ Session-based auth (signed cookies)
   - ✅ HTTP-only, Secure, SameSite=Strict
   - ✅ Session expiry: 30 days inactivity
   - ✅ Biometric unlock (Face ID/Touch ID) for app access

3. **Data Encryption**
   - ✅ Database encryption: SQLCipher for WatermelonDB
   - ✅ Sensitive fields encrypted at rest (AES-256-GCM)
   - ✅ Keychain/Keystore for encryption keys

4. **Privacy**
   - ✅ Screenshot prevention (iOS: `secureTextEntry`, Android: `FLAG_SECURE`)
   - ✅ No analytics tracking of reflection content
   - ✅ HIPAA-compliant 90-day data retention
   - ✅ Opt-in crash reporting (Sentry with PII scrubbing)

5. **Authorization**
   - ✅ Row-level security: Users can only access their own data
   - ✅ Premium feature gates (RevenueCat entitlements)

#### Implementation

**Biometric Authentication:**

```typescript
// biometricAuth.ts
import * as LocalAuthentication from 'expo-local-authentication';

export class BiometricAuth {
  async isAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Noor',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric auth failed', error);
      return false;
    }
  }
}

// App.tsx - Lock screen on background
useEffect(() => {
  const subscription = AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      const authenticated = await biometricAuth.authenticate();
      if (!authenticated) {
        navigation.navigate('LockScreen');
      }
    }
  });

  return () => subscription.remove();
}, []);
```

**Database Encryption:**

```typescript
// watermelonDB.ts
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'noor_app',
  // Enable SQLCipher encryption
  jsi: true,
  encryptionKey: await getEncryptionKey(), // From Keychain
});

const database = new Database({
  adapter,
  modelClasses: [Surah, Verse, Bookmark],
});
```

**Screenshot Prevention:**

```typescript
// Screen.tsx
import { preventScreenCapture } from 'expo-screen-capture';

export function ReflectionScreen() {
  useEffect(() => {
    // Prevent screenshots on sensitive screens
    preventScreenCapture();

    return () => {
      // Re-enable on unmount
      allowScreenCapture();
    };
  }, []);

  return <View>...</View>;
}
```

---

## API Contracts

### Base URL

**Production:** `https://api.noorapp.com`
**Staging:** `https://staging-api.noorapp.com`
**Local Dev:** `http://localhost:5000`

### Authentication

All endpoints (except `/health`) require session authentication via signed cookies.

**Cookie Name:** `noor_session`
**Cookie Attributes:** `HttpOnly`, `Secure`, `SameSite=Strict`

---

### Endpoints

#### 1. Authentication

##### `POST /api/auth/signup`

Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Ahmed Khan"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "name": "Ahmed Khan",
    "created_at": "2025-02-11T10:00:00Z"
  },
  "session_token": "signed-session-token"
}
```

**Errors:**
- `400`: Email already exists
- `422`: Validation error (weak password, invalid email)

---

##### `POST /api/auth/login`

Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "name": "Ahmed Khan",
    "premium_status": "active",
    "subscription_expires_at": "2026-02-11T10:00:00Z"
  },
  "session_token": "signed-session-token"
}
```

**Errors:**
- `401`: Invalid credentials
- `429`: Rate limit exceeded (max 5 attempts per 15 minutes)

---

##### `POST /api/auth/logout`

Invalidate session.

**Response (204 No Content)**

---

#### 2. CBT Companion

##### `POST /api/companion/analyze`

Analyze user thought for cognitive distortions.

**Request:**
```json
{
  "thought": "I always mess everything up. I'm worthless.",
  "emotional_intensity": 4,
  "somatic_awareness": "Tightness in chest, racing heart"
}
```

**Response (200 OK):**
```json
{
  "analysis": {
    "distortions": [
      {
        "type": "overgeneralization",
        "evidence": "Use of 'always' and absolute language",
        "severity": "high"
      },
      {
        "type": "labeling",
        "evidence": "Self-labeling as 'worthless'",
        "severity": "high"
      }
    ],
    "emotional_state": "shame",
    "tone": "harsh",
    "crisis_detected": false,
    "suggested_verses": [
      {
        "surah": 94,
        "verse": 5,
        "text_arabic": "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
        "text_english": "For indeed, with hardship comes ease"
      }
    ]
  }
}
```

**Errors:**
- `400`: Thought too short (<10 characters)
- `402`: Premium required (free tier limit exceeded)
- `429`: Rate limit (max 10 requests/hour for free users)

---

##### `POST /api/companion/reframe`

Generate therapeutic reframe with Islamic anchors.

**Request:**
```json
{
  "thought": "I always mess everything up. I'm worthless.",
  "distortions": ["overgeneralization", "labeling"],
  "emotional_intensity": 4,
  "emotional_state": "shame"
}
```

**Response (200 OK):**
```json
{
  "reframe": {
    "alternative_thought": "I made a mistake in this situation, but that doesn't define my worth. Allah created me with inherent value, and I can learn from this experience.",
    "evidence_for": [
      "You recognized your mistake and are seeking to improve",
      "Past successes demonstrate your capability"
    ],
    "evidence_against": [
      "One mistake doesn't negate your entire life",
      "Humans are fallible by nature (الإنسان خطّاء)"
    ],
    "islamic_anchor": {
      "concept": "tawbah",
      "verse": {
        "surah": 39,
        "verse": 53,
        "text_english": "Say: O My servants who have transgressed against themselves, despair not of the mercy of Allah"
      }
    },
    "next_steps": [
      "Practice self-compassion (رفق بالنفس)",
      "Identify the lesson from this experience",
      "Set a small, achievable goal for tomorrow"
    ]
  }
}
```

---

##### `POST /api/companion/reflection`

Save completed reflection session.

**Request:**
```json
{
  "thought": "I always mess everything up.",
  "distortions": ["overgeneralization", "labeling"],
  "reframe": "I made a mistake in this situation...",
  "regulation_practice": "5-minute breathing exercise",
  "intention": "Practice self-compassion when I make mistakes",
  "emotional_intensity_before": 4,
  "emotional_intensity_after": 2
}
```

**Response (201 Created):**
```json
{
  "reflection": {
    "id": "uuid-456",
    "created_at": "2025-02-11T10:30:00Z",
    "thought": "[ENCRYPTED]",
    "reframe": "[ENCRYPTED]",
    "emotional_improvement": 2
  }
}
```

---

#### 3. Progress & Sync

##### `GET /api/progress`

Get user's progress summary.

**Response (200 OK):**
```json
{
  "progress": {
    "current_streak": 7,
    "longest_streak": 12,
    "total_reflections": 45,
    "total_verses_read": 320,
    "total_lessons_completed": 18,
    "last_active_date": "2025-02-11",
    "achievements_unlocked": [
      {
        "id": "streak_7",
        "name": "7-Day Streak",
        "icon": "🔥",
        "unlocked_at": "2025-02-11T08:00:00Z"
      }
    ]
  }
}
```

---

##### `POST /api/sync/bookmarks`

Sync bookmarks from offline database.

**Request:**
```json
{
  "bookmarks": [
    {
      "verse_id": "2:255",
      "created_at": 1675209600000
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "synced_count": 1
}
```

---

#### 4. Premium & Subscriptions

##### `GET /api/premium/status`

Check user's premium subscription status.

**Response (200 OK):**
```json
{
  "status": "active",
  "plan": "premium_yearly",
  "expires_at": "2026-02-11T10:00:00Z",
  "features_unlocked": [
    "unlimited_reflections",
    "photo_recognition",
    "semantic_search",
    "offline_ai"
  ]
}
```

---

##### `POST /api/premium/webhook`

RevenueCat webhook for subscription events.

**Request (from RevenueCat):**
```json
{
  "event_type": "INITIAL_PURCHASE",
  "app_user_id": "uuid-123",
  "product_id": "noor_premium_yearly",
  "entitlement_id": "premium_access",
  "purchased_at_ms": 1675209600000
}
```

**Response (200 OK):**
```json
{
  "received": true
}
```

---

#### 5. Health Check

##### `GET /api/health`

Check API health status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-02-11T10:00:00Z"
}
```

---

## Database Schema Design

### PostgreSQL Schema (Server-Side)

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hashed
  name VARCHAR(255),
  premium_status VARCHAR(20) DEFAULT 'free', -- 'free', 'active', 'expired'
  subscription_plan VARCHAR(50), -- 'premium_monthly', 'premium_yearly'
  subscription_expires_at TIMESTAMP,
  revenucat_user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete for GDPR compliance
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_premium_status ON users(premium_status);
```

#### Sessions Table

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

#### Reflections Table

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thought_encrypted TEXT NOT NULL, -- AES-256-GCM encrypted
  distortions JSONB, -- Array of distortion types
  reframe_encrypted TEXT,
  regulation_practice TEXT,
  intention_encrypted TEXT,
  emotional_intensity_before INT CHECK (emotional_intensity_before BETWEEN 1 AND 5),
  emotional_intensity_after INT CHECK (emotional_intensity_after BETWEEN 1 AND 5),
  emotional_state VARCHAR(50), -- 'anxiety', 'grief', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Auto-delete after 90 days
);

CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_created_at ON reflections(created_at);

-- Automatic cleanup job (runs daily)
CREATE OR REPLACE FUNCTION cleanup_old_reflections()
RETURNS void AS $$
BEGIN
  UPDATE reflections
  SET deleted_at = NOW()
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
```

#### User Progress Table

```sql
CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_reflections INT DEFAULT 0,
  total_verses_read INT DEFAULT 0,
  total_lessons_completed INT DEFAULT 0,
  total_adhkar_completed INT DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to update last_active_date on any activity
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_progress
  SET last_active_date = CURRENT_DATE
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_on_reflection
  AFTER INSERT ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();
```

#### Achievements Table

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'streak_7', 'verses_100', etc.
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
```

#### Bookmarks Table

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_id VARCHAR(20) NOT NULL, -- Format: "2:255" (Surah:Verse)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
```

---

### WatermelonDB Schema (Client-Side Offline)

**Location:** `client/database/schema.ts`

```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // Quran Tables
    tableSchema({
      name: 'surahs',
      columns: [
        { name: 'number', type: 'number', isIndexed: true },
        { name: 'name_arabic', type: 'string' },
        { name: 'name_english', type: 'string' },
        { name: 'name_transliteration', type: 'string' },
        { name: 'revelation_type', type: 'string' }, // 'Makki' | 'Madani'
        { name: 'verse_count', type: 'number' },
      ],
    }),

    tableSchema({
      name: 'verses',
      columns: [
        { name: 'surah_id', type: 'number', isIndexed: true },
        { name: 'verse_number', type: 'number', isIndexed: true },
        { name: 'text_arabic', type: 'string' },
        { name: 'text_english', type: 'string' },
        { name: 'text_urdu', type: 'string', isOptional: true },
        { name: 'text_transliteration', type: 'string' },
        { name: 'juz', type: 'number' },
        { name: 'page', type: 'number' },
      ],
    }),

    // Arabic Learning Tables
    tableSchema({
      name: 'arabic_letters',
      columns: [
        { name: 'letter_arabic', type: 'string' },
        { name: 'letter_name', type: 'string' },
        { name: 'transliteration', type: 'string' },
        { name: 'isolated_form', type: 'string' },
        { name: 'initial_form', type: 'string' },
        { name: 'medial_form', type: 'string' },
        { name: 'final_form', type: 'string' },
        { name: 'audio_url', type: 'string', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'vocabulary_words',
      columns: [
        { name: 'word_arabic', type: 'string' },
        { name: 'word_english', type: 'string' },
        { name: 'transliteration', type: 'string' },
        { name: 'category', type: 'string' }, // 'greetings', 'numbers', etc.
        { name: 'difficulty', type: 'string' }, // 'beginner', 'intermediate', 'advanced'
      ],
    }),

    tableSchema({
      name: 'flashcards',
      columns: [
        { name: 'word_id', type: 'string', isIndexed: true },
        { name: 'state', type: 'string' }, // 'new', 'learning', 'review', 'relearning'
        { name: 'due_date', type: 'number', isIndexed: true }, // Unix timestamp
        { name: 'stability', type: 'number' }, // FSRS stability
        { name: 'difficulty', type: 'number' }, // FSRS difficulty
        { name: 'elapsed_days', type: 'number' },
        { name: 'scheduled_days', type: 'number' },
        { name: 'reps', type: 'number' }, // Review count
        { name: 'lapses', type: 'number' }, // Forget count
        { name: 'last_review', type: 'number', isOptional: true },
        { name: 'synced', type: 'boolean' }, // false = needs sync to server
      ],
    }),

    // Adhkar Table
    tableSchema({
      name: 'adhkar',
      columns: [
        { name: 'title_arabic', type: 'string' },
        { name: 'title_english', type: 'string' },
        { name: 'text_arabic', type: 'string' },
        { name: 'text_transliteration', type: 'string' },
        { name: 'text_translation', type: 'string' },
        { name: 'category', type: 'string' }, // 'morning', 'evening', 'sleep', etc.
        { name: 'repetition_count', type: 'number', isOptional: true },
        { name: 'reference', type: 'string', isOptional: true },
      ],
    }),

    // Bookmarks Table (synced from server)
    tableSchema({
      name: 'bookmarks',
      columns: [
        { name: 'verse_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'synced', type: 'boolean' },
      ],
    }),
  ],
});
```

---

### Data Migration Strategy

**Goal:** Import 3.4MB of Noor-AI data into WatermelonDB without bloating app bundle.

#### Approach

1. **Initial Seed:** Bundle `noor_ai_seed.db` in app assets (3.4MB)
2. **First Launch:** Copy SQLite file to app documents directory
3. **Lazy Loading:** Load Surahs on demand (114 rows initially, verses on surah selection)
4. **Incremental Updates:** Download delta updates from server (new translations, corrections)

#### Migration Script

```typescript
// migrations/importNoorAIData.ts
import { Database } from '@nozbe/watermelondb';
import SQLite from 'react-native-sqlite-storage';

export async function importNoorAIData(db: Database) {
  // Open bundled SQLite file
  const sourceDB = await SQLite.openDatabase({
    name: 'noor_ai_seed.db',
    location: 'default',
  });

  // Import Surahs
  const [surahs] = await sourceDB.executeSql('SELECT * FROM surahs');
  await db.write(async () => {
    for (const row of surahs.rows.raw()) {
      await db.collections.get('surahs').create((surah) => {
        surah.number = row.number;
        surah.name_arabic = row.name_arabic;
        surah.name_english = row.name_english;
        surah.revelation_type = row.revelation_type;
        surah.verse_count = row.verse_count;
      });
    }
  });

  // Import Verses (batched for performance)
  const [verses] = await sourceDB.executeSql('SELECT * FROM verses');
  const batch = [];
  for (const row of verses.rows.raw()) {
    batch.push(
      db.collections.get('verses').prepareCreate((verse) => {
        verse.surah_id = row.surah_id;
        verse.verse_number = row.verse_number;
        verse.text_arabic = row.text_arabic;
        verse.text_english = row.text_english;
      })
    );

    // Commit in batches of 500
    if (batch.length >= 500) {
      await db.write(async () => db.batch(...batch));
      batch.length = 0;
    }
  }

  // Commit remaining
  if (batch.length > 0) {
    await db.write(async () => db.batch(...batch));
  }

  // Mark migration as complete
  await AsyncStorage.setItem('noor_ai_data_migrated', 'true');
}
```

---

## Security Requirements

### OWASP Mobile Top 10 Compliance

| Risk | Mitigation | Implementation |
|------|-----------|----------------|
| **M1: Improper Platform Usage** | Use platform security features correctly | Keychain/Keystore for secrets, biometric auth |
| **M2: Insecure Data Storage** | Encrypt sensitive data at rest | SQLCipher for WatermelonDB, encrypted reflections |
| **M3: Insecure Communication** | TLS 1.3, certificate pinning | All API calls use HTTPS, pin certificates |
| **M4: Insecure Authentication** | Strong session management | Signed cookies, 30-day expiry, biometric unlock |
| **M5: Insufficient Cryptography** | Use industry-standard algorithms | AES-256-GCM, bcrypt for passwords |
| **M6: Insecure Authorization** | Row-level security | PostgreSQL policies, user can only access own data |
| **M7: Client Code Quality** | Linting, type safety, code review | ESLint, TypeScript strict mode, PR reviews |
| **M8: Code Tampering** | App signing, jailbreak detection | Code signing certificates, detect rooted devices |
| **M9: Reverse Engineering** | Obfuscation, integrity checks | ProGuard (Android), code obfuscation (iOS) |
| **M10: Extraneous Functionality** | Remove debug code, disable logs | Strip console.log in production builds |

---

### Encryption Standards

**Reflection Data Encryption:**

```typescript
// encryptionService.ts
import { encrypt, decrypt } from 'react-native-aes-gcm-crypto';
import * as Keychain from 'react-native-keychain';

export class EncryptionService {
  private encryptionKey: string | null = null;

  async initialize() {
    // Retrieve encryption key from Keychain (iOS) or Keystore (Android)
    const credentials = await Keychain.getGenericPassword({
      service: 'noor_encryption_key',
    });

    if (!credentials) {
      // Generate new key on first launch
      const newKey = await this.generateEncryptionKey();
      await Keychain.setGenericPassword('encryption_key', newKey, {
        service: 'noor_encryption_key',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      this.encryptionKey = newKey;
    } else {
      this.encryptionKey = credentials.password;
    }
  }

  async encryptReflection(plaintext: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');

    const { ciphertext, iv, tag } = await encrypt(
      plaintext,
      this.encryptionKey
    );

    // Return Base64-encoded ciphertext with IV and auth tag
    return JSON.stringify({ ciphertext, iv, tag });
  }

  async decryptReflection(encrypted: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');

    const { ciphertext, iv, tag } = JSON.parse(encrypted);

    const plaintext = await decrypt(
      ciphertext,
      this.encryptionKey,
      iv,
      tag
    );

    return plaintext;
  }

  private async generateEncryptionKey(): Promise<string> {
    // Generate 256-bit key
    const key = await crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(key).toString('base64');
  }
}
```

---

### Privacy Policy Compliance

**Required Disclosures:**

1. **Data Collection:**
   - Email, name (for account creation)
   - Reflection content (encrypted, stored for 90 days)
   - Location (for prayer times, not stored on server)
   - Usage analytics (opt-in, anonymized)

2. **Data Sharing:**
   - RevenueCat: Subscription status only (no reflection content)
   - Anthropic Claude API: Reflection text for analysis (not stored by Anthropic per their policy)
   - Sentry: Crash reports (PII scrubbed)

3. **User Rights:**
   - Export data (JSON download)
   - Delete account (immediate data purge)
   - Opt-out of analytics

**Implementation:**

```typescript
// privacyService.ts
export class PrivacyService {
  async exportUserData(userId: string): Promise<ExportData> {
    // Fetch all user data from PostgreSQL
    const reflections = await db.select().from(reflectionsTable)
      .where(eq(reflectionsTable.userId, userId));

    const progress = await db.select().from(userProgressTable)
      .where(eq(userProgressTable.userId, userId));

    const bookmarks = await db.select().from(bookmarksTable)
      .where(eq(bookmarksTable.userId, userId));

    // Decrypt reflections
    const decryptedReflections = await Promise.all(
      reflections.map(async (r) => ({
        ...r,
        thought: await encryptionService.decryptReflection(r.thought_encrypted),
        reframe: await encryptionService.decryptReflection(r.reframe_encrypted),
      }))
    );

    return {
      reflections: decryptedReflections,
      progress,
      bookmarks,
      exported_at: new Date().toISOString(),
    };
  }

  async deleteUserAccount(userId: string): Promise<void> {
    // Hard delete all user data
    await db.delete(reflectionsTable).where(eq(reflectionsTable.userId, userId));
    await db.delete(userProgressTable).where(eq(userProgressTable.userId, userId));
    await db.delete(bookmarksTable).where(eq(bookmarksTable.userId, userId));
    await db.delete(achievementsTable).where(eq(achievementsTable.userId, userId));
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    // Trigger account deletion in RevenueCat
    await revenueCatAPI.deleteUser(userId);
  }
}
```

---

## UI/UX Specifications

### Design System

**Foundation:** Material Design 3 (Material You) + Islamic aesthetic

#### Color Palette

**Primary (Islamic Green):**
- `primary-50`: #E8F5E9
- `primary-100`: #C8E6C9
- `primary-500`: #4CAF50 (Main)
- `primary-700`: #388E3C
- `primary-900`: #1B5E20

**Secondary (Gold):**
- `secondary-100`: #FFE082
- `secondary-500`: #FFC107
- `secondary-700`: #FFA000

**Neutral:**
- `neutral-50`: #FAFAFA (Light background)
- `neutral-100`: #F5F5F5
- `neutral-900`: #212121 (Dark text)

**Dark Mode:**
- `dark-bg`: #121212
- `dark-surface`: #1E1E1E
- `dark-surface-variant`: #2C2C2C

#### Typography

**Arabic Text:**
- **Font:** Amiri (Quranic), Noto Naskh Arabic (UI)
- **Sizes:** 24px (Quran verses), 18px (Adhkar), 16px (UI)

**English Text:**
- **Font:** Inter (UI), Cormorant Garamond (Serene headers)
- **Sizes:** 32px (H1), 24px (H2), 18px (H3), 16px (Body), 14px (Caption)

**Weights:**
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

#### Spacing Scale

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

#### Border Radius

```typescript
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999, // Fully rounded
};
```

---

### Navigation Patterns

**Bottom Tab Bar:**

```
┌────────────────────────────────────────────────┐
│                  Screen Content                │
│                                                │
│                                                │
│                                                │
│                                                │
├────────┬────────┬────────┬────────┬───────────┤
│  🏠    │  💬    │  📚    │  🕌    │  👤      │
│  Home  │Companion│ Learn  │ Worship│ Profile  │
└────────┴────────┴────────┴────────┴───────────┘
```

**Active State:** Icon + label in primary color, bold label
**Inactive State:** Gray icon + label, regular weight
**Haptic Feedback:** Light tap on tab press

---

### Component Library

#### Button Component

**Variants:**
- `primary`: Filled, primary color
- `secondary`: Outlined, secondary color
- `text`: Text-only, no background

**Sizes:**
- `small`: 32px height, 12px padding
- `medium`: 44px height, 16px padding (default)
- `large`: 56px height, 24px padding

**States:**
- Default, Hover (web), Pressed, Disabled, Loading

**Implementation:**

```typescript
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'medium', ... }: ButtonProps) {
  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={[styles.button, styles[variant], styles[size]]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? <ActivityIndicator /> : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.label}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}
```

---

#### Card Component

**Purpose:** Container for grouped content (Prayer times, Reflections, Surah cards)

**Variants:**
- `flat`: No shadow, border only
- `elevated`: Shadow, rounded corners
- `glass`: Frosted glass effect (iOS)

**Implementation:**

```typescript
// Card.tsx
interface CardProps {
  variant?: 'flat' | 'elevated' | 'glass';
  children: React.ReactNode;
  onPress?: () => void;
}

export function Card({ variant = 'elevated', ... }: CardProps) {
  return (
    <Pressable
      style={[
        styles.card,
        variant === 'elevated' && styles.shadow,
        variant === 'glass' && styles.glass,
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}
```

---

### Accessibility Requirements

**WCAG 2.1 AA Compliance:**

1. **Color Contrast:**
   - Text: 4.5:1 minimum (7:1 for AAA)
   - UI elements: 3:1 minimum

2. **Touch Targets:**
   - Minimum 44x44 points (Apple HIG)
   - Minimum 48x48 dp (Android Material Design)

3. **Screen Reader Support:**
   - All interactive elements have `accessibilityLabel`
   - Buttons have `accessibilityRole="button"`
   - Images have `accessibilityLabel` or `accessibilityRole="image"`

4. **Keyboard Navigation (Web):**
   - All interactive elements focusable via Tab
   - Focus indicators visible

5. **Dynamic Type (iOS):**
   - Text scales with system font size settings
   - Layout adapts to large text sizes

**Implementation:**

```typescript
// AccessibleButton.tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Start reflection"
  accessibilityHint="Opens the thought capture screen"
  accessibilityState={{ disabled: isDisabled }}
  onPress={handlePress}
>
  <Text>Start Reflection</Text>
</Pressable>
```

---

### Animation Guidelines

**Principles:**
- **Fast:** 200-300ms for micro-interactions
- **Smooth:** 60 FPS minimum, use native driver
- **Purposeful:** Animations guide attention, don't distract

**Examples:**

1. **Tab Switch:** Fade in/out (200ms)
2. **Card Press:** Scale down 0.95x (100ms)
3. **Modal Appear:** Slide up from bottom (300ms)
4. **Loading State:** Shimmer effect (1000ms loop)

**Implementation:**

```typescript
// useTabPressAnimation.ts
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export function useTabPressAnimation() {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}
```

---

## Testing Strategy

### Testing Pyramid

```
        ┌─────────────┐
        │     E2E     │ (10% - Critical user flows)
        │   Detox     │
        └─────────────┘
      ┌─────────────────┐
      │   Integration   │ (20% - Feature modules)
      │   React Native  │
      │  Testing Lib    │
      └─────────────────┘
    ┌───────────────────────┐
    │       Unit Tests      │ (70% - Business logic)
    │      Jest + RTL       │
    └───────────────────────┘
```

---

### Unit Testing

**Target:** 80% code coverage for business logic

**Tools:**
- Jest 29.x
- React Native Testing Library
- ts-jest (TypeScript support)

**What to Test:**
- ✅ Utility functions (date formatting, prayer time calculation)
- ✅ Custom hooks (useQuery wrappers, usePrayerTimes)
- ✅ Redux/Zustand state logic
- ✅ API client functions
- ✅ FSRS algorithm (flashcard scheduling)

**Example:**

```typescript
// __tests__/prayerService.test.ts
import { PrayerService } from '../prayerService';

describe('PrayerService', () => {
  it('calculates correct prayer times for New York on 2025-02-11', async () => {
    const service = new PrayerService();
    const times = await service.getPrayerTimes(
      new Date('2025-02-11'),
      { latitude: 40.7128, longitude: -74.0060 }
    );

    expect(times.fajr.getHours()).toBe(5);
    expect(times.fajr.getMinutes()).toBeGreaterThanOrEqual(45);
    expect(times.fajr.getMinutes()).toBeLessThanOrEqual(50);
  });

  it('throws error when location is unavailable', async () => {
    const service = new PrayerService();
    await expect(service.getPrayerTimes(new Date())).rejects.toThrow(
      'Location not available'
    );
  });
});
```

---

### Integration Testing

**Target:** Critical user flows work end-to-end

**Tools:**
- React Native Testing Library
- Mock Service Worker (API mocking)
- WatermelonDB in-memory database

**What to Test:**
- ✅ CBT reflection flow (Thought Capture → Session Complete)
- ✅ Quran reading flow (Surah List → Verse Reader → Bookmark)
- ✅ Arabic flashcard review flow (FSRS scheduling)
- ✅ Premium paywall → Purchase flow

**Example:**

```typescript
// __tests__/integration/cbt-flow.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThoughtCaptureScreen } from '../../screens/ThoughtCaptureScreen';

describe('CBT Reflection Flow', () => {
  it('completes full reflection from thought capture to session complete', async () => {
    const queryClient = new QueryClient();

    const { getByPlaceholderText, getByText } = render(
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <ThoughtCaptureScreen />
        </NavigationContainer>
      </QueryClientProvider>
    );

    // Step 1: Enter thought
    const thoughtInput = getByPlaceholderText('What's on your mind?');
    fireEvent.changeText(thoughtInput, 'I always mess everything up.');

    // Step 2: Submit for analysis
    const submitButton = getByText('Analyze Thought');
    fireEvent.press(submitButton);

    // Step 3: Wait for API response (mocked)
    await waitFor(() => {
      expect(getByText('Distortions Found')).toBeTruthy();
    });

    // Step 4: Confirm distortions
    const confirmButton = getByText('Continue to Reframe');
    fireEvent.press(confirmButton);

    // ... Continue through full flow
  });
});
```

---

### E2E Testing

**Target:** Smoke tests for critical paths

**Tools:**
- Detox (React Native E2E framework)
- Appium (fallback for complex scenarios)

**What to Test:**
- ✅ User can sign up, log in, log out
- ✅ User can complete a reflection session
- ✅ User can read Quran, bookmark a verse
- ✅ User can review Arabic flashcards
- ✅ User can purchase premium subscription (sandbox)
- ✅ Prayer times display correctly after granting location permission

**Example:**

```typescript
// e2e/cbt-reflection.e2e.ts
describe('CBT Reflection', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should complete a reflection session', async () => {
    // Navigate to Companion tab
    await element(by.id('companion-tab')).tap();

    // Tap "Start Reflection" button
    await element(by.id('start-reflection-button')).tap();

    // Enter thought
    await element(by.id('thought-input')).typeText(
      'I feel overwhelmed by everything.'
    );

    // Tap "Analyze Thought"
    await element(by.id('analyze-button')).tap();

    // Wait for analysis screen
    await waitFor(element(by.id('distortion-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify distortions displayed
    await expect(element(by.text('Overgeneralization'))).toBeVisible();

    // Tap "Continue to Reframe"
    await element(by.id('continue-reframe')).tap();

    // ... Continue through full flow
  });
});
```

---

### Performance Testing

**Tools:**
- React Native Performance Monitor
- Flipper (React DevTools)
- Lighthouse (Web performance)

**Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| **App Launch Time** | <2s | Time to interactive (TTI) |
| **Screen Transition** | <300ms | Navigation animation complete |
| **API Response Time** | <500ms | P95 latency |
| **Database Query Time** | <100ms | WatermelonDB queries |
| **Bundle Size (iOS)** | <50MB | .ipa file size |
| **Bundle Size (Android)** | <40MB | .apk file size |
| **Memory Usage** | <150MB | Idle state memory |
| **Frame Rate** | 60 FPS | Scrolling, animations |

**Implementation:**

```typescript
// performanceMonitor.ts
import { PerformanceObserver, performance } from 'react-native-performance';

export class PerformanceMonitor {
  observe() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);

          // Alert if threshold exceeded
          if (entry.duration > 500) {
            Sentry.captureMessage(`Slow operation: ${entry.name}`, {
              level: 'warning',
              extra: { duration: entry.duration },
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  measureScreenLoad(screenName: string, callback: () => void) {
    performance.mark(`${screenName}-start`);
    callback();
    performance.mark(`${screenName}-end`);
    performance.measure(
      `${screenName}-load`,
      `${screenName}-start`,
      `${screenName}-end`
    );
  }
}
```

---

### Test Automation (CI/CD)

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: pod install --project-directory=ios
      - run: detox build -c ios.sim.release
      - run: detox test -c ios.sim.release

  e2e-tests-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: detox build -c android.emu.release
      - run: detox test -c android.emu.release

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run typecheck

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
```

---

## Success Metrics & KPIs

### Product Metrics

| Metric | Target | Measurement Frequency | Tool |
|--------|--------|----------------------|------|
| **Daily Active Users (DAU)** | 10,000 within 6 months | Daily | PostHog/Mixpanel |
| **Retention Rate (D7)** | 40% | Weekly | PostHog |
| **Retention Rate (D30)** | 25% | Monthly | PostHog |
| **Session Duration** | 8 minutes average | Daily | PostHog |
| **Feature Adoption (Quran)** | 60% of users | Weekly | Custom analytics |
| **Feature Adoption (CBT)** | 30% of users | Weekly | Custom analytics |
| **Premium Conversion Rate** | 5% | Monthly | RevenueCat |
| **Churn Rate** | <10% monthly | Monthly | RevenueCat |

---

### Technical Metrics

| Metric | Target | Measurement Frequency | Tool |
|--------|--------|----------------------|------|
| **Crash-Free Rate** | 99.5% | Daily | Sentry |
| **API Uptime** | 99.9% | Real-time | Pingdom/UptimeRobot |
| **P95 API Latency** | <500ms | Hourly | Express middleware |
| **Test Coverage** | 80% | Per PR | Jest/Codecov |
| **Build Success Rate** | 95% | Per commit | GitHub Actions |
| **App Store Rating** | 4.5+ stars | Weekly | Manual check |
| **Bug Backlog** | <20 open bugs | Weekly | GitHub Issues |

---

### User Satisfaction Metrics

| Metric | Target | Measurement Frequency | Tool |
|--------|--------|----------------------|------|
| **NPS (Net Promoter Score)** | 40+ | Quarterly | In-app survey |
| **CSAT (Customer Satisfaction)** | 4.5/5 | After key actions | In-app survey |
| **Support Ticket Volume** | <50/week | Weekly | Zendesk/Intercom |
| **App Store Reviews** | 4.5+ stars | Weekly | Manual check |

---

### Engagement Metrics

| Metric | Target | Measurement Frequency | Tool |
|--------|--------|----------------------|------|
| **Reflections/User/Week** | 2+ | Weekly | PostgreSQL query |
| **Quran Verses Read/User/Week** | 50+ | Weekly | PostgreSQL query |
| **Arabic Lessons Completed/Week** | 3+ | Weekly | PostgreSQL query |
| **Prayer Times Checked/Day** | 5+ | Daily | PostgreSQL query |
| **Streak Completion Rate** | 30% users maintain 7+ day streak | Weekly | PostgreSQL query |

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Database migration fails** | Medium | High | Incremental migration, rollback plan, extensive testing |
| **Performance degradation** | Medium | High | Performance budgets, monitoring, lazy loading |
| **API rate limits exceeded** | Low | Medium | Caching, request deduplication, backoff retry |
| **Offline sync conflicts** | Medium | Medium | Last-write-wins, conflict resolution UI |
| **SQLite corruption** | Low | High | Backup strategy, checksum validation |
| **Bundle size exceeds limit** | Medium | Medium | Code splitting, dynamic imports, tree shaking |

---

### Product Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **User adoption lower than expected** | Medium | High | Early beta testing, user interviews, marketing |
| **Premium conversion too low** | Medium | High | A/B test pricing, improve value prop, paywalls |
| **Feature overload confuses users** | High | Medium | Onboarding flow, progressive disclosure, tooltips |
| **Competitors launch similar app** | Medium | Medium | Differentiate with CBT + Islamic integration |
| **Negative app store reviews** | Low | High | Extensive QA, early access program, support team |

---

### Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **GDPR violation** | Low | Critical | Data protection impact assessment, legal review |
| **App Store rejection** | Medium | High | Pre-submission audit, follow guidelines strictly |
| **HIPAA non-compliance** | Low | Critical | Encrypt all reflections, 90-day retention, legal review |
| **RevenueCat integration issues** | Low | Medium | Extensive testing, sandbox mode, fallback billing |

---

### Security Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Data breach** | Low | Critical | Encryption at rest/transit, security audit, pen testing |
| **Session hijacking** | Low | High | Signed cookies, HTTPS only, short session expiry |
| **SQL injection** | Low | High | Parameterized queries (Drizzle ORM), input validation |
| **XSS attack** | Low | Medium | React Native auto-escaping, sanitize user input |
| **Jailbroken device abuse** | Medium | Medium | Jailbreak detection, disable on rooted devices |

---

## Implementation Timeline

**Total Duration:** 16 weeks (4 months)

### Phase 1: Foundation (Weeks 1-2)

**Goals:**
- Set up React Native project with TypeScript
- Configure CI/CD pipeline
- Implement authentication
- Database migration (PostgreSQL + WatermelonDB)

**Deliverables:**
- ✅ React Native project initialized
- ✅ Navigation structure (5 tabs)
- ✅ Authentication flow (signup/login/logout)
- ✅ PostgreSQL schema created
- ✅ WatermelonDB initialized with Noor-AI data
- ✅ CI/CD pipeline (GitHub Actions)

---

### Phase 2: Core Features (Weeks 3-6)

**Goals:**
- Migrate Quran reader
- Implement prayer times
- Build Arabic learning system
- Preserve existing CBT workflows

**Deliverables:**
- ✅ Quran reader (114 Surahs, 6,236 verses)
- ✅ Prayer times calculation (5 daily prayers)
- ✅ Qibla compass
- ✅ Arabic alphabet learning
- ✅ FSRS flashcard system
- ✅ Adhkar collections
- ✅ Existing CBT screens functional

---

### Phase 3: Integration (Weeks 7-10)

**Goals:**
- Integrate Islamic content into CBT flows
- Implement progress tracking
- Build premium features
- Offline sync

**Deliverables:**
- ✅ CBT + Quran verse injection
- ✅ Progress tracking (streaks, achievements)
- ✅ Premium subscription (RevenueCat)
- ✅ Offline-first sync strategy
- ✅ RAG integration (Ollama, Phase 2 stretch)

---

### Phase 4: Polish (Weeks 11-14)

**Goals:**
- UI/UX refinement
- Performance optimization
- Accessibility improvements
- Bug fixes

**Deliverables:**
- ✅ Design system implementation
- ✅ Animations and micro-interactions
- ✅ Accessibility audit (WCAG 2.1 AA)
- ✅ Performance optimization (<2s launch time)
- ✅ Bug fixes from beta testing

---

### Phase 5: Launch Prep (Weeks 15-16)

**Goals:**
- App Store submission
- Marketing materials
- Beta launch
- Monitoring setup

**Deliverables:**
- ✅ App Store listing (screenshots, description)
- ✅ Privacy policy + Terms of Service
- ✅ Beta launch (TestFlight, Google Play Internal Testing)
- ✅ Monitoring dashboards (Sentry, PostHog)
- ✅ Support documentation

---

## Conclusion

This PRD defines a comprehensive plan to merge **Noor-AI (Flutter)** and **Noor-CBT (React Native)** into a unified Islamic companion super-app. The merged app will provide:

1. **Therapeutic CBT workflows** with Islamic integration
2. **Quran reading** with 6,236 verses, translations, bookmarks
3. **Prayer times** with Adhan calculation and Qibla compass
4. **Arabic learning** with FSRS spaced repetition
5. **Adhkar collections** with counters and notifications
6. **Progress tracking** with streaks and achievements
7. **Premium subscriptions** via RevenueCat

The architecture prioritizes **offline-first**, **security**, **accessibility**, and **performance**. The 16-week implementation plan ensures incremental delivery with zero breaking changes for existing Noor-CBT users.

**Next Steps:**
1. Review and approve PRD
2. Assign agents to Phase 1 tasks
3. Set up project tracking (Jira/Linear)
4. Begin implementation Week 1 (Foundation)

---

**Prepared by:** Paranoid Lead Engineer & Architect Team
**Review Status:** PENDING APPROVAL
**Document Version:** 1.0
**Last Updated:** 2025-02-11
