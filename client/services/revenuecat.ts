/**
 * RevenueCat Service
 *
 * Centralized IAP service wrapping RevenueCat SDK.
 * Handles initialization, offerings, purchases, restore, and entitlement checks.
 */

import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE,
  MakePurchaseResult,
} from "react-native-purchases";
import { VALIDATION_MODE } from "@/lib/config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubscriptionTier = "free" | "plus" | "pro";

export interface SubscriptionStatus {
  isPremium: boolean;
  tier: SubscriptionTier;
  isLoading: boolean;
}

export interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  customerInfo?: CustomerInfo;
}

// RevenueCat entitlement IDs (must match dashboard)
const ENTITLEMENT_PLUS = "noor_plus_access";
const ENTITLEMENT_PRO = "noor_pro_access";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const key = Platform.select({
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
  });
  // Fallback to legacy single-key env var
  return key || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";
}

function tierFromCustomerInfo(info: CustomerInfo): SubscriptionTier {
  if (info.entitlements.active[ENTITLEMENT_PRO]) return "pro";
  if (info.entitlements.active[ENTITLEMENT_PLUS]) return "plus";
  return "free";
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

let _initialized = false;

/**
 * Initialize RevenueCat SDK. Call once at app start.
 * Safe to call multiple times -- subsequent calls are no-ops.
 */
export async function initializeRevenueCat(): Promise<void> {
  if (_initialized || VALIDATION_MODE) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      "[RevenueCat] No API key. Set EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY.",
    );
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    await Purchases.configure({ apiKey, appUserID: undefined });
    _initialized = true;
    console.log("[RevenueCat] Initialized");
  } catch (error) {
    console.error("[RevenueCat] Init failed:", error);
  }
}

// ---------------------------------------------------------------------------
// Offerings
// ---------------------------------------------------------------------------

/**
 * Fetch available subscription offerings from RevenueCat.
 * Returns null when unavailable (validation mode, no network, etc.).
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (VALIDATION_MODE || !_initialized) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error("[RevenueCat] Failed to fetch offerings:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------

/**
 * Purchase a specific package from an offering.
 * Handles cancellation, network errors, and pending transactions gracefully.
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<PurchaseResult> {
  if (VALIDATION_MODE) {
    return { success: false, error: "Purchases disabled in validation mode" };
  }

  try {
    const result: MakePurchaseResult =
      await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo: result.customerInfo };
  } catch (error: unknown) {
    const err = error as { userCancelled?: boolean; code?: string; message?: string };
    // User cancelled -- not an error
    if (err.userCancelled || err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, cancelled: true };
    }

    // Payment pending (e.g. Ask to Buy, pending bank approval)
    if (err.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
      return { success: false, error: "Payment is pending approval." };
    }

    // Network error
    if (err.code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
      return {
        success: false,
        error: "Network error. Please check your connection and try again.",
      };
    }

    console.error("[RevenueCat] Purchase failed:", error);
    return { success: false, error: err.message || "Purchase failed" };
  }
}

// ---------------------------------------------------------------------------
// Restore
// ---------------------------------------------------------------------------

/**
 * Restore purchases for users who reinstalled or switched devices.
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (VALIDATION_MODE) {
    return { success: false, error: "Restore disabled in validation mode" };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const hasPremium =
      Object.keys(customerInfo.entitlements.active).length > 0;
    return { success: hasPremium, customerInfo };
  } catch (error: unknown) {
    console.error("[RevenueCat] Restore failed:", error);
    const msg = error instanceof Error ? error.message : "Restore failed";
    return { success: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Customer Info & Entitlements
// ---------------------------------------------------------------------------

/**
 * Get the current customer info from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (VALIDATION_MODE || !_initialized) return null;

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error("[RevenueCat] Failed to get customer info:", error);
    return null;
  }
}

/**
 * Check if user has a specific entitlement ('plus' or 'pro').
 */
export async function checkEntitlement(
  entitlementId: "plus" | "pro",
): Promise<boolean> {
  const info = await getCustomerInfo();
  if (!info) return false;

  const rcId =
    entitlementId === "pro" ? ENTITLEMENT_PRO : ENTITLEMENT_PLUS;

  // Pro tier includes Plus features
  if (entitlementId === "plus") {
    return (
      info.entitlements.active[ENTITLEMENT_PLUS] !== undefined ||
      info.entitlements.active[ENTITLEMENT_PRO] !== undefined
    );
  }

  return info.entitlements.active[rcId] !== undefined;
}

/**
 * Derive subscription status from customer info.
 */
export function statusFromCustomerInfo(info: CustomerInfo): SubscriptionStatus {
  const tier = tierFromCustomerInfo(info);
  return { isPremium: tier !== "free", tier, isLoading: false };
}

// ---------------------------------------------------------------------------
// Event Listener
// ---------------------------------------------------------------------------

type CustomerInfoListener = (info: CustomerInfo) => void;

/**
 * Subscribe to real-time customer info changes.
 * Returns an unsubscribe function.
 */
export function onCustomerInfoUpdated(
  listener: CustomerInfoListener,
): () => void {
  if (VALIDATION_MODE) return () => {};

  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}
