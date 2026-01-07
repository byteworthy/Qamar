import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand, ScreenCopy } from "@/constants/brand";
import { checkReflectionLimit, getBillingStatus, isPaidStatus } from "@/lib/billing";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();


  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const { data: limitStatus } = useQuery({
    queryKey: ["/api/reflection/can-reflect"],
    queryFn: checkReflectionLimit,
    staleTime: 30000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;
  const canReflect = limitStatus?.canReflect ?? true;

  const handleBeginReflection = () => {
    if (!canReflect && !isPaid) {
      Alert.alert(
        "Daily Limit Reached",
        "You have used your free daily reflection. Upgrade to Noor Plus for unlimited reflections.",
        [
          { text: "Maybe Later", style: "cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate("Pricing") }
        ]
      );
      return;
    }
    navigation.navigate("ThoughtCapture");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="h1" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          {Brand.name}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {Brand.tagline}
        </ThemedText>
      </View>

      <View style={[styles.anchorCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.anchorAccent, { backgroundColor: SiraatColors.indigo }]} />
        <ThemedText type="body" style={[styles.anchorText, { fontFamily: Fonts?.serif }]}>
          {Brand.anchorLine}
        </ThemedText>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Button
            onPress={handleBeginReflection}
            style={{ backgroundColor: theme.primary }}
          >
            {ScreenCopy.home.cta}
          </Button>
          <ThemedText type="body" style={[styles.ctaSubcopy, { color: theme.textSecondary }]}>
            {ScreenCopy.home.ctaSubcopy}
          </ThemedText>
          {!isPaid && limitStatus ? (
            <ThemedText type="caption" style={[styles.limitText, { color: theme.textSecondary }]}>
              {limitStatus.remaining === 0 
                ? "Daily limit reached" 
                : `${limitStatus.remaining} free reflection${limitStatus.remaining === 1 ? '' : 's'} remaining today`}
            </ThemedText>
          ) : null}
          <ThemedText type="caption" style={[styles.methodCallout, { color: theme.textSecondary }]}>
            {Brand.methodCallout}
          </ThemedText>
        </View>

        <Pressable
          onPress={() => navigation.navigate("History")}
          style={({ pressed }) => [
            styles.historyButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="clock" size={20} color={theme.textSecondary} />
          <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: theme.textSecondary }}>
            {ScreenCopy.home.historyLink}
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} style={{ marginLeft: "auto" }} />
        </Pressable>

        {!isPaid ? (
          <Pressable
            onPress={() => navigation.navigate("Pricing")}
            style={({ pressed }) => [
              styles.upgradeButton,
              { backgroundColor: SiraatColors.indigo, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="star" size={20} color="#fff" />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm, color: "#fff", fontWeight: "600" }}>
              Upgrade to Noor Plus
            </ThemedText>
            <Feather name="chevron-right" size={20} color="#fff" style={{ marginLeft: "auto" }} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={[styles.disclaimer, { color: theme.textSecondary }]}>
          {Brand.disclaimer}
        </ThemedText>
      </View>
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
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  anchorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  anchorAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  anchorText: {
    flex: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    lineHeight: 26,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
  },
  ctaSubcopy: {
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 24,
  },
  methodCallout: {
    textAlign: "center",
    marginTop: Spacing.lg,
    fontStyle: "italic",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  limitText: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["4xl"],
    gap: Spacing.xs,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
});
