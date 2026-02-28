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
  | "unlimited_reflection_sessions"
  | "daily_reflection_limit"
  // Quran features
  | "quran_audio"
  | "quran_basic"
  // Islamic content features
  | "arabic_flashcards"
  | "hadith_search"
  | "adhkar_basic"
  | "offline_content"
  // Hifz features
  | "hifz_unlimited"
  | "hifz_ai_analysis"
  | "hifz_circles"
  // Tafsir & Verse features (Phase 6B)
  | "tafsir_unlimited"
  | "verse_discussion_unlimited"
  // Dua features (Phase 6C)
  | "dua_unlimited"
  // Study Plan features (Phase 6D)
  | "study_plan_regenerate"
  | "study_plan_adapt"
  | "study_plan_multiple"
  // Premium features
  | "ai_companion_unlimited"
  | "ai_tutor_unlimited"
  | "pronunciation_unlimited"
  | "ai_translation_explain"
  | "advanced_insights"
  | "priority_support";

// Feature -> Tier mapping
// New structure: all core Islamic features are free, premium features are Plus
const FEATURE_TIER_MAP: Record<FeatureName, SubscriptionTier> = {
  // Free tier features (all core Islamic features)
  daily_reflection_limit: "free",
  quran_basic: "free",
  quran_audio: "free",
  adhkar_basic: "free",
  arabic_flashcards: "free",
  hadith_search: "free",
  offline_content: "free",

  // Plus tier features (premium + advanced)
  unlimited_reflection_sessions: "plus",
  ai_companion_unlimited: "plus",
  ai_tutor_unlimited: "plus",
  pronunciation_unlimited: "plus",
  ai_translation_explain: "plus",
  advanced_insights: "plus",
  priority_support: "plus",
  hifz_unlimited: "plus",
  hifz_ai_analysis: "plus",
  tafsir_unlimited: "plus",
  verse_discussion_unlimited: "plus",
  dua_unlimited: "plus",
  study_plan_regenerate: "plus",
  study_plan_adapt: "plus",

  // Pro tier features (social + advanced analytics)
  hifz_circles: "pro",
  study_plan_multiple: "pro",
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
