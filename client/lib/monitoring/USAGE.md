# Monitoring & Observability Usage Guide

Comprehensive guide for using Sentry, analytics, and premium features in the Noor app.

## Table of Contents

1. [Sentry Error Tracking](#sentry-error-tracking)
2. [Analytics Events](#analytics-events)
3. [Premium Feature Gates](#premium-feature-gates)
4. [RevenueCat Integration](#revenuecat-integration)
5. [Best Practices](#best-practices)

---

## Sentry Error Tracking

### Initialization

Initialize Sentry once at app startup (in `App.tsx` or root component):

```typescript
import { initSentry } from '@/lib/monitoring';

// In your root component
useEffect(() => {
  initSentry();
}, []);
```

### Error Capturing

```typescript
import { captureException, captureMessage } from '@/lib/monitoring';

// Capture exceptions
try {
  await loadQuranData();
} catch (error) {
  captureException(error as Error, {
    surahId: 1,
    context: 'quran_loading',
  });
}

// Capture messages
captureMessage('User completed onboarding', 'info');
```

### Breadcrumbs for User Journey

Breadcrumbs help you understand what the user was doing before an error occurred.

```typescript
import {
  addQuranBreadcrumb,
  addPrayerBreadcrumb,
  addArabicLearningBreadcrumb,
} from '@/lib/monitoring';

// Quran breadcrumbs
addQuranBreadcrumb('Opened Surah', 1); // Surah Al-Fatihah
addQuranBreadcrumb('Scrolled to verse', 1, 7); // Verse 7

// Prayer breadcrumbs
addPrayerBreadcrumb('Checked times', 'Fajr');
addPrayerBreadcrumb('Set notification');

// Arabic learning breadcrumbs
addArabicLearningBreadcrumb('Started review session', 10);
addArabicLearningBreadcrumb('Completed scenario');
```

### Performance Tracking

Track slow operations to identify performance bottlenecks:

```typescript
import {
  trackQuranLoad,
  trackPrayerTimeCalculation,
  trackArabicLearningLoad,
} from '@/lib/monitoring';

// Track Quran loading
const finishQuranLoad = trackQuranLoad(surahId);
const data = await fetchQuranData(surahId);
finishQuranLoad(); // Marks transaction complete

// Track prayer calculation
const finishPrayerCalc = trackPrayerTimeCalculation();
const times = calculatePrayerTimes(location);
finishPrayerCalc();

// Track Arabic data loading
const finishArabicLoad = trackArabicLearningLoad();
const cards = await fetchFlashcards();
finishArabicLoad();
```

### User Context

Set user context to group errors by user:

```typescript
import { setUser } from '@/lib/monitoring';

// After user signs in
setUser(userId);

// After user signs out
setUser(null);
```

---

## Analytics Events

### Quran Analytics

```typescript
import {
  logQuranRead,
  logQuranSearch,
  logQuranBookmark,
  logQuranAudioPlay,
  logQuranTranslationChange,
  logQuranOfflineDownload,
} from '@/lib/monitoring';

// Track reading
logQuranRead(1, 7); // Read 7 verses of Surah 1

// Track search
logQuranSearch('mercy', 42); // Searched "mercy", found 42 results

// Track bookmarking
logQuranBookmark(2, 255); // Bookmarked Ayat al-Kursi

// Track audio playback
logQuranAudioPlay(36, 'Mishary Rashid'); // Playing Surah Yasin

// Track translation changes
logQuranTranslationChange('en-sahih'); // Switched to Sahih International

// Track offline downloads
logQuranOfflineDownload([1, 2, 3]); // Downloaded 3 surahs
```

### Prayer Analytics

```typescript
import {
  logPrayerTimeCheck,
  logPrayerNotificationToggle,
  logPrayerCompletion,
  logQiblaCheck,
  logAdhanCustomization,
  logPrayerWidgetInstall,
} from '@/lib/monitoring';

// Track prayer time checks
logPrayerTimeCheck('Fajr');

// Track notification settings
logPrayerNotificationToggle('Dhuhr', true); // Enabled Dhuhr notification

// Track prayer completion
logPrayerCompletion('Asr', true); // Completed Asr on time

// Track Qibla usage
logQiblaCheck();

// Track adhan customization
logAdhanCustomization('mecca_muezzin_1');

// Track widget installation
logPrayerWidgetInstall();
```

### Arabic Learning Analytics

```typescript
import {
  logFlashcardReview,
  logLearningSession,
  logScenarioStart,
  logVocabularyListCreate,
  logPronunciationPractice,
} from '@/lib/monitoring';

// Track flashcard reviews (FSRS rating: 1-5)
logFlashcardReview(4, 'word_salaam'); // Rated "salaam" as 4 (easy)

// Track session completion
logLearningSession(20, 180); // Reviewed 20 cards in 180 seconds

// Track scenario start
logScenarioStart('restaurant_ordering');

// Track vocabulary list creation
logVocabularyListCreate('Travel Arabic', 50); // Created list with 50 words

// Track pronunciation practice
logPronunciationPractice('word_bismillah', 85); // 85% accuracy
```

### Premium Conversion Analytics

```typescript
import {
  logFeaturePaywallShown,
  logFeatureUpgrade,
  logPaywallDismissed,
  logPricingPageView,
  logPurchaseRestore,
} from '@/lib/monitoring';

// Track paywall impressions (automatically tracked by PremiumFeatureGate)
logFeaturePaywallShown('pro_quran_audio');

// Track upgrades
logFeatureUpgrade('pro_quran_audio', 'pro'); // Upgraded to Pro via audio feature

// Track dismissals
logPaywallDismissed('pro_quran_offline'); // User dismissed paywall

// Track pricing page views
logPricingPageView();

// Track purchase restoration
logPurchaseRestore();
```

---

## Premium Feature Gates

### Using PremiumFeatureGate Component

Wrap premium content with the feature gate:

```typescript
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { PremiumFeature } from '@/lib/monitoring';

// Basic usage
function QuranAudioPlayer() {
  return (
    <PremiumFeatureGate feature={PremiumFeature.QURAN_AUDIO}>
      <AudioPlayerComponent />
    </PremiumFeatureGate>
  );
}

// With custom fallback
function OfflineDownloadButton() {
  return (
    <PremiumFeatureGate
      feature={PremiumFeature.QURAN_OFFLINE}
      fallback={<CustomUpgradePrompt />}
    >
      <DownloadButton />
    </PremiumFeatureGate>
  );
}

// With access check callback
function QuranTranslations() {
  return (
    <PremiumFeatureGate
      feature={PremiumFeature.QURAN_ALL_TRANSLATIONS}
      onAccessCheck={(hasAccess) => {
        console.log('Translation access:', hasAccess);
      }}
    >
      <TranslationPicker />
    </PremiumFeatureGate>
  );
}
```

### Using usePremiumFeature Hook

For more control, use the hook directly:

```typescript
import { usePremiumFeature } from '@/components/PremiumFeatureGate';
import { PremiumFeature } from '@/lib/monitoring';

function MyComponent() {
  const { hasAccess, loading, refresh } = usePremiumFeature(
    PremiumFeature.QURAN_AUDIO
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      {hasAccess ? (
        <AudioPlayer />
      ) : (
        <Button onPress={() => navigateToPricing()}>
          Unlock Audio
        </Button>
      )}
    </View>
  );
}
```

### Programmatic Feature Checks

Check features without UI components:

```typescript
import {
  hasFeature,
  isPremiumUser,
  getActiveFeatures,
  canAccessOfflineQuran,
  PremiumFeature,
} from '@/lib/monitoring';

// Check specific feature
const canUseAudio = await hasFeature(PremiumFeature.QURAN_AUDIO);

// Check if user is premium
const isPremium = await isPremiumUser();

// Get all active features
const features = await getActiveFeatures();
console.log('User has:', features);

// Convenience functions
const canDownload = await canAccessOfflineQuran();
```

---

## RevenueCat Integration

### Initialization

Initialize RevenueCat once at app startup:

```typescript
import { initializeRevenueCat } from '@/lib/monitoring';

// In your root component
useEffect(() => {
  const init = async () => {
    await initializeRevenueCat();
  };
  init();
}, []);
```

### Check Subscription Status

```typescript
import { getSubscriptionStatus } from '@/lib/monitoring';

const { isPlusSubscriber, isProSubscriber, isLoading } =
  await getSubscriptionStatus();

if (isProSubscriber) {
  // User has Pro subscription
} else if (isPlusSubscriber) {
  // User has Plus subscription
} else {
  // Free user
}
```

### Sync Purchases

Call after completing a purchase:

```typescript
import { syncSubscriptions } from '@/lib/monitoring';

// After purchase flow completes
await syncSubscriptions();

// Refresh feature access
const { refresh } = usePremiumFeature(PremiumFeature.QURAN_AUDIO);
await refresh();
```

---

## Best Practices

### 1. Breadcrumb Strategy

Add breadcrumbs at key user actions:

```typescript
// ✅ Good - tracks user journey
function QuranReader() {
  const openSurah = async (id: number) => {
    addQuranBreadcrumb('Opening Surah', id);
    const data = await loadSurah(id);
    addQuranBreadcrumb('Surah loaded', id);
    setData(data);
  };
}

// ❌ Bad - too granular
function QuranReader() {
  addQuranBreadcrumb('Component mounted', 0);
  addQuranBreadcrumb('State initialized', 0);
  addQuranBreadcrumb('Effect ran', 0);
}
```

### 2. Performance Transactions

Track operations that might be slow:

```typescript
// ✅ Good - tracks potentially slow operation
async function loadQuranWithAudio(surahId: number) {
  const finishTransaction = trackQuranLoad(surahId);

  try {
    const [text, audio] = await Promise.all([
      fetchQuranText(surahId),
      fetchQuranAudio(surahId),
    ]);
    return { text, audio };
  } finally {
    finishTransaction(); // Always finish, even on error
  }
}

// ❌ Bad - forgetting to finish transaction
async function loadQuran(surahId: number) {
  const finishTransaction = trackQuranLoad(surahId);
  const data = await fetchQuranText(surahId);
  // Forgot to call finishTransaction()
  return data;
}
```

### 3. Context Data

Set context before errors occur:

```typescript
// ✅ Good - context available when error happens
async function reviewFlashcard(cardId: string, rating: number) {
  setArabicLearningContext(rating, cardId);

  try {
    await submitReview(cardId, rating);
  } catch (error) {
    // Error will include context about card and rating
    captureException(error as Error);
  }
}
```

### 4. Premium Feature Checks

Always check features before showing premium UI:

```typescript
// ✅ Good - checks feature first
async function showAudioPlayer() {
  const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);

  if (!hasAccess) {
    navigation.navigate('Pricing');
    return;
  }

  navigation.navigate('AudioPlayer');
}

// ❌ Bad - shows UI then checks
function AudioPlayerScreen() {
  const { hasAccess } = usePremiumFeature(PremiumFeature.QURAN_AUDIO);

  return (
    <View>
      <ExpensiveAudioComponent /> {/* Loads even without access */}
      {!hasAccess && <PaywallOverlay />}
    </View>
  );
}
```

### 5. Analytics Timing

Log events at the right time:

```typescript
// ✅ Good - logs when action completes
async function downloadSurah(id: number) {
  await downloadQuranData(id);
  logQuranOfflineDownload([id]); // Log after success
}

// ❌ Bad - logs before action completes
async function downloadSurah(id: number) {
  logQuranOfflineDownload([id]); // Logged even if download fails
  await downloadQuranData(id);
}
```

### 6. Error Boundaries

Catch UI errors with error boundaries:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QuranReader />
    </ErrorBoundary>
  );
}

// ErrorBoundary should use captureException internally
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, {
      componentStack: info.componentStack,
    });
  }
}
```

### 7. Validation Mode

Respect VALIDATION_MODE in development:

```typescript
import { VALIDATION_MODE } from '@/lib/config';

// ✅ Good - respects validation mode
if (VALIDATION_MODE) {
  console.log('Running in validation mode - purchases disabled');
}

// Premium features automatically respect VALIDATION_MODE
const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);
// Returns false in validation mode
```

---

## Testing

### Testing with Mock Subscriptions

```typescript
// In your tests
jest.mock('@/lib/premium-features', () => ({
  hasFeature: jest.fn().mockResolvedValue(true),
  isPremiumUser: jest.fn().mockResolvedValue(true),
}));

// Test premium features
test('shows audio player for premium users', async () => {
  const { getByTestId } = render(<QuranAudioScreen />);
  await waitFor(() => {
    expect(getByTestId('audio-player')).toBeTruthy();
  });
});
```

### Testing Analytics

```typescript
// Mock analytics in tests
jest.mock('@/lib/analytics', () => ({
  logQuranRead: jest.fn(),
  logPrayerTimeCheck: jest.fn(),
}));

// Verify events are logged
import { logQuranRead } from '@/lib/analytics';

test('logs quran reading', () => {
  const { getByText } = render(<QuranReader surahId={1} />);
  fireEvent.press(getByText('Read'));

  expect(logQuranRead).toHaveBeenCalledWith(1, expect.any(Number));
});
```

---

## Environment Variables

Required environment variables:

```bash
# Sentry (optional - app works without it)
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# RevenueCat (required for IAP)
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxxxxxxxxxxxxxxxx

# Validation Mode (set to false in production)
EXPO_PUBLIC_VALIDATION_MODE=false
```

---

## Troubleshooting

### Sentry not initialized

If Sentry logs show "not configured":

1. Check `EXPO_PUBLIC_SENTRY_DSN` is set
2. Install Sentry: `npx expo install @sentry/react-native`
3. Uncomment initialization code in `client/lib/sentry.ts`

### Premium features always locked

1. Check `EXPO_PUBLIC_REVENUECAT_API_KEY` is set
2. Verify RevenueCat entitlements in dashboard
3. Check `VALIDATION_MODE` is set to `false`
4. Sync purchases: `await syncSubscriptions()`

### Performance transactions not showing

1. Ensure Sentry is initialized
2. Always call the `finish()` function returned by track functions
3. Check Sentry performance sampling rate in config

---

## Additional Resources

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [RevenueCat React Native SDK](https://docs.revenuecat.com/docs/reactnative)
- [FSRS Spaced Repetition](https://github.com/open-spaced-repetition/fsrs.js)
