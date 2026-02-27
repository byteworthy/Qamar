# Phase 7: Production Readiness - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship production-ready Qamar app to iOS App Store and Google Play in 1-2 weeks with comprehensive E2E testing, performance optimization, and premium polish.

**Architecture:** 5 independent parallel tracks (E2E, Performance, App Store, Visual Polish, UX Polish). Each track commits to main independently. No cross-dependencies.

**Tech Stack:** Detox E2E testing, React Native performance tools (Hermes, reanimated), App Store metadata, accessibility APIs

---

## Track 1: E2E Test Suite (20+ tests)

### Task 1.1: Fix Detox Configuration

**Files:**
- Modify: `.detoxrc.js`

**Step 1: Update app names from "myapp" to "noor"**

```bash
cd /Users/kevinrichards/projects/noor
```

Edit `.detoxrc.js`:

```javascript
// Line 15-17 (ios.debug build command)
build: "xcodebuild -workspace ios/noor.xcworkspace -scheme noor -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/noor.app",

// Line 22-24 (ios.release build command)
build: "xcodebuild -workspace ios/noor.xcworkspace -scheme noor -configuration Release -sdk iphonesimulator -derivedDataPath ios/build",
binaryPath: "ios/build/Build/Products/Release-iphonesimulator/noor.app",
```

**Step 2: Verify Detox config is valid**

Run: `npx detox test --configuration ios.sim.debug --dry-run`
Expected: No errors, "Dry run completed successfully"

**Step 3: Commit**

```bash
git add .detoxrc.js
git commit -m "test(e2e): fix Detox config with correct app name and paths"
```

---

### Task 1.2: Create E2E Test Helpers

**Files:**
- Create: `e2e/shared/helpers.js`
- Create: `e2e/shared/selectors.js`

**Step 1: Create navigation helpers**

File: `e2e/shared/helpers.js`

```javascript
// Shared E2E test helpers for Qamar app

export async function waitForElement(testID, timeout = 5000) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
}

export async function tapElement(testID) {
  await element(by.id(testID)).tap();
}

export async function navigateToTab(tabName) {
  // Tab names: 'home', 'quran', 'prayer', 'learn', 'settings'
  await tapElement(`tab-${tabName}`);
  await waitForElement(`${tabName}-screen`);
}

export async function scrollToElement(scrollViewID, elementID) {
  await element(by.id(elementID))
    .atIndex(0)
    .scrollTo('bottom');
  await waitForElement(elementID);
}

export async function typeText(inputID, text) {
  await element(by.id(inputID)).typeText(text);
}

export async function clearText(inputID) {
  await element(by.id(inputID)).clearText();
}

export async function expectVisible(testID) {
  await expect(element(by.id(testID))).toBeVisible();
}

export async function expectNotVisible(testID) {
  await expect(element(by.id(testID))).not.toBeVisible();
}

export async function reloadApp() {
  await device.reloadReactNative();
}
```

**Step 2: Create common selectors**

File: `e2e/shared/selectors.js`

```javascript
// Common element selectors for E2E tests

export const TABS = {
  home: 'tab-home',
  quran: 'tab-quran',
  prayer: 'tab-prayer',
  learn: 'tab-learn',
  settings: 'tab-settings',
};

export const ONBOARDING = {
  welcome: 'onboarding-welcome-screen',
  skip: 'onboarding-skip-button',
  next: 'onboarding-next-button',
  getStarted: 'onboarding-get-started-button',
};

export const QURAN = {
  screen: 'quran-screen',
  surahList: 'surah-list',
  verseList: 'verse-list',
  playButton: 'quran-play-button',
  pauseButton: 'quran-pause-button',
  tajweedToggle: 'quran-tajweed-toggle',
  wordByWordToggle: 'quran-word-by-word-toggle',
};

export const LEARN = {
  screen: 'learn-screen',
  hifzCard: 'learn-card-hifz',
  studyPlanCard: 'learn-card-study-plan',
  tutorCard: 'learn-card-tutor',
  pronunciationCard: 'learn-card-pronunciation',
  duaCard: 'learn-card-dua',
};

export const PREMIUM = {
  paywallModal: 'premium-paywall-modal',
  upgradeButton: 'premium-upgrade-button',
  maybeLaterButton: 'premium-maybe-later-button',
  quotaBadge: 'premium-quota-badge',
};
```

**Step 3: Commit**

```bash
git add e2e/shared/
git commit -m "test(e2e): add shared helpers and selectors"
```

---

### Task 1.3: E2E Test - Onboarding Flow

**Files:**
- Create: `e2e/flows/onboarding.test.js`

**Step 1: Write onboarding test**

File: `e2e/flows/onboarding.test.js`

```javascript
import { device, element, by, expect, waitFor } from 'detox';
import { waitForElement, tapElement, expectVisible } from '../shared/helpers';
import { ONBOARDING, TABS } from '../shared/selectors';

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should complete onboarding and land on home screen', async () => {
    // Wait for welcome screen
    await waitForElement(ONBOARDING.welcome);

    // Skip onboarding
    await tapElement(ONBOARDING.skip);

    // Should land on home tab
    await expectVisible(TABS.home);
    await expectVisible('home-screen');
  });

  it('should show feature preview on welcome screen', async () => {
    await device.launchApp({ newInstance: true });

    // Welcome screen should have feature carousel
    await expectVisible(ONBOARDING.welcome);
    await expectVisible('feature-preview-carousel');
  });
});
```

**Step 2: Add testID props to onboarding screens**

Modify: `client/screens/onboarding/WelcomeScreen.tsx`

Add `testID="onboarding-welcome-screen"` to root View.
Add `testID="onboarding-skip-button"` to skip button.
Add `testID="feature-preview-carousel"` to carousel View.

Modify: `client/screens/onboarding/PrivacyScreen.tsx`

Add `testID="onboarding-privacy-screen"` to root View.

Modify: `client/screens/onboarding/SafetyScreen.tsx`

Add `testID="onboarding-safety-screen"` to root View.

**Step 3: Add testID to tab bar**

Modify: `client/navigation/RootStackNavigator.tsx` or wherever tab bar is defined.

Add `testID="tab-home"`, `testID="tab-quran"`, etc. to each tab button.

**Step 4: Run onboarding test**

```bash
npm run build:e2e:ios
npm run test:e2e:ios -- e2e/flows/onboarding.test.js
```

Expected: Tests pass

**Step 5: Commit**

```bash
git add e2e/flows/onboarding.test.js client/screens/onboarding/ client/navigation/
git commit -m "test(e2e): add onboarding flow test with testIDs"
```

---

### Task 1.4: E2E Test - Quran Reader + Audio

**Files:**
- Create: `e2e/flows/quran-reader.test.js`

**Step 1: Write Quran reader test**

File: `e2e/flows/quran-reader.test.js`

```javascript
import { device, element, by, expect } from 'detox';
import { waitForElement, tapElement, navigateToTab, expectVisible } from '../shared/helpers';
import { QURAN, TABS } from '../shared/selectors';

describe('Quran Reader + Audio', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    // Skip onboarding if present
    try {
      await tapElement('onboarding-skip-button');
    } catch (e) {
      // Already past onboarding
    }
  });

  it('should open Quran reader and display Al-Fatiha', async () => {
    await navigateToTab('quran');
    await expectVisible(QURAN.screen);

    // Tap on Al-Fatiha (first surah)
    await tapElement('surah-card-1');

    // Should show verse list
    await expectVisible(QURAN.verseList);
    await expectVisible('verse-1-1'); // Al-Fatiha verse 1
  });

  it('should play audio when play button is tapped', async () => {
    await navigateToTab('quran');
    await tapElement('surah-card-1'); // Al-Fatiha

    // Tap play button
    await tapElement(QURAN.playButton);

    // Pause button should be visible (play → pause transition)
    await expectVisible(QURAN.pauseButton);
  });

  it('should toggle tajweed colors', async () => {
    await navigateToTab('quran');
    await tapElement('surah-card-1');

    // Tap tajweed toggle
    await tapElement(QURAN.tajweedToggle);

    // Tajweed colors should be visible
    await expectVisible('tajweed-colored-text');
  });

  it('should toggle word-by-word mode', async () => {
    await navigateToTab('quran');
    await tapElement('surah-card-1');

    // Tap word-by-word toggle
    await tapElement(QURAN.wordByWordToggle);

    // Word-by-word player should be visible
    await expectVisible('word-by-word-player');
  });
});
```

**Step 2: Add testIDs to Quran screens**

Modify: `client/screens/quran/QuranReaderScreen.tsx`

Add `testID="quran-screen"` to root View.
Add `testID="surah-list"` to FlatList.
Add `testID={`surah-card-${surah.id}`}` to each surah card.

Modify: `client/screens/quran/VerseReaderScreen.tsx`

Add `testID="verse-list"` to FlatList.
Add `testID={`verse-${surahNumber}-${verse.number}`}` to each verse.
Add `testID="quran-play-button"` to play button.
Add `testID="quran-pause-button"` to pause button.
Add `testID="quran-tajweed-toggle"` to tajweed toggle.
Add `testID="quran-word-by-word-toggle"` to word-by-word toggle.

**Step 3: Run test**

```bash
npm run test:e2e:ios -- e2e/flows/quran-reader.test.js
```

Expected: Tests pass

**Step 4: Commit**

```bash
git add e2e/flows/quran-reader.test.js client/screens/quran/
git commit -m "test(e2e): add Quran reader and audio playback tests"
```

---

### Task 1.5: E2E Test - Hifz Recitation Flow

**Files:**
- Create: `e2e/flows/hifz-recitation.test.js`

**Step 1: Write Hifz test**

File: `e2e/flows/hifz-recitation.test.js`

```javascript
import { device } from 'detox';
import { waitForElement, tapElement, navigateToTab, expectVisible } from '../shared/helpers';
import { LEARN } from '../shared/selectors';

describe('Hifz Memorization Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    try {
      await tapElement('onboarding-skip-button');
    } catch (e) {}
  });

  it('should open Hifz dashboard from Learn tab', async () => {
    await navigateToTab('learn');
    await expectVisible(LEARN.screen);

    // Tap Hifz feature card
    await tapElement(LEARN.hifzCard);

    // Should show Hifz dashboard
    await expectVisible('hifz-dashboard-screen');
    await expectVisible('hifz-progress-map');
  });

  it('should start recitation mode for a verse', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.hifzCard);

    // Tap on Al-Fatiha in progress map
    await tapElement('hifz-surah-1');

    // Should show recitation screen
    await expectVisible('hifz-recitation-screen');
    await expectVisible('hifz-verse-text');
  });

  it('should show hidden verse mode toggle', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.hifzCard);
    await tapElement('hifz-surah-1');

    // Hidden verse toggle should be visible
    await expectVisible('hifz-hidden-verse-toggle');

    // Tap to enable
    await tapElement('hifz-hidden-verse-toggle');

    // Verse should be hidden
    await expectVisible('hifz-hidden-verse-placeholder');
  });
});
```

**Step 2: Add testIDs to Hifz screens**

Modify: `client/screens/hifz/HifzDashboardScreen.tsx`

Add `testID="hifz-dashboard-screen"`, `testID="hifz-progress-map"`, `testID={`hifz-surah-${surah.number}`}`.

Modify: `client/screens/hifz/HifzRecitationScreen.tsx`

Add `testID="hifz-recitation-screen"`, `testID="hifz-verse-text"`, `testID="hifz-hidden-verse-toggle"`, `testID="hifz-hidden-verse-placeholder"`.

Modify: `client/screens/learn/LearnTabScreen.tsx`

Add `testID="learn-card-hifz"` to Hifz feature card.

**Step 3: Run test**

```bash
npm run test:e2e:ios -- e2e/flows/hifz-recitation.test.js
```

Expected: Tests pass

**Step 4: Commit**

```bash
git add e2e/flows/hifz-recitation.test.js client/screens/hifz/ client/screens/learn/
git commit -m "test(e2e): add Hifz recitation flow test"
```

---

### Task 1.6: E2E Test - Study Plan Generation

**Files:**
- Create: `e2e/flows/study-plan.test.js`

**Step 1: Write study plan test**

File: `e2e/flows/study-plan.test.js`

```javascript
import { device } from 'detox';
import { waitForElement, tapElement, navigateToTab, expectVisible } from '../shared/helpers';
import { LEARN } from '../shared/selectors';

describe('Study Plan Generation', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    try {
      await tapElement('onboarding-skip-button');
    } catch (e) {}
  });

  it('should open study plan screen from Learn tab', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.studyPlanCard);

    await expectVisible('study-plan-screen');
  });

  it('should show onboarding for first-time user', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.studyPlanCard);

    // Should show onboarding if no plan exists
    await expectVisible('study-plan-onboarding');
  });

  it('should generate study plan after completing onboarding', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.studyPlanCard);

    // Complete onboarding
    await tapElement('study-plan-goal-memorize');
    await tapElement('study-plan-next');
    await tapElement('study-plan-time-20min');
    await tapElement('study-plan-next');
    await tapElement('study-plan-skill-intermediate');
    await tapElement('study-plan-generate');

    // Should show loading state
    await expectVisible('study-plan-generating');

    // Should show weekly calendar after generation (wait up to 30s)
    await waitForElement('study-plan-weekly-view', 30000);
  });
});
```

**Step 2: Add testIDs to study plan screens**

Modify: `client/screens/learn/StudyPlanScreen.tsx`

Add `testID="study-plan-screen"`, `testID="study-plan-weekly-view"`.

Modify: `client/components/StudyPlanOnboarding.tsx`

Add `testID="study-plan-onboarding"`, `testID="study-plan-goal-memorize"`, `testID="study-plan-next"`, etc.

Modify: `client/screens/learn/LearnTabScreen.tsx`

Add `testID="learn-card-study-plan"` to Study Plan feature card.

**Step 3: Run test**

```bash
npm run test:e2e:ios -- e2e/flows/study-plan.test.js
```

Expected: Tests pass

**Step 4: Commit**

```bash
git add e2e/flows/study-plan.test.js client/screens/learn/ client/components/
git commit -m "test(e2e): add study plan generation flow test"
```

---

### Task 1.7: E2E Test - Premium Paywall

**Files:**
- Create: `e2e/flows/premium-paywall.test.js`

**Step 1: Write premium paywall test**

File: `e2e/flows/premium-paywall.test.js`

```javascript
import { device } from 'detox';
import { waitForElement, tapElement, navigateToTab, expectVisible } from '../shared/helpers';
import { LEARN, PREMIUM } from '../shared/selectors';

describe('Premium Paywall', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true, delete: true }); // Fresh app state
    try {
      await tapElement('onboarding-skip-button');
    } catch (e) {}
  });

  it('should show quota badge on tutor screen', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.tutorCard);

    // Quota badge should be visible
    await expectVisible(PREMIUM.quotaBadge);
  });

  it('should show paywall after hitting free quota', async () => {
    await navigateToTab('learn');
    await tapElement(LEARN.studyPlanCard);

    // Generate 3 study plans to hit quota
    for (let i = 0; i < 3; i++) {
      // Complete onboarding and generate
      // (Simplified - actual implementation would navigate through onboarding)
      await tapElement('study-plan-generate');
      await waitForElement('study-plan-weekly-view', 30000);
      await device.pressBack(); // Go back to study plan screen
    }

    // Try to generate 4th plan
    await tapElement('study-plan-generate');

    // Should show paywall
    await expectVisible(PREMIUM.paywallModal);
    await expectVisible(PREMIUM.upgradeButton);
    await expectVisible(PREMIUM.maybeLaterButton);
  });

  it('should dismiss paywall when "Maybe Later" is tapped', async () => {
    // Trigger paywall (assuming quota hit)
    await navigateToTab('learn');
    await tapElement(LEARN.tutorCard);
    // ... trigger quota limit ...

    await expectVisible(PREMIUM.paywallModal);
    await tapElement(PREMIUM.maybeLaterButton);

    // Paywall should be dismissed
    await expect(element(by.id(PREMIUM.paywallModal))).not.toBeVisible();
  });
});
```

**Step 2: Add testIDs to premium components**

Modify: `client/components/PremiumUpsell.tsx`

Add `testID="premium-paywall-modal"`, `testID="premium-upgrade-button"`, `testID="premium-maybe-later-button"`.

Modify: `client/components/DailyQuotaBadge.tsx`

Add `testID="premium-quota-badge"`.

**Step 3: Run test**

```bash
npm run test:e2e:ios -- e2e/flows/premium-paywall.test.js
```

Expected: Tests pass

**Step 4: Commit**

```bash
git add e2e/flows/premium-paywall.test.js client/components/
git commit -m "test(e2e): add premium paywall and quota tests"
```

---

### Task 1.8: E2E Test - Offline Mode

**Files:**
- Create: `e2e/flows/offline-mode.test.js`

**Step 1: Write offline mode test**

File: `e2e/flows/offline-mode.test.js`

```javascript
import { device } from 'detox';
import { waitForElement, tapElement, navigateToTab, expectVisible } from '../shared/helpers';
import { QURAN, LEARN } from '../shared/selectors';

describe('Offline Mode', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    try {
      await tapElement('onboarding-skip-button');
    } catch (e) {}
  });

  it('should show offline banner when network is disabled', async () => {
    // Disable network
    await device.setURLBlacklist(['.*']);

    // Reload app to detect offline state
    await device.reloadReactNative();

    // Should show offline banner
    await expectVisible('offline-banner');
  });

  it('should allow Quran reader to work offline', async () => {
    // Disable network
    await device.setURLBlacklist(['.*']);

    await navigateToTab('quran');
    await tapElement('surah-card-1');

    // Quran reader should still work (cached data)
    await expectVisible(QURAN.verseList);
    await expectVisible('verse-1-1');
  });

  it('should disable online-only features when offline', async () => {
    await device.setURLBlacklist(['.*']);
    await device.reloadReactNative();

    await navigateToTab('learn');

    // Online-only features should be disabled
    await expect(element(by.id(LEARN.tutorCard))).toHaveToggleValue(false);
    await expectVisible('requires-internet-badge');
  });

  it('should restore online features when network is enabled', async () => {
    // Disable network
    await device.setURLBlacklist(['.*']);
    await device.reloadReactNative();
    await expectVisible('offline-banner');

    // Re-enable network
    await device.setURLBlacklist([]);
    await device.reloadReactNative();

    // Offline banner should disappear
    await expect(element(by.id('offline-banner'))).not.toBeVisible();

    // Online features should be enabled
    await navigateToTab('learn');
    await tapElement(LEARN.tutorCard);
    await expectVisible('arabic-tutor-screen');
  });
});
```

**Step 2: Add testIDs for offline mode**

Modify: `client/components/OfflineBanner.tsx` (create if doesn't exist)

Add `testID="offline-banner"`.

Modify: `client/screens/learn/LearnTabScreen.tsx`

Add `testID="requires-internet-badge"` to "Requires Internet" badges on online-only features.

**Step 3: Run test**

```bash
npm run test:e2e:ios -- e2e/flows/offline-mode.test.js
```

Expected: Tests pass

**Step 4: Commit**

```bash
git add e2e/flows/offline-mode.test.js client/components/ client/screens/learn/
git commit -m "test(e2e): add offline mode tests"
```

---

### Task 1.9: Create Comprehensive Regression Test

**Files:**
- Create: `e2e/regression.test.js`

**Step 1: Write regression smoke test**

File: `e2e/regression.test.js`

```javascript
import { device } from 'detox';
import { waitForElement, tapElement, navigateToTab, expectVisible } from './shared/helpers';

describe('Regression Smoke Test', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should launch app successfully', async () => {
    await expectVisible('onboarding-welcome-screen');
  });

  it('should navigate to all 5 tabs', async () => {
    await tapElement('onboarding-skip-button');

    // Home tab
    await navigateToTab('home');
    await expectVisible('home-screen');

    // Quran tab
    await navigateToTab('quran');
    await expectVisible('quran-screen');

    // Prayer tab
    await navigateToTab('prayer');
    await expectVisible('prayer-screen');

    // Learn tab
    await navigateToTab('learn');
    await expectVisible('learn-screen');

    // Settings tab
    await navigateToTab('settings');
    await expectVisible('settings-screen');
  });

  it('should open all Learn tab features', async () => {
    await navigateToTab('learn');

    // Hifz
    await tapElement('learn-card-hifz');
    await expectVisible('hifz-dashboard-screen');
    await device.pressBack();

    // Study Plan
    await tapElement('learn-card-study-plan');
    await expectVisible('study-plan-screen');
    await device.pressBack();

    // Arabic Tutor
    await tapElement('learn-card-tutor');
    await expectVisible('arabic-tutor-screen');
    await device.pressBack();

    // Pronunciation Coach
    await tapElement('learn-card-pronunciation');
    await expectVisible('pronunciation-coach-screen');
    await device.pressBack();

    // Dua Finder
    await tapElement('learn-card-dua');
    await expectVisible('dua-finder-screen');
    await device.pressBack();
  });
});
```

**Step 2: Add missing testIDs to screens**

Ensure all screens referenced in regression test have `testID` on root View:
- `home-screen`
- `prayer-screen`
- `settings-screen`
- `arabic-tutor-screen`
- `pronunciation-coach-screen`
- `dua-finder-screen`

**Step 3: Run regression test**

```bash
npm run test:e2e:ios -- e2e/regression.test.js
```

Expected: All tests pass

**Step 4: Commit**

```bash
git add e2e/regression.test.js client/screens/
git commit -m "test(e2e): add comprehensive regression smoke test"
```

---

### Task 1.10: Setup E2E CI Workflow

**Files:**
- Create: `.github/workflows/e2e-ios.yml`
- Create: `.github/workflows/e2e-android.yml`

**Step 1: Create iOS E2E workflow**

File: `.github/workflows/e2e-ios.yml`

```yaml
name: E2E Tests (iOS)

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  e2e-ios:
    runs-on: macos-14
    timeout-minutes: 45

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build iOS app for Detox
        run: npm run build:e2e:ios:release

      - name: Run Detox E2E tests
        run: npm run test:e2e:ios:release

      - name: Upload test artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-artifacts-ios
          path: |
            e2e/artifacts/
            DetoxScreenshots/
```

**Step 2: Create Android E2E workflow**

File: `.github/workflows/e2e-android.yml`

```yaml
name: E2E Tests (Android)

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  e2e-android:
    runs-on: ubuntu-latest
    timeout-minutes: 45

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install dependencies
        run: npm ci

      - name: Build Android app for Detox
        run: npm run build:e2e:android:release

      - name: Run Detox E2E tests
        run: npm run test:e2e:android:release

      - name: Upload test artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-artifacts-android
          path: |
            e2e/artifacts/
            DetoxScreenshots/
```

**Step 3: Test workflows locally (optional)**

```bash
# Install act (GitHub Actions local runner)
brew install act

# Test iOS workflow
act -j e2e-ios
```

**Step 4: Commit**

```bash
git add .github/workflows/
git commit -m "ci: add E2E test workflows for iOS and Android"
```

---

## Track 2: Performance Optimization

### Task 2.1: Bundle Size Analysis & Asset Optimization

**Files:**
- Modify: `assets/images/` (compress images)
- Create: `scripts/compress-assets.sh`

**Step 1: Analyze current bundle size**

```bash
npm run bundle:analyze
```

Expected output: Total bundle size (target: < 30MB)

**Step 2: Create asset compression script**

File: `scripts/compress-assets.sh`

```bash
#!/bin/bash
# Compress all PNG images in assets/

echo "Compressing images with pngquant..."

find assets/images -name "*.png" -print0 | while IFS= read -r -d '' file; do
  pngquant --force --quality=65-80 --output "$file" "$file"
  echo "Compressed: $file"
done

echo "Done! Re-run npm run bundle:analyze to verify size reduction."
```

**Step 3: Make script executable and run**

```bash
chmod +x scripts/compress-assets.sh
./scripts/compress-assets.sh
```

Expected: Images compressed by 20-40%

**Step 4: Re-analyze bundle**

```bash
npm run bundle:analyze
```

Expected: Bundle size reduced

**Step 5: Commit**

```bash
git add assets/ scripts/compress-assets.sh
git commit -m "perf: compress PNG assets with pngquant"
```

---

### Task 2.2: Remove Unused Dependencies & Tree-Shake

**Files:**
- Modify: `package.json`
- Modify: `babel.config.js`

**Step 1: Audit dependencies**

```bash
npx depcheck
```

Expected: List of unused dependencies

**Step 2: Remove unused dependencies (if any)**

```bash
npm uninstall <unused-dep-1> <unused-dep-2>
```

**Step 3: Enable production console.log removal**

Modify: `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... existing plugins ...
      [
        'transform-remove-console',
        { exclude: ['error', 'warn'] }, // Keep errors and warnings
      ],
    ],
  };
};
```

**Step 4: Verify tree-shaking is enabled**

Check `metro.config.js` has:

```javascript
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
    },
  },
};
```

**Step 5: Test production build**

```bash
npm run expo:static:build
```

Expected: No errors, console.logs removed

**Step 6: Commit**

```bash
git add package.json babel.config.js
git commit -m "perf: enable console.log removal in production builds"
```

---

### Task 2.3: Lazy Load Heavy Screens

**Files:**
- Modify: `client/navigation/RootStackNavigator.tsx`

**Step 1: Wrap heavy screens in React.lazy()**

Modify: `client/navigation/RootStackNavigator.tsx`

```typescript
import React, { Suspense } from 'react';

// Lazy load heavy screens
const HifzDashboardScreen = React.lazy(() => import('../screens/hifz/HifzDashboardScreen'));
const HifzRecitationScreen = React.lazy(() => import('../screens/hifz/HifzRecitationScreen'));
const StudyPlanScreen = React.lazy(() => import('../screens/learn/StudyPlanScreen'));
const ArabicTutorScreen = React.lazy(() => import('../screens/learn/ArabicTutorScreen'));
const PronunciationCoachScreen = React.lazy(() => import('../screens/learn/PronunciationCoachScreen'));

// Loading fallback
function ScreenLoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF8F3' }}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}

// Wrap screens in Suspense
function LazyScreen({ component: Component, ...props }: any) {
  return (
    <Suspense fallback={<ScreenLoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

// Use in stack navigator
<Stack.Screen
  name="HifzDashboard"
  component={() => <LazyScreen component={HifzDashboardScreen} />}
/>
```

**Step 2: Test lazy loading**

```bash
npm run expo:dev
```

Expected: Screens load on-demand, initial bundle smaller

**Step 3: Commit**

```bash
git add client/navigation/RootStackNavigator.tsx
git commit -m "perf: lazy load heavy screens with React.lazy"
```

---

### Task 2.4: Optimize FlatList Performance

**Files:**
- Modify: All screens with FlatList components

**Step 1: Add getItemLayout to Quran verse list**

Modify: `client/screens/quran/VerseReaderScreen.tsx`

```typescript
const VERSE_ITEM_HEIGHT = 120; // Approximate height per verse

<FlatList
  data={verses}
  keyExtractor={(item) => `${item.number}`}
  renderItem={renderVerse}
  // Performance optimizations
  getItemLayout={(data, index) => ({
    length: VERSE_ITEM_HEIGHT,
    offset: VERSE_ITEM_HEIGHT * index,
    index,
  })}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  initialNumToRender={5}
/>
```

**Step 2: Apply same optimizations to Hifz progress grid**

Modify: `client/screens/hifz/HifzDashboardScreen.tsx`

Add `getItemLayout`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`.

**Step 3: Apply to Learn tab feature grid**

Modify: `client/screens/learn/LearnTabScreen.tsx`

Add FlatList optimizations.

**Step 4: Test scrolling performance**

```bash
npm run expo:dev
```

Expected: Smooth 60fps scrolling on Quran reader, no jank

**Step 5: Commit**

```bash
git add client/screens/
git commit -m "perf: optimize FlatList with getItemLayout and rendering optimizations"
```

---

### Task 2.5: Profile and Fix Re-Render Issues

**Files:**
- Modify: Multiple component files (based on profiling)

**Step 1: Enable React DevTools Profiler**

```bash
npm run expo:dev
# Open React DevTools in browser
```

**Step 2: Profile Quran reader scrolling**

- Open Quran reader
- Start profiling
- Scroll through verses
- Stop profiling
- Identify components with excessive re-renders

**Step 3: Memoize expensive components**

Example: `client/components/VerseText.tsx`

```typescript
import React, { memo } from 'react';

export const VerseText = memo(({ verse, tajweedEnabled }: VerseTextProps) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if verse or tajweedEnabled changed
  return prevProps.verse.number === nextProps.verse.number &&
         prevProps.tajweedEnabled === nextProps.tajweedEnabled;
});
```

**Step 4: Use useCallback for function props**

Example: `client/screens/quran/VerseReaderScreen.tsx`

```typescript
const handlePlayAudio = useCallback(() => {
  // Audio play logic
}, [currentVerse]);

const handleToggleTajweed = useCallback(() => {
  setTajweedEnabled(prev => !prev);
}, []);
```

**Step 5: Re-profile and verify improvement**

Expected: < 16ms render time (60fps)

**Step 6: Commit**

```bash
git add client/components/ client/screens/
git commit -m "perf: memoize components and use useCallback to prevent re-renders"
```

---

## Track 3: App Store Content

### Task 3.1: Create iOS Screenshot Assets

**Files:**
- Create: `docs/app-store/ios/screenshots/` (8 PNG files)

**Step 1: Take 8 screenshots using simulator**

```bash
# Launch iOS simulator
npm run ios

# Navigate to each screen and take screenshots:
# 1. Quran reader with tajweed + word-by-word
# 2. Learn hub feature grid
# 3. Hifz progress map + hidden verse
# 4. Prayer times + qibla
# 5. Arabic tutor chat
# 6. Study plan calendar
# 7. Quran audio reciter selection
# 8. Dark mode screenshot

# Save screenshots to: docs/app-store/ios/screenshots/
```

**Step 2: Add device frames using Shotbot or Figma**

- Upload screenshots to Shotbot.io or Figma
- Apply iPhone 16 Pro Max device frames
- Export at 1290 x 2796 px
- Save as `01-hero-quran.png`, `02-learn-hub.png`, etc.

**Step 3: Verify screenshot quality**

```bash
# Check file sizes
ls -lh docs/app-store/ios/screenshots/
```

Expected: Each screenshot < 5MB, clear and readable

**Step 4: Commit**

```bash
git add docs/app-store/ios/screenshots/
git commit -m "assets: add iOS App Store screenshots (8 screens)"
```

---

### Task 3.2: Write iOS App Store Metadata

**Files:**
- Create: `docs/app-store/ios/description.md`
- Create: `docs/app-store/ios/keywords.txt`
- Create: `docs/app-store/ios/promotional-text.md`
- Create: `docs/app-store/ios/privacy-labels.md`

**Step 1: Write App Store description**

File: `docs/app-store/ios/description.md`

```markdown
# Qamar - Your Islamic Companion

## Subtitle (30 char)
Quran, Prayer, Arabic & Reflection

## Promotional Text (170 char)
New: Personalized weekly study plans! Let Qamar create a custom Quran learning schedule that adapts to your pace and goals.

## Description (4000 char)

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

**Step 2: Write keywords**

File: `docs/app-store/ios/keywords.txt`

```
quran,prayer times,qibla,arabic,muslim,islam,tajweed,hifz,hadith,dua
```

**Step 3: Write promotional text**

File: `docs/app-store/ios/promotional-text.md`

```
New: Personalized weekly study plans! Let Qamar create a custom Quran learning schedule that adapts to your pace and goals.
```

**Step 4: Write privacy labels**

File: `docs/app-store/ios/privacy-labels.md`

```markdown
# iOS Privacy Nutrition Labels

## Data Not Collected
We do not collect any data from this app.

## Data Linked to You
None

## Data Used to Track You
None

## App Privacy Details
- Location data is used only for prayer time calculations and is never sent to servers
- Microphone is used only for pronunciation recording and stays on-device
- All user data (reflections, progress) is stored locally on device
- No analytics, no tracking, no data sharing
```

**Step 5: Commit**

```bash
git add docs/app-store/ios/
git commit -m "docs: add iOS App Store metadata (description, keywords, privacy)"
```

---

### Task 3.3: Create Android Screenshots & Metadata

**Files:**
- Create: `docs/app-store/android/screenshots/phone/` (8 PNG files)
- Create: `docs/app-store/android/description.md`
- Create: `docs/app-store/android/short-description.txt`
- Create: `docs/app-store/android/feature-graphic.png`

**Step 1: Take Android phone screenshots**

```bash
# Launch Android emulator
npm run android

# Take same 8 screenshots as iOS
# Save to: docs/app-store/android/screenshots/phone/
```

**Step 2: Apply Pixel 8 Pro device frames**

- Upload to Shotbot or Figma
- Apply Pixel 8 Pro frames (1440 x 3120 px)
- Export and save

**Step 3: Write short description**

File: `docs/app-store/android/short-description.txt`

```
Complete Islamic companion: Quran, prayer times, Arabic learning & reflection
```

**Step 4: Write full description**

File: `docs/app-store/android/description.md`

```markdown
# Qamar - Your Complete Islamic Companion

Why have 5 Islamic apps when Qamar does it all?

Qamar is your complete Islamic companion — combining a full Quran reader, Arabic learning suite, prayer times, memorization tools, and guided reflection. All ad-free, offline-capable, and beautifully designed for Android.

[Same content as iOS description, with Android-specific mentions like Material You theming]

MATERIAL YOU THEMING
• Dynamic color theming based on your wallpaper
• Seamless Android integration
• Adaptive widgets (coming soon)

[Rest of description...]
```

**Step 5: Create feature graphic**

- Use Figma or Canva
- Size: 1024 x 500 px
- Include: Qamar logo + tagline + 3-4 key feature icons
- Export as `feature-graphic.png`

**Step 6: Commit**

```bash
git add docs/app-store/android/
git commit -m "docs: add Android Google Play metadata and screenshots"
```

---

### Task 3.4: Create App Preview Video Script

**Files:**
- Create: `docs/app-store/video/script.md`

**Step 1: Write 30-second video script**

File: `docs/app-store/video/script.md`

```markdown
# Qamar App Preview Video Script (30 seconds)

## Shots

**0-5s: Hero Shot**
- Open: Quran reader with Al-Fatiha
- Tap tajweed toggle → colors fade in
- Tap word-by-word → first word highlights
- Audio plays with word highlighting
- Text overlay: "Read the Quran with tajweed & word-by-word audio"

**6-10s: Prayer Times**
- Transition to Prayer Times screen
- Show beautiful prayer time cards
- Qibla compass needle rotates
- Text overlay: "Never miss prayer"

**11-15s: Hifz Memorization**
- Transition to Hifz dashboard
- Progress map shows filled cells
- Tap verse → hidden verse mode
- Record button pulsing
- Text overlay: "Memorize with spaced repetition"

**16-20s: Study Plan**
- Transition to Study Plan calendar
- Weekly view with daily tasks
- Checkmark animation on task completion
- Text overlay: "Personalized weekly plans"

**21-25s: Arabic Tutor**
- Transition to Arabic Tutor chat
- Type message → response appears
- Text overlay: "Learn Arabic with personalized coaching"

**26-30s: Closing**
- Montage: Quran → Prayer → Hifz → Arabic
- Qamar logo appears
- Text: "One app instead of five"
- Text: "Download Qamar"
- App Store / Google Play badge

## Audio
- Soft Quran recitation in background (Alafasy, Al-Fatiha)
- Subtle transition sounds between screens
- No voiceover (music/SFX only)

## Recording Notes
- Use iOS simulator for clean recording
- Screen recording at 60fps
- Edit in iMovie or Final Cut Pro
- Export as MP4 (1920x1080, 30fps)
```

**Step 2: Commit script**

```bash
git add docs/app-store/video/
git commit -m "docs: add app preview video script"
```

---

## Track 4: Visual Polish

### Task 4.1: Add Loading States to API Calls

**Files:**
- Modify: `client/hooks/useStudyPlan.ts`
- Modify: `client/hooks/useTafsir.ts`
- Create: `client/components/SkeletonLoader.tsx`

**Step 1: Create skeleton loader component**

File: `client/components/SkeletonLoader.tsx`

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export function SkeletonLoader({ width, height, borderRadius = 8 }: SkeletonLoaderProps) {
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: withRepeat(
        withTiming(0.5, { duration: 1000, easing: Easing.ease }),
        -1,
        true
      ),
    };
  });

  return (
    <Animated.View style={[styles.skeleton, { width, height, borderRadius }, shimmerStyle]}>
      <LinearGradient
        colors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  },
});
```

**Step 2: Add loading skeleton to study plan screen**

Modify: `client/screens/learn/StudyPlanScreen.tsx`

```typescript
import { SkeletonLoader } from '@/components/SkeletonLoader';

function StudyPlanLoadingSkeleton() {
  return (
    <View style={styles.loadingContainer}>
      <SkeletonLoader width="100%" height={100} />
      <View style={{ height: 16 }} />
      <SkeletonLoader width="100%" height={80} />
      <View style={{ height: 16 }} />
      <SkeletonLoader width="100%" height={80} />
    </View>
  );
}

// In render:
{isGenerating ? (
  <StudyPlanLoadingSkeleton />
) : (
  <WeeklyView plan={currentPlan} />
)}
```

**Step 3: Add loading skeleton to tafsir panel**

Modify: `client/components/TafsirPanel.tsx`

```typescript
function TafsirLoadingSkeleton() {
  return (
    <View style={styles.skeleton}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.section}>
          <SkeletonLoader width={120} height={20} />
          <View style={{ height: 8 }} />
          <SkeletonLoader width="100%" height={60} />
        </View>
      ))}
    </View>
  );
}

// In render:
{isLoading ? <TafsirLoadingSkeleton /> : <TafsirContent sections={sections} />}
```

**Step 4: Test loading states**

```bash
npm run expo:dev
```

Expected: Smooth skeleton shimmer animation, no flashing

**Step 5: Commit**

```bash
git add client/components/SkeletonLoader.tsx client/screens/ client/components/
git commit -m "feat(ui): add skeleton loading states for API calls"
```

---

### Task 4.2: Add Empty States to All Screens

**Files:**
- Create: `client/components/EmptyState.tsx`
- Modify: Multiple screen files

**Step 1: Create empty state component**

File: `client/components/EmptyState.tsx`

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}15` }]}>
        <Feather name={icon} size={48} color={theme.primary} />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        {description}
      </ThemedText>
      {actionLabel && onAction && (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
```

**Step 2: Add empty state to study plan screen**

Modify: `client/screens/learn/StudyPlanScreen.tsx`

```typescript
import { EmptyState } from '@/components/EmptyState';

// In render:
{!currentPlan ? (
  <EmptyState
    icon="calendar"
    title="No Study Plan Yet"
    description="Create your first personalized study plan to start your Quran learning journey"
    actionLabel="Create Study Plan"
    onAction={() => setShowOnboarding(true)}
  />
) : (
  <WeeklyView plan={currentPlan} />
)}
```

**Step 3: Add empty states to other screens**

- Hifz dashboard (no progress yet)
- Dua finder (no favorites)
- Conversation history (no messages)

**Step 4: Test empty states**

```bash
npm run expo:dev
```

Expected: Beautiful empty states with clear CTAs

**Step 5: Commit**

```bash
git add client/components/EmptyState.tsx client/screens/
git commit -m "feat(ui): add empty states with illustrations and CTAs"
```

---

### Task 4.3: Add Error States

**Files:**
- Create: `client/components/ErrorState.tsx`
- Modify: API hooks to use error state

**Step 1: Create error state component**

File: `client/components/ErrorState.tsx`

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry
}: ErrorStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: '#FF634715' }]}>
        <Feather name="alert-circle" size={48} color="#FF6347" />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </ThemedText>
      {onRetry && (
        <Button onPress={onRetry} style={styles.button}>
          Try Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
```

**Step 2: Use error state in study plan hook**

Modify: `client/hooks/useStudyPlan.ts`

```typescript
import { ErrorState } from '@/components/ErrorState';

// In component using hook:
{error ? (
  <ErrorState
    message="Couldn't generate study plan. Check your connection and try again."
    onRetry={() => generatePlan(lastInput)}
  />
) : (
  // Normal content
)}
```

**Step 3: Add error handling to all API hooks**

- `useTafsir.ts`
- `useVerseConversation.ts`
- `useDuaRecommender.ts`
- `useAITutor.ts`

**Step 4: Test error states**

```bash
# Simulate network error by disabling server
npm run expo:dev
```

Expected: User-friendly error messages with retry button

**Step 5: Commit**

```bash
git add client/components/ErrorState.tsx client/hooks/
git commit -m "feat(ui): add error states with retry functionality"
```

---

### Task 4.4: Enhance Animations with Reanimated

**Files:**
- Modify: `client/components/FeatureCard.tsx`
- Modify: `client/screens/hifz/HifzProgressMap.tsx`

**Step 1: Add spring animation to card press**

Modify: `client/components/FeatureCard.tsx` or `client/screens/learn/LearnTabScreen.tsx`

```typescript
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function FeatureCard({ onPress }: FeatureCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* Card content */}
      </Pressable>
    </Animated.View>
  );
}
```

**Step 2: Add staggered animation to Hifz progress cells**

Modify: `client/screens/hifz/HifzProgressMap.tsx`

```typescript
import Animated, { FadeInUp } from 'react-native-reanimated';

{juzList.map((juz, index) => (
  <Animated.View
    key={juz.number}
    entering={FadeInUp.duration(300).delay(index * 50)}
  >
    <JuzCell juz={juz} onPress={() => handleJuzPress(juz)} />
  </Animated.View>
))}
```

**Step 3: Add fade-in animation to tajweed colors**

Modify: `client/components/TajweedText.tsx`

```typescript
import Animated, { FadeIn } from 'react-native-reanimated';

{tajweedEnabled && (
  <Animated.View entering={FadeIn.duration(500)}>
    <TajweedColoredText text={text} />
  </Animated.View>
)}
```

**Step 4: Test animations at 60fps**

```bash
npm run expo:dev
```

Expected: Smooth spring animations, no frame drops

**Step 5: Commit**

```bash
git add client/components/ client/screens/
git commit -m "feat(ui): add smooth spring and fade animations with reanimated"
```

---

### Task 4.5: Accessibility - VoiceOver Support

**Files:**
- Modify: All interactive components

**Step 1: Add accessibility labels to Quran reader**

Modify: `client/screens/quran/VerseReaderScreen.tsx`

```typescript
<Pressable
  onPress={handlePlay}
  accessibilityRole="button"
  accessibilityLabel="Play Quran recitation"
  accessibilityHint="Double tap to play audio"
  testID="quran-play-button"
>
  <Feather name="play" size={24} />
</Pressable>

<Pressable
  onPress={handleToggleTajweed}
  accessibilityRole="switch"
  accessibilityLabel="Tajweed colors"
  accessibilityState={{ checked: tajweedEnabled }}
  accessibilityHint="Double tap to toggle tajweed color-coding"
  testID="quran-tajweed-toggle"
>
  <ThemedText>Tajweed</ThemedText>
</Pressable>
```

**Step 2: Add accessibility to Hifz cells**

Modify: `client/screens/hifz/HifzProgressMap.tsx`

```typescript
<Pressable
  onPress={() => onPress(juz)}
  accessibilityRole="button"
  accessibilityLabel={`Juz ${juz.number}, ${juz.completedVerses} of ${juz.totalVerses} verses memorized`}
  accessibilityHint="Double tap to practice this Juz"
>
  <JuzCellContent juz={juz} />
</Pressable>
```

**Step 3: Add accessibility to feature cards**

Modify: `client/screens/learn/LearnTabScreen.tsx`

```typescript
<Pressable
  onPress={onPress}
  accessibilityRole="button"
  accessibilityLabel={title}
  accessibilityHint={`Opens ${title.toLowerCase()}`}
>
  <FeatureCardContent />
</Pressable>
```

**Step 4: Test with VoiceOver**

```bash
# iOS: Enable VoiceOver in Settings > Accessibility
# Navigate app with VoiceOver enabled
```

Expected: All interactive elements announced clearly

**Step 5: Commit**

```bash
git add client/screens/ client/components/
git commit -m "a11y: add VoiceOver support with accessibility labels"
```

---

### Task 4.6: Accessibility - Color Contrast Audit

**Files:**
- Modify: `client/constants/theme/colors.ts`

**Step 1: Audit current colors with contrast checker**

Use: https://webaim.org/resources/contrastchecker/

Check:
- Qamar gold (#D4AF37) on cream background (#FAF8F3)
- Text colors (dark mode and light mode)
- Tajweed colors on both backgrounds

**Step 2: Adjust colors if needed**

Modify: `client/constants/theme/colors.ts`

```typescript
export const NoorColors = {
  // Ensure 4.5:1 contrast ratio
  gold: '#D4AF37', // May need darkening for better contrast
  cream: '#FAF8F3',

  // Text colors
  textPrimary: '#1A1A1A', // Dark enough for 4.5:1 on cream
  textSecondary: '#666666', // May need darkening

  // Tajweed colors (adjust if needed for dark mode)
  tajweedGhunnah: '#A0A000', // Adjusted for contrast
  tajweedIkhfa: '#909000',
  // ... adjust others as needed
};
```

**Step 3: Test contrast with Accessibility Inspector**

```bash
# Xcode > Open Developer Tool > Accessibility Inspector
# Run Color Contrast Analyzer
```

Expected: All text meets WCAG AA (4.5:1 for normal text)

**Step 4: Update dark mode colors**

Ensure dark mode colors also meet contrast requirements.

**Step 5: Commit**

```bash
git add client/constants/theme/
git commit -m "a11y: improve color contrast for WCAG AA compliance"
```

---

## Track 5: UX Polish

### Task 5.1: Improve Onboarding with Feature Preview

**Files:**
- Modify: `client/screens/onboarding/WelcomeScreen.tsx`
- Create: `client/components/FeaturePreviewCarousel.tsx`

**Step 1: Create feature preview carousel**

File: `client/components/FeaturePreviewCarousel.tsx`

```typescript
import React, { useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface FeaturePreview {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const FEATURES: FeaturePreview[] = [
  {
    icon: 'book-open',
    title: 'Read the Quran',
    description: '8 world-class reciters with tajweed & word-by-word audio',
  },
  {
    icon: 'book',
    title: 'Memorize Effectively',
    description: 'Spaced repetition system with personalized feedback',
  },
  {
    icon: 'message-square',
    title: 'Learn Arabic',
    description: 'Personalized coaching for vocabulary, grammar & conversation',
  },
  {
    icon: 'clock',
    title: 'Never Miss Prayer',
    description: 'Accurate prayer times and qibla direction for your location',
  },
];

export function FeaturePreviewCarousel() {
  const flatListRef = useRef<FlatList>(null);
  const currentIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % FEATURES.length;
      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderFeature = ({ item, index }: { item: FeaturePreview; index: number }) => (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 100)}
      style={styles.featureCard}
    >
      <View style={styles.iconCircle}>
        <Feather name={item.icon} size={32} color="#D4AF37" />
      </View>
      <ThemedText style={styles.title}>{item.title}</ThemedText>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
    </Animated.View>
  );

  return (
    <View style={styles.container} testID="feature-preview-carousel">
      <FlatList
        ref={flatListRef}
        data={FEATURES}
        renderItem={renderFeature}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: width * 0.8,
          offset: width * 0.8 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginVertical: 32,
  },
  featureCard: {
    width: width * 0.8,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
});
```

**Step 2: Add carousel to welcome screen**

Modify: `client/screens/onboarding/WelcomeScreen.tsx`

```typescript
import { FeaturePreviewCarousel } from '@/components/FeaturePreviewCarousel';

<View style={styles.container}>
  {/* Logo and title */}
  <ThemedText style={styles.title}>Welcome to Qamar</ThemedText>
  <ThemedText style={styles.subtitle}>Your Complete Islamic Companion</ThemedText>

  {/* Feature preview carousel */}
  <FeaturePreviewCarousel />

  {/* Get Started button */}
  <Button onPress={handleNext} testID="onboarding-get-started-button">
    Get Started
  </Button>
</View>
```

**Step 3: Test carousel**

```bash
npm run expo:dev
```

Expected: Auto-scrolling carousel every 3s, swipe works

**Step 4: Commit**

```bash
git add client/components/FeaturePreviewCarousel.tsx client/screens/onboarding/
git commit -m "feat(onboarding): add feature preview carousel to welcome screen"
```

---

### Task 5.2: Add Offline Mode Detection & Banner

**Files:**
- Create: `client/components/OfflineBanner.tsx`
- Create: `client/hooks/useNetworkStatus.ts`
- Modify: `client/navigation/RootStackNavigator.tsx`

**Step 1: Create network status hook**

File: `client/hooks/useNetworkStatus.ts`

```typescript
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, isInternetReachable };
}
```

**Step 2: Create offline banner component**

File: `client/components/OfflineBanner.tsx`

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, isInternetReachable } = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = (!isOnline || !isInternetReachable) && !dismissed;

  if (!shouldShow) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(300)}
      exiting={SlideOutDown.duration(300)}
      style={styles.container}
      testID="offline-banner"
    >
      <Feather name="wifi-off" size={20} color="#FFF" />
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>You're offline</ThemedText>
        <ThemedText style={styles.subtitle}>
          Quran reader, prayer times, and flashcards work offline
        </ThemedText>
      </View>
      <Pressable onPress={() => setDismissed(true)}>
        <Feather name="x" size={20} color="#FFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6347',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
});
```

**Step 3: Add banner to root navigator**

Modify: `client/navigation/RootStackNavigator.tsx`

```typescript
import { OfflineBanner } from '@/components/OfflineBanner';

<NavigationContainer>
  <OfflineBanner />
  <Stack.Navigator>
    {/* Screens */}
  </Stack.Navigator>
</NavigationContainer>
```

**Step 4: Test offline banner**

```bash
# Enable airplane mode on simulator
npm run expo:dev
```

Expected: Banner slides in when offline, dismissible

**Step 5: Commit**

```bash
git add client/components/OfflineBanner.tsx client/hooks/useNetworkStatus.ts client/navigation/
git commit -m "feat(ux): add offline mode detection with dismissible banner"
```

---

### Task 5.3: Add Permission Priming Dialogs

**Files:**
- Create: `client/components/PermissionPrimer.tsx`
- Modify: `client/screens/learn/PronunciationCoachScreen.tsx`

**Step 1: Create permission primer component**

File: `client/components/PermissionPrimer.tsx`

```typescript
import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface PermissionPrimerProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

export function PermissionPrimer({
  visible,
  onAccept,
  onDecline,
  icon,
  title,
  description,
}: PermissionPrimerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <GlassCard style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name={icon} size={40} color="#D4AF37" />
          </View>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
          <View style={styles.buttons}>
            <Button onPress={onAccept} style={styles.acceptButton}>
              Continue
            </Button>
            <Button onPress={onDecline} variant="secondary">
              Not Now
            </Button>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 24,
  },
  buttons: {
    gap: 12,
    width: '100%',
  },
  acceptButton: {
    backgroundColor: '#D4AF37',
  },
});
```

**Step 2: Use permission primer in pronunciation coach**

Modify: `client/screens/learn/PronunciationCoachScreen.tsx`

```typescript
import { PermissionPrimer } from '@/components/PermissionPrimer';
import * as Permissions from 'expo-permissions';

const [showMicPrimer, setShowMicPrimer] = useState(false);

const handleStartRecording = async () => {
  // Check if permission already granted
  const { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);

  if (status === 'undetermined') {
    // Show primer first
    setShowMicPrimer(true);
  } else if (status === 'granted') {
    // Start recording
    startRecording();
  } else {
    // Permission denied, show settings link
    showPermissionDeniedAlert();
  }
};

const handleAcceptMicPermission = async () => {
  setShowMicPrimer(false);
  const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
  if (status === 'granted') {
    startRecording();
  }
};

// In render:
<PermissionPrimer
  visible={showMicPrimer}
  onAccept={handleAcceptMicPermission}
  onDecline={() => setShowMicPrimer(false)}
  icon="mic"
  title="Microphone Access"
  description="Qamar uses your microphone to record your Quran recitation and provide pronunciation feedback."
/>
```

**Step 3: Add permission primer to prayer times (location)**

Similar pattern for location permission.

**Step 4: Test permission flow**

```bash
npm run expo:dev
```

Expected: Primer shows before system permission dialog

**Step 5: Commit**

```bash
git add client/components/PermissionPrimer.tsx client/screens/
git commit -m "feat(ux): add permission priming dialogs for mic and location"
```

---

### Task 5.4: Add First-Time Tooltips

**Files:**
- Create: `client/components/Tooltip.tsx`
- Create: `client/hooks/useTooltip.ts`
- Modify: `client/screens/quran/VerseReaderScreen.tsx`

**Step 1: Create tooltip hook**

File: `client/hooks/useTooltip.ts`

```typescript
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTooltip(tooltipId: string) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkTooltip = async () => {
      const shown = await AsyncStorage.getItem(`tooltip_shown_${tooltipId}`);
      setShouldShow(shown !== 'true');
    };
    checkTooltip();
  }, [tooltipId]);

  const dismissTooltip = async () => {
    await AsyncStorage.setItem(`tooltip_shown_${tooltipId}`, 'true');
    setShouldShow(false);
  };

  return { shouldShow, dismissTooltip };
}
```

**Step 2: Create tooltip component**

File: `client/components/Tooltip.tsx`

```typescript
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TooltipProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export function Tooltip({ visible, message, onDismiss }: TooltipProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      <Pressable onPress={onDismiss} style={styles.overlay} />
      <View style={styles.tooltip}>
        <ThemedText style={styles.message}>{message}</ThemedText>
        <Pressable onPress={onDismiss} style={styles.button}>
          <ThemedText style={styles.buttonText}>Got it</ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tooltip: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
```

**Step 3: Add tooltip to Quran reader first visit**

Modify: `client/screens/quran/VerseReaderScreen.tsx`

```typescript
import { Tooltip } from '@/components/Tooltip';
import { useTooltip } from '@/hooks/useTooltip';

const { shouldShow, dismissTooltip } = useTooltip('quran-play-audio');

<View style={styles.container}>
  <Tooltip
    visible={shouldShow}
    message="Tap the play button to hear the recitation with word-by-word highlighting"
    onDismiss={dismissTooltip}
  />
  {/* Rest of screen */}
</View>
```

**Step 4: Test tooltip**

```bash
npm run expo:dev
```

Expected: Tooltip shows on first visit, never again after dismissal

**Step 5: Commit**

```bash
git add client/components/Tooltip.tsx client/hooks/useTooltip.ts client/screens/
git commit -m "feat(ux): add first-time tooltips for feature discovery"
```

---

### Task 5.5: Handle Edge Cases - Quota Exhaustion

**Files:**
- Modify: `client/hooks/useStudyPlan.ts`
- Modify: `client/screens/learn/StudyPlanScreen.tsx`

**Step 1: Show quota badge on study plan screen**

Modify: `client/screens/learn/StudyPlanScreen.tsx`

```typescript
import { DailyQuotaBadge } from '@/components/DailyQuotaBadge';

<View style={styles.header}>
  <ThemedText style={styles.title}>My Study Plan</ThemedText>
  <DailyQuotaBadge remaining={remainingQuota} total={3} />
</View>
```

**Step 2: Disable generate button when quota exhausted**

```typescript
const isQuotaExhausted = remainingQuota === 0;

<Button
  onPress={handleGenerate}
  disabled={isQuotaExhausted}
  style={isQuotaExhausted && styles.disabledButton}
>
  {isQuotaExhausted ? 'Out of Free Plans Today' : 'Generate Study Plan'}
</Button>

{isQuotaExhausted && (
  <ThemedText style={styles.quotaHint}>
    Upgrade to Plus for unlimited study plans, or try again tomorrow
  </ThemedText>
)}
```

**Step 3: Show upgrade prompt on quota hit**

```typescript
const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

useEffect(() => {
  if (remainingQuota === 0 && !showUpgradePrompt) {
    setShowUpgradePrompt(true);
  }
}, [remainingQuota]);

<PremiumUpsell
  visible={showUpgradePrompt}
  onDismiss={() => setShowUpgradePrompt(false)}
  feature="Unlimited Study Plans"
/>
```

**Step 4: Test quota flow**

```bash
npm run expo:dev
# Generate 3 study plans
# Verify button disabled and upgrade prompt shown
```

Expected: Clear quota feedback, seamless upgrade path

**Step 5: Commit**

```bash
git add client/hooks/ client/screens/
git commit -m "feat(ux): handle quota exhaustion with clear feedback and upgrade path"
```

---

### Task 5.6: Update CONTINUE.md with Phase 7 Completion

**Files:**
- Modify: `CONTINUE.md`

**Step 1: Add Phase 7 section**

Modify: `CONTINUE.md`

```markdown
### COMPLETE — Phase 7: Production Readiness

**COMPLETED** on main branch (commits across 5 parallel tracks).

All production polish complete:
- E2E test suite: 20+ Detox tests covering all features, offline mode, premium gating
- Performance: Bundle < 30MB, launch < 2s, 60fps guaranteed
- App Store content: iOS screenshots (8), Android screenshots (8), metadata, video script
- Visual polish: Loading states, empty states, error states, smooth animations, accessibility
- UX polish: Improved onboarding, offline banner, permission priming, first-time tooltips, quota handling

**E2E CI:** GitHub Actions workflows for iOS + Android

**Ready for:** TestFlight beta, App Store submission

### NEXT — Phase 8: Launch

- TestFlight beta testing (iOS)
- Google Play Internal Testing (Android)
- App Store submission
- Marketing materials
```

**Step 2: Update test count (if E2E tests added to jest)**

Update test count from 707 to 707+ (E2E tests run separately).

**Step 3: Commit**

```bash
git add CONTINUE.md
git commit -m "docs: mark Phase 7 complete in CONTINUE.md"
```

---

## Execution Notes

### Parallel Execution Strategy

**Track 1 (E2E):** Independent, can run in background
**Track 2 (Performance):** Independent, commits directly to main
**Track 3 (App Store):** Independent, assets-only
**Track 4 (Visual):** Independent, UI polish
**Track 5 (UX):** Independent, UX improvements

All 5 tracks can run simultaneously with 5 subagents or human delegation.

### Testing After Each Track

**Track 1:** `npm run test:e2e:ios` and `npm run test:e2e:android`
**Track 2:** `npm run bundle:analyze` and manual performance testing
**Track 3:** No automated testing (manual screenshot review)
**Track 4:** Manual UI review + accessibility testing
**Track 5:** Manual UX flow testing

### Final Verification

After all 5 tracks complete:

```bash
# Type check
npm run check:types

# Unit tests
npm test

# E2E tests
npm run test:e2e:ios:release
npm run test:e2e:android:release

# Bundle analysis
npm run bundle:analyze

# Build for production
npm run expo:static:build
```

Expected:
- 0 TypeScript errors
- 707+ tests passing
- 20+ E2E tests passing
- Bundle < 30MB
- Production builds successful

---

## Timeline Estimate

**Days 1-3:** Setup infrastructure (5 tracks start simultaneously)
- Track 1: Detox config + helpers
- Track 2: Bundle analysis + compression
- Track 3: Screenshot planning
- Track 4: Component creation (skeleton, empty state, error state)
- Track 5: Hook creation (network status, tooltip)

**Days 4-7:** Implementation (parallel work across all tracks)
- Track 1: Write 20+ E2E tests
- Track 2: Lazy loading + FlatList optimizations
- Track 3: Take screenshots + write metadata
- Track 4: Add animations + accessibility
- Track 5: Onboarding improvements + permission priming

**Days 8-10:** Integration & verification
- Run full E2E suite
- Profile performance
- Review screenshots
- Test accessibility
- Verify all UX flows

**Days 11-14:** TestFlight & App Store prep
- Upload TestFlight build
- Submit to App Store review
- Gather beta feedback
- Final polish based on feedback

---

## Success Criteria

✅ **20+ E2E tests** passing on iOS + Android
✅ **Bundle < 30MB** verified with bundle analyzer
✅ **App launch < 2s** on iPhone 12 / Pixel 5
✅ **60fps** on all scrollable screens
✅ **8 screenshots** per platform (iOS, Android)
✅ **App Store metadata** complete
✅ **All UI states** handled (loading, empty, error)
✅ **VoiceOver** works on all screens
✅ **WCAG AA** color contrast compliance
✅ **Offline mode** graceful degradation
✅ **Permission priming** before system dialogs
✅ **First-time tooltips** for discovery
✅ **Quota handling** with upgrade prompts

---

**Plan Status:** Ready for execution
**Next Action:** Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan
