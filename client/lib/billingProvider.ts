/**
 * Billing Provider
 *
 * Handles subscription purchases via Apple IAP or Google Play Billing.
 * Falls back to mock billing when store billing is not configured.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  isBillingConfiguredForPlatform,
  getBillingConfigStatus,
  getConfigurationMessage,
} from "./billingConfig";

// =============================================================================
// TYPES
// =============================================================================

export type BillingTier = "free" | "plus" | "pro";
export type BillingStatus = "free" | "active" | "past_due" | "canceled";

export interface BillingProfile {
  tier: BillingTier;
  status: BillingStatus;
  planName: string;
  updatedAt: number;
}

export interface BillingProvider {
  getProfile: () => Promise<BillingProfile>;
  purchase: (
    tier: BillingTier,
    period: "monthly" | "yearly",
  ) => Promise<BillingProfile>;
  restore: () => Promise<BillingProfile>;
  manage: () => Promise<void>;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const BILLING_QUERY_KEY = ["billing-profile"];

/**
 * Determine billing mode based on configuration
 * - If store identifiers are configured, use store billing
 * - Otherwise, use mock billing for development/testing
 */
export function getBillingMode(): "store" | "mock" | "disabled" {
  const status = getBillingConfigStatus();

  // If fully or partially configured, try store billing
  if (status === "fully_configured" || status === "partially_configured") {
    // Check if current platform is configured
    if (isBillingConfiguredForPlatform()) {
      return "store";
    }
  }

  // Default to mock for development
  return "mock";
}

/**
 * Check if billing is available for purchases
 */
export function isBillingAvailable(): boolean {
  return getBillingMode() !== "disabled";
}

/**
 * Check if store billing is active (vs mock)
 */
export function isStoreBillingActive(): boolean {
  return getBillingMode() === "store";
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MOCK_PROFILE_KEY = "@noor_mock_billing_profile";

const defaultProfile: BillingProfile = {
  tier: "free",
  status: "free",
  planName: "Free",
  updatedAt: Date.now(),
};

// =============================================================================
// HELPERS
// =============================================================================

export const getPlanName = (tier: BillingTier): string => {
  if (tier === "pro") return "Noor Pro";
  if (tier === "plus") return "Noor Plus";
  return "Free";
};

// =============================================================================
// MOCK BILLING PROVIDER (Development/Testing)
// =============================================================================

class MockBillingProvider implements BillingProvider {
  async getProfile(): Promise<BillingProfile> {
    const stored = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
    if (!stored) return defaultProfile;
    try {
      const parsed = JSON.parse(stored) as BillingProfile;
      return { ...defaultProfile, ...parsed };
    } catch {
      return defaultProfile;
    }
  }

  async purchase(
    tier: BillingTier,
    _period: "monthly" | "yearly",
  ): Promise<BillingProfile> {
    const status: BillingStatus = tier === "free" ? "free" : "active";
    const updatedProfile: BillingProfile = {
      tier,
      status,
      planName: getPlanName(tier),
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(
      MOCK_PROFILE_KEY,
      JSON.stringify(updatedProfile),
    );
    return updatedProfile;
  }

  async restore(): Promise<BillingProfile> {
    return this.getProfile();
  }

  async manage(): Promise<void> {
    // No-op for mock
    return;
  }
}

// =============================================================================
// STORE BILLING PROVIDER (Production)
// =============================================================================

class StoreBillingProvider implements BillingProvider {
  async getProfile(): Promise<BillingProfile> {
    // TODO: Implement real store billing
    // - Check subscription status with App Store / Play Store
    // - Validate receipts with backend if needed
    // For now, return free profile
    return defaultProfile;
  }

  async purchase(
    _tier: BillingTier,
    _period: "monthly" | "yearly",
  ): Promise<BillingProfile> {
    // TODO: Implement real IAP purchase flow
    // - Call expo-in-app-purchases or react-native-iap
    // - Process purchase
    // - Validate receipt
    // - Update profile

    // Safe fallback: inform that store billing needs implementation
    const message = `Store billing not implemented yet. ${getConfigurationMessage()}`;
    console.warn("[Billing]", message);

    // Return current profile without changes
    return defaultProfile;
  }

  async restore(): Promise<BillingProfile> {
    // TODO: Implement restore purchases
    // - Call restore API from IAP library
    // - Check valid subscriptions
    // - Update profile

    console.warn("[Billing] Restore purchases not implemented yet.");
    return defaultProfile;
  }

  async manage(): Promise<void> {
    // TODO: Open subscription management
    // - iOS: Open Settings app subscription page
    // - Android: Open Play Store subscription page

    console.warn("[Billing] Manage subscriptions not implemented yet.");
    return;
  }
}

// =============================================================================
// PROVIDER SELECTION
// =============================================================================

function createBillingProvider(): BillingProvider {
  const mode = getBillingMode();

  if (mode === "store") {
    return new StoreBillingProvider();
  }

  // Default to mock for development
  return new MockBillingProvider();
}

const billingProvider = createBillingProvider();

// =============================================================================
// EXPORTS
// =============================================================================

export const getBillingProfile = () => billingProvider.getProfile();

export const purchaseTier = (tier: BillingTier, period: "monthly" | "yearly") =>
  billingProvider.purchase(tier, period);

export const restorePurchases = () => billingProvider.restore();

export const openManageSubscriptions = () => billingProvider.manage();

export const isPaidTier = (tier: BillingTier) =>
  tier === "plus" || tier === "pro";

export const isProTier = (tier: BillingTier) => tier === "pro";

// =============================================================================
// DEBUG
// =============================================================================

/**
 * Get current billing mode for debugging
 */
export function getBillingDebugInfo() {
  return {
    mode: getBillingMode(),
    isConfigured: isBillingConfiguredForPlatform(),
    configStatus: getBillingConfigStatus(),
    message: getConfigurationMessage(),
  };
}
