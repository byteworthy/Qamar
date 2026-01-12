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
  // Demo mode: Set to false for production to enforce Pro gating
  const isDemo = true;

  // Seeded demo reflections - 10 realistic entries with timestamps and variation
  const demoReflections = [
    { id: 1, timestamp: new Date(Date.now() - 1 * 86400000), state: "tightness_around_provision", thought: "I'm behind on bills and can't stop thinking about it", distortions: ["catastrophizing", "fortune-telling"] },
    { id: 2, timestamp: new Date(Date.now() - 2 * 86400000), state: "fear_of_loss", thought: "What if my spouse leaves me?", distortions: ["catastrophizing"] },
    { id: 3, timestamp: new Date(Date.now() - 3 * 86400000), state: "confusion_effort_control", thought: "I worked so hard but nothing is changing", distortions: ["all-or-nothing", "should-statements"] },
    { id: 4, timestamp: new Date(Date.now() - 5 * 86400000), state: "shame_after_sin", thought: "I keep falling into the same mistake", distortions: ["personalization", "labeling"] },
    { id: 5, timestamp: new Date(Date.now() - 6 * 86400000), state: "guilt_without_clarity", thought: "I feel like I'm not doing enough for my parents", distortions: ["should-statements", "mind-reading"] },
    { id: 6, timestamp: new Date(Date.now() - 8 * 86400000), state: "decision_paralysis", thought: "I don't know which job offer to take", distortions: ["fortune-telling", "all-or-nothing"] },
    { id: 7, timestamp: new Date(Date.now() - 10 * 86400000), state: "social_anxiety", thought: "People at the masjid probably judge me", distortions: ["mind-reading", "personalization"] },
    { id: 8, timestamp: new Date(Date.now() - 12 * 86400000), state: "tightness_around_provision", thought: "I should be earning more by now", distortions: ["should-statements", "comparison"] },
    { id: 9, timestamp: new Date(Date.now() - 14 * 86400000), state: "feeling_unseen", thought: "No one notices how hard I'm trying", distortions: ["mind-reading", "emotional-reasoning"] },
    { id: 10, timestamp: new Date(Date.now() - 16 * 86400000), state: "confusion_effort_control", thought: "I prayed for this but nothing happened", distortions: ["all-or-nothing", "fortune-telling"] },
  ];

  // Demo data derived from seeded reflections
  const demoPatterns: PatternData = {
    summary: "Across your reflections, responsibility often appears before rest. Effort is present, but trust arrives later. When outcomes feel uncertain, the mind reaches for control rather than patience.",
    assumptions: [
      { text: "Responsibility equals control", count: 4 },
      { text: "Feeling anxious means danger is real", count: 3 },
      { text: "Struggle means I am failing", count: 3 },
      { text: "If I cannot fix it, I am the problem", count: 2 },
      { text: "Other people's emotions are my responsibility", count: 2 },
    ],
  };

  const { data: fetchedPatterns, isLoading } = useQuery({
    queryKey: ["/api/reflection/patterns"],
    queryFn: fetchPatterns,
    enabled: isPaid && !isDemo,
    staleTime: 300000,
  });

  // Use demo data when in demo mode, otherwise use fetched patterns
  const patterns = isDemo ? demoPatterns : fetchedPatterns;

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

      {isDemo && demoReflections.length > 0 && (
        <Animated.View 
          entering={FadeInUp.duration(400).delay(300)}
          style={styles.section}
        >
          <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Recent Reflections
          </ThemedText>
          <View style={styles.reflectionsList}>
            {demoReflections.slice(0, 4).map((reflection, index) => (
              <View 
                key={reflection.id}
                style={[styles.reflectionCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: 4 }}>
                  {reflection.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </ThemedText>
                <ThemedText type="body" style={{ lineHeight: 20 }} numberOfLines={2}>
                  {reflection.thought}
                </ThemedText>
                <View style={styles.distortionTags}>
                  {reflection.distortions.slice(0, 2).map((d, i) => (
                    <View key={i} style={[styles.distortionTag, { backgroundColor: theme.backgroundRoot }]}>
                      <ThemedText type="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                        {d}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.noteContainer}>
        <ThemedText type="caption" style={[styles.note, { color: theme.textSecondary }]}>
          Patterns are observations, not verdicts.
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
  reflectionsList: {
    gap: Spacing.md,
  },
  reflectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  distortionTags: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  distortionTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
});
