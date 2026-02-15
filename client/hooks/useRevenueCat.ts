/**
 * RevenueCat React Hooks
 *
 * Provides reactive subscription state, offerings, purchase, and restore hooks.
 */

import { useCallback, useEffect, useState } from "react";
import { PurchasesOfferings, PurchasesPackage } from "react-native-purchases";
import {
  getOfferings,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
  onCustomerInfoUpdated,
  statusFromCustomerInfo,
  SubscriptionStatus,
  SubscriptionTier,
  PurchaseResult,
} from "@/services/revenuecat";
import { VALIDATION_MODE } from "@/lib/config";

// ---------------------------------------------------------------------------
// useSubscriptionStatus
// ---------------------------------------------------------------------------

/**
 * Reactive subscription status that auto-updates on purchases/expirations.
 */
export function useSubscriptionStatus(): SubscriptionStatus & {
  refresh: () => Promise<void>;
} {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    tier: "free" as SubscriptionTier,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    if (VALIDATION_MODE) {
      setStatus({ isPremium: false, tier: "free", isLoading: false });
      return;
    }

    const info = await getCustomerInfo();
    if (info) {
      setStatus(statusFromCustomerInfo(info));
    } else {
      setStatus({ isPremium: false, tier: "free", isLoading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for real-time changes
  useEffect(() => {
    const unsubscribe = onCustomerInfoUpdated((info) => {
      setStatus(statusFromCustomerInfo(info));
    });
    return unsubscribe;
  }, []);

  return { ...status, refresh };
}

// ---------------------------------------------------------------------------
// useOfferings
// ---------------------------------------------------------------------------

interface OfferingsState {
  offerings: PurchasesOfferings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Fetch and cache available subscription offerings.
 */
export function useOfferings(): OfferingsState {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getOfferings();
    if (result) {
      setOfferings(result);
    } else if (!VALIDATION_MODE) {
      setError("Unable to load subscription options. Please try again.");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { offerings, isLoading, error, refresh };
}

// ---------------------------------------------------------------------------
// usePurchase
// ---------------------------------------------------------------------------

interface PurchaseState {
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Mutation hook for executing a purchase.
 */
export function usePurchase(): PurchaseState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      setIsLoading(true);
      setError(null);

      const result = await purchasePackage(pkg);

      if (!result.success && !result.cancelled && result.error) {
        setError(result.error);
      }

      setIsLoading(false);
      return result;
    },
    [],
  );

  return { purchase, isLoading, error };
}

// ---------------------------------------------------------------------------
// useRestorePurchases
// ---------------------------------------------------------------------------

interface RestoreState {
  restore: () => Promise<PurchaseResult>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Mutation hook for restoring purchases.
 */
export function useRestorePurchases(): RestoreState {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setIsLoading(true);
    setError(null);

    const result = await restorePurchases();

    if (!result.success && result.error) {
      setError(result.error);
    }

    setIsLoading(false);
    return result;
  }, []);

  return { restore, isLoading, error };
}
