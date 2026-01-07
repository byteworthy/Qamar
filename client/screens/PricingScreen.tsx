import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { createCheckoutSession, createPortalSession, getBillingStatus, isPaidStatus, syncBillingStatus } from "@/lib/billing";
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

function PlanCard({ name, price, period, features, isCurrentPlan, isPremium, onSelect, loading }: PlanCardProps) {
  const { theme } = useTheme();
  
  return (
    <View style={[
      styles.planCard,
      { 
        backgroundColor: theme.cardBackground,
        borderColor: isPremium ? SiraatColors.indigo : theme.border,
        borderWidth: isPremium ? 2 : 1,
      }
    ]}>
      {isPremium ? (
        <View style={[styles.badge, { backgroundColor: SiraatColors.indigo }]}>
          <ThemedText type="caption" style={{ color: "#fff" }}>RECOMMENDED</ThemedText>
        </View>
      ) : null}
      
      <ThemedText type="h3" style={[styles.planName, { fontFamily: Fonts?.serif }]}>
        {name}
      </ThemedText>
      
      <View style={styles.priceContainer}>
        <ThemedText type="h1" style={styles.price}>{price}</ThemedText>
        {period ? <ThemedText type="body" style={{ color: theme.textSecondary }}>{period}</ThemedText> : null}
      </View>
      
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Feather 
              name={feature.included ? "check" : "x"} 
              size={18} 
              color={feature.included ? SiraatColors.emerald : theme.textSecondary} 
            />
            <ThemedText 
              type="body" 
              style={[
                styles.featureText, 
                { color: feature.included ? theme.text : theme.textSecondary }
              ]}
            >
              {feature.text}
            </ThemedText>
          </View>
        ))}
      </View>
      
      {isCurrentPlan ? (
        <View style={[styles.currentPlanBadge, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>Current Plan</ThemedText>
        </View>
      ) : onSelect ? (
        <Button 
          onPress={onSelect} 
          disabled={loading}
          style={{ 
            backgroundColor: isPremium ? SiraatColors.indigo : theme.backgroundDefault,
            marginTop: Spacing.lg 
          }}
        >
          {loading ? "Loading..." : (isPremium ? "Upgrade to Plus" : "Select")}
        </Button>
      ) : null}
    </View>
  );
}

export default function PricingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  const handleRestorePurchase = async () => {
    setSyncing(true);
    try {
      const result = await syncBillingStatus();
      queryClient.invalidateQueries({ queryKey: ["/api/billing/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflection/can-reflect"] });
      if (isPaidStatus(result.status)) {
        Alert.alert("Subscription Restored", "Your Noor Plus subscription has been activated.");
      } else {
        Alert.alert("No Active Subscription", "We couldn't find an active subscription. If you recently purchased, please wait a moment and try again.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to restore purchase");
    } finally {
      setSyncing(false);
    }
  };

  const handleUpgrade = async () => {
    if (!email) {
      Alert.alert("Email Required", "Please enter your email to continue.");
      return;
    }

    setLoading(true);
    try {
      const { checkoutUrl } = await createCheckoutSession(email);
      if (checkoutUrl) {
        if (Platform.OS === "web") {
          window.location.href = checkoutUrl;
        } else {
          await WebBrowser.openBrowserAsync(checkoutUrl);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const { portalUrl } = await createPortalSession();
      if (portalUrl) {
        if (Platform.OS === "web") {
          window.location.href = portalUrl;
        } else {
          await WebBrowser.openBrowserAsync(portalUrl);
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to open billing portal");
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

  const plusFeatures: PlanFeature[] = [
    { text: "Unlimited reflections", included: true },
    { text: "Full reflection history", included: true },
    { text: "Pattern insights and summaries", included: true },
    { text: "Personal assumption library", included: true },
    { text: "Contextual duas by inner state", included: true },
    { text: "Cancel anytime", included: true },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="h2" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          Deepen Your Practice
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Noor Plus reveals patterns in your thoughts and offers guidance tailored to your heart.
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
          name="Noor Plus"
          price="$9.99"
          period="/month"
          features={plusFeatures}
          isCurrentPlan={isPaid}
          isPremium
          onSelect={isPaid ? undefined : handleUpgrade}
          loading={loading}
        />
      </View>

      {!isPaid ? (
        <View style={[styles.emailContainer, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="body" style={[styles.emailLabel, { color: theme.textSecondary }]}>
            Enter your email to upgrade
          </ThemedText>
          <TextInput
            style={[
              styles.emailInput,
              { 
                backgroundColor: theme.cardBackground, 
                color: theme.text,
                borderColor: theme.border,
              }
            ]}
            placeholder="your@email.com"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.restoreContainer}>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginBottom: Spacing.sm }}>
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
        </View>
      ) : (
        <View style={styles.manageBillingContainer}>
          <Button
            onPress={handleManageBilling}
            disabled={managingBilling}
            style={{ backgroundColor: theme.backgroundDefault }}
          >
            {managingBilling ? "Loading..." : "Manage Billing"}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  plansContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  planCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -12,
    right: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  planName: {
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.xl,
  },
  price: {
    fontSize: 36,
    fontWeight: "700",
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  currentPlanBadge: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  emailContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  emailLabel: {
    marginBottom: Spacing.sm,
  },
  emailInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  manageBillingContainer: {
    alignItems: "center",
  },
  restoreContainer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
});
