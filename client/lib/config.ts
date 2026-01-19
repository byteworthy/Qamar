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
 * Defaults to true unless explicitly set to "false"
 */
export const VALIDATION_MODE =
  process.env.EXPO_PUBLIC_VALIDATION_MODE !== "false";

/**
 * Check if a string contains validation mode placeholder markers
 */
export function isValidationModeResponse(text: string): boolean {
  return text.includes("[VALIDATION MODE]");
}

/**
 * Configuration values
 */
export const config = {
  apiDomain: process.env.EXPO_PUBLIC_DOMAIN,
  validationMode: VALIDATION_MODE,
};
