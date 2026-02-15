/**
 * Client Configuration Module
 *
 * Centralizes environment variable handling with:
 * - VALIDATION_MODE support for testing without external services
 * - Safe defaults for development builds
 */

/**
 * When true, the app runs in validation mode:
 * - Billing/purchase flows show "Coming Soon" instead of purchase actions
 * - AI responses may be placeholders from server
 * - Safe for tester validation without real payments
 *
 * PRODUCTION GUARD: EXPO_PUBLIC_VALIDATION_MODE must be explicitly set to "false" in production builds.
 * This prevents accidentally shipping validation mode to production where real purchases are required.
 *
 * Defaults to true unless explicitly set to "false"
 */
export const VALIDATION_MODE =
  process.env.EXPO_PUBLIC_VALIDATION_MODE !== "false";

// PRODUCTION GUARD: Ensure validation mode is explicitly disabled in production
if (process.env.NODE_ENV === "production" && VALIDATION_MODE) {
  console.error(
    "FATAL: EXPO_PUBLIC_VALIDATION_MODE is not set to 'false' in production build. " +
      "Purchases will be disabled. Set EXPO_PUBLIC_VALIDATION_MODE=false in EAS production profile.",
  );
  // In production, fail loudly so this is caught in build/review
  throw new Error(
    "Production build cannot use VALIDATION_MODE. Set EXPO_PUBLIC_VALIDATION_MODE=false in eas.json production profile.",
  );
}

/**
 * Check if a string contains validation mode placeholder markers
 */
export function isValidationModeResponse(text: string): boolean {
  return text.includes("[VALIDATION MODE]");
}

/**
 * RevenueCat Configuration
 *
 * API keys for subscription management via RevenueCat.
 * Get keys from: https://app.revenuecat.com/projects/[your-project]/api-keys
 *
 * CRITICAL: Use PUBLIC API key (starts with "appl_" for iOS, "goog_" for Android), NOT secret key
 */
export const REVENUECAT_CONFIG = {
  /** Legacy single-key fallback */
  apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "",
  /** Per-platform keys (preferred) */
  iosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY || "",
  androidKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY || "",
};

/**
 * Configuration values
 */
export const config = {
  apiDomain: process.env.EXPO_PUBLIC_DOMAIN,
  validationMode: VALIDATION_MODE,
};
