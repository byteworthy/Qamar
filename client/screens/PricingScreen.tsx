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
  isPremiumTier,
  openManageSubscriptions,
  purchaseTier,
  restorePurchases,
} from "@/lib/billingProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
          borderColor: isPremium ? SiraatColors.indigo : theme.border,
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
                feature.included ? SiraatColors.emerald : theme.textSecondary
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
              ? SiraatColors.indigo
              : theme.backgroundDefault,
            marginTop: spacing.lg,
          }}
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
  const isPremium = billingProfile ? isPremiumTier(billingProfile.tier) : false;

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
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to restore purchase");
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
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start purchase");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      await openManageSubscriptions();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to open subscriptions");
    } finally {
      setManagingBilling(false);
    }
  };

  const freeFeatures: PlanFeature[] = [
    { text: "1 full reflection session", included: true },
    { text: "Full 5-stage flow", included: true },
    { text: "Islamic reflection framing", included: true },
    { text: "Local on-device storage", included: true },
    { text: "Session history", included: false },
    { text: "Insights or trends", included: false },
  ];

  const proFeatures: PlanFeature[] = [
    { text: "Unlimited reflection sessions", included: true },
    { text: "Full session history", included: true },
    { text: "Session summaries", included: true },
    { text: "Basic insights", included: true },
    { text: "Save intentions for later review", included: true },
    { text: "Cancel anytime", included: true },
  ];

  const premiumFeatures: PlanFeature[] = [
    { text: "Everything in Pro", included: true },
    { text: "Repeating thought patterns", included: true },
    { text: "Intention follow-through review", included: true },
    { text: "Weekly reflection summaries", included: true },
    { text: "Monthly clarity snapshot", included: true },
    { text: "Cancel anytime", included: true },
  ];

  return (
    <Screen title="Upgrade" showBack>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { fontFamily: Fonts?.serif }]}>
          Support Your Practice
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Choose the plan that fits your pace.
        </ThemedText>
      </View>

      {/* VALIDATION MODE banner */}
      {VALIDATION_MODE ? (
        <View
          style={[
            styles.validationBanner,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[styles.validationText, { color: theme.textSecondary }]}
          >
            Validation Build — Paid tiers coming soon
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
          name="Pro"
          price="$3.99"
          period="/month"
          features={proFeatures}
          isCurrentPlan={!VALIDATION_MODE && billingProfile?.tier === "pro"}
          comingSoon={VALIDATION_MODE}
          onSelect={
            VALIDATION_MODE || isPaid
              ? undefined
              : () => handleUpgrade("pro", "monthly")
          }
          loading={loading}
        />

        <PlanCard
          name="Premium"
          price="$7.99"
          period="/month"
          features={premiumFeatures}
          isCurrentPlan={!VALIDATION_MODE && billingProfile?.tier === "premium"}
          isPremium={!VALIDATION_MODE}
          comingSoon={VALIDATION_MODE}
          onSelect={
            VALIDATION_MODE || isPremium
              ? undefined
              : () => handleUpgrade("premium", "monthly")
          }
          loading={loading}
        />
      </View>

      {/* Hide billing actions in validation mode */}
      {!VALIDATION_MODE ? (
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
            >
              {syncing ? "Checking..." : "Restore Purchase"}
            </Button>
          </View>

          <View style={styles.manageBillingContainer}>
            <Button
              onPress={handleManageBilling}
              disabled={managingBilling}
              style={{ backgroundColor: theme.backgroundDefault }}
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
