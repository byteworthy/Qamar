/**
 * PremiumGate Component
 *
 * Wrapper that checks entitlements and shows upgrade prompt if user lacks access.
 * Use this to gate premium features throughout the app.
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useEntitlements, FeatureName } from "@/hooks/useEntitlements";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Layout } from "@/constants/layout";
import { Fonts } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PremiumGateProps {
  requiredTier: "plus" | "pro";
  featureName: string;
  children: React.ReactNode;
  feature?: FeatureName; // Optional: for more granular feature checks
}

const { spacing, radii, container, typeScale } = Layout;

/**
 * Feature gate component.
 * If user has required tier, renders children.
 * Otherwise, shows an upgrade prompt card.
 */
export function PremiumGate({
  requiredTier,
  featureName,
  children,
  feature,
}: PremiumGateProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { isPlusUser, isProUser, isLoading, canAccessFeature } =
    useEntitlements();

  // Check access based on required tier or specific feature
  const hasAccess = React.useMemo(() => {
    if (isLoading) return false;

    // If a specific feature is provided, use granular check
    if (feature) {
      return canAccessFeature(feature);
    }

    // Otherwise check by tier
    if (requiredTier === "pro") {
      return isProUser;
    }
    return isPlusUser;
  }, [
    isLoading,
    requiredTier,
    isPlusUser,
    isProUser,
    feature,
    canAccessFeature,
  ]);

  const handleUpgrade = () => {
    navigation.navigate("Pricing");
  };

  // While loading, show nothing (or optionally a skeleton)
  if (isLoading) {
    return null;
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Otherwise, show upgrade prompt
  const tierLabel = requiredTier === "pro" ? "Qamar Pro" : "Qamar Plus";

  return (
    <View
      style={[
        styles.gateContainer,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}
      >
        <Feather name="lock" size={32} color={theme.accent} />
      </View>

      <ThemedText style={[styles.title, { fontFamily: Fonts?.serif }]}>
        Unlock {featureName}
      </ThemedText>

      <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
        Upgrade to {tierLabel} to access this feature and unlock the full Qamar experience.
      </ThemedText>

      <Button
        onPress={handleUpgrade}
        style={styles.upgradeButton}
        accessibilityHint={`Navigate to pricing screen to upgrade to ${tierLabel}`}
      >
        Upgrade to {tierLabel}
      </Button>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityHint="Go back to previous screen"
      >
        <ThemedText style={[styles.backText, { color: theme.textSecondary }]}>
          Maybe Later
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: container.cardPad,
    borderWidth: 1,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typeScale.h2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typeScale.body,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  upgradeButton: {
    minWidth: 200,
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    fontSize: typeScale.body,
  },
});
