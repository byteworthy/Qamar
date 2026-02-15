# Noor App Merger - Implementation Plan with Skill Injections

**Duration:** 16 Weeks (4 Months)
**Last Updated:** 2025-02-11
**Status:** READY FOR EXECUTION

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Foundation Setup (Weeks 1-2)](#phase-1-foundation-setup-weeks-1-2)
3. [Phase 2: Core Features Migration (Weeks 3-6)](#phase-2-core-features-migration-weeks-3-6)
4. [Phase 3: Integration & Premium (Weeks 7-10)](#phase-3-integration--premium-weeks-7-10)
5. [Phase 4: Polish & Optimization (Weeks 11-14)](#phase-4-polish--optimization-weeks-11-14)
6. [Phase 5: Launch Preparation (Weeks 15-16)](#phase-5-launch-preparation-weeks-15-16)
7. [Skill Injection Matrix](#skill-injection-matrix)
8. [Plugin Requirements](#plugin-requirements)
9. [Code Quality Gates](#code-quality-gates)
10. [Drift Detection Checkpoints](#drift-detection-checkpoints)

---

## Overview

### Guiding Principles

1. **Zero Breaking Changes** - Existing Noor-CBT functionality must remain intact
2. **Incremental Delivery** - Ship features progressively, not big-bang
3. **Skill-Driven Development** - Invoke Claude skills at appropriate phases
4. **Quality Gates** - Every phase requires passing quality checks
5. **Paranoid Review** - Question every decision: "Could this be simpler?"

### Success Metrics

| Phase | Exit Criteria | Quality Gate |
|-------|--------------|--------------|
| **Phase 1** | Project initialized, navigation skeleton, auth working | ✅ TypeScript strict mode passes, ✅ CI/CD green |
| **Phase 2** | All Noor-AI features ported, offline DB working | ✅ 70%+ test coverage, ✅ App launches <2s |
| **Phase 3** | Progress tracking, premium features, sync working | ✅ RevenueCat integration tested, ✅ No data loss on sync |
| **Phase 4** | UI polished, accessible, performant | ✅ WCAG AA compliance, ✅ 60 FPS scrolling |
| **Phase 5** | Beta launched, monitoring active | ✅ Crash-free rate >99%, ✅ App Store approved |

---

## Phase 1: Foundation Setup (Weeks 1-2)

### Goals

- Set up React Native + Expo project
- Configure CI/CD pipeline
- Implement authentication
- Initialize databases (PostgreSQL + WatermelonDB)
- Create navigation skeleton

### Tasks

#### Week 1: Project Initialization

**Day 1-2: Project Setup**
- [ ] Initialize Expo project with TypeScript template
- [ ] Configure ESLint + Prettier + TypeScript strict mode
- [ ] Set up folder structure (features/, components/, services/)
- [ ] Install core dependencies (React Navigation, TanStack Query, WatermelonDB)
- [ ] Configure `.env` file structure

**Skill Injection:** `/clean-code` - Review project structure
**Command:**
```bash
/clean-code review-structure
```
**Expected Output:** Validation that folder structure follows clean architecture principles

---

**Day 3-4: CI/CD Pipeline**
- [ ] Create GitHub Actions workflow (`.github/workflows/test.yml`)
- [ ] Configure Jest for unit testing
- [ ] Set up TypeScript type checking in CI
- [ ] Configure ESLint auto-fix in CI
- [ ] Add PR template with quality checklist

**Skill Injection:** `/devops-best-practices` - Review CI/CD configuration
**Command:**
```bash
/devops-best-practices review-pipeline .github/workflows/test.yml
```

---

**Day 5: Navigation Skeleton**
- [ ] Implement `RootStackNavigator` with 5 tabs
- [ ] Create placeholder screens (HomeScreen, CompanionScreen, etc.)
- [ ] Configure deep linking
- [ ] Test tab navigation on iOS + Android

**Skill Injection:** `/react-patterns` - Review navigation architecture
**Command:**
```bash
/react-patterns review-navigation client/navigation/
```

---

#### Week 2: Authentication & Databases

**Day 1-2: Authentication**
- [ ] Implement signup/login screens
- [ ] Integrate with existing Noor-CBT auth API
- [ ] Set up session cookie handling
- [ ] Implement biometric authentication (Face ID/Touch ID)

**Skill Injection:** `/security-review` - Audit authentication flow
**Command:**
```bash
/security-review audit-auth client/screens/auth/
```

---

**Day 3-4: WatermelonDB Setup**
- [ ] Define WatermelonDB schema (Surahs, Verses, Flashcards, Bookmarks)
- [ ] Write migration script to import `noor_ai_seed.db` (3.4MB)
- [ ] Create model classes (Surah, Verse, Flashcard)
- [ ] Test offline queries (read 1000 verses in <100ms)

**Skill Injection:** `/database-design` - Review schema design
**Command:**
```bash
/database-design review-schema client/database/schema.ts
```

---

**Day 5: Testing & Quality Gate**
- [ ] Write tests for authentication flow
- [ ] Write tests for WatermelonDB queries
- [ ] Run `npm run typecheck` (must pass with 0 errors)
- [ ] Run `npm run test` (must have >70% coverage)
- [ ] Deploy to Expo Go for manual testing

**Quality Gate:**
```bash
npm run typecheck && npm run lint && npm run test -- --coverage --coverageThreshold='{"global":{"lines":70}}'
```

**Exit Criteria:**
- ✅ All tests passing
- ✅ TypeScript strict mode with 0 errors
- ✅ CI/CD pipeline green
- ✅ App runs on iOS + Android simulators

---

## Phase 2: Core Features Migration (Weeks 3-6)

### Goals

- Migrate Quran reader from Noor-AI
- Implement prayer times calculation
- Build Arabic learning system (alphabet + flashcards)
- Port Adhkar collections
- Preserve existing CBT workflows

---

#### Week 3: Quran Reader

**Day 1-2: Surah List Screen**
- [ ] Create `SurahListScreen` component
- [ ] Query 114 Surahs from WatermelonDB
- [ ] Display Surah cards with Arabic name, revelation type, verse count
- [ ] Implement search/filter by Surah name

**Skill Injection:** `/frontend-design` - Review UI/UX
**Command:**
```bash
/frontend-design review-screen client/features/quran/screens/SurahListScreen.tsx
```

---

**Day 3-4: Verse Reader Screen**
- [ ] Create `VerseReaderScreen` component
- [ ] Query verses by Surah ID
- [ ] Display Arabic text + translation + transliteration
- [ ] Implement verse-by-verse scrolling (optimized for 6,236 verses)
- [ ] Add bookmark functionality (local + sync)

**Skill Injection:** `/react-patterns` - Review performance optimizations
**Command:**
```bash
/react-patterns review-performance client/features/quran/screens/VerseReaderScreen.tsx
```

---

**Day 5: Testing**
- [ ] Write tests for Surah queries
- [ ] Write tests for bookmarking
- [ ] Performance test: Load 100 verses in <100ms
- [ ] Memory test: No leaks when scrolling 1000+ verses

**Quality Gate:**
```bash
npm run test -- features/quran --coverage
```

---

#### Week 4: Prayer Times & Qibla

**Day 1-2: Prayer Times Calculation**
- [ ] Install `adhan-js` library
- [ ] Create `PrayerService` class
- [ ] Calculate 5 daily prayers based on GPS coordinates
- [ ] Store last known location in AsyncStorage
- [ ] Implement background task to update prayer times at midnight

**Skill Injection:** `/clean-code` - Review service architecture
**Command:**
```bash
/clean-code review-service client/services/prayerService.ts
```

---

**Day 3-4: Prayer Times UI**
- [ ] Create `PrayerTimesScreen` with countdown to next prayer
- [ ] Display all 5 prayers with times
- [ ] Implement prayer time notifications (Expo Notifications)
- [ ] Add settings screen for calculation method

**Skill Injection:** `/frontend-design` - Review prayer times UI
**Command:**
```bash
/frontend-design review-screen client/features/prayer/screens/PrayerTimesScreen.tsx
```

---

**Day 5: Qibla Compass**
- [ ] Implement `QiblaCompassScreen` using magnetometer
- [ ] Calculate Qibla direction based on GPS
- [ ] Add haptic feedback when aligned
- [ ] Test on physical devices (compass requires real hardware)

**Quality Gate:**
```bash
npm run test -- features/prayer
```

---

#### Week 5: Arabic Learning (FSRS)

**Day 1-2: Alphabet Grid**
- [ ] Create `AlphabetGridScreen` with 28 letters
- [ ] Query Arabic letters from WatermelonDB
- [ ] Display letter cards with Arabic script + transliteration
- [ ] Implement audio playback for pronunciation

**Skill Injection:** `/app-builder` - Review learning module structure
**Command:**
```bash
/app-builder review-feature client/features/arabic-learning/
```

---

**Day 3-4: FSRS Flashcard System**
- [ ] Install `ts-fsrs` library
- [ ] Create `FSRSService` class
- [ ] Implement flashcard scheduling algorithm
- [ ] Create `FlashcardReviewScreen` with rating buttons (Again/Hard/Good/Easy)
- [ ] Update flashcard state in WatermelonDB on rating

**Skill Injection:** `/clean-code` - Review FSRS implementation
**Command:**
```bash
/clean-code review-algorithm client/services/fsrsService.ts
```

---

**Day 5: Testing**
- [ ] Write tests for FSRS scheduling
- [ ] Write tests for flashcard review flow
- [ ] Verify intervals calculated correctly (test data)

**Quality Gate:**
```bash
npm run test -- features/arabic-learning
```

---

#### Week 6: Adhkar & CBT Preservation

**Day 1-2: Adhkar Collections**
- [ ] Import `adhkar.json` (44KB) into WatermelonDB
- [ ] Create `AdhkarListScreen` with categories
- [ ] Create `AdhkarReaderScreen` with counter
- [ ] Implement haptic feedback on counter tap

**Skill Injection:** `/frontend-design` - Review adhkar UI
**Command:**
```bash
/frontend-design review-screen client/features/adhkar/screens/AdhkarReaderScreen.tsx
```

---

**Day 3-4: CBT Preservation**
- [ ] Verify existing CBT screens still work
- [ ] Migrate CBT screens to new navigation structure
- [ ] Test full CBT flow (Thought Capture → Session Complete)
- [ ] Ensure no regressions in Claude API integration

**Skill Injection:** `/security-review` - Audit CBT data flow
**Command:**
```bash
/security-review audit-data-flow client/features/companion/
```

---

**Day 5: Integration Testing**
- [ ] Test all features work together
- [ ] Test navigation flows (tab → screen → detail)
- [ ] Test offline mode (airplane mode)
- [ ] Deploy to Expo Go for manual testing

**Quality Gate:**
```bash
npm run test:integration
```

**Exit Criteria:**
- ✅ All Noor-AI features ported
- ✅ Offline database working (3.4MB SQLite)
- ✅ CBT workflows preserved
- ✅ Test coverage >70%

---

## Phase 3: Integration & Premium (Weeks 7-10)

### Goals

- Integrate Islamic content into CBT flows
- Implement progress tracking (streaks, achievements)
- Build premium features (RevenueCat integration)
- Implement offline sync strategy

---

#### Week 7: CBT + Quran Integration

**Day 1-3: Inject Quran Verses into CBT**
- [ ] Update `analyzeThought` API to return suggested verses
- [ ] Modify `DistortionScreen` to display relevant Quranic verses
- [ ] Map emotional states (grief, anxiety) to verses in `islamic-content-mapper.ts`
- [ ] Test integration: Enter thought → Receive verses

**Skill Injection:** `/api-patterns` - Review API integration
**Command:**
```bash
/api-patterns review-endpoint server/routes.ts /api/companion/analyze
```

---

**Day 4-5: Testing**
- [ ] Write integration tests for CBT + Quran flow
- [ ] Test edge cases (no internet, API timeout)

---

#### Week 8: Progress Tracking

**Day 1-2: Database Schema**
- [ ] Create PostgreSQL tables: `user_progress`, `achievements`, `daily_goals`
- [ ] Write Drizzle ORM migrations
- [ ] Implement server APIs: GET `/api/progress`, POST `/api/activity`

**Skill Injection:** `/database-design` - Review progress schema
**Command:**
```bash
/database-design review-schema server/db/schema.ts
```

---

**Day 3-4: Progress Dashboard UI**
- [ ] Create `ProgressDashboardScreen`
- [ ] Display current streak, longest streak, total activities
- [ ] Create `AchievementsScreen` with unlocked/locked badges
- [ ] Implement achievement unlock logic (trigger on milestones)

**Skill Injection:** `/frontend-design` - Review progress UI
**Command:**
```bash
/frontend-design review-screen client/features/progress/screens/ProgressDashboardScreen.tsx
```

---

**Day 5: Testing**
- [ ] Write tests for streak calculation
- [ ] Write tests for achievement unlocks

---

#### Week 9: Premium Features (RevenueCat)

**Day 1-2: RevenueCat Setup**
- [ ] Install `react-native-purchases` SDK
- [ ] Configure RevenueCat project (products, entitlements)
- [ ] Create `billingProvider.ts` context
- [ ] Implement purchase flow (iOS/Android in-app purchases)

**Skill Injection:** `/app-builder` - Review IAP implementation
**Command:**
```bash
/app-builder review-iap client/lib/billingProvider.ts
```

---

**Day 3-4: Paywall UI**
- [ ] Create `PaywallScreen` with pricing tiers
- [ ] Implement premium feature gates (lock features for free users)
- [ ] Test purchase flow in sandbox mode
- [ ] Implement restore purchases button

**Skill Injection:** `/frontend-design` - Review paywall UI
**Command:**
```bash
/frontend-design review-screen client/features/premium/screens/PaywallScreen.tsx
```

---

**Day 5: Testing**
- [ ] Test purchase flow (sandbox)
- [ ] Test restore purchases
- [ ] Verify premium features unlock after purchase

---

#### Week 10: Offline Sync

**Day 1-3: Sync Service**
- [ ] Create `SyncService` class
- [ ] Implement background sync for bookmarks, flashcards, achievements
- [ ] Test conflict resolution (last-write-wins)
- [ ] Implement network state detection

**Skill Injection:** `/clean-code` - Review sync logic
**Command:**
```bash
/clean-code review-service client/services/syncService.ts
```

---

**Day 4-5: Testing**
- [ ] Write integration tests for sync
- [ ] Test offline → online sync
- [ ] Test conflict resolution

**Quality Gate:**
```bash
npm run test:integration && npm run test:e2e
```

**Exit Criteria:**
- ✅ Progress tracking working
- ✅ RevenueCat integration tested
- ✅ Offline sync functional
- ✅ No data loss on sync

---

## Phase 4: Polish & Optimization (Weeks 11-14)

### Goals

- UI/UX refinement (design system, animations)
- Performance optimization (<2s launch time)
- Accessibility improvements (WCAG 2.1 AA)
- Bug fixes from beta testing

---

#### Week 11: Design System Implementation

**Day 1-2: Theme Configuration**
- [ ] Define color palette (primary, secondary, neutral, dark mode)
- [ ] Configure typography (Arabic: Amiri, English: Inter)
- [ ] Create spacing scale (4px, 8px, 16px, 24px, 32px)
- [ ] Implement border radius scale

**Skill Injection:** `/frontend-design` - Review design system
**Command:**
```bash
/frontend-design review-design-system client/constants/theme.ts
```

---

**Day 3-4: Component Library**
- [ ] Build `Button` component (variants: primary, secondary, text)
- [ ] Build `Card` component (variants: flat, elevated, glass)
- [ ] Build `Screen` component (wrapper with safe area)
- [ ] Document components in Storybook (optional)

---

**Day 5: Dark Mode**
- [ ] Implement dark mode theme
- [ ] Add theme toggle in settings
- [ ] Test all screens in dark mode

---

#### Week 12: Animations & Micro-interactions

**Day 1-2: Navigation Animations**
- [ ] Implement tab press animations (scale 0.95x)
- [ ] Add modal slide-up animations
- [ ] Implement screen transitions (fade in/out)

**Skill Injection:** `/react-patterns` - Review animation patterns
**Command:**
```bash
/react-patterns review-animations client/components/
```

---

**Day 3-4: Loading States & Skeletons**
- [ ] Create `LoadingSkeleton` component
- [ ] Add loading states to all screens
- [ ] Implement pull-to-refresh

---

**Day 5: Haptic Feedback**
- [ ] Add haptic feedback on button press
- [ ] Add haptic on tab press
- [ ] Add haptic on Qibla alignment

---

#### Week 13: Accessibility

**Day 1-2: Screen Reader Support**
- [ ] Add `accessibilityLabel` to all interactive elements
- [ ] Add `accessibilityHint` to buttons
- [ ] Test with iOS VoiceOver + Android TalkBack

**Skill Injection:** `/frontend-design` - Audit accessibility
**Command:**
```bash
/frontend-design audit-accessibility client/
```

---

**Day 3-4: Color Contrast & Touch Targets**
- [ ] Audit color contrast (4.5:1 minimum)
- [ ] Ensure touch targets are 44x44 points minimum
- [ ] Test with large font sizes (Dynamic Type)

---

**Day 5: Testing**
- [ ] Run accessibility scanner (Axe DevTools)
- [ ] Manual testing with screen reader

---

#### Week 14: Performance Optimization

**Day 1-2: Bundle Size Optimization**
- [ ] Analyze bundle size (React Native Bundle Visualizer)
- [ ] Remove unused dependencies
- [ ] Implement code splitting (lazy loading screens)
- [ ] Target: <50MB app size

**Skill Injection:** `/react-patterns` - Review performance
**Command:**
```bash
/react-patterns review-performance client/
```

---

**Day 3-4: Runtime Performance**
- [ ] Optimize FlatList rendering (virtualization)
- [ ] Use React.memo for expensive components
- [ ] Implement image caching
- [ ] Target: 60 FPS scrolling

---

**Day 5: Performance Testing**
- [ ] Measure app launch time (<2s target)
- [ ] Measure screen transition time (<300ms target)
- [ ] Test on low-end devices (3-year-old phones)

**Quality Gate:**
```bash
npm run test:performance
```

**Exit Criteria:**
- ✅ WCAG 2.1 AA compliant
- ✅ App launches <2s
- ✅ 60 FPS scrolling
- ✅ Bundle size <50MB

---

## Phase 5: Launch Preparation (Weeks 15-16)

### Goals

- App Store submission (iOS + Android)
- Beta launch (TestFlight, Google Play Internal Testing)
- Monitoring dashboards (Sentry, PostHog)
- Support documentation

---

#### Week 15: App Store Submission

**Day 1-2: App Store Metadata**
- [ ] Write app description (English + Arabic)
- [ ] Create screenshots (5.5", 6.5", 12.9" devices)
- [ ] Design app icon (1024x1024)
- [ ] Record demo video (30 seconds)

**Skill Injection:** `/app-builder` - Review App Store listing
**Command:**
```bash
/app-builder review-app-store-listing docs/APP_STORE_METADATA.md
```

---

**Day 3-4: Build & Submit**
- [ ] Create production build (EAS Build)
- [ ] Test production build on real devices
- [ ] Submit to App Store Connect (iOS)
- [ ] Submit to Google Play Console (Android)

---

**Day 5: Prepare Beta**
- [ ] Add beta testers to TestFlight
- [ ] Send beta invites
- [ ] Monitor crash reports

---

#### Week 16: Monitoring & Launch

**Day 1-2: Monitoring Setup**
- [ ] Configure Sentry error tracking
- [ ] Set up PostHog analytics dashboards
- [ ] Create Slack alerts for critical errors

**Skill Injection:** `/devops-best-practices` - Review monitoring
**Command:**
```bash
/devops-best-practices review-monitoring
```

---

**Day 3-4: Support Documentation**
- [ ] Write FAQ document
- [ ] Create troubleshooting guide
- [ ] Document API endpoints (OpenAPI spec)

---

**Day 5: Launch**
- [ ] Monitor beta feedback
- [ ] Fix critical bugs
- [ ] Prepare for public launch (Week 17+)

**Quality Gate:**
```bash
npm run test:e2e && npm run test:smoke
```

**Exit Criteria:**
- ✅ App approved by App Store + Play Store
- ✅ Beta launched successfully
- ✅ Crash-free rate >99%
- ✅ Monitoring dashboards live

---

## Skill Injection Matrix

| Phase | Week | Skill | Purpose | Command |
|-------|------|-------|---------|---------|
| **1** | 1 | `/clean-code` | Validate project structure | `/clean-code review-structure` |
| **1** | 1 | `/devops-best-practices` | Review CI/CD pipeline | `/devops-best-practices review-pipeline` |
| **1** | 1 | `/react-patterns` | Review navigation architecture | `/react-patterns review-navigation` |
| **1** | 2 | `/security-review` | Audit authentication flow | `/security-review audit-auth` |
| **1** | 2 | `/database-design` | Review WatermelonDB schema | `/database-design review-schema` |
| **2** | 3 | `/frontend-design` | Review Quran UI/UX | `/frontend-design review-screen` |
| **2** | 3 | `/react-patterns` | Review performance optimizations | `/react-patterns review-performance` |
| **2** | 4 | `/clean-code` | Review prayer service architecture | `/clean-code review-service` |
| **2** | 5 | `/app-builder` | Review Arabic learning module | `/app-builder review-feature` |
| **2** | 6 | `/security-review` | Audit CBT data flow | `/security-review audit-data-flow` |
| **3** | 7 | `/api-patterns` | Review API integration | `/api-patterns review-endpoint` |
| **3** | 8 | `/database-design` | Review progress schema | `/database-design review-schema` |
| **3** | 9 | `/app-builder` | Review IAP implementation | `/app-builder review-iap` |
| **3** | 10 | `/clean-code` | Review sync logic | `/clean-code review-service` |
| **4** | 11 | `/frontend-design` | Review design system | `/frontend-design review-design-system` |
| **4** | 12 | `/react-patterns` | Review animation patterns | `/react-patterns review-animations` |
| **4** | 13 | `/frontend-design` | Audit accessibility | `/frontend-design audit-accessibility` |
| **4** | 14 | `/react-patterns` | Review performance | `/react-patterns review-performance` |
| **5** | 15 | `/app-builder` | Review App Store listing | `/app-builder review-app-store-listing` |
| **5** | 16 | `/devops-best-practices` | Review monitoring | `/devops-best-practices review-monitoring` |

---

## Plugin Requirements

### Required Plugins

1. **ESLint Plugin** - Automated linting in CI/CD
2. **Prettier Plugin** - Code formatting enforcement
3. **TypeScript Plugin** - Type checking in editor
4. **Jest Plugin** - Test runner integration
5. **Detox Plugin** - E2E testing (mobile)
6. **Sentry Plugin** - Error tracking integration
7. **PostHog Plugin** - Analytics integration (optional)

### Optional Plugins

1. **Storybook Plugin** - Component documentation (Phase 4)
2. **Bundle Analyzer Plugin** - Performance optimization (Phase 4)
3. **Codecov Plugin** - Test coverage reporting

---

## Code Quality Gates

### Pre-Commit Hooks (Husky)

```bash
# .husky/pre-commit
npm run typecheck
npm run lint
npm run test -- --bail --findRelatedTests
```

### PR Review Checklist

- [ ] TypeScript strict mode passes (0 errors)
- [ ] ESLint passes (0 warnings)
- [ ] Test coverage >70%
- [ ] All tests passing
- [ ] No console.log statements
- [ ] Accessibility labels added
- [ ] Performance tested (no memory leaks)

### CI/CD Quality Gates

```yaml
# .github/workflows/test.yml
jobs:
  quality-gate:
    steps:
      - name: Type Check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test -- --coverage --coverageThreshold='{"global":{"lines":70}}'

      - name: Build
        run: npm run build
```

---

## Drift Detection Checkpoints

### Weekly Drift Reviews

**Every Friday:**
1. Review code changes from week
2. Check for architecture drift (e.g., new folder structure)
3. Verify no new `any` types introduced
4. Ensure no circular dependencies
5. Check bundle size hasn't grown >10%

**Template:**
```markdown
## Weekly Drift Review - Week X

### Changes Reviewed
- [x] Navigation changes
- [x] New components
- [x] New API endpoints

### Drift Detected?
- [ ] No drift
- [ ] Minor drift (acceptable)
- [ ] Major drift (requires refactor)

### Actions
- Refactor X to align with architecture
- Update documentation Y
```

---

### Phase Exit Reviews

**End of Each Phase:**
1. Paranoid engineer reviews all code
2. Check alignment with PRD
3. Verify architecture decisions
4. Test all quality gates pass

**Questions to Ask:**
- Could this be simpler?
- Does this align with our vision?
- Do we actually need this?
- Will this work on a budget phone?
- Can everyone use this (accessibility)?
- What could go wrong (security)?

---

## Conclusion

This implementation plan provides:

1. ✅ **16-week breakdown** with daily tasks
2. ✅ **Skill injections** at appropriate phases
3. ✅ **Plugin requirements** (ESLint, Prettier, Jest, Detox)
4. ✅ **Code quality gates** (pre-commit hooks, CI/CD checks)
5. ✅ **Drift detection checkpoints** (weekly reviews, phase exits)

**Next Steps:**
1. Assign agents to Phase 1 tasks
2. Set up project tracking (GitHub Projects)
3. Begin Week 1 execution

---

**Prepared by:** Paranoid Lead Engineer
**Status:** READY FOR EXECUTION
**Document Version:** 1.0
**Last Updated:** 2025-02-11
