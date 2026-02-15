# Monitoring & Analytics - Quick Reference

One-page reference for the most common monitoring operations.

## 🚀 Quick Start

```typescript
// In App.tsx
import { initSentry, initializeRevenueCat } from '@/lib/monitoring';

useEffect(() => {
  initSentry();
  initializeRevenueCat();
}, []);
```

## 📊 Analytics Events

### Quran
```typescript
import { logQuranRead, logQuranBookmark } from '@/lib/monitoring';

logQuranRead(1, 7);                    // Read 7 verses of Surah 1
logQuranBookmark(2, 255);              // Bookmarked Ayat al-Kursi
```

### Prayer
```typescript
import { logPrayerTimeCheck, logPrayerCompletion } from '@/lib/monitoring';

logPrayerTimeCheck('Fajr');            // Checked Fajr time
logPrayerCompletion('Dhuhr', true);    // Completed Dhuhr on time
```

### Arabic Learning
```typescript
import { logFlashcardReview, logScenarioStart } from '@/lib/monitoring';

logFlashcardReview(4, 'word_salaam'); // Rated "salaam" as 4 (easy)
logScenarioStart('restaurant');        // Started restaurant scenario
```

## 🔒 Premium Features

### Feature Gate (UI Component)
```typescript
import { PremiumFeatureGate } from '@/components/PremiumFeatureGate';
import { PremiumFeature } from '@/lib/monitoring';

<PremiumFeatureGate feature={PremiumFeature.QURAN_AUDIO}>
  <AudioPlayer />
</PremiumFeatureGate>
```

### Feature Check (Programmatic)
```typescript
import { hasFeature, PremiumFeature } from '@/lib/monitoring';

const canUseAudio = await hasFeature(PremiumFeature.QURAN_AUDIO);
if (canUseAudio) {
  // Show audio controls
}
```

### Hook (Advanced Control)
```typescript
import { usePremiumFeature } from '@/components/PremiumFeatureGate';

const { hasAccess, loading, refresh } = usePremiumFeature(
  PremiumFeature.QURAN_AUDIO
);
```

## 🐛 Debugging & Breadcrumbs

```typescript
import { addQuranBreadcrumb, addPrayerBreadcrumb } from '@/lib/monitoring';

addQuranBreadcrumb('Opened Surah', 1, 7);     // Quran actions
addPrayerBreadcrumb('Set notification', 'Fajr'); // Prayer actions
```

## ⚡ Performance Tracking

```typescript
import { trackQuranLoad } from '@/lib/monitoring';

const finishTransaction = trackQuranLoad(surahId);
try {
  await loadQuranData(surahId);
} finally {
  finishTransaction(); // Always finish
}
```

## 🎯 Premium Features List

### Quran (4 features)
- `PremiumFeature.QURAN_OFFLINE` - Offline access (Plus)
- `PremiumFeature.QURAN_ALL_TRANSLATIONS` - All translations (Pro)
- `PremiumFeature.QURAN_AUDIO` - Audio recitations (Pro)
- `PremiumFeature.QURAN_ADVANCED_SEARCH` - Advanced search (Pro)

### Arabic (4 features)
- `PremiumFeature.ARABIC_ALL_SCENARIOS` - All scenarios (Plus)
- `PremiumFeature.ARABIC_UNLIMITED_REVIEWS` - Unlimited reviews (Pro)
- `PremiumFeature.ARABIC_PRONUNCIATION` - AI pronunciation (Pro)
- `PremiumFeature.ARABIC_CUSTOM_LISTS` - Custom lists (Pro)

### Prayer (4 features)
- `PremiumFeature.PRAYER_CUSTOM_ADHAN` - Custom adhan (Plus)
- `PremiumFeature.PRAYER_WIDGET` - Home widget (Pro)
- `PremiumFeature.PRAYER_QIBLA` - Qibla finder (Pro)
- `PremiumFeature.PRAYER_HISTORY` - Prayer history (Pro)

### Reflection (2 features)
- `PremiumFeature.REFLECTION_EXERCISES` - Reflection exercises (Plus)
- `PremiumFeature.REFLECTION_ADVANCED` - Advanced analytics (Pro)

## 📦 Single Import

```typescript
// Import everything from one place
import {
  // Analytics
  logQuranRead,
  logPrayerTimeCheck,
  logFlashcardReview,

  // Breadcrumbs
  addQuranBreadcrumb,
  addPrayerBreadcrumb,

  // Performance
  trackQuranLoad,

  // Premium
  hasFeature,
  isPremiumUser,
  PremiumFeature,
} from '@/lib/monitoring';
```

## 🔧 Common Patterns

### Quran Reading Flow
```typescript
// User opens Quran
addQuranBreadcrumb('Opened app', 0);

// User selects surah
const finishLoad = trackQuranLoad(surahId);
const verses = await loadSurah(surahId);
finishLoad();

// User reads
logQuranRead(surahId, verses.length);
```

### Premium Feature Flow
```typescript
// Check access
const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);

if (!hasAccess) {
  // Navigate to pricing (paywall auto-tracked)
  navigation.navigate('Pricing');
  return;
}

// User has access - show feature
navigation.navigate('AudioPlayer');
```

### Error Handling
```typescript
import { captureException, setQuranContext } from '@/lib/monitoring';

try {
  setQuranContext(surahId, versesRead); // Set context first
  await saveProgress();
} catch (error) {
  captureException(error as Error); // Captured with context
}
```

## 🧪 Testing

### Mock Premium Features
```typescript
jest.mock('@/lib/premium-features', () => ({
  hasFeature: jest.fn().mockResolvedValue(true),
}));
```

### Mock Analytics
```typescript
jest.mock('@/lib/analytics', () => ({
  logQuranRead: jest.fn(),
}));
```

## 🌍 Environment

```bash
# Required for production
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_VALIDATION_MODE=false

# Optional (Sentry)
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

## 📚 Full Documentation

- [README.md](./README.md) - Complete overview
- [USAGE.md](./USAGE.md) - Detailed examples
- [VERIFICATION.md](./VERIFICATION.md) - Testing checklist

## 🆘 Troubleshooting

**Premium features locked?**
- Check `VALIDATION_MODE=false`
- Verify RevenueCat API key
- Sync: `await syncSubscriptions()`

**Sentry not working?**
- Check `EXPO_PUBLIC_SENTRY_DSN` is set
- Install: `npx expo install @sentry/react-native`

**Analytics not firing?**
- Check console logs (fallback when Sentry disabled)
- Verify Sentry initialization

---

**Need help?** See [USAGE.md](./USAGE.md) for comprehensive examples.
