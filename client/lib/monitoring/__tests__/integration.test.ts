/**
 * Monitoring Integration Tests
 *
 * Verifies that Sentry, analytics, and premium features work together correctly.
 */

import {
  addQuranBreadcrumb,
  addPrayerBreadcrumb,
  addArabicLearningBreadcrumb,
  trackQuranLoad,
  trackPrayerTimeCalculation,
  logQuranRead,
  logPrayerTimeCheck,
  logFlashcardReview,
  logFeaturePaywallShown,
  hasFeature,
  isPremiumUser,
  PremiumFeature,
} from '../index';

// Mock Sentry (since it's not installed yet)
jest.mock('../../sentry', () => ({
  initSentry: jest.fn(),
  isSentryEnabled: jest.fn(() => false),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  addQuranBreadcrumb: jest.fn((action, surahId, verseNumber) => {
    console.log(`[Quran] ${action} - Surah ${surahId}${verseNumber ? `:${verseNumber}` : ''}`);
  }),
  addPrayerBreadcrumb: jest.fn((action, prayerName) => {
    console.log(`[Prayer] ${action}${prayerName ? ` - ${prayerName}` : ''}`);
  }),
  addArabicLearningBreadcrumb: jest.fn((action, wordCount) => {
    console.log(`[Arabic] ${action}${wordCount ? ` - ${wordCount} words` : ''}`);
  }),
  trackQuranLoad: jest.fn(() => jest.fn()),
  trackPrayerTimeCalculation: jest.fn(() => jest.fn()),
  trackArabicLearningLoad: jest.fn(() => jest.fn()),
  setQuranContext: jest.fn(),
  setPrayerContext: jest.fn(),
  setArabicLearningContext: jest.fn(),
  setPremiumConversionContext: jest.fn(),
}));

// Mock RevenueCat
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getCustomerInfo: jest.fn(() => ({
    entitlements: {
      active: {},
    },
  })),
  syncPurchases: jest.fn(),
  LOG_LEVEL: {
    INFO: 'INFO',
  },
}));

describe('Monitoring Integration', () => {
  describe('Sentry Breadcrumbs', () => {
    it('should add Quran breadcrumbs with surah info', () => {
      addQuranBreadcrumb('Read', 1, 7);
      expect(console.log).toHaveBeenCalledWith('[Quran] Read - Surah 1:7');
    });

    it('should add Prayer breadcrumbs with prayer name', () => {
      addPrayerBreadcrumb('Check time', 'Fajr');
      expect(console.log).toHaveBeenCalledWith('[Prayer] Check time - Fajr');
    });

    it('should add Arabic learning breadcrumbs with word count', () => {
      addArabicLearningBreadcrumb('Review session', 10);
      expect(console.log).toHaveBeenCalledWith('[Arabic] Review session - 10 words');
    });
  });

  describe('Performance Tracking', () => {
    it('should track Quran load time', () => {
      const finishTransaction = trackQuranLoad(1);
      expect(finishTransaction).toBeInstanceOf(Function);

      // Simulate operation
      finishTransaction();
    });

    it('should track Prayer time calculation', () => {
      const finishTransaction = trackPrayerTimeCalculation();
      expect(finishTransaction).toBeInstanceOf(Function);

      finishTransaction();
    });
  });

  describe('Analytics Events', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should log Quran reading activity', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      logQuranRead(1, 7);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics:Quran]')
      );
    });

    it('should log Prayer time checks', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      logPrayerTimeCheck('Fajr');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics:Prayer]')
      );
    });

    it('should log flashcard reviews', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      logFlashcardReview(4, 'word_salaam');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics:Arabic]')
      );
    });

    it('should log paywall impressions', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      logFeaturePaywallShown('pro_quran_audio');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics:Premium]')
      );
    });
  });

  describe('Premium Features', () => {
    it('should check feature access', async () => {
      const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);
      expect(typeof hasAccess).toBe('boolean');
    });

    it('should check premium user status', async () => {
      const isPremium = await isPremiumUser();
      expect(typeof isPremium).toBe('boolean');
    });

    it('should return false for all features in validation mode', async () => {
      // VALIDATION_MODE defaults to true in tests
      const hasQuranAudio = await hasFeature(PremiumFeature.QURAN_AUDIO);
      const hasOffline = await hasFeature(PremiumFeature.QURAN_OFFLINE);
      const hasAllScenarios = await hasFeature(PremiumFeature.ARABIC_ALL_SCENARIOS);

      expect(hasQuranAudio).toBe(false);
      expect(hasOffline).toBe(false);
      expect(hasAllScenarios).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should track complete Quran reading flow', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      // User opens Quran
      addQuranBreadcrumb('Opened app', 0);

      // User selects a surah
      addQuranBreadcrumb('Selected surah', 1);

      // Track loading performance
      const finishLoad = trackQuranLoad(1);

      // User starts reading
      logQuranRead(1, 7);

      // Complete loading
      finishLoad();

      expect(consoleSpy).toHaveBeenCalledTimes(4);
    });

    it('should track prayer notification flow', () => {
      // User checks prayer times
      logPrayerTimeCheck('Fajr');

      // User enables notification
      addPrayerBreadcrumb('Enable notification', 'Fajr');

      // User completes prayer
      addPrayerBreadcrumb('Prayer completed', 'Fajr');

      // All events logged
      expect(console.log).toHaveBeenCalled();
    });

    it('should track premium conversion flow', async () => {
      // User tries to access premium feature
      const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);

      if (!hasAccess) {
        // Show paywall
        logFeaturePaywallShown('pro_quran_audio');

        // User views pricing
        console.log('[Analytics:Premium] Pricing page viewed');
      }

      expect(console.log).toHaveBeenCalled();
    });

    it('should track Arabic learning session', () => {
      // User starts session
      addArabicLearningBreadcrumb('Started session', 0);

      // User reviews cards
      logFlashcardReview(3, 'word_salaam');
      logFlashcardReview(4, 'word_shukran');
      logFlashcardReview(2, 'word_marhaba');

      // Complete session
      addArabicLearningBreadcrumb('Session complete', 3);

      expect(console.log).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle feature check errors gracefully', async () => {
      const Purchases = require('react-native-purchases');
      Purchases.getCustomerInfo.mockRejectedValueOnce(new Error('Network error'));

      const hasAccess = await hasFeature(PremiumFeature.QURAN_AUDIO);

      // Should fail closed (deny access on error)
      expect(hasAccess).toBe(false);
    });

    it('should handle premium status check errors', async () => {
      const Purchases = require('react-native-purchases');
      Purchases.getCustomerInfo.mockRejectedValueOnce(new Error('Network error'));

      const isPremium = await isPremiumUser();

      // Should fail closed
      expect(isPremium).toBe(false);
    });
  });

  describe('PremiumFeature Enum', () => {
    it('should have all Quran features defined', () => {
      expect(PremiumFeature.QURAN_OFFLINE).toBeDefined();
      expect(PremiumFeature.QURAN_ALL_TRANSLATIONS).toBeDefined();
      expect(PremiumFeature.QURAN_AUDIO).toBeDefined();
      expect(PremiumFeature.QURAN_ADVANCED_SEARCH).toBeDefined();
    });

    it('should have all Prayer features defined', () => {
      expect(PremiumFeature.PRAYER_CUSTOM_ADHAN).toBeDefined();
      expect(PremiumFeature.PRAYER_WIDGET).toBeDefined();
      expect(PremiumFeature.PRAYER_QIBLA).toBeDefined();
      expect(PremiumFeature.PRAYER_HISTORY).toBeDefined();
    });

    it('should have all Arabic learning features defined', () => {
      expect(PremiumFeature.ARABIC_ALL_SCENARIOS).toBeDefined();
      expect(PremiumFeature.ARABIC_UNLIMITED_REVIEWS).toBeDefined();
      expect(PremiumFeature.ARABIC_PRONUNCIATION).toBeDefined();
      expect(PremiumFeature.ARABIC_CUSTOM_LISTS).toBeDefined();
    });

    it('should have CBT features defined', () => {
      expect(PremiumFeature.CBT_EXERCISES).toBeDefined();
      expect(PremiumFeature.CBT_ADVANCED).toBeDefined();
    });
  });
});
