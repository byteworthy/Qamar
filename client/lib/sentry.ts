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
