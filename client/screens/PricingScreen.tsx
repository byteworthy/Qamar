import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { VALIDATION_MODE } from "@/lib/config";
import { Layout } from "@/constants/layout";
import { Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  BILLING_QUERY_KEY,
  BillingTier,
  getBillingProfile,
  isPaidTier,
  isProTier,
  isStoreBillingActive,
  openManageSubscriptions,
  purchaseTier,
  restorePurchases,
} from "@/lib/billingProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Returns a user-friendly billing error message.
 * Never exposes raw SDK errors to users.
 */
function getBillingUserMessage(
  err: unknown,
  context: "purchase" | "restore" | "manage",
): { title: string; message: string } {
  // Extract message safely
  const rawMessage =
    err instanceof Error
      ? err.message.toLowerCase()
      : String(err).toLowerCase();

  // Log for debugging (dev only shows in console)
  if (__DEV__) {
    console.error(`[Billing ${context}] Raw error:`, err);
  }

  // Detect user cancellation patterns
  const isCanceled =
    rawMessage.includes("cancel") ||
    rawMessage.includes("cancelled") ||
    rawMessage.includes("user canceled") ||
    rawMessage.includes("user cancelled") ||
    rawMessage.includes("sku_error_cancelled") ||
    rawMessage.includes("e_user_cancelled");

  if (isCanceled) {
    return {
      title: "Purchase Canceled",
      message: "Your purchase was canceled. No charges were made.",
    };
  }

  // Detect not available patterns
  const isNotAvailable =
    rawMessage.includes("not available") ||
    rawMessage.includes("unavailable") ||
    rawMessage.includes("billing_unavailable") ||
    rawMessage.includes("service_disconnected");

  if (isNotAvailable) {
    return {
      title: "Temporarily Unavailable",
      message:
        "Subscriptions aren't available right now. Please wait a moment and try again.",
    };
  }

  // Context-specific fallback messages
  switch (context) {
    case "restore":
      return {
        title: "Can't Restore Purchases",
        message: "We couldn't restore your purchases. Check your connection and try again.",
      };
    case "manage":
      return {
        title: "Can't Open Settings",
        message:
          "We couldn't open your subscription settings. Please try again or manage through your App Store settings.",
      };
    case "purchase":
    default:
      return {
        title: "Purchase Incomplete",
        message: "We couldn't complete your purchase. Please check your payment method and try again.",
      };
  }
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  features: PlanFeature[];
  isCurrentPlan: boolean;
  isPremium?: boolean;
  onSelect?: () => void;
  loading?: boolean;
  comingSoon?: boolean;
}

const { spacing, radii, container, typeScale } = Layout;

function PlanCard({
  name,
  price,
  period,
  features,
  isCurrentPlan,
  isPremium,
  onSelect,
  loading,
  comingSoon,
}: PlanCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.planCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isPremium ? theme.accent : theme.border,
          borderWidth: isPremium ? 2 : 1,
        },
      ]}
    >
      {comingSoon ? (
        <View style={[styles.badge, { backgroundColor: theme.textSecondary }]}>
          <ThemedText style={styles.badgeText}>COMING SOON</ThemedText>
        </View>
      ) : null}

      <ThemedText style={[styles.planName, { fontFamily: Fonts?.serif }]}>
        {name}
      </ThemedText>

      <View style={styles.priceContainer}>
        <ThemedText style={styles.price}>{price}</ThemedText>
        {period ? (
          <ThemedText style={[styles.period, { color: theme.textSecondary }]}>
            {period}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Feather
              name={feature.included ? "check" : "x"}
              size={16}
              color={
                feature.included ? theme.success : theme.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.featureText,
                { color: feature.included ? theme.text : theme.textSecondary },
              ]}
            >
              {feature.text}
            </ThemedText>
          </View>
        ))}
      </View>

      {comingSoon ? (
        <View
          style={[
            styles.currentPlanBadge,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[styles.currentPlanText, { color: theme.textSecondary }]}
          >
            Available at launch
          </ThemedText>
        </View>
      ) : isCurrentPlan ? (
        <View
          style={[
            styles.currentPlanBadge,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[styles.currentPlanText, { color: theme.textSecondary }]}
          >
            Current Plan
          </ThemedText>
        </View>
      ) : onSelect ? (
        <Button
          onPress={onSelect}
          disabled={loading}
          style={{
            backgroundColor: isPremium
              ? theme.accent
              : theme.backgroundDefault,
            marginTop: spacing.lg,
          }}
          accessibilityHint={`Subscribes to ${name} plan. ${price}${period || ""}`}
        >
          {loading ? "Loading..." : `Select ${name}`}
        </Button>
      ) : null}
    </View>
  );
}

export default function PricingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { data: billingProfile } = useQuery({
    queryKey: BILLING_QUERY_KEY,
    queryFn: getBillingProfile,
  });

  const isPaid = billingProfile ? isPaidTier(billingProfile.tier) : false;
  const isPro = billingProfile ? isProTier(billingProfile.tier) : false;

  // Billing is disabled if in validation mode OR store billing is not configured
  const billingDisabled = VALIDATION_MODE || !isStoreBillingActive();

  const handleRestorePurchase = async () => {
    setSyncing(true);
    try {
      const result = await restorePurchases();
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["/api/reflection/can-reflect"],
      });
      if (isPaidTier(result.tier)) {
        Alert.alert(
          "Subscription Restored",
          "Your subscription has been activated.",
        );
      } else {
        Alert.alert(
          "No Active Subscription",
          "We couldn't find an active subscription. If you recently purchased, please wait a moment and try again.",
        );
      }
    } catch (error: unknown) {
      const { title, message } = getBillingUserMessage(error, "restore");
      Alert.alert(title, message);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpgrade = async (
    tier: BillingTier,
    period: "monthly" | "yearly",
  ) => {
    setLoading(true);
    try {
      const result = await purchaseTier(tier, period);
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["/api/reflection/can-reflect"],
      });
      if (isPaidTier(result.tier)) {
        Alert.alert("Subscription Activated", "Your subscription is active.");
      }
    } catch (error: unknown) {
      const { title, message } = getBillingUserMessage(error, "purchase");
      Alert.alert(title, message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      await openManageSubscriptions();
    } catch (error: unknown) {
      const { title, message } = getBillingUserMessage(error, "manage");
      Alert.alert(title, message);
    } finally {
      setManagingBilling(false);
    }
  };

  const freeFeatures: PlanFeature[] = [
    { text: "1 reflection per day", included: true },
    { text: "Basic journaling", included: true },
    { text: "Islamic reframes", included: true },
    { text: "Unlimited reflections", included: false },
    { text: "Pattern insights", included: false },
    { text: "Contextual duas", included: false },
  ];

  const plusFeatures: PlanFeature[] = [
    { text: "Unlimited reflections", included: true },
    { text: "Pattern insights", included: true },
    { text: "Contextual duas", included: true },
    { text: "Full history (30 days)", included: true },
    { text: "Lock in $2.99 rate forever", included: true },
    { text: "Cancel anytime", included: true },
  ];

  const proFeatures: PlanFeature[] = [
    { text: "Everything in Plus", included: true },
    { text: "All personas", included: true },
    { text: "Advanced insights", included: true },
    { text: "Deeper pattern tracking", included: true },
    { text: "Export data", included: true },
    { text: "Priority features", included: true },
  ];

  return (
    <Screen title="Upgrade" showBack>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { fontFamily: Fonts?.serif }]}>
          Early Access Pricing
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Lock in beta rates forever. Price increases to $6.99/month after launch.
        </ThemedText>
      </View>

      {/* Show banner when billing is disabled (validation mode or not configured) */}
      {billingDisabled ? (
        <View
          style={[
            styles.validationBanner,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[styles.validationText, { color: theme.textSecondary }]}
          >
            {VALIDATION_MODE
              ? "Validation Build — Paid tiers coming soon"
              : "Subscriptions coming soon"}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.plansContainer}>
        <PlanCard
          name="Free"
          price="$0"
          features={freeFeatures}
          isCurrentPlan={!isPaid}
        />

        <PlanCard
          name="Noor Plus (Beta)"
          price="$2.99"
          period="/month"
          features={plusFeatures}
          isCurrentPlan={!billingDisabled && billingProfile?.tier === "plus"}
          isPremium={!billingDisabled}
          comingSoon={billingDisabled}
          onSelect={
            billingDisabled || isPaid
              ? undefined
              : () => handleUpgrade("plus", "monthly")
          }
          loading={loading}
        />

        <PlanCard
          name="Noor Pro"
          price="$6.99"
          period="/month"
          features={proFeatures}
          isCurrentPlan={!billingDisabled && billingProfile?.tier === "pro"}
          comingSoon={true}
          onSelect={undefined}
          loading={loading}
        />
      </View>

      {/* Hide billing actions when billing is disabled */}
      {!billingDisabled ? (
        <>
          <View
            style={[
              styles.restoreContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText
              style={[styles.restoreLabel, { color: theme.textSecondary }]}
            >
              Already purchased?
            </ThemedText>
            <Button
              onPress={handleRestorePurchase}
              disabled={syncing}
              variant="secondary"
              style={{ backgroundColor: "transparent" }}
              accessibilityHint="Restores previous purchases from your Apple ID or Google Play account"
            >
              {syncing ? "Checking..." : "Restore Purchase"}
            </Button>
          </View>

          <View style={styles.manageBillingContainer}>
            <Button
              onPress={handleManageBilling}
              disabled={managingBilling}
              style={{ backgroundColor: theme.backgroundDefault }}
              accessibilityHint="Opens App Store or Google Play to manage your active subscriptions"
            >
              {managingBilling ? "Loading..." : "Manage Subscriptions"}
            </Button>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typeScale.h2,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    fontSize: typeScale.body,
    lineHeight: 20,
  },
  plansContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  planCard: {
    width: "100%",
    padding: container.cardPad,
    borderRadius: radii.lg,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -12,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  badgeText: {
    color: "#fff",
    fontSize: typeScale.small,
    fontWeight: "600",
  },
  planName: {
    fontSize: typeScale.h2,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.lg,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
  },
  period: {
    fontSize: typeScale.body,
    marginLeft: 2,
  },
  featuresContainer: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
  },
  currentPlanBadge: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  currentPlanText: {
    fontSize: typeScale.body,
  },
  restoreContainer: {
    padding: container.cardPad,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  restoreLabel: {
    fontSize: typeScale.small,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  manageBillingContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  validationBanner: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  validationText: {
    fontSize: typeScale.small,
    textAlign: "center",
  },
});
