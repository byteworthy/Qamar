import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
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
      {isPremium ? (
        <View style={[styles.badge, { backgroundColor: SiraatColors.indigo }]}>
          <ThemedText style={styles.badgeText}>RECOMMENDED</ThemedText>
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

      {isCurrentPlan ? (
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
          {loading ? "Loading..." : isPremium ? "Upgrade to Plus" : "Select"}
        </Button>
      ) : null}
    </View>
  );
}

export default function PricingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { data: billingProfile } = useQuery({
    queryKey: BILLING_QUERY_KEY,
    queryFn: getBillingProfile,
  });

  const isPaid = billingProfile ? isPaidTier(billingProfile.tier) : false;
  const isPremium = billingProfile
    ? isPremiumTier(billingProfile.tier)
    : false;

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
    { text: "1 reflection per day", included: true },
    { text: "View last 3 reflections", included: true },
    { text: "Unlimited reflections", included: false },
    { text: "Full history access", included: false },
    { text: "Pattern insights", included: false },
    { text: "Contextual duas", included: false },
  ];

  const proFeatures: PlanFeature[] = [
    { text: "Unlimited reflections", included: true },
    { text: "Full reflection history", included: true },
    { text: "Pattern insights and summaries", included: true },
    { text: "Personal assumption library", included: true },
    { text: "Contextual duas by inner state", included: true },
    { text: "Cancel anytime", included: true },
  ];

  const premiumFeatures: PlanFeature[] = [
    { text: "Everything in Pro", included: true },
    { text: "Priority support", included: true },
    { text: "Early access to new modules", included: true },
    { text: "Cancel anytime", included: true },
  ];

  return (
    <Screen title="Upgrade" showBack>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { fontFamily: Fonts?.serif }]}>
          Deepen Your Practice
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Choose the plan that fits your pace. Purchases are handled in the app
          store.
        </ThemedText>
      </View>

      <View style={styles.plansContainer}>
        <PlanCard
          name="Free"
          price="$0"
          features={freeFeatures}
          isCurrentPlan={!isPaid}
        />

        <PlanCard
          name="Pro"
          price="$9.99"
          period="/month"
          features={proFeatures}
          isCurrentPlan={billingProfile?.tier === "pro"}
          isPremium
          onSelect={isPaid ? undefined : () => handleUpgrade("pro", "monthly")}
          loading={loading}
        />

        <PlanCard
          name="Premium"
          price="$19.99"
          period="/month"
          features={premiumFeatures}
          isCurrentPlan={billingProfile?.tier === "premium"}
          onSelect={
            isPremium ? undefined : () => handleUpgrade("premium", "monthly")
          }
          loading={loading}
        />
      </View>

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
});
