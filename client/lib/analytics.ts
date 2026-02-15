/**
 * Analytics and Event Tracking
 *
 * Centralized analytics for Islamic features using Sentry contexts.
 * When Sentry is enabled, these events are sent as context data.
 * When disabled, they're logged to console for debugging.
 */

import {
  setQuranContext,
  setPrayerContext,
  setArabicLearningContext,
  setPremiumConversionContext,
  addQuranBreadcrumb,
  addPrayerBreadcrumb,
  addArabicLearningBreadcrumb,
} from "./sentry";

// ============================================================================
// QURAN ANALYTICS
// ============================================================================

/**
 * Log Quran reading activity.
 *
 * @param surahId - The surah being read (1-114)
 * @param versesRead - Number of verses read in this session
 *
 * @example
 * logQuranRead(1, 7); // User read 7 verses of Al-Fatihah
 */
export function logQuranRead(surahId: number, versesRead: number): void {
  const timestamp = new Date().toISOString();

  // Set context for error grouping
  setQuranContext(surahId, versesRead, timestamp);

  // Add breadcrumb for user journey
  addQuranBreadcrumb("Read", surahId);

  console.log(`[Analytics:Quran] Read Surah ${surahId} (${versesRead} verses)`);
}

/**
 * Log Quran search activity.
 *
 * @param query - The search query
 * @param resultsCount - Number of results found
 */
export function logQuranSearch(query: string, resultsCount: number): void {
  addQuranBreadcrumb(`Search: "${query}" (${resultsCount} results)`, 0);
  console.log(`[Analytics:Quran] Search: "${query}" - ${resultsCount} results`);
}

/**
 * Log Quran bookmarking.
 *
 * @param surahId - The surah being bookmarked
 * @param verseNumber - The verse being bookmarked
 */
export function logQuranBookmark(surahId: number, verseNumber: number): void {
  addQuranBreadcrumb("Bookmark", surahId, verseNumber);
  console.log(`[Analytics:Quran] Bookmarked ${surahId}:${verseNumber}`);
}

/**
 * Log Quran audio playback.
 *
 * @param surahId - The surah being played
 * @param reciter - The reciter name/ID
 */
export function logQuranAudioPlay(surahId: number, reciter: string): void {
  addQuranBreadcrumb(`Audio: ${reciter}`, surahId);
  console.log(`[Analytics:Quran] Playing Surah ${surahId} by ${reciter}`);
}

/**
 * Log Quran translation change.
 *
 * @param translationId - The translation ID (e.g., "en-sahih", "ur-junagarhi")
 */
export function logQuranTranslationChange(translationId: string): void {
  addQuranBreadcrumb(`Translation: ${translationId}`, 0);
  console.log(`[Analytics:Quran] Switched to translation: ${translationId}`);
}

/**
 * Log offline Quran download.
 *
 * @param surahIds - Array of surah IDs being downloaded
 */
export function logQuranOfflineDownload(surahIds: number[]): void {
  addQuranBreadcrumb(`Offline download: ${surahIds.length} surahs`, 0);
  console.log(`[Analytics:Quran] Downloaded ${surahIds.length} surahs for offline`);
}

// ============================================================================
// PRAYER TIMES ANALYTICS
// ============================================================================

/**
 * Log prayer time check activity.
 *
 * @param prayerName - The prayer being checked (Fajr, Dhuhr, Asr, Maghrib, Isha)
 *
 * @example
 * logPrayerTimeCheck('Fajr'); // User checked Fajr prayer time
 */
export function logPrayerTimeCheck(prayerName: string): void {
  const timestamp = new Date().toISOString();

  // Set context for error grouping
  setPrayerContext(prayerName, timestamp);

  // Add breadcrumb for user journey
  addPrayerBreadcrumb("Check time", prayerName);

  console.log(`[Analytics:Prayer] Checked ${prayerName} prayer time`);
}

/**
 * Log prayer notification settings.
 *
 * @param prayerName - The prayer for notification
 * @param enabled - Whether notification is enabled
 */
export function logPrayerNotificationToggle(
  prayerName: string,
  enabled: boolean,
): void {
  addPrayerBreadcrumb(
    `Notification ${enabled ? "enabled" : "disabled"}`,
    prayerName,
  );
  console.log(
    `[Analytics:Prayer] ${prayerName} notification ${enabled ? "enabled" : "disabled"}`,
  );
}

/**
 * Log prayer completion.
 *
 * @param prayerName - The prayer that was completed
 * @param onTime - Whether prayer was completed on time
 */
export function logPrayerCompletion(
  prayerName: string,
  onTime: boolean,
): void {
  addPrayerBreadcrumb(
    `Completed ${onTime ? "on time" : "late"}`,
    prayerName,
  );
  console.log(
    `[Analytics:Prayer] ${prayerName} completed ${onTime ? "on time" : "late"}`,
  );
}

/**
 * Log Qibla direction check.
 */
export function logQiblaCheck(): void {
  addPrayerBreadcrumb("Qibla check");
  console.log(`[Analytics:Prayer] Checked Qibla direction`);
}

/**
 * Log adhan customization.
 *
 * @param adhanId - The adhan sound ID selected
 */
export function logAdhanCustomization(adhanId: string): void {
  addPrayerBreadcrumb(`Adhan: ${adhanId}`);
  console.log(`[Analytics:Prayer] Selected adhan: ${adhanId}`);
}

/**
 * Log prayer widget installation.
 */
export function logPrayerWidgetInstall(): void {
  addPrayerBreadcrumb("Widget installed");
  console.log(`[Analytics:Prayer] Widget installed`);
}

// ============================================================================
// ARABIC LEARNING ANALYTICS
// ============================================================================

/**
 * Log flashcard review activity.
 *
 * @param rating - The user's rating (1-5, FSRS system)
 * @param cardId - The card being reviewed
 *
 * @example
 * logFlashcardReview(4, 'word_salaam'); // User rated "salaam" as 4 (easy)
 */
export function logFlashcardReview(rating: number, cardId: string): void {
  const timestamp = new Date().toISOString();

  // Set context for error grouping
  setArabicLearningContext(rating, cardId, timestamp);

  // Add breadcrumb for user journey
  addArabicLearningBreadcrumb(`Review: ${cardId} (rating ${rating})`);

  console.log(`[Analytics:Arabic] Reviewed card ${cardId} with rating ${rating}`);
}

/**
 * Log learning session completion.
 *
 * @param cardsReviewed - Number of cards reviewed
 * @param sessionDuration - Duration in seconds
 */
export function logLearningSession(
  cardsReviewed: number,
  sessionDuration: number,
): void {
  addArabicLearningBreadcrumb("Session complete", cardsReviewed);
  console.log(
    `[Analytics:Arabic] Session complete: ${cardsReviewed} cards in ${sessionDuration}s`,
  );
}

/**
 * Log conversation scenario start.
 *
 * @param scenarioId - The scenario being practiced
 */
export function logScenarioStart(scenarioId: string): void {
  addArabicLearningBreadcrumb(`Scenario: ${scenarioId}`);
  console.log(`[Analytics:Arabic] Started scenario: ${scenarioId}`);
}

/**
 * Log vocabulary list creation.
 *
 * @param listName - Name of the custom list
 * @param wordCount - Number of words in the list
 */
export function logVocabularyListCreate(
  listName: string,
  wordCount: number,
): void {
  addArabicLearningBreadcrumb(`Created list: ${listName}`, wordCount);
  console.log(
    `[Analytics:Arabic] Created vocabulary list "${listName}" with ${wordCount} words`,
  );
}

/**
 * Log pronunciation practice.
 *
 * @param wordId - The word being practiced
 * @param accuracy - Accuracy score (0-100)
 */
export function logPronunciationPractice(
  wordId: string,
  accuracy: number,
): void {
  addArabicLearningBreadcrumb(`Pronunciation: ${wordId} (${accuracy}%)`);
  console.log(
    `[Analytics:Arabic] Pronunciation practice: ${wordId} - ${accuracy}% accuracy`,
  );
}

// ============================================================================
// PREMIUM CONVERSION ANALYTICS
// ============================================================================

/**
 * Log when user attempts to access a premium feature.
 * Critical for understanding conversion friction.
 *
 * @param feature - The feature ID that triggered the paywall
 *
 * @example
 * logFeaturePaywallShown('pro_quran_audio');
 */
export function logFeaturePaywallShown(feature: string): void {
  setPremiumConversionContext(feature);
  console.log(`[Analytics:Premium] Paywall shown for: ${feature}`);
}

/**
 * Log when user upgrades to premium.
 *
 * @param feature - The feature that drove the conversion (optional)
 * @param tier - The subscription tier (plus/pro)
 */
export function logFeatureUpgrade(feature?: string, tier?: string): void {
  const context = feature || "unknown_trigger";
  setPremiumConversionContext(context);
  console.log(
    `[Analytics:Premium] Upgrade to ${tier || "premium"}${feature ? ` via ${feature}` : ""}`,
  );
}

/**
 * Log when user dismisses paywall without upgrading.
 *
 * @param feature - The feature that showed the paywall
 */
export function logPaywallDismissed(feature: string): void {
  console.log(`[Analytics:Premium] Paywall dismissed for: ${feature}`);
}

/**
 * Log when user views pricing page.
 */
export function logPricingPageView(): void {
  console.log(`[Analytics:Premium] Pricing page viewed`);
}

/**
 * Log when user restores purchases.
 */
export function logPurchaseRestore(): void {
  console.log(`[Analytics:Premium] Purchase restored`);
}

// ============================================================================
// GENERAL APP ANALYTICS
// ============================================================================

/**
 * Log feature usage for general tracking.
 *
 * @param featureName - The feature being used
 * @param metadata - Additional context data
 */
export function logFeatureUsage(
  featureName: string,
  metadata?: Record<string, unknown>,
): void {
  console.log(`[Analytics:Feature] ${featureName}`, metadata || "");
}

/**
 * Log user onboarding step.
 *
 * @param step - The onboarding step (1-n)
 * @param stepName - Name of the step
 */
export function logOnboardingStep(step: number, stepName: string): void {
  console.log(`[Analytics:Onboarding] Step ${step}: ${stepName}`);
}

/**
 * Log error in user flow (non-technical).
 *
 * @param flow - The user flow (e.g., 'quran_reading', 'prayer_notification')
 * @param errorMessage - User-friendly error description
 */
export function logUserFlowError(flow: string, errorMessage: string): void {
  console.error(`[Analytics:Error] ${flow}: ${errorMessage}`);
}
