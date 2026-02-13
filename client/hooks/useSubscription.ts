/**
 * useSubscription Hook
 *
 * Thin wrapper over useSubscriptionStatus from useRevenueCat.
 * Maintains the original API for backward compatibility.
 */

import { useSubscriptionStatus } from "./useRevenueCat";

interface SubscriptionStatus {
  isPlusSubscriber: boolean;
  isProSubscriber: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to check and monitor user subscription status.
 * Delegates to the canonical useSubscriptionStatus hook.
 */
export function useSubscription(): SubscriptionStatus {
  const { isPremium, tier, isLoading, refresh } = useSubscriptionStatus();

  return {
    isPlusSubscriber: tier === "plus" || tier === "pro",
    isProSubscriber: tier === "pro",
    isLoading,
    refresh,
  };
}
