/**
 * useSubscription Hook
 *
 * React hook for checking user subscription status and entitlements.
 * Uses RevenueCat SDK to determine if user has access to Plus or Pro features.
 */

import { useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { VALIDATION_MODE } from '@/lib/config';

interface SubscriptionStatus {
  isPlusSubscriber: boolean;
  isProSubscriber: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to check and monitor user subscription status
 *
 * @returns Subscription status and refresh function
 *
 * @example
 * ```typescript
 * function ProfileScreen() {
 *   const { isPlusSubscriber, isProSubscriber, isLoading } = useSubscription();
 *
 *   if (isLoading) return <Loading />;
 *   if (isProSubscriber) return <ProFeatures />;
 *   if (isPlusSubscriber) return <PlusFeatures />;
 *   return <FreeFeatures />;
 * }
 * ```
 */
export function useSubscription(): SubscriptionStatus {
  const [isPlusSubscriber, setIsPlusSubscriber] = useState(false);
  const [isProSubscriber, setIsProSubscriber] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function checkSubscription(): Promise<void> {
    try {
      // In validation mode, user is always free tier
      if (VALIDATION_MODE) {
        setIsPlusSubscriber(false);
        setIsProSubscriber(false);
        setIsLoading(false);
        return;
      }

      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();

      // Check entitlements from RevenueCat
      const hasProAccess = customerInfo.entitlements.active['noor_pro_access'] !== undefined;
      const hasPlusAccess = customerInfo.entitlements.active['noor_plus_access'] !== undefined;

      setIsProSubscriber(hasProAccess);
      setIsPlusSubscriber(hasPlusAccess || hasProAccess); // Pro includes Plus features
    } catch (error) {
      console.error('[useSubscription] Failed to check subscription status:', error);
      // On error, default to free tier
      setIsPlusSubscriber(false);
      setIsProSubscriber(false);
    } finally {
      setIsLoading(false);
    }
  }

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription();
  }, []);

  // Listen for subscription updates (purchases, expirations)
  useEffect(() => {
    if (VALIDATION_MODE) return;

    const customerInfoListener = (info: CustomerInfo) => {
      const hasProAccess = info.entitlements.active['noor_pro_access'] !== undefined;
      const hasPlusAccess = info.entitlements.active['noor_plus_access'] !== undefined;

      setIsProSubscriber(hasProAccess);
      setIsPlusSubscriber(hasPlusAccess || hasProAccess);
    };

    // Add listener for real-time updates
    Purchases.addCustomerInfoUpdateListener(customerInfoListener);

    // Cleanup listener on unmount
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    };
  }, []);

  return {
    isPlusSubscriber,
    isProSubscriber,
    isLoading,
    refresh: checkSubscription,
  };
}
