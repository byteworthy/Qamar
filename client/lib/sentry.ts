/**
 * Sentry Error Tracking (Mobile)
 *
 * Uses @sentry/react-native for production error tracking.
 * Disabled by default. Set EXPO_PUBLIC_SENTRY_DSN environment variable to enable.
 * When disabled, all functions are no-ops with console logging.
 */

import * as Sentry from "@sentry/react-native";

let sentryInitialized = false;

/**
 * Initialize Sentry for the mobile app.
 * No-op if EXPO_PUBLIC_SENTRY_DSN is not set.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.log("[Sentry] Disabled - EXPO_PUBLIC_SENTRY_DSN not configured");
    return;
  }

  try {
    Sentry.init({
      dsn,
      tracesSampleRate: __DEV__ ? 1.0 : 0.2,
      profilesSampleRate: __DEV__ ? 1.0 : 0.1,
      environment: __DEV__ ? "development" : "production",
      enabled: !__DEV__,
      debug: __DEV__,
    });
    sentryInitialized = true;
    console.log("[Sentry] Initialized successfully");
  } catch (error) {
    console.error("[Sentry] Failed to initialize:", error);
    sentryInitialized = false;
  }
}

/**
 * Check if Sentry is enabled and initialized.
 */
export function isSentryEnabled(): boolean {
  return sentryInitialized;
}

/**
 * Capture an exception in Sentry.
 * No-op if Sentry is not configured.
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  if (!isSentryEnabled()) {
    console.error("[Error]", error.message, context || "");
    return;
  }

  Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message in Sentry.
 * No-op if Sentry is not configured.
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): void {
  if (!isSentryEnabled()) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry.
 * No-op if Sentry is not configured.
 */
export function setUser(userId: string | null): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.setUser(userId ? { id: userId } : null);
}

/**
 * Add breadcrumb for debugging.
 * No-op if Sentry is not configured.
 */
export function addBreadcrumb(message: string, category?: string): void {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.addBreadcrumb({ message, category: category || "app" });
}

// ============================================================================
// ISLAMIC FEATURES BREADCRUMBS
// ============================================================================

/**
 * Track Quran reading activity for debugging.
 * Helps trace user journey through Quran features.
 */
export function addQuranBreadcrumb(
  action: string,
  surahId: number,
  verseNumber?: number,
): void {
  if (!isSentryEnabled()) {
    console.log(
      `[Quran] ${action} - Surah ${surahId}${verseNumber ? `:${verseNumber}` : ""}`,
    );
    return;
  }

  Sentry.addBreadcrumb({
    message: `${action} - Surah ${surahId}${verseNumber ? `:${verseNumber}` : ""}`,
    category: "quran",
    data: { surahId, verseNumber },
  });
}

/**
 * Track Prayer Times activity for debugging.
 * Helps trace user interactions with prayer schedules and notifications.
 */
export function addPrayerBreadcrumb(action: string, prayerName?: string): void {
  if (!isSentryEnabled()) {
    console.log(`[Prayer] ${action}${prayerName ? ` - ${prayerName}` : ""}`);
    return;
  }

  Sentry.addBreadcrumb({
    message: `${action}${prayerName ? ` - ${prayerName}` : ""}`,
    category: "prayer",
    data: prayerName ? { prayerName } : undefined,
  });
}

/**
 * Track Arabic Learning activity for debugging.
 * Helps trace flashcard reviews and learning progress.
 */
export function addArabicLearningBreadcrumb(
  action: string,
  wordCount?: number,
): void {
  if (!isSentryEnabled()) {
    console.log(
      `[Arabic] ${action}${wordCount ? ` - ${wordCount} words` : ""}`,
    );
    return;
  }

  Sentry.addBreadcrumb({
    message: `${action}${wordCount ? ` - ${wordCount} words` : ""}`,
    category: "arabic-learning",
    data: wordCount ? { wordCount } : undefined,
  });
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Track Quran data loading performance.
 * Returns a finish function to mark transaction completion.
 *
 * @example
 * const finishTransaction = trackQuranLoad(1);
 * // ... load Surah data
 * finishTransaction();
 */
export function trackQuranLoad(surahId: number): () => void {
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    if (isSentryEnabled()) {
      Sentry.addBreadcrumb({
        message: `Load Surah ${surahId} - ${duration}ms`,
        category: "performance.quran",
        data: { surahId, duration },
      });
    } else {
      console.log(`[Perf:Quran] Load Surah ${surahId} - ${duration}ms`);
    }
  };
}

/**
 * Track Prayer Time calculation performance.
 * Returns a finish function to mark transaction completion.
 *
 * @example
 * const finishTransaction = trackPrayerTimeCalculation();
 * // ... calculate prayer times
 * finishTransaction();
 */
export function trackPrayerTimeCalculation(): () => void {
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    if (isSentryEnabled()) {
      Sentry.addBreadcrumb({
        message: `Calculate prayer times - ${duration}ms`,
        category: "performance.prayer",
        data: { duration },
      });
    } else {
      console.log(`[Perf:Prayer] Calculate times - ${duration}ms`);
    }
  };
}

/**
 * Track Arabic Learning data loading performance.
 * Returns a finish function to mark transaction completion.
 *
 * @example
 * const finishTransaction = trackArabicLearningLoad();
 * // ... load flashcards
 * finishTransaction();
 */
export function trackArabicLearningLoad(): () => void {
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    if (isSentryEnabled()) {
      Sentry.addBreadcrumb({
        message: `Load learning data - ${duration}ms`,
        category: "performance.arabic",
        data: { duration },
      });
    } else {
      console.log(`[Perf:Arabic] Load learning data - ${duration}ms`);
    }
  };
}

// ============================================================================
// CONTEXT TRACKING FOR ANALYTICS
// ============================================================================

/**
 * Set context for Quran reading activity.
 * Useful for grouping errors and events by reading session.
 */
export function setQuranContext(
  surahId: number,
  versesRead: number,
  timestamp: string = new Date().toISOString(),
): void {
  if (!isSentryEnabled()) {
    console.log(
      `[Context:Quran] Surah ${surahId}, ${versesRead} verses read at ${timestamp}`,
    );
    return;
  }

  Sentry.setContext("quran", { surahId, versesRead, timestamp });
}

/**
 * Set context for Prayer activity.
 * Useful for grouping errors and events by prayer interaction.
 */
export function setPrayerContext(
  prayerName: string,
  timestamp: string = new Date().toISOString(),
): void {
  if (!isSentryEnabled()) {
    console.log(`[Context:Prayer] ${prayerName} at ${timestamp}`);
    return;
  }

  Sentry.setContext("prayer", { prayerName, timestamp });
}

/**
 * Set context for Arabic Learning activity.
 * Useful for grouping errors and events by learning session.
 */
export function setArabicLearningContext(
  rating: number,
  cardId: string,
  timestamp: string = new Date().toISOString(),
): void {
  if (!isSentryEnabled()) {
    console.log(
      `[Context:Arabic] Card ${cardId}, rating ${rating} at ${timestamp}`,
    );
    return;
  }

  Sentry.setContext("arabic-learning", { rating, cardId, timestamp });
}

/**
 * Set context for premium feature conversion.
 * Tracks which features drive upgrade decisions.
 */
export function setPremiumConversionContext(
  feature: string,
  timestamp: string = new Date().toISOString(),
): void {
  if (!isSentryEnabled()) {
    console.log(`[Context:Premium] Feature ${feature} at ${timestamp}`);
    return;
  }

  Sentry.setContext("premium-conversion", { feature, timestamp });
}
