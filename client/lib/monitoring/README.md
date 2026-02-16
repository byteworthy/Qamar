# Monitoring & Observability System

Comprehensive monitoring, analytics, and premium feature management for the Noor Islamic app.

## Overview

This monitoring system provides:

- **Sentry Error Tracking**: Capture errors and breadcrumbs for debugging
- **Performance Monitoring**: Track slow operations (Quran loading, prayer calculations)
- **Analytics Events**: Track user behavior across Islamic features
- **Premium Feature Gates**: Control access to paid features via RevenueCat
- **Conversion Tracking**: Understand what drives premium upgrades

## Quick Start

### 1. Initialize Services

```typescript
import { initSentry, initializeRevenueCat } from '@/lib/monitoring';

// In App.tsx or root component
useEffect(() => {
  // Initialize error tracking
  initSentry();

  // Initialize RevenueCat for IAP
  initializeRevenueCat();
}, []);
```

### 2. Track User Actions

```typescript
import { logQuranRead, addQuranBreadcrumb } from '@/lib/monitoring';

function QuranReader({ surahId }: { surahId: number }) {
  const handleRead = async () => {
    // Add breadcrumb for debugging
    addQuranBreadcrumb('Started reading', surahId);

    // Load content
    const verses = await loadSurah(surahId);

    // Log analytics event
    logQuranRead(surahId, verses.length);
  };

  return <Button onPress={handleRead}>Read Surah</Button>;
}
```

### 3. Gate Premium Features

```typescript
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { PremiumFeature } from '@/lib/monitoring';

function QuranAudioPlayer() {
  return (
    <PremiumFeatureGate feature={PremiumFeature.QURAN_AUDIO}>
      <AudioPlayerComponent />
    </PremiumFeatureGate>
  );
}
```

## Architecture

```
client/lib/monitoring/
├── index.ts                    # Central exports
├── README.md                   # This file
├── USAGE.md                    # Detailed usage guide
└── __tests__/
    └── integration.test.ts     # Integration tests

client/lib/
├── sentry.ts                   # Sentry error tracking (extended)
├── analytics.ts                # Analytics events (NEW)
├── premium-features.ts         # Premium feature management (NEW)
├── revenuecat.ts              # RevenueCat SDK (existing)
└── config.ts                  # App configuration

client/components/
├── PremiumFeatureGate.tsx     # Feature gate component (NEW)
└── PremiumUpsell.tsx          # Paywall UI (NEW)
```

## Features

### 1. Sentry Error Tracking

**Feature entitlements:**

```typescript
// Breadcrumbs for user journey
addQuranBreadcrumb('Opened Surah', 1, 7);
addPrayerBreadcrumb('Checked times', 'Fajr');
addArabicLearningBreadcrumb('Started review', 10);

// Performance tracking
const finishTransaction = trackQuranLoad(surahId);
await loadQuranData(surahId);
finishTransaction();

// Context for error grouping
setQuranContext(surahId, versesRead);
setPrayerContext('Fajr');
setArabicLearningContext(rating, cardId);
```

### 2. Analytics Events

**New comprehensive event tracking:**

```typescript
// Quran analytics
logQuranRead(1, 7);
logQuranSearch('mercy', 42);
logQuranBookmark(2, 255);
logQuranAudioPlay(36, 'Mishary Rashid');
logQuranOfflineDownload([1, 2, 3]);

// Prayer analytics
logPrayerTimeCheck('Fajr');
logPrayerCompletion('Dhuhr', true);
logQiblaCheck();
logPrayerWidgetInstall();

// Arabic learning analytics
logFlashcardReview(4, 'word_salaam');
logLearningSession(20, 180);
logScenarioStart('restaurant_ordering');
logPronunciationPractice('word_bismillah', 85);

// Premium conversion
logFeaturePaywallShown('pro_quran_audio');
logFeatureUpgrade('pro_quran_audio', 'pro');
```

### 3. Premium Feature Management

**RevenueCat integration with feature gates:**

```typescript
// Check feature access
const hasAudio = await hasFeature(PremiumFeature.QURAN_AUDIO);
const isPremium = await isPremiumUser();

// Get all active features
const features = await getActiveFeatures();

// Convenience checks
const canDownload = await canAccessOfflineQuran();
const canAccessAll = await canAccessAllArabicScenarios();
```

**Feature tiers:**

- **Plus Tier**: Unlimited conversations, full Quran audio, all learning scenarios

### 4. Premium Feature Gates

**UI components for controlling access:**

```typescript
// Basic gate
<PremiumFeatureGate feature={PremiumFeature.QURAN_AUDIO}>
  <AudioPlayer />
</PremiumFeatureGate>

// With custom fallback
<PremiumFeatureGate
  feature={PremiumFeature.QURAN_OFFLINE}
  fallback={<CustomUpgradePrompt />}
>
  <DownloadButton />
</PremiumFeatureGate>

// Using hook for programmatic control
const { hasAccess, loading, refresh } = usePremiumFeature(
  PremiumFeature.QURAN_AUDIO
);
```

## Premium Features

### Quran Features

| Feature | ID | Tier | Description |
|---------|-----|------|-------------|
| Offline Access | `pro_quran_offline` | Plus | Download surahs for offline reading |
| All Translations | `pro_quran_translations` | Pro | Access to 20+ translations |
| Audio Recitations | `pro_quran_audio` | Pro | Listen to 10+ reciters |
| Advanced Search | `pro_quran_search` | Pro | Powerful search with filters |

### Arabic Learning Features

| Feature | ID | Tier | Description |
|---------|-----|------|-------------|
| All Scenarios | `pro_arabic_scenarios` | Plus | 50+ conversation scenarios |
| Unlimited Reviews | `pro_arabic_unlimited` | Pro | No daily review limits |
| Pronunciation | `pro_arabic_pronunciation` | Pro | AI pronunciation feedback |
| Custom Lists | `pro_arabic_custom_lists` | Pro | Create custom vocabulary lists |

### Prayer Features

| Feature | ID | Tier | Description |
|---------|-----|------|-------------|
| Custom Adhan | `pro_prayer_adhan` | Plus | 20+ adhan sounds |
| Widget | `pro_prayer_widget` | Pro | Home screen widget |
| Qibla Finder | `pro_prayer_qibla` | Pro | Compass-based Qibla direction |
| Prayer History | `pro_prayer_history` | Pro | Track prayer consistency |

## Configuration

### Environment Variables

```bash
# Sentry (optional - app works without it)
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# RevenueCat (required for IAP)
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxxxxxxxxxxxxxxxx

# Validation Mode (set to false in production)
# When true: purchases disabled, all features locked
EXPO_PUBLIC_VALIDATION_MODE=false
```

### RevenueCat Dashboard Setup

1. Create entitlements matching the `PremiumFeature` enum IDs
2. Create Plus and Pro products
3. Map products to entitlements
4. Test with sandbox users

**Example entitlement mapping:**

```
Plus Subscription ($4.99/month)
├── pro_quran_offline
├── pro_arabic_scenarios
├── pro_prayer_adhan
└── noor_plus_access

Pro Subscription ($9.99/month)
├── All Plus entitlements
├── pro_quran_translations
├── pro_quran_audio
├── pro_quran_search
├── pro_arabic_unlimited
├── pro_arabic_pronunciation
├── pro_arabic_custom_lists
├── pro_prayer_widget
├── pro_prayer_qibla
├── pro_prayer_history
└── noor_pro_access
```

## Testing

### Run Tests

```bash
cd client
npm test lib/monitoring/__tests__/integration.test.ts
```

### Mock Premium Features in Tests

```typescript
jest.mock('@/lib/premium-features', () => ({
  hasFeature: jest.fn().mockResolvedValue(true),
  isPremiumUser: jest.fn().mockResolvedValue(true),
}));
```

### Mock Analytics in Tests

```typescript
jest.mock('@/lib/analytics', () => ({
  logQuranRead: jest.fn(),
  logPrayerTimeCheck: jest.fn(),
}));
```

## Best Practices

### 1. Always Finish Performance Transactions

```typescript
// ✅ Good - uses try/finally
const finishTransaction = trackQuranLoad(surahId);
try {
  await loadQuranData(surahId);
} finally {
  finishTransaction();
}

// ❌ Bad - might not finish on error
const finishTransaction = trackQuranLoad(surahId);
await loadQuranData(surahId);
finishTransaction();
```

### 2. Add Breadcrumbs at Key Actions

```typescript
// ✅ Good - tracks important steps
addQuranBreadcrumb('Opening surah', surahId);
await loadSurah(surahId);
addQuranBreadcrumb('Surah loaded', surahId);

// ❌ Bad - too granular
addQuranBreadcrumb('Component mounted');
addQuranBreadcrumb('State updated');
```

### 3. Set Context Before Errors

```typescript
// ✅ Good - context available when error occurs
setQuranContext(surahId, versesRead);
try {
  await saveProgress();
} catch (error) {
  captureException(error); // Has context
}
```

### 4. Check Features Before Showing UI

```typescript
// ✅ Good - check first, then navigate
const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);
if (!hasAccess) {
  navigation.navigate('Pricing');
  return;
}
navigation.navigate('AudioPlayer');

// ❌ Bad - loads UI before checking
<PremiumFeatureGate feature={PremiumFeature.QURAN_AUDIO}>
  <ExpensiveAudioComponent /> {/* Loads even without access */}
</PremiumFeatureGate>
```

### 5. Log Analytics After Success

```typescript
// ✅ Good - log after action completes
await downloadSurah(id);
logQuranOfflineDownload([id]);

// ❌ Bad - logs even if download fails
logQuranOfflineDownload([id]);
await downloadSurah(id);
```

## Troubleshooting

### Sentry Not Working

1. Check `EXPO_PUBLIC_SENTRY_DSN` is set
2. Install Sentry: `npx expo install @sentry/react-native`
3. Uncomment initialization code in `client/lib/sentry.ts`

### Premium Features Always Locked

1. Check `EXPO_PUBLIC_REVENUECAT_API_KEY` is set
2. Verify entitlements in RevenueCat dashboard
3. Ensure `VALIDATION_MODE=false`
4. Sync purchases: `await syncSubscriptions()`

### Performance Transactions Not Showing

1. Ensure Sentry is initialized
2. Always call the `finish()` function
3. Check Sentry performance sampling rate

## Migration from Existing Code

### Updating Existing Features

```typescript
// Before
import { captureException } from '@/lib/sentry';

// After (still works, but can use centralized import)
import { captureException } from '@/lib/monitoring';
```

### Adding to New Islamic Features

```typescript
// Quran screen
import {
  addQuranBreadcrumb,
  logQuranRead,
  trackQuranLoad,
} from '@/lib/monitoring';

// Prayer screen
import {
  addPrayerBreadcrumb,
  logPrayerTimeCheck,
} from '@/lib/monitoring';

// Arabic learning screen
import {
  addArabicLearningBreadcrumb,
  logFlashcardReview,
} from '@/lib/monitoring';
```

## Performance Impact

- **Breadcrumbs**: Minimal (console.log when Sentry disabled)
- **Analytics**: Minimal (console.log + Sentry context)
- **Feature Checks**: ~50-100ms (cached by RevenueCat)
- **Performance Tracking**: <1ms overhead

## Security Considerations

1. **API Keys**: Use PUBLIC keys only (start with `appl_` for iOS)
2. **User Privacy**: No PII in breadcrumbs or analytics
3. **Fail Closed**: Features deny access on error (secure default)
4. **VALIDATION_MODE**: Prevents accidental purchases in dev/staging

## Future Enhancements

- [ ] Add A/B testing framework
- [ ] Implement cohort analysis
- [ ] Add conversion funnel tracking
- [ ] Create analytics dashboard
- [ ] Add custom Sentry tags for Islamic features
- [ ] Implement offline analytics queue

## Documentation

- [USAGE.md](./USAGE.md) - Detailed usage examples
- [Integration Tests](../__tests__/integration.test.ts) - Test coverage
- [Sentry Docs](https://docs.sentry.io/platforms/react-native/)
- [RevenueCat Docs](https://docs.revenuecat.com/docs/reactnative)

## Support

For issues or questions:

1. Check [USAGE.md](./USAGE.md) for examples
2. Review [Troubleshooting](#troubleshooting) section
3. Check test files for integration examples
4. Consult Sentry/RevenueCat documentation

## License

Internal use only - Noor Islamic App
