/**
 * Billing Configuration
 *
 * Reads product IDs from STORE_IDENTIFIERS.json
 * Provides safe fallbacks when billing is not configured
 */

import { Platform } from "react-native";
import storeIdentifiers from "../../release/STORE_IDENTIFIERS.json";

// =============================================================================
// TYPES
// =============================================================================

export interface ProductIds {
  plusMonthly: string;
  plusYearly: string;
  proMonthly: string;
  proYearly: string;
}

export interface BillingConfig {
  isConfigured: boolean;
  configurationStatus: BillingConfigStatus;
  productIds: ProductIds;
  basePlanIds?: ProductIds; // Android only
}

export type BillingConfigStatus =
  | "fully_configured"
  | "partially_configured"
  | "not_configured";

// =============================================================================
// CONFIGURATION CHECK
// =============================================================================

/**
 * Check if Apple billing is configured
 * Requires: teamId, appStoreConnectAppId, subscriptionGroupId
 */
function isAppleConfigured(): boolean {
  const { apple } = storeIdentifiers;
  return Boolean(
    apple.teamId && apple.appStoreConnectAppId && apple.subscriptionGroupId,
  );
}

/**
 * Check if Google billing is configured
 * Requires: playConsoleAppId
 */
function isGoogleConfigured(): boolean {
  const { google } = storeIdentifiers;
  return Boolean(google.playConsoleAppId);
}

/**
 * Check if EAS is configured
 * Requires: account, projectId
 */
export function isEasConfigured(): boolean {
  const { eas } = storeIdentifiers;
  return Boolean(eas.account && eas.projectId);
}

/**
 * Get overall billing configuration status
 */
export function getBillingConfigStatus(): BillingConfigStatus {
  const appleReady = isAppleConfigured();
  const googleReady = isGoogleConfigured();

  if (appleReady && googleReady) {
    return "fully_configured";
  }
  if (appleReady || googleReady) {
    return "partially_configured";
  }
  return "not_configured";
}

/**
 * Check if billing is configured for the current platform
 */
export function isBillingConfiguredForPlatform(): boolean {
  if (Platform.OS === "ios") {
    return isAppleConfigured();
  }
  if (Platform.OS === "android") {
    return isGoogleConfigured();
  }
  // Web or other platforms - not supported for IAP
  return false;
}

// =============================================================================
// PRODUCT IDS
// =============================================================================

/**
 * Get product IDs for the current platform
 */
export function getProductIds(): ProductIds {
  if (Platform.OS === "ios") {
    return storeIdentifiers.apple.productIds;
  }
  return storeIdentifiers.google.productIds;
}

/**
 * Get base plan IDs (Android only)
 */
export function getBasePlanIds(): ProductIds | undefined {
  if (Platform.OS === "android") {
    return storeIdentifiers.google.basePlanIds;
  }
  return undefined;
}

/**
 * Get all product ID strings for fetching from store
 */
export function getAllProductIdStrings(): string[] {
  const ids = getProductIds();
  return [ids.plusMonthly, ids.plusYearly, ids.proMonthly, ids.proYearly];
}

// =============================================================================
// MAIN CONFIG OBJECT
// =============================================================================

/**
 * Get full billing configuration
 */
export function getBillingConfig(): BillingConfig {
  return {
    isConfigured: isBillingConfiguredForPlatform(),
    configurationStatus: getBillingConfigStatus(),
    productIds: getProductIds(),
    basePlanIds: getBasePlanIds(),
  };
}

// =============================================================================
// STORE IDENTIFIERS ACCESS
// =============================================================================

/**
 * Get raw store identifiers (for debugging/admin)
 */
export function getStoreIdentifiers() {
  return storeIdentifiers;
}

/**
 * Get app identity info
 */
export function getAppIdentity() {
  return storeIdentifiers.app;
}

// =============================================================================
// HUMAN READABLE STATUS
// =============================================================================

/**
 * Get human-readable configuration status message
 */
export function getConfigurationMessage(): string {
  const status = getBillingConfigStatus();

  switch (status) {
    case "fully_configured":
      return "Billing is fully configured for both platforms.";
    case "partially_configured":
      return `Billing is configured for ${isAppleConfigured() ? "iOS" : "Android"} only.`;
    case "not_configured":
      return "Billing is not configured. Store identifiers need to be added.";
  }
}

/**
 * Get list of missing configuration items
 */
export function getMissingConfiguration(): string[] {
  const missing: string[] = [];

  const { apple, google, eas } = storeIdentifiers;

  // Apple checks
  if (!apple.teamId) missing.push("Apple Team ID");
  if (!apple.appStoreConnectAppId) missing.push("App Store Connect App ID");
  if (!apple.subscriptionGroupId) missing.push("Apple Subscription Group ID");

  // Google checks
  if (!google.playConsoleAppId) missing.push("Play Console App ID");

  // EAS checks
  if (!eas.account) missing.push("EAS Account");
  if (!eas.projectId) missing.push("EAS Project ID");

  return missing;
}
