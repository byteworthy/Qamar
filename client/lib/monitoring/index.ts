/**
 * Monitoring and Observability
 *
 * Centralized exports for Sentry, analytics, and premium features.
 */

// Sentry error tracking and breadcrumbs
export {
  initSentry,
  isSentryEnabled,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  // Islamic features breadcrumbs
  addQuranBreadcrumb,
  addPrayerBreadcrumb,
  addArabicLearningBreadcrumb,
  // Performance tracking
  trackQuranLoad,
  trackPrayerTimeCalculation,
  trackArabicLearningLoad,
  // Context tracking
  setQuranContext,
  setPrayerContext,
  setArabicLearningContext,
  setPremiumConversionContext,
} from "../sentry";

// Analytics events
export {
  // Quran analytics
  logQuranRead,
  logQuranSearch,
  logQuranBookmark,
  logQuranAudioPlay,
  logQuranTranslationChange,
  logQuranOfflineDownload,
  // Prayer analytics
  logPrayerTimeCheck,
  logPrayerNotificationToggle,
  logPrayerCompletion,
  logQiblaCheck,
  logAdhanCustomization,
  logPrayerWidgetInstall,
  // Arabic learning analytics
  logFlashcardReview,
  logLearningSession,
  logScenarioStart,
  logVocabularyListCreate,
  logPronunciationPractice,
  // Premium conversion
  logFeaturePaywallShown,
  logFeatureUpgrade,
  logPaywallDismissed,
  logPricingPageView,
  logPurchaseRestore,
  // General
  logFeatureUsage,
  logOnboardingStep,
  logUserFlowError,
} from "../analytics";

// Premium features
export {
  PremiumFeature,
  hasFeature,
  isPremiumUser,
  getActiveFeatures,
  canAccessOfflineQuran,
  canAccessAllArabicScenarios,
  canAccessPrayerWidget,
  getRequiredTier,
  FEATURE_TIERS,
} from "../premium-features";

// RevenueCat
export {
  initializeRevenueCat,
  getSubscriptionStatus,
  syncSubscriptions,
} from "../revenuecat";
