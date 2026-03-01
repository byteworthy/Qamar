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
  getProductIds,
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

/**
 * Type guard to validate BillingProfile structure from JSON.parse
 */
function isBillingProfile(value: unknown): value is BillingProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    (profile.tier === "free" ||
      profile.tier === "plus" ||
      profile.tier === "pro") &&
    (profile.status === "free" ||
      profile.status === "active" ||
      profile.status === "past_due" ||
      profile.status === "canceled") &&
    typeof profile.planName === "string" &&
    typeof profile.updatedAt === "number"
  );
}

/**
 * Type guard for IAP error with code property
 */
interface IAPError {
  code: string;
  message?: string;
}

function isIAPError(error: unknown): error is IAPError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as IAPError).code === "string"
  );
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
  if (tier === "pro") return "Qamar Pro";
  if (tier === "plus") return "Qamar Plus";
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
      const parsed: unknown = JSON.parse(stored);
      if (isBillingProfile(parsed)) {
        return { ...defaultProfile, ...parsed };
      }
      return defaultProfile;
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
  private cachedProfile: BillingProfile | null = null;

  async getProfile(): Promise<BillingProfile> {
    // Return cached if available
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    // Try to restore from AsyncStorage
    const stored = await AsyncStorage.getItem(MOCK_PROFILE_KEY);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (isBillingProfile(parsed)) {
          this.cachedProfile = parsed;
          return this.cachedProfile;
        }
      } catch {
        // Invalid stored data, continue to check store
      }
    }

    // No cached profile, return free
    return defaultProfile;
  }

  async purchase(
    tier: BillingTier,
    period: "monthly" | "yearly",
  ): Promise<BillingProfile> {
    const { Platform } = await import("react-native");
    const iap = await import("react-native-iap");

    try {
      await iap.initConnection();

      // Get product ID
      const productKey = period === "monthly" ? "plusMonthly" : "plusYearly";

      const productIds = getProductIds();
      const productId = productIds[productKey];

      if (__DEV__) {
        console.log("[Billing] Purchasing:", productId);
      }

      // Request purchase - subscriptions require type 'subs'
      await iap.requestPurchase({
        request:
          Platform.OS === "ios"
            ? { apple: { sku: productId } }
            : { google: { skus: [productId] } },
        type: "subs",
      });

      if (__DEV__) {
        console.log("[Billing] Purchase successful");
      }

      // Update profile
      const status: BillingStatus = "active";
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
      this.cachedProfile = updatedProfile;

      await iap.endConnection();
      return updatedProfile;
    } catch (error: unknown) {
      console.error("[Billing] Purchase error:", error);
      await iap.endConnection().catch(() => {});

      // User cancelled
      if (isIAPError(error) && error.code === "E_USER_CANCELLED") {
        throw new Error("Purchase cancelled");
      }

      throw new Error("Purchase failed. Please try again.");
    }
  }

  async restore(): Promise<BillingProfile> {
    const { initConnection, endConnection, getAvailablePurchases } =
      await import("react-native-iap");

    try {
      await initConnection();

      const purchases = await getAvailablePurchases();
      if (__DEV__) {
        console.log("[Billing] Available purchases:", purchases);
      }

      if (!purchases || purchases.length === 0) {
        await endConnection();
        throw new Error("No purchases found");
      }

      // Find highest tier subscription
      const productIds = getProductIds();
      let highestTier: BillingTier = "free";

      for (const purchase of purchases) {
        const productId = purchase.productId;

        // Check if Plus tier
        if (
          productId === productIds.plusMonthly ||
          productId === productIds.plusYearly ||
          productId === productIds.lifetime
        ) {
          highestTier = "plus";
          break;
        }
      }

      const status: BillingStatus = highestTier === "free" ? "free" : "active";
      const updatedProfile: BillingProfile = {
        tier: highestTier,
        status,
        planName: getPlanName(highestTier),
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(
        MOCK_PROFILE_KEY,
        JSON.stringify(updatedProfile),
      );
      this.cachedProfile = updatedProfile;

      await endConnection();
      return updatedProfile;
    } catch (error: unknown) {
      console.error("[Billing] Restore error:", error);
      await endConnection().catch(() => {});
      const message =
        error instanceof Error
          ? error.message
          : "Failed to restore purchases. Please try again.";
      throw new Error(message);
    }
  }

  async manage(): Promise<void> {
    const { Platform, Linking } = await import("react-native");

    try {
      if (Platform.OS === "ios") {
        // iOS: Open Settings > Subscriptions
        await Linking.openURL("https://apps.apple.com/account/subscriptions");
      } else if (Platform.OS === "android") {
        // Android: Open Play Store subscriptions
        const packageName = "com.noor.app";
        await Linking.openURL(
          `https://play.google.com/store/account/subscriptions?package=${packageName}`,
        );
      }
    } catch (error) {
      console.error("[Billing] Failed to open manage subscriptions:", error);
      throw new Error("Failed to open subscription management");
    }
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
