import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { VALIDATION_MODE } from "@/lib/config";
import {
  Fonts,
  QamarColors,
  Spacing,
  BorderRadius,
  Gradients,
} from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  BILLING_QUERY_KEY,
  getBillingProfile,
  isPaidTier,
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
  const rawMessage =
    err instanceof Error
      ? err.message.toLowerCase()
      : String(err).toLowerCase();

  if (__DEV__) {
    console.error(`[Billing ${context}] Raw error:`, err);
  }

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

  switch (context) {
    case "restore":
      return {
        title: "Can't Restore Purchases",
        message:
          "We couldn't restore your purchases. Check your connection and try again.",
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
        message:
          "We couldn't complete your purchase. Please check your payment method and try again.",
      };
  }
}

// ---------------------------------------------------------------------------
// Feature comparison data
// ---------------------------------------------------------------------------

interface ComparisonFeature {
  label: string;
  free: boolean;
  plus: boolean;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  { label: "Daily reflection (1/day)", free: true, plus: true },
  { label: "Basic journaling", free: true, plus: true },
  { label: "Islamic reframes", free: true, plus: true },
  { label: "Unlimited conversations", free: false, plus: true },
  { label: "Full Quran audio recitations", free: false, plus: true },
  { label: "All Arabic scenarios", free: false, plus: true },
  { label: "Hadith library access", free: false, plus: true },
  { label: "Pattern insights & analytics", free: false, plus: true },
  { label: "Export reflections", free: false, plus: true },
  { label: "Contextual duas", free: false, plus: true },
  { label: "30-day full history", free: false, plus: true },
];

// ---------------------------------------------------------------------------
// Plan selector types
// ---------------------------------------------------------------------------

type PlanId = "monthly" | "yearly" | "lifetime";

interface PlanOption {
  id: PlanId;
  label: string;
  price: string;
  period?: string;
  badge?: string;
  perMonth?: string;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$2.99",
    period: "/month",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$19.99",
    period: "/year",
    badge: "Best Value",
    perMonth: "$1.67/mo",
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$49.99",
    period: "one-time",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const GOLD = QamarColors.gold;

function FeatureComparisonRow({
  feature,
  theme,
  index,
}: {
  feature: ComparisonFeature;
  theme: ReturnType<typeof useTheme>["theme"];
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.comparisonRow,
        {
          backgroundColor:
            index % 2 === 0 ? "transparent" : theme.backgroundDefault + "40",
          opacity: fadeAnim,
        },
      ]}
    >
      <ThemedText
        style={[styles.comparisonLabel, { color: theme.text }]}
        numberOfLines={1}
      >
        {feature.label}
      </ThemedText>
      <View style={styles.comparisonChecks}>
        <View style={styles.comparisonCell}>
          {feature.free ? (
            <Feather name="check" size={16} color={theme.success} />
          ) : (
            <Feather
              name="minus"
              size={14}
              color={theme.textSecondary + "60"}
            />
          )}
        </View>
        <View style={styles.comparisonCell}>
          <Feather name="check" size={16} color={GOLD} />
        </View>
      </View>
    </Animated.View>
  );
}

function PlanSelector({
  plan,
  selected,
  onSelect,
  theme,
  colorScheme,
  testID,
}: {
  plan: PlanOption;
  selected: boolean;
  onSelect: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
  colorScheme: string;
  testID?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect();
  };

  const gradientColors =
    colorScheme === "dark"
      ? (Gradients.dark.buttonGradient.colors as unknown as [string, string])
      : (Gradients.light.buttonGradient.colors as unknown as [string, string]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={`${plan.label} plan, ${plan.price} ${plan.period || ""}`}
        style={[
          styles.planSelector,
          {
            backgroundColor: selected
              ? theme.cardBackground
              : theme.backgroundDefault,
            borderColor: selected ? GOLD : theme.border,
            borderWidth: selected ? 2 : 1,
          },
        ]}
      >
        {plan.badge ? (
          <LinearGradient
            colors={[...gradientColors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.planBadge}
          >
            <ThemedText style={styles.planBadgeText}>{plan.badge}</ThemedText>
          </LinearGradient>
        ) : null}

        {/* Radio indicator */}
        <View
          style={[
            styles.radioOuter,
            { borderColor: selected ? GOLD : theme.textSecondary + "60" },
          ]}
        >
          {selected ? (
            <View style={[styles.radioInner, { backgroundColor: GOLD }]} />
          ) : null}
        </View>

        <View style={styles.planSelectorInfo}>
          <ThemedText
            style={[
              styles.planSelectorLabel,
              { fontFamily: Fonts?.sansMedium, color: theme.text },
            ]}
          >
            {plan.label}
          </ThemedText>
          {plan.perMonth ? (
            <ThemedText style={[styles.planPerMonth, { color: GOLD }]}>
              {plan.perMonth}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.planSelectorPriceBlock}>
          <ThemedText
            style={[
              styles.planSelectorPrice,
              { color: theme.text, fontFamily: Fonts?.sansBold },
            ]}
          >
            {plan.price}
          </ThemedText>
          {plan.period ? (
            <ThemedText
              style={[
                styles.planSelectorPeriod,
                { color: theme.textSecondary },
              ]}
            >
              {plan.period}
            </ThemedText>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function PricingScreen() {
  const { theme } = useTheme();
  const colorScheme = useColorScheme() ?? "dark";
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("yearly");

  const { data: billingProfile } = useQuery({
    queryKey: BILLING_QUERY_KEY,
    queryFn: getBillingProfile,
  });

  const isPaid = billingProfile ? isPaidTier(billingProfile.tier) : false;
  const billingDisabled = VALIDATION_MODE || !isStoreBillingActive();

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handlers
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

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Map selectedPlan to billing provider params
      const period = selectedPlan === "yearly" ? "yearly" : "monthly";
      const result = await purchaseTier("plus", period);
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["/api/reflection/can-reflect"],
      });
      if (isPaidTier(result.tier)) {
        navigation.navigate("BillingSuccess" as never);
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

  const openTerms = () => {
    Linking.openURL("https://byteworthy.github.io/Qamar/legal/terms.html");
  };

  const openPrivacy = () => {
    Linking.openURL("https://byteworthy.github.io/Qamar/legal/privacy.html");
  };

  const gradientColors =
    colorScheme === "dark"
      ? Gradients.dark.buttonGradient.colors
      : Gradients.light.buttonGradient.colors;

  return (
    <Screen title="Upgrade" showBack>
      {/* Hero header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        {/* Star/crescent icon */}
        <View style={[styles.heroIcon, { backgroundColor: GOLD + "18" }]}>
          <Feather name="star" size={32} color={GOLD} />
        </View>

        <ThemedText
          style={[
            styles.title,
            { fontFamily: Fonts?.serifBold, color: theme.text },
          ]}
        >
          Unlock the Full{"\n"}Qamar Experience
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Deepen your faith with unlimited access to all premium features.
        </ThemedText>
      </Animated.View>

      {/* Validation mode banner */}
      {billingDisabled ? (
        <View
          style={[
            styles.validationBanner,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather
            name="info"
            size={14}
            color={theme.textSecondary}
            style={{ marginRight: 6 }}
          />
          <ThemedText
            style={[styles.validationText, { color: theme.textSecondary }]}
          >
            {VALIDATION_MODE
              ? "Validation Build -- Paid tiers coming soon"
              : "Subscriptions coming soon"}
          </ThemedText>
        </View>
      ) : null}

      {/* Feature comparison table */}
      <View
        testID="features-list"
        style={[
          styles.comparisonCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Table header */}
        <View style={styles.comparisonHeader}>
          <ThemedText
            style={[
              styles.comparisonHeaderLabel,
              { color: theme.textSecondary, fontFamily: Fonts?.sansMedium },
            ]}
          >
            Features
          </ThemedText>
          <View style={styles.comparisonChecks}>
            <View style={styles.comparisonCell}>
              <ThemedText
                style={[
                  styles.comparisonHeaderCol,
                  { color: theme.textSecondary },
                ]}
              >
                Free
              </ThemedText>
            </View>
            <View style={styles.comparisonCell}>
              <ThemedText
                style={[
                  styles.comparisonHeaderCol,
                  { color: GOLD, fontFamily: Fonts?.sansBold },
                ]}
              >
                Plus
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Comparison rows */}
        {COMPARISON_FEATURES.map((feature, index) => (
          <FeatureComparisonRow
            key={feature.label}
            feature={feature}
            theme={theme}
            index={index}
          />
        ))}
      </View>

      {/* Plan selection */}
      <View style={styles.planSection}>
        <ThemedText
          style={[
            styles.sectionTitle,
            { color: theme.text, fontFamily: Fonts?.serifMedium },
          ]}
          accessibilityRole="header"
        >
          Choose Your Plan
        </ThemedText>

        <View style={styles.planCards}>
          {PLAN_OPTIONS.map((plan) => (
            <PlanSelector
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              theme={theme}
              colorScheme={colorScheme}
              testID={
                plan.id === "monthly"
                  ? "plan-monthly"
                  : plan.id === "yearly"
                    ? "plan-annual"
                    : undefined
              }
            />
          ))}
        </View>
      </View>

      {/* CTA button */}
      {!billingDisabled && !isPaid ? (
        <View style={styles.ctaSection}>
          <TouchableOpacity
            testID="subscribe-button"
            onPress={handleUpgrade}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              loading ? "Processing purchase" : "Start Free Trial"
            }
            accessibilityHint={`Subscribe to ${selectedPlan} plan`}
            style={styles.ctaButtonOuter}
          >
            <LinearGradient
              colors={[...gradientColors]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <ThemedText
                style={[styles.ctaButtonText, { fontFamily: Fonts?.sansBold }]}
              >
                {loading ? "Processing..." : "Start Free Trial"}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <ThemedText
            style={[styles.reassuranceText, { color: theme.textSecondary }]}
          >
            Cancel anytime. No commitment required.
          </ThemedText>
        </View>
      ) : isPaid ? (
        <View style={styles.ctaSection}>
          <View
            style={[
              styles.currentPlanBanner,
              { backgroundColor: GOLD + "15", borderColor: GOLD + "30" },
            ]}
          >
            <Feather name="check-circle" size={18} color={GOLD} />
            <ThemedText
              style={[
                styles.currentPlanBannerText,
                { color: GOLD, fontFamily: Fonts?.sansMedium },
              ]}
            >
              {"You're on Qamar Plus"}
            </ThemedText>
          </View>
        </View>
      ) : null}

      {/* Social proof */}
      <View
        style={[
          styles.socialProofCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Feather
          name="message-circle"
          size={16}
          color={GOLD}
          style={{ marginBottom: 8 }}
        />
        <ThemedText
          style={[
            styles.socialProofQuote,
            { color: theme.text, fontFamily: Fonts?.serif },
          ]}
        >
          {
            '"Qamar has become part of my daily spiritual routine. The reflections help me stay grounded and connected to my faith."'
          }
        </ThemedText>
        <ThemedText
          style={[styles.socialProofAuthor, { color: theme.textSecondary }]}
        >
          -- A Qamar Plus member
        </ThemedText>
      </View>

      {/* Subscription Legal Disclosure (Required by Guideline 3.1.2) */}
      {!billingDisabled ? (
        <View
          style={[
            styles.subscriptionLegal,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[styles.legalText, { color: theme.textSecondary }]}
          >
            Payment will be charged to your Apple ID at confirmation of
            purchase. Subscription automatically renews unless canceled at least
            24 hours before the end of the current period. You can manage and
            cancel subscriptions in App Store settings.
          </ThemedText>

          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={openTerms}
              accessibilityRole="link"
              accessibilityLabel="Terms of Service"
              accessibilityHint="Opens Terms of Service in browser"
            >
              <ThemedText style={[styles.linkText, { color: theme.accent }]}>
                Terms of Service
              </ThemedText>
            </TouchableOpacity>

            <ThemedText
              style={[styles.linkSeparator, { color: theme.textSecondary }]}
            >
              {" | "}
            </ThemedText>

            <TouchableOpacity
              onPress={openPrivacy}
              accessibilityRole="link"
              accessibilityLabel="Privacy Policy"
              accessibilityHint="Opens Privacy Policy in browser"
            >
              <ThemedText style={[styles.linkText, { color: theme.accent }]}>
                Privacy Policy
              </ThemedText>
            </TouchableOpacity>

            <ThemedText
              style={[styles.linkSeparator, { color: theme.textSecondary }]}
            >
              {" | "}
            </ThemedText>

            <TouchableOpacity
              testID="restore-purchases-button"
              onPress={handleRestorePurchase}
              disabled={syncing}
              accessibilityRole="link"
              accessibilityLabel={
                syncing ? "Restoring purchases" : "Restore Purchases"
              }
              accessibilityHint="Restores previous purchases from your Apple ID"
            >
              <ThemedText style={[styles.linkText, { color: theme.accent }]}>
                {syncing ? "Restoring..." : "Restore Purchases"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Manage subscriptions (for existing subscribers) */}
      {!billingDisabled && isPaid ? (
        <View style={styles.manageBillingContainer}>
          <Button
            onPress={handleManageBilling}
            disabled={managingBilling}
            variant="secondary"
            style={{ backgroundColor: theme.backgroundDefault }}
            accessibilityHint="Opens App Store or Google Play to manage your active subscriptions"
          >
            {managingBilling ? "Loading..." : "Manage Subscription"}
          </Button>
        </View>
      ) : null}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Header
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    paddingTop: Spacing.sm,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },

  // Validation banner
  validationBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  validationText: {
    fontSize: 13,
    textAlign: "center",
  },

  // Feature comparison
  comparisonCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  comparisonHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.15)",
  },
  comparisonHeaderLabel: {
    flex: 1,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  comparisonHeaderCol: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  comparisonChecks: {
    flexDirection: "row",
    width: 100,
  },
  comparisonCell: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  // Plan section
  planSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  planCards: {
    gap: Spacing.md,
  },
  planSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    position: "relative",
    overflow: "hidden",
  },
  planBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  planBadgeText: {
    color: "#1a1a2e",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planSelectorInfo: {
    flex: 1,
  },
  planSelectorLabel: {
    fontSize: 15,
  },
  planPerMonth: {
    fontSize: 12,
    marginTop: 2,
  },
  planSelectorPriceBlock: {
    alignItems: "flex-end",
  },
  planSelectorPrice: {
    fontSize: 18,
  },
  planSelectorPeriod: {
    fontSize: 12,
    marginTop: 1,
  },

  // CTA
  ctaSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  ctaButtonOuter: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  ctaButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
  },
  ctaButtonText: {
    color: "#1a1a2e",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  reassuranceText: {
    fontSize: 13,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  currentPlanBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  currentPlanBannerText: {
    fontSize: 15,
  },

  // Social proof
  socialProofCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  socialProofQuote: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  socialProofAuthor: {
    fontSize: 13,
    marginTop: Spacing.sm,
    textAlign: "center",
  },

  // Legal / footer
  subscriptionLegal: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  legalText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  linkSeparator: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  manageBillingContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
});
