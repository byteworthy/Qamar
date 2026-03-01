/**
 * Premium Feature Gate Component
 *
 * Controls access to premium features with automatic paywall display.
 * Checks RevenueCat entitlements and shows upgrade prompt for locked features.
 */

import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  hasFeature,
  PremiumFeature,
  getRequiredTier,
} from "@/lib/premium-features";
import { logFeaturePaywallShown } from "@/lib/analytics";
import { PremiumUpsell } from "./PremiumUpsell";
import { LoadingState } from "./LoadingState";

/**
 * Props for PremiumFeatureGate component
 */
interface PremiumFeatureGateProps {
  /**
   * The premium feature to check access for
   */
  feature: PremiumFeature;

  /**
   * Content to show when user has access
   */
  children: React.ReactNode;

  /**
   * Optional custom fallback when user lacks access.
   * If not provided, shows default PremiumUpsell component.
   */
  fallback?: React.ReactNode;

  /**
   * Optional callback when access check completes
   */
  onAccessCheck?: (hasAccess: boolean) => void;

  /**
   * Optional loading component
   */
  loadingComponent?: React.ReactNode;
}

/**
 * Feature Gate Component
 *
 * Wraps premium content and shows paywall for non-premium users.
 *
 * @example
 * <PremiumFeatureGate feature={PremiumFeature.QURAN_AUDIO}>
 *   <AudioPlayer />
 * </PremiumFeatureGate>
 *
 * @example
 * // With custom fallback
 * <PremiumFeatureGate
 *   feature={PremiumFeature.QURAN_OFFLINE}
 *   fallback={<CustomUpgradePrompt />}
 * >
 *   <OfflineDownloadButton />
 * </PremiumFeatureGate>
 */
export function PremiumFeatureGate({
  feature,
  children,
  fallback,
  onAccessCheck,
  loadingComponent,
}: PremiumFeatureGateProps): React.JSX.Element | null {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    checkAccess();
  }, [feature]);

  async function checkAccess() {
    setLoading(true);
    try {
      const access = await hasFeature(feature);
      setHasAccess(access);

      // Track paywall impression if user lacks access
      if (!access) {
        logFeaturePaywallShown(feature);
      }

      // Notify parent component
      onAccessCheck?.(access);
    } catch (error) {
      console.error("[PremiumFeatureGate] Access check failed:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while checking access
  if (loading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <View style={styles.loadingContainer}>
        <LoadingState text="Checking access..." />
      </View>
    );
  }

  // User has access - show protected content
  if (hasAccess) {
    return <>{children}</>;
  }

  // User lacks access - show upsell or custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upsell component
  return (
    <PremiumUpsell
      feature={feature}
      requiredTier={getRequiredTier(feature)}
      onUpgrade={() => {
        // Navigate to pricing/paywall screen
        // @ts-expect-error - Navigation types may not include all routes
        navigation.navigate("Pricing", { feature });
      }}
      onDismiss={() => {
        // User can navigate back or we handle dismissal
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }}
    />
  );
}

/**
 * Hook for checking premium feature access
 *
 * Returns current access status and a refresh function.
 *
 * @example
 * const { hasAccess, loading, refresh } = usePremiumFeature(PremiumFeature.QURAN_AUDIO);
 */
export function usePremiumFeature(feature: PremiumFeature) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = async () => {
    setLoading(true);
    try {
      const access = await hasFeature(feature);
      setHasAccess(access);

      if (!access) {
        logFeaturePaywallShown(feature);
      }
    } catch (error) {
      console.error("[usePremiumFeature] Access check failed:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [feature]);

  return {
    hasAccess,
    loading,
    refresh: checkAccess,
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
