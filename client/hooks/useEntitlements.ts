/**
 * useEntitlements Hook
 *
 * Provides feature gating logic based on subscription tier.
 * Wraps useSubscriptionStatus to expose simple boolean checks.
 */

import { useMemo } from "react";
import { useSubscriptionStatus } from "./useRevenueCat";
import { SubscriptionTier } from "@/services/revenuecat";

export interface EntitlementsState {
  isPlusUser: boolean;
  isProUser: boolean;
  isFreeUser: boolean;
  tier: SubscriptionTier;
  isLoading: boolean;
  canAccessFeature: (feature: FeatureName) => boolean;
}

// Feature names used throughout the app
export type FeatureName =
  // Core features
  | "unlimited_cbt_sessions"
  | "daily_cbt_limit"
  // Quran features
  | "quran_audio"
  | "quran_basic"
  // Islamic content features
  | "arabic_flashcards"
  | "hadith_search"
  | "adhkar_basic"
  | "offline_content"
  // Premium features
  | "ai_companion_unlimited"
  | "ai_tutor_unlimited"
  | "pronunciation_unlimited"
  | "ai_translation_explain"
  | "advanced_insights"
  | "priority_support";

// Feature -> Tier mapping
// New structure: all non-AI features are free, AI features are Plus
const FEATURE_TIER_MAP: Record<FeatureName, SubscriptionTier> = {
  // Free tier features (all core Islamic features)
  daily_cbt_limit: "free",
  quran_basic: "free",
  quran_audio: "free",
  adhkar_basic: "free",
  arabic_flashcards: "free",
  hadith_search: "free",
  offline_content: "free",

  // Plus tier features (AI-powered only)
  unlimited_cbt_sessions: "plus",
  ai_companion_unlimited: "plus",
  ai_tutor_unlimited: "plus",
  pronunciation_unlimited: "plus",
  ai_translation_explain: "plus",
  advanced_insights: "plus",
  priority_support: "plus",
};

/**
 * Get the minimum tier required for a feature.
 */
function getRequiredTier(feature: FeatureName): SubscriptionTier {
  return FEATURE_TIER_MAP[feature] || "free";
}

/**
 * Check if a user's tier grants access to a feature.
 * Pro users have access to all Plus features.
 */
function tierHasAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierOrder: SubscriptionTier[] = ["free", "plus", "pro"];
  const userLevel = tierOrder.indexOf(userTier);
  const requiredLevel = tierOrder.indexOf(requiredTier);
  return userLevel >= requiredLevel;
}

/**
 * Hook that provides entitlement checks based on subscription status.
 */
export function useEntitlements(): EntitlementsState {
  const { tier, isPremium, isLoading } = useSubscriptionStatus();

  const entitlements = useMemo(() => {
    const isPlusUser = tier === "plus" || tier === "pro";
    const isProUser = tier === "pro";
    const isFreeUser = tier === "free";

    const canAccessFeature = (feature: FeatureName): boolean => {
      const requiredTier = getRequiredTier(feature);
      return tierHasAccess(tier, requiredTier);
    };

    return {
      isPlusUser,
      isProUser,
      isFreeUser,
      tier,
      isLoading,
      canAccessFeature,
    };
  }, [tier, isLoading]);

  return entitlements;
}
