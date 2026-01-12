import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PatternData {
  summary: string;
  assumptions: { text: string; count: number }[];
}

async function fetchPatterns(): Promise<PatternData> {
  const response = await fetch(new URL("/api/reflection/patterns", getApiUrl()).toString());
  if (!response.ok) {
    throw new Error("Failed to fetch patterns");
  }
  return response.json();
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;
  const isDemo = true; // Demo mode

  const { data: patterns, isLoading } = useQuery({
    queryKey: ["/api/reflection/patterns"],
    queryFn: fetchPatterns,
    enabled: isPaid || isDemo,
    staleTime: 300000,
  });

  if (!isPaid && !isDemo) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          styles.centerContent,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)} style={styles.lockedContainer}>
          <View style={[styles.lockIcon, { backgroundColor: SiraatColors.indigo + "15" }]}>
            <Feather name="lock" size={32} color={SiraatColors.indigo} />
          </View>
          <ThemedText type="h3" style={{ fontFamily: Fonts?.serif, textAlign: "center", marginTop: Spacing.xl }}>
            Unlock Your Patterns
          </ThemedText>
          <ThemedText type="body" style={[styles.lockedDescription, { color: theme.textSecondary }]}>
            See what your reflections reveal about your thinking patterns and recurring assumptions.
          </ThemedText>
          <Button
            onPress={() => navigation.navigate("Pricing")}
            style={{ backgroundColor: SiraatColors.indigo, marginTop: Spacing.xl }}
          >
            Upgrade to Noor Plus
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Loading your patterns...
        </ThemedText>
      </View>
    );
  }

  const hasData = patterns && (patterns.summary || patterns.assumptions?.length > 0);

  if (!hasData) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          styles.centerContent,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)} style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="bar-chart-2" size={32} color={theme.textSecondary} />
          </View>
          <ThemedText type="h3" style={{ fontFamily: Fonts?.serif, textAlign: "center", marginTop: Spacing.xl }}>
            No patterns yet
          </ThemedText>
          <ThemedText type="body" style={[styles.emptyDescription, { color: theme.textSecondary }]}>
            Complete a few reflections to start seeing your thinking patterns and recurring themes.
          </ThemedText>
          <Button
            onPress={() => navigation.navigate("ThoughtCapture")}
            style={{ backgroundColor: theme.primary, marginTop: Spacing.xl }}
          >
            Start a Reflection
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + Spacing["3xl"] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.intro}>
        <ThemedText type="h3" style={{ fontFamily: Fonts?.serif, marginBottom: Spacing.sm }}>
          Your Patterns
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Based on your recent reflections.
        </ThemedText>
      </Animated.View>

      {patterns?.summary && (
        <Animated.View 
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.section}
        >
          <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Pattern Summary
          </ThemedText>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body" style={{ lineHeight: 24 }}>
              {patterns.summary}
            </ThemedText>
          </View>
        </Animated.View>
      )}

      {patterns?.assumptions && patterns.assumptions.length > 0 && (
        <Animated.View 
          entering={FadeInUp.duration(400).delay(200)}
          style={styles.section}
        >
          <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Recurring Assumptions
          </ThemedText>
          <View style={styles.assumptionsList}>
            {patterns.assumptions.map((item, index) => (
              <View 
                key={index}
                style={[styles.assumptionCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={styles.assumptionContent}>
                  <ThemedText type="body" style={{ flex: 1, lineHeight: 22 }}>
                    {item.text}
                  </ThemedText>
                  <View style={[styles.countBadge, { backgroundColor: theme.backgroundRoot }]}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {item.count}x
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.noteContainer}>
        <ThemedText type="caption" style={[styles.note, { color: theme.textSecondary }]}>
          Patterns are observed, not judged. Use them as mirrors, not verdicts.
        </ThemedText>
      </Animated.View>
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
    paddingTop: Spacing.lg,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  intro: {
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  assumptionsList: {
    gap: Spacing.md,
  },
  assumptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  assumptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  noteContainer: {
    marginTop: "auto",
    paddingTop: Spacing.xl,
  },
  note: {
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
  lockedContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedDescription: {
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDescription: {
    textAlign: "center",
    marginTop: Spacing.md,
    lineHeight: 22,
  },
});
