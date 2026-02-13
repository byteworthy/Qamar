/**
 * Sentry Error Tracking (Mobile)
 *
 * Disabled by default. Set EXPO_PUBLIC_SENTRY_DSN environment variable to enable.
 * When disabled, all functions are no-ops.
 */

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

  // When ready to enable Sentry:
  // 1. npx expo install @sentry/react-native
  // 2. Configure native builds
  // 3. Uncomment the initialization code below
  console.log("[Sentry] DSN found - Sentry package not yet installed");
  console.log("[Sentry] To enable: npx expo install @sentry/react-native");
  sentryInitialized = false;
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
    // Sentry not configured - just log to console
    console.error("[Error]", error.message, context || "");
    return;
  }

  // When Sentry is installed, this will forward to Sentry.captureException
  console.error("[Sentry]", error.message, context || "");
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

  // When Sentry is installed, this will forward to Sentry.captureMessage
  console.log(`[Sentry:${level}]`, message);
}

/**
 * Set user context for Sentry.
 * No-op if Sentry is not configured.
 */
export function setUser(userId: string | null): void {
  if (!isSentryEnabled()) {
    return;
  }

  // When Sentry is installed, this will forward to Sentry.setUser
}

/**
 * Add breadcrumb for debugging.
 * No-op if Sentry is not configured.
 */
export function addBreadcrumb(message: string, category?: string): void {
  if (!isSentryEnabled()) {
    return;
  }

  // When Sentry is installed, this will forward to Sentry.addBreadcrumb
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

  // When Sentry is installed, this will forward to Sentry.addBreadcrumb
  console.log(
    `[Sentry:Quran] ${action} - Surah ${surahId}${verseNumber ? `:${verseNumber}` : ""}`,
  );
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

  // When Sentry is installed, this will forward to Sentry.addBreadcrumb
  console.log(
    `[Sentry:Prayer] ${action}${prayerName ? ` - ${prayerName}` : ""}`,
  );
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

  // When Sentry is installed, this will forward to Sentry.addBreadcrumb
  console.log(
    `[Sentry:Arabic] ${action}${wordCount ? ` - ${wordCount} words` : ""}`,
  );
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
  if (!isSentryEnabled()) {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      console.log(`[Perf:Quran] Load Surah ${surahId} - ${duration}ms`);
    };
  }

  // When Sentry is installed, this will create a performance transaction
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    console.log(`[Sentry:Perf] Quran load - Surah ${surahId} - ${duration}ms`);
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
  if (!isSentryEnabled()) {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      console.log(`[Perf:Prayer] Calculate times - ${duration}ms`);
    };
  }

  // When Sentry is installed, this will create a performance transaction
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    console.log(`[Sentry:Perf] Prayer calculation - ${duration}ms`);
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
  if (!isSentryEnabled()) {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      console.log(`[Perf:Arabic] Load learning data - ${duration}ms`);
    };
  }

  // When Sentry is installed, this will create a performance transaction
  const startTime = Date.now();
  return () => {
    const duration = Date.now() - startTime;
    console.log(`[Sentry:Perf] Arabic learning load - ${duration}ms`);
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

  // When Sentry is installed, this will forward to Sentry.setContext
  console.log(
    `[Sentry:Context] Quran - Surah ${surahId}, ${versesRead} verses`,
  );
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

  // When Sentry is installed, this will forward to Sentry.setContext
  console.log(`[Sentry:Context] Prayer - ${prayerName}`);
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

  // When Sentry is installed, this will forward to Sentry.setContext
  console.log(`[Sentry:Context] Arabic - Card ${cardId}, rating ${rating}`);
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

  // When Sentry is installed, this will forward to Sentry.setContext
  console.log(`[Sentry:Context] Premium conversion - ${feature}`);
}
