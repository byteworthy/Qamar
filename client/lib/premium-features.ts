/**
 * Premium Feature Management
 *
 * Defines premium features for the Islamic app and provides
 * entitlement checking via RevenueCat.
 */

import { getCustomerInfo, checkEntitlement } from "@/services/revenuecat";
import { VALIDATION_MODE } from "./config";

/**
 * Premium Features Enum
 *
 * Each feature corresponds to an entitlement ID in RevenueCat.
 * These should match your RevenueCat dashboard configuration.
 */
export enum PremiumFeature {
  // ========== QURAN FEATURES ==========
  /**
   * Download Quran for offline reading (all surahs + translations)
   */
  QURAN_OFFLINE = "pro_quran_offline",

  /**
   * Access to all Quran translations (beyond default 1-2)
   */
  QURAN_ALL_TRANSLATIONS = "pro_quran_translations",

  /**
   * Quran audio recitations by multiple reciters
   */
  QURAN_AUDIO = "pro_quran_audio",

  /**
   * Advanced Quran search with filters and tagging
   */
  QURAN_ADVANCED_SEARCH = "pro_quran_search",

  // ========== ARABIC LEARNING FEATURES ==========
  /**
   * Access to all conversation scenarios (beyond basic greetings)
   */
  ARABIC_ALL_SCENARIOS = "pro_arabic_scenarios",

  /**
   * Unlimited flashcard reviews (no daily limit)
   */
  ARABIC_UNLIMITED_REVIEWS = "pro_arabic_unlimited",

  /**
   * AI-powered pronunciation feedback
   */
  ARABIC_PRONUNCIATION = "pro_arabic_pronunciation",

  /**
   * Custom vocabulary lists and progress tracking
   */
  ARABIC_CUSTOM_LISTS = "pro_arabic_custom_lists",

  // ========== PRAYER FEATURES ==========
  /**
   * Custom adhan (call to prayer) audio
   */
  PRAYER_CUSTOM_ADHAN = "pro_prayer_adhan",

  /**
   * Home screen widget for prayer times
   */
  PRAYER_WIDGET = "pro_prayer_widget",

  /**
   * Qibla direction finder
   */
  PRAYER_QIBLA = "pro_prayer_qibla",

  /**
   * Prayer history and streak tracking
   */
  PRAYER_HISTORY = "pro_prayer_history",

  // ========== REFLECTION FEATURES (existing) ==========
  /**
   * Access to guided reflection tools and exercises
   */
  REFLECTION_EXERCISES = "noor_plus_access",

  /**
   * Advanced reflection analytics and insights
   */
  REFLECTION_ADVANCED = "noor_pro_access",
}

/**
 * Check if user has access to a specific premium feature.
 *
 * @param feature - The premium feature to check
 * @returns Promise resolving to true if user has access
 *
 * @example
 * const canUseOffline = await hasFeature(PremiumFeature.QURAN_OFFLINE);
 * if (canUseOffline) {
 *   // Show offline download button
 * }
 */
export async function hasFeature(
  feature: PremiumFeature,
): Promise<boolean> {
  try {
    // In validation mode, simulate limited access
    if (VALIDATION_MODE) {
      console.log(
        `[RevenueCat] VALIDATION_MODE - Feature ${feature} access denied`,
      );
      return false;
    }

    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    // Check if user has this specific entitlement
    const hasAccess = customerInfo.entitlements.active[feature] !== undefined;

    // Pro tier includes all Plus features
    const tier = getRequiredTier(feature);
    if (!hasAccess && tier === "plus") {
      const hasProFallback =
        customerInfo.entitlements.active["noor_pro_access"] !== undefined;
      if (hasProFallback) return true;
    }

    console.log(`[RevenueCat] Feature ${feature}: ${hasAccess ? "granted" : "denied"}`);
    return hasAccess;
  } catch (error) {
    console.error("[RevenueCat] Error checking premium feature:", error);
    // Fail closed - deny access on error
    return false;
  }
}

/**
 * Check if user has any premium subscription.
 *
 * @returns Promise resolving to true if user is a premium subscriber
 *
 * @example
 * const isPremium = await isPremiumUser();
 * if (isPremium) {
 *   // Show premium badge
 * }
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    if (VALIDATION_MODE) {
      console.log("[RevenueCat] VALIDATION_MODE - Not a premium user");
      return false;
    }

    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return false;

    const hasAnyEntitlement =
      Object.keys(customerInfo.entitlements.active).length > 0;

    console.log(
      `[RevenueCat] Premium user: ${hasAnyEntitlement ? "Yes" : "No"}`,
    );
    return hasAnyEntitlement;
  } catch (error) {
    console.error("[RevenueCat] Error checking premium status:", error);
    return false;
  }
}

/**
 * Get all active premium features for the current user.
 *
 * @returns Promise resolving to array of active feature IDs
 *
 * @example
 * const features = await getActiveFeatures();
 * console.log('User has access to:', features);
 */
export async function getActiveFeatures(): Promise<string[]> {
  try {
    if (VALIDATION_MODE) {
      return [];
    }

    const customerInfo = await getCustomerInfo();
    if (!customerInfo) return [];

    const activeFeatures = Object.keys(customerInfo.entitlements.active);

    console.log(`[RevenueCat] Active features: ${activeFeatures.join(", ")}`);
    return activeFeatures;
  } catch (error) {
    console.error("[RevenueCat] Error fetching active features:", error);
    return [];
  }
}

/**
 * Check if user can access offline Quran features.
 * Convenience wrapper for common use case.
 */
export async function canAccessOfflineQuran(): Promise<boolean> {
  return hasFeature(PremiumFeature.QURAN_OFFLINE);
}

/**
 * Check if user can access all Arabic learning scenarios.
 * Convenience wrapper for common use case.
 */
export async function canAccessAllArabicScenarios(): Promise<boolean> {
  return hasFeature(PremiumFeature.ARABIC_ALL_SCENARIOS);
}

/**
 * Check if user can access prayer widgets.
 * Convenience wrapper for common use case.
 */
export async function canAccessPrayerWidget(): Promise<boolean> {
  return hasFeature(PremiumFeature.PRAYER_WIDGET);
}

/**
 * Feature tier configuration.
 * Maps features to their required subscription tier.
 */
export const FEATURE_TIERS = {
  // Plus tier features (lower tier)
  plus: [
    PremiumFeature.QURAN_OFFLINE,
    PremiumFeature.ARABIC_ALL_SCENARIOS,
    PremiumFeature.PRAYER_CUSTOM_ADHAN,
    PremiumFeature.REFLECTION_EXERCISES,
  ],

  // Pro tier features (higher tier)
  pro: [
    PremiumFeature.QURAN_ALL_TRANSLATIONS,
    PremiumFeature.QURAN_AUDIO,
    PremiumFeature.QURAN_ADVANCED_SEARCH,
    PremiumFeature.ARABIC_UNLIMITED_REVIEWS,
    PremiumFeature.ARABIC_PRONUNCIATION,
    PremiumFeature.ARABIC_CUSTOM_LISTS,
    PremiumFeature.PRAYER_WIDGET,
    PremiumFeature.PRAYER_QIBLA,
    PremiumFeature.PRAYER_HISTORY,
    PremiumFeature.REFLECTION_ADVANCED,
  ],
} as const;

/**
 * Get the required tier for a feature.
 *
 * @param feature - The feature to check
 * @returns 'plus' | 'pro' | null
 */
export function getRequiredTier(
  feature: PremiumFeature,
): "plus" | "pro" | null {
  if ((FEATURE_TIERS.plus as readonly PremiumFeature[]).includes(feature)) return "plus";
  if ((FEATURE_TIERS.pro as readonly PremiumFeature[]).includes(feature)) return "pro";
  return null;
}
