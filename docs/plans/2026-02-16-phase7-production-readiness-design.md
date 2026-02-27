# Phase 7: Production Readiness - Design Document

**Date:** 2026-02-16
**Status:** Approved
**Timeline:** 1-2 weeks
**Approach:** Maximum Parallelization (5 independent tracks)

---

## Executive Summary

**Goal:** Ship production-ready Qamar app to iOS App Store and Google Play with comprehensive quality, polish, and testing.

**Requirements:**
- **Timeline:** Full public launch in 3-4 weeks
- **Platform:** iOS priority, Android simultaneous
- **E2E Coverage:** Full regression suite (20+ flows)
- **Performance:** Optimized experience (< 30MB bundle, < 2s launch, 60fps)
- **Polish:** All three (visual, content, UX) done in parallel

**Strategy:** 5 independent parallel tracks, each commits to main independently without blocking others.

---

## Architecture Overview

### Track Independence

```
Track 1: E2E Testing        → e2e/ directory
Track 2: Performance        → Bundle config, Hermes, lazy loading
Track 3: App Store Content  → assets/screenshots/, docs/app-store/
Track 4: Visual Polish      → UI components, animations, states
Track 5: UX Polish          → Onboarding, offline, edge cases
```

**No cross-dependencies:** Each track can complete independently and commit when ready.

### Execution Model

**Parallel subagent swarm:** 5 agents running simultaneously, one per track.

**Timeline:**
- **Days 1-3:** All tracks start, infrastructure setup
- **Days 4-7:** Implementation, testing, iteration
- **Days 8-10:** Integration, final verification, TestFlight beta
- **Days 11-14:** App Store submission, launch prep

**Success Criteria:**
- ✅ 20+ E2E tests passing on iOS + Android
- ✅ Bundle < 30MB, launch < 2s, 60fps guaranteed
- ✅ 6-8 polished screenshots per platform
- ✅ All UI states handled, onboarding smooth
- ✅ App Store metadata complete, ready to submit

---

## Track 1: E2E Test Suite

**Goal:** 20+ Detox tests covering all major features, edge cases, premium gating, offline mode.

### Setup & Infrastructure

**Fix Detox Config:**
- Update `.detoxrc.js` app names from "myapp" → "noor"
- Update iOS workspace/scheme paths
- Verify simulator/emulator device configs (iPhone 15 Pro, Pixel 5 API 34)
- Add testID props to all interactive elements (following existing `TESTID_GUIDE.md`)

**Test Structure:**
```
e2e/
├── flows/                    # Feature-specific flows
│   ├── quran-reader.test.js
│   ├── hifz-recitation.test.js
│   ├── study-plan.test.js
│   ├── arabic-tutor.test.js
│   ├── prayer-times.test.js
│   ├── tafsir-panel.test.js
│   ├── dua-finder.test.js
│   ├── pronunciation-coach.test.js
│   └── ... (12 more)
├── shared/
│   ├── helpers.js            # Login, navigation helpers
│   └── selectors.js          # Common element selectors
└── regression.test.js        # Full smoke test
```

### Test Categories (20+ flows)

**Core Features (8 tests):**
1. Onboarding flow (welcome → privacy → setup)
2. Quran reader + audio playback (8 reciters)
3. Word-by-word audio + highlighting
4. Tajweed toggle + color display
5. Prayer times + qibla compass
6. Arabic flashcard review
7. Hadith library browsing
8. Islamic calendar navigation

**Phase 6 Features (7 tests):**
9. Hifz dashboard → recitation → hidden verse → feedback
10. Tafsir panel (5 sections, caching)
11. Verse discussion (multi-turn chat)
12. Dua finder (search, favorites, TTS)
13. Study plan generation (onboarding → weekly view)
14. Arabic tutor (4 modes, quota tracking)
15. Pronunciation coach (record → transcribe → feedback)

**Premium & Edge Cases (5+ tests):**
16. Premium paywall (3 free calls → upgrade prompt)
17. Offline mode (cached data loads, online-only features disabled)
18. Slow network (loading states, timeouts)
19. Authentication flow (if applicable)
20. Navigation stress test (deep links, back button, tab switching)

### CI Integration

**GitHub Actions Workflow:**
- Run E2E on every PR to main
- iOS simulator + Android emulator in parallel
- Fail fast on any test failure
- Generate test report artifacts (HTML + JSON)
- Upload screenshots on failure for debugging

**Test Execution:**
```bash
# Local testing
npm run test:e2e:ios
npm run test:e2e:android

# CI testing
npm run test:e2e:ios:release
npm run test:e2e:android:release
```

---

## Track 2: Performance Optimization

**Goal:** Bundle < 30MB, app launch < 2s, 60fps guaranteed across all screens.

### Bundle Size Optimization (Target: < 30MB)

**Asset Optimization:**
- Compress splash/icon images using ImageOptim or pngquant
- Use WebP for large images where supported
- Remove unused assets from `assets/` directory
- Audit font files (only include weights actually used: Amiri, Inter, Cormorant)

**Code Optimization:**
- Enable Hermes bytecode compilation (already enabled via `newArchEnabled: true`)
- Tree-shaking: audit dependencies for unused imports
- Remove console.logs in production (babel-plugin-transform-remove-console already installed)
- Lazy load heavy screens (defer imports until navigation)

**Data Optimization:**
- Audit Quran metadata: fetch reciter URLs on demand vs bundling all 8
- Compress tajweed rules JSON
- Move large datasets to AsyncStorage cache vs bundled
- Evaluate: can we defer some Quran text to on-demand download?

**Measurement:**
```bash
npm run bundle:analyze  # Already exists in package.json
# Analyze output:
# - Total bundle size
# - Assets directory size
# - JavaScript bundle size
# Target: < 30MB total
```

### Launch Time Optimization (Target: < 2s)

**Lazy Loading Strategy:**
- Defer heavy imports until needed:
  - `@react-native-voice/voice` → only import in PronunciationCoachScreen
  - `expo-av` → only import in audio/recording screens
  - Large data files → load from AsyncStorage asynchronously
- Lazy load screens using React.lazy():
  ```javascript
  const HifzDashboard = React.lazy(() => import('./screens/HifzDashboard'));
  const StudyPlanScreen = React.lazy(() => import('./screens/StudyPlanScreen'));
  ```
- Split navigation stacks: defer Learn tab screens until tab accessed

**Splash Screen Optimization:**
- Minimize work before first paint
- Defer AsyncStorage reads (don't block on cache hydration)
- Use React 19's Suspense for deferred data loading
- Show splash → home screen transition as quickly as possible

**Startup Profiling:**
- Use Flipper + React DevTools Profiler
- Identify slow initializers (Zustand store hydration, Anthropic SDK init)
- Measure: app launch → first interactive screen
- Target: < 2s on mid-range devices (iPhone 12, Pixel 5)

### 60fps Guarantee

**List Optimization:**
- All FlatLists use `getItemLayout` (no layout calculation on scroll)
- `maxToRenderPerBatch={10}` for long lists
- `windowSize={5}` to reduce memory usage
- `removeClippedSubviews={true}` on Android

**Animation Optimization:**
- All animations use `react-native-reanimated` (runs on UI thread)
- Avoid `setState` in scroll handlers → use `useAnimatedScrollHandler`
- Profile with React DevTools: identify re-render storms
- Use `worklet` for computationally expensive animation calculations

**Component Memoization:**
- Wrap expensive components in `React.memo()`
- Use `useMemo` for expensive calculations
- Use `useCallback` for function props to prevent child re-renders
- Audit props: avoid passing new objects/functions on every render

**Measurement:**
- **iOS:** Xcode Instruments (Time Profiler, Core Animation)
- **Android:** Systrace + Chrome DevTools Performance tab
- **Target:** No frame drops during scroll, navigation, animations
- **Critical screens:** Quran reader, Hifz dashboard, Learn tab grid

---

## Track 3: App Store Content

**Goal:** Premium App Store presence with compelling screenshots, descriptions, and metadata for iOS (priority) and Android.

### iOS App Store (Priority)

**Screenshots (6-8 required):**

1. **Hero shot:** Quran reader with tajweed colors + word-by-word highlighting active
2. **Learn hub:** Grid of feature cards (Hifz, Arabic Tutor, Study Plan, Dua Finder)
3. **Hifz memorization:** Progress map (30-cell grid) + hidden verse recording mode
4. **Prayer times:** Beautiful prayer time cards + qibla compass with compass needle
5. **Arabic tutor:** Chat interface showing conversational Arabic learning
6. **Study plan:** Weekly calendar view with daily tasks and completion stats
7. **Quran audio:** 8 reciter selection screen + audio playback controls
8. **Personalization:** Dark mode screenshot + theme/customization options

**Screenshot specs:**
- Device: 6.7" iPhone 16 Pro Max (1290 x 2796 px)
- Show app in context (status bar, rounded corners, realistic content)
- Consistent branding (use app's color palette)
- High-quality mockups (use Figma or Shotbot for device frames)

**App Preview Video (30s):**
- **0-5s:** Open with Quran reader (tajweed enabled, audio playing, word highlighting)
- **6-15s:** Quick tour: Prayer times → Hifz progress → Study Plan calendar
- **16-25s:** Show Arabic tutor conversation + pronunciation feedback
- **26-30s:** End with tagline: "One app instead of five" + app icon + "Download Qamar"

**App Description:**

**Subtitle (30 char max):**
"Quran, Prayer, Arabic & Reflection"

**Promotional Text (170 char, editable without new version):**
"New: Personalized weekly study plans! Let Qamar create a custom Quran learning schedule that adapts to your pace and goals."

**Description (4000 char max):**

```markdown
Why have 5 Islamic apps when Qamar does it all?

Qamar is your complete Islamic companion — combining a full Quran reader, Arabic learning suite, prayer times, memorization tools, and guided reflection. All ad-free, offline-capable, and beautifully designed.

QURAN READER
• 8 world-class reciters with crystal-clear audio
• Word-by-word audio with highlighting
• Tajweed color-coding (17 rules explained)
• Tafsir explanations from classical scholars
• Verse-by-verse discussions with personalized insights

MEMORIZATION (HIFZ)
• Scientifically-proven spaced repetition system
• Record your recitation and get instant feedback
• Visual progress tracking across all 30 Juz
• Hidden verse mode to test retention

ARABIC LEARNING
• Conversational Arabic tutor with 4 learning modes
• Pronunciation coach with real-time scoring
• Translation with root word analysis
• Vocabulary flashcards with spaced repetition
• On-device text-to-speech

PRAYER & WORSHIP
• Precise prayer times for your location
• Qibla compass with AR direction
• 100+ authentic adhkar with counters
• Islamic calendar with Ramadan mode

PERSONALIZED STUDY PLAN
• Weekly Quran study plans that adapt to your pace
• Daily tasks with direct app navigation
• Track completion and build streaks

PRIVATE & OFFLINE-FIRST
• Your reflections stay on your device
• Quran text, prayers, and core features work offline
• No ads, ever
• No tracking or data collection

FREE FOREVER
• Full Quran with 8 reciters
• Prayer times and qibla
• Arabic vocabulary flashcards
• All worship features

NOOR PLUS ($2.99/month)
• Unlimited personalized study plans
• Unlimited Arabic tutor conversations
• Unlimited pronunciation coaching
• Advanced Hifz analysis

Download Qamar and deepen your Islamic practice today.
```

**Keywords (100 char max):**
`quran,prayer times,qibla,arabic,muslim,islam,tajweed,hifz,hadith,dua`

**App Category:**
- Primary: Lifestyle
- Secondary: Education

**Age Rating:** 4+ (no objectionable content)

**Privacy Nutrition Labels:**
- Data Not Collected: None (we don't collect data)
- Data Linked to You: None
- Data Used to Track You: None

### Android Google Play

**Screenshots (6-8, phone + 7" tablet):**
- Same content as iOS but Android device frames
- Pixel 8 Pro screenshots (1440 x 3120 px)
- Tablet screenshots (Pixel Tablet, 2560 x 1600 px)

**Feature Graphic (1024 x 500 px):**
- Hero banner with Qamar logo + tagline + 3-4 key features
- Use app's color palette (gold #D4AF37, cream #FAF8F3)

**Short Description (80 char):**
"Complete Islamic companion: Quran, prayer times, Arabic learning & reflection"

**Full Description (4000 char):**
- Similar content to iOS description
- Android-optimized tone (mention Material You theming support)
- Emphasize offline-first, no ads, privacy-focused

**Video (optional):**
- YouTube link to app preview (same 30s video as iOS)

**Content Rating:**
- ESRB: Everyone
- PEGI: 3
- No objectionable content

### Metadata Files Structure

**Save to repo:**
```
docs/app-store/
├── ios/
│   ├── description.md           # Full App Store description
│   ├── keywords.txt             # 100-char keyword list
│   ├── promotional-text.md      # 170-char promo
│   ├── privacy-labels.md        # Privacy nutrition label answers
│   └── screenshots/             # 8 PNGs (6.7" iPhone)
│       ├── 01-hero-quran.png
│       ├── 02-learn-hub.png
│       ├── 03-hifz.png
│       ├── 04-prayer.png
│       ├── 05-tutor.png
│       ├── 06-study-plan.png
│       ├── 07-audio.png
│       └── 08-dark-mode.png
├── android/
│   ├── description.md
│   ├── short-description.txt
│   ├── feature-graphic.png
│   └── screenshots/
│       ├── phone/               # 8 PNGs (Pixel 8 Pro)
│       └── tablet/              # 4 PNGs (Pixel Tablet)
└── video/
    └── app-preview-30s.mp4      # 30-second preview video
```

### Screenshot Automation

**Use existing infrastructure:**
```bash
npm run screenshots  # Existing script in package.json
```

**Capture strategy:**
- Use Detox or Maestro in screenshot mode
- Navigate to each screen, capture at key moment
- Post-process with device frames (Figma plugin or Shotbot.io)
- Ensure consistent lighting, content, branding

**Manual touchups:**
- Add subtle Qamar watermark if needed
- Ensure text is readable at thumbnail size
- Verify colors look good on both light/dark App Store backgrounds

---

## Track 4: Visual Polish

**Goal:** Pixel-perfect UI, smooth animations, all states handled, excellent accessibility.

### Loading States

**API Calls:**
- Skeleton screens for list loading (not just spinners)
- Graceful loading: show cached data + "Updating..." indicator
- Smart placeholders (prayer times show last known until fresh data loads)

**Components needing loading states:**
- **Quran reader:** Verse loading skeleton (3-5 gray lines)
- **Hifz dashboard:** Progress grid loading (30 skeleton cells with shimmer)
- **Study plan generation:** 30s+ Claude call → progress indicator with encouraging messages
- **Tafsir panel:** 5-section skeleton (context, key terms, views, refs, takeaway)
- **Arabic tutor chat:** Typing indicator (3 animated dots)
- **Dua search:** Card skeleton grid (3-4 cards with shimmer)

**Loading UI patterns:**
- Use `react-native-skeleton-placeholder` or custom shimmer
- Skeleton matches final content shape
- Smooth transition from skeleton → real content (fade-in)

### Empty States

**Delightful illustrations + clear CTAs:**
- **No study plan yet:** Illustration + "Create your first study plan" + button
- **No saved duas:** Illustration + "Search for duas to start building your collection"
- **No hifz progress:** "Start memorizing with Al-Fatiha" + "Begin" button
- **No conversation history:** "Ask your first question about Islam"
- **Offline mode active:** "You're offline. Some features require internet connection"
- **No flashcards due:** "No cards due today! You're all caught up 🎉"

**Design system:**
- Consistent empty state pattern across app
- Use expo-symbols for icons or custom minimal illustrations
- Align with Qamar's spiritual aesthetic (muted golds #D4AF37, soft gradients, calm)
- Always include a clear next action (button or instruction)

### Error States

**User-friendly error messages:**
- **API failure:** "Couldn't load content. Try again?" + Retry button
- **Network offline:** "You're offline. Only cached content available."
- **Permission denied (mic):** "Qamar needs microphone access for pronunciation feedback" + "Open Settings" button
- **Permission denied (location):** "Enable location for accurate prayer times" + manual location entry option
- **Rate limit hit:** "You've reached your free limit (3/day). Upgrade to Plus for unlimited access" + "Learn More" button
- **Claude API error:** "Service temporarily unavailable. Try again in a moment."

**Error UI components:**
- **Toast notifications:** Transient errors (network blip, minor API issue)
- **Full-screen error:** Critical failures with retry button
- **Inline errors:** Form validation errors (red text under input)
- **Banner errors:** Persistent issues (offline mode banner at top)

**Error recovery:**
- Always provide retry mechanism
- Auto-retry with exponential backoff for transient failures
- Clear error state after successful retry

### Micro-interactions & Animations

**Enhance existing animations:**
- **Tab bar:** Icon bounce on press + haptic feedback (light impact)
- **Card press:** Subtle scale transform (0.98) with spring animation
- **Pull-to-refresh:** Custom indicator (rotating Qamar icon or crescent)
- **Success animations:** Checkmark on task complete, confetti on streak milestone

**New animations (react-native-reanimated):**
- **Tajweed toggle:** Color fade-in animation (500ms)
- **Audio playback:** Pulsing speaker icon or waveform visualization
- **Hifz progress map:** Cells fill with gradient on completion (staggered animation)
- **Study plan calendar:** Daily tasks slide-in from right when day is selected
- **Dua favorites:** Heart icon bounce + scale when favorited
- **Prayer time countdown:** Smooth number transitions (not jumpy)

**Performance:**
- All animations run at 60fps (UI thread via reanimated worklets)
- No layout thrashing (use transform/opacity, not width/height)
- Spring animations use `withSpring` for natural feel

### Accessibility

**VoiceOver / TalkBack:**
- All interactive elements have `accessibilityLabel`
- All images have `accessibilityHint` where helpful
- Screen reader announces state changes ("Tajweed enabled", "Audio playing")
- Grouped elements use `accessible={true}` wrapper
- Disable accessibility on decorative elements

**Dynamic Type:**
- All text components respect iOS text size settings
- Use `<ThemedText>` which already handles dynamic type
- Test at largest accessibility size (ensure no clipping/overlap)
- Minimum touch target: 44x44 pt (iOS), 48x48 dp (Android)

**Color Contrast:**
- WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Audit tajweed colors in dark mode (ensure sufficient contrast)
- Test with Accessibility Inspector (Xcode) or Android Accessibility Scanner
- Verify gold accent color (#D4AF37) has enough contrast on cream background

**Focus Management:**
- Proper focus order on screens (top-to-bottom, left-to-right)
- Auto-focus on text inputs when appropriate (search fields, chat input)
- Restore focus after modal dismissal
- Keyboard navigation works (external keyboard on iPad)

**Reduced Motion:**
- Respect `prefers-reduced-motion` setting
- Disable decorative animations if user prefers reduced motion
- Keep functional animations (don't hide critical state changes)

### Dark Mode Edge Cases

**Audit all screens:**
- Ensure all custom colors have dark variants in theme
- Gradients work in both light and dark modes
- Glass effects (blur) look good on dark backgrounds
- Border colors visible on dark backgrounds (use rgba with opacity)
- Icons have proper tint colors for both modes

**Test devices:**
- iOS 17+ with scheduled dark mode (auto-switch at sunset)
- Android 14+ Material You dark theme
- Force dark mode in dev settings → manually verify each screen

**Special cases:**
- **Quran text:** Cream background in light mode, dark gray in dark mode (not pure black)
- **Tajweed colors:** Adjust opacity in dark mode for better readability
- **Prayer time cards:** Gradient backgrounds work in both modes
- **Glass cards:** Blur intensity adjusted for dark mode

---

## Track 5: UX Polish

**Goal:** Seamless first-time experience, graceful offline handling, bulletproof edge cases.

### Onboarding Flow Improvements

**Current state:** 3 screens (Welcome → Privacy → Safety)

**Enhancements:**

**Welcome screen:**
- Add quick feature preview carousel (3-4 cards with visuals + 1-sentence description)
  - Card 1: "Read the Quran with 8 world-class reciters"
  - Card 2: "Memorize with spaced repetition and feedback"
  - Card 3: "Learn Arabic with personalized coaching"
  - Card 4: "Never miss prayer with accurate times and qibla"
- Auto-advance carousel every 3s or swipe manually
- "Get Started" button prominently placed

**Permission priming:**
- Before requesting mic permission: "Qamar uses your microphone to give you pronunciation feedback on your recitation"
- Before requesting location: "Qamar uses your location for accurate prayer times and qibla direction"
- Show benefit first, then request permission (higher acceptance rate)

**Quick setup (new screen):**
- Ask 2-3 key preferences:
  - "Select your preferred Quran reciter" (grid of 8 with names)
  - "Choose your prayer calculation method" (list of methods with location-based suggestion)
  - "Enable notifications for prayer times?" (toggle)
- "Skip for now" option at top-right
- Save preferences to AsyncStorage

**Progress indicator:**
- Show "3 of 3" or progress dots
- Allow back navigation to previous onboarding screen

**First-time user experience:**
- After onboarding → auto-navigate to Quran reader (show core value immediately)
- Show Al-Fatiha (Surah 1) by default
- Subtle tooltip on first visit: "Tap play to hear the recitation" (dismissible)
- Don't ask for premium upgrade during first session (let them explore free features)

### Offline Mode Messaging

**Detection strategy:**
- Use `@react-native-community/netinfo` to detect connectivity
- Subscribe to network state changes
- Show persistent banner when offline: "You're offline. Some features unavailable."

**Graceful degradation:**

**Offline-capable (cached):**
- Quran reader (all surahs cached in AsyncStorage)
- Prayer times (cached for 30 days ahead)
- Arabic flashcards (decks cached locally)
- Tajweed display (local data)
- Hadith library (cached collections)
- Adhkar (local data)

**Requires online (Claude API):**
- Arabic tutor
- Pronunciation coach
- Tafsir explanations
- Verse discussions
- Dua search
- Study plan generation

**UI indicators:**
- Disabled state for online-only features when offline
- "Requires internet" badge on Learn tab feature cards
- Tooltip on tap: "This feature requires an internet connection"
- Auto-retry when connection restored (toast: "You're back online!")

**Offline banner:**
- Persistent at top of screen when offline
- Dismissible but returns on screen change
- Shows available features: "Quran reader, prayer times, and flashcards work offline"

### Edge Case Handling

**Slow Network (2G/3G):**
- Show loading states immediately (don't wait 5s to show spinner)
- Timeout after 15s → show error + retry button
- Cache aggressively to avoid re-fetching same data
- Show cached data + "Updating..." if available

**API Failures:**
- **Claude API down:** "Service temporarily unavailable. Try again in a moment." + Retry button
- **Rate limiting:** Clear upgrade path or "You've reached the limit. Try again in X minutes."
- **Network timeout:** "Request timed out. Check your connection and try again."
- Retry with exponential backoff (1s, 2s, 4s, 8s) — don't hammer failed endpoints

**Premium Quota Edge Cases:**
- User hits 3/3 free calls mid-conversation → graceful interrupt:
  - "You've used your 3 free calls today. Upgrade to Plus for unlimited access or try again tomorrow."
  - Show upgrade button + "Remind me tomorrow" button
- Show quota remaining proactively: "2/3 free calls left today" badge on tutor/pronunciation screens
- Don't let users start a flow they can't complete:
  - Disable "Generate Study Plan" button if quota exhausted (show "Out of free calls" tooltip)

**Deep Link Handling:**
- External links: `noor://verse-reader?surahId=2&verseNumber=5`
- Validate all params (surahId 1-114, verseNumber valid for surah)
- Fallback to home screen if invalid params (show toast: "Invalid link")
- Handle app already open vs cold start differently
- Show loading screen during deep link navigation (don't flash home screen first)

**Permission Denied:**
- **Mic permission denied:** Pronunciation coach shows:
  - "Qamar needs microphone access to record your recitation"
  - "Enable microphone in Settings" button (deep link to app settings)
  - Don't repeatedly ask after denial (respect user choice)
- **Location permission denied:** Prayer times offers:
  - Manual location entry (city search)
  - "Use my location" button to re-request permission
  - Default to Mecca if no location available

**Storage Full:**
- Handle AsyncStorage quota errors gracefully
- Show warning: "Storage full. Clear cached data?" + button to clear old cache
- Prioritize keeping: prayer times, current flashcard deck, user preferences

### First-Time Feature Discovery

**Subtle guidance without hand-holding:**

**Study Plan:**
- Empty state shows: "Create your first personalized study plan" + illustrated card + "Get Started" button
- After first plan: Show completion stats + "You're on a 3-day streak! 🔥"

**Hifz:**
- First visit shows: "Start with Al-Fatiha (recommended for beginners)" + highlighted card
- After first recitation: "Great start! Practice daily to build your streak."

**Arabic Tutor:**
- First visit shows 4 mode chips: "Choose a learning mode to begin"
- Tooltip on each mode: "Vocabulary: Learn new words and phrases"
- After first session: "Nice work! You have 2/3 free calls left today."

**Premium features:**
- First quota hit shows: "You have 3 free calls per day. Upgrade to Plus for unlimited access."
- Don't show upgrade prompt until user actually hits limit (not preemptively)

**Progressive disclosure:**
- Don't overwhelm with all features at once
- Unlock features gradually: e.g., don't show advanced tajweed rules until user toggles tajweed on
- Show tooltips only on first use, then never again (store "tooltip_shown_X" flags in AsyncStorage)

### Critical User Journeys (Polish Audit)

**Journey 1: New user → Quran reader → Play audio**

**Steps:**
1. Open app → Skip onboarding → Tap Quran tab
2. Select Al-Fatiha (default, pre-selected)
3. Tap play button

**Polish:**
- Reciter already selected (default: Mishary Alafasy)
- Audio plays immediately (< 1s delay)
- Word highlighting synced with audio
- Pause/play button clearly visible
- No loading spinner (audio is cached or streams quickly)

**Journey 2: Free user → Generate study plan → Hit quota → Upgrade**

**Steps:**
1. Learn tab → Study Plan card → Tap
2. Onboarding: Select goal → time → skill level
3. Generate plan (uses 1 free call)
4. Use plan for a few days
5. Generate 2 more plans over next week
6. Try to generate 4th plan → hit quota

**Polish:**
- Clear quota indicator on Study Plan screen: "2/3 free plans left this week"
- Upgrade prompt explains value: "Get unlimited personalized study plans with Plus ($2.99/mo)"
- "Maybe Later" option available (not forced upgrade)

**Journey 3: Hifz → Record → Get feedback**

**Steps:**
1. Hifz tab → Select Al-Fatiha → Tap verse
2. Hidden verse mode → Tap record button
3. Recite verse → Tap stop
4. Wait for feedback

**Polish:**
- Clear "Press and hold to record" instruction (or toggle record mode)
- Recording indicator (pulsing red circle)
- Feedback appears < 3s after stop (fast transcription)
- Feedback is actionable: "Great! Try emphasizing the 'qaf' sound in 'qalb'"
- Score shown prominently (85/100 with color coding)

---

## Success Metrics

**Track 1: E2E Testing**
- ✅ 20+ tests written and passing
- ✅ GitHub Actions workflow runs on every PR
- ✅ Test coverage report shows >80% of critical paths

**Track 2: Performance**
- ✅ Bundle size < 30MB (verify with `npm run bundle:analyze`)
- ✅ App launch < 2s on iPhone 12 / Pixel 5
- ✅ 60fps on all scrollable screens (verified with Xcode Instruments)
- ✅ No memory leaks (verified with Flipper)

**Track 3: App Store Content**
- ✅ 6-8 polished screenshots per platform (iOS, Android phone, Android tablet)
- ✅ 30s app preview video
- ✅ App Store descriptions written and reviewed
- ✅ Keywords optimized for search ranking

**Track 4: Visual Polish**
- ✅ All screens have loading, empty, and error states
- ✅ Animations run at 60fps
- ✅ VoiceOver / TalkBack work on all screens
- ✅ WCAG AA color contrast verified
- ✅ Dark mode works perfectly on all screens

**Track 5: UX Polish**
- ✅ Onboarding flow improved with feature preview
- ✅ Offline mode gracefully degrades
- ✅ All edge cases handled (slow network, API failures, quota, permissions)
- ✅ First-time user experience tested and validated

---

## Deliverables

**Code:**
- `e2e/` directory with 20+ test files
- Performance optimizations merged to main
- UI polish commits merged to main
- All 707 existing tests still passing

**Assets:**
- `docs/app-store/ios/screenshots/` (8 PNGs)
- `docs/app-store/android/screenshots/phone/` (8 PNGs)
- `docs/app-store/android/screenshots/tablet/` (4 PNGs)
- `docs/app-store/video/app-preview-30s.mp4`

**Documentation:**
- `docs/app-store/ios/description.md`
- `docs/app-store/android/description.md`
- Updated `CONTINUE.md` with Phase 7 completion

**Builds:**
- TestFlight beta build for iOS
- Google Play Internal Testing build for Android

---

## Next Steps After Design Approval

1. **Invoke writing-plans skill** to create detailed implementation plan
2. **Execute with parallel subagent swarm** (5 agents, one per track)
3. **Integration and verification** (days 8-10)
4. **TestFlight beta launch** (day 10)
5. **Final polish based on beta feedback** (days 11-14)
6. **App Store submission** (day 14)

---

**Design Status:** ✅ Approved
**Next Action:** Invoke writing-plans skill to create implementation plan
