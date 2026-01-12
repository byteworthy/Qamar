import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/constants/layout";
import { Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
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

const { spacing, radii, container, typeScale } = Layout;

export default function InsightsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;
  const isDemo = true;

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

  const patterns = isDemo ? demoPatterns : fetchedPatterns;

  if (!isPaid && !isDemo) {
    return (
      <Screen title="Insights" showBack scrollable={false}>
        <View style={styles.centerContent}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.lockedContainer}>
            <View style={[styles.lockIcon, { backgroundColor: SiraatColors.indigo + "15" }]}>
              <Feather name="lock" size={28} color={SiraatColors.indigo} />
            </View>
            <ThemedText style={[styles.lockedTitle, { fontFamily: Fonts?.serif }]}>
              Unlock Your Patterns
            </ThemedText>
            <ThemedText style={[styles.lockedDescription, { color: theme.textSecondary }]}>
              See what your reflections reveal about your thinking patterns and recurring assumptions.
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("Pricing")}
              style={{ backgroundColor: SiraatColors.indigo, marginTop: spacing.xl }}
            >
              Upgrade to Noor Plus
            </Button>
          </Animated.View>
        </View>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen title="Insights" showBack scrollable={false}>
        <View style={styles.centerContent}>
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading your patterns...
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const hasData = patterns && (patterns.summary || patterns.assumptions?.length > 0);

  if (!hasData) {
    return (
      <Screen title="Insights" showBack scrollable={false}>
        <View style={styles.centerContent}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="bar-chart-2" size={28} color={theme.textSecondary} />
            </View>
            <ThemedText style={[styles.emptyTitle, { fontFamily: Fonts?.serif }]}>
              No patterns yet
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: theme.textSecondary }]}>
              Complete a few reflections to start seeing your thinking patterns.
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("ThoughtCapture")}
              style={{ backgroundColor: theme.primary, marginTop: spacing.xl }}
            >
              Start a Reflection
            </Button>
          </Animated.View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Insights" showBack contentStyle={{ paddingBottom: spacing.xxl }}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.intro}>
        <ThemedText style={[styles.introText, { color: theme.textSecondary }]}>
          Based on your recent reflections.
        </ThemedText>
      </Animated.View>

      {patterns?.summary && (
        <Animated.View entering={FadeInUp.duration(350).delay(100)} style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Pattern Summary
          </ThemedText>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.summaryText}>
              {patterns.summary}
            </ThemedText>
          </View>
        </Animated.View>
      )}

      {patterns?.assumptions && patterns.assumptions.length > 0 && (
        <Animated.View entering={FadeInUp.duration(350).delay(150)} style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Recurring Assumptions
          </ThemedText>
          <View style={styles.assumptionsList}>
            {patterns.assumptions.map((item, index) => (
              <View 
                key={index}
                style={[styles.assumptionCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <ThemedText style={styles.assumptionText}>
                  {item.text}
                </ThemedText>
                <View style={[styles.countBadge, { backgroundColor: theme.backgroundRoot }]}>
                  <ThemedText style={[styles.countText, { color: theme.textSecondary }]}>
                    {item.count}x
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {isDemo && demoReflections.length > 0 && (
        <Animated.View entering={FadeInUp.duration(350).delay(200)} style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Recent Reflections
          </ThemedText>
          <View style={styles.reflectionsList}>
            {demoReflections.slice(0, 4).map((reflection) => (
              <View 
                key={reflection.id}
                style={[styles.reflectionCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <ThemedText style={[styles.reflectionDate, { color: theme.textSecondary }]}>
                  {reflection.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </ThemedText>
                <ThemedText style={styles.reflectionThought} numberOfLines={2}>
                  {reflection.thought}
                </ThemedText>
                <View style={styles.distortionTags}>
                  {reflection.distortions.slice(0, 2).map((d, i) => (
                    <View key={i} style={[styles.distortionTag, { backgroundColor: theme.backgroundRoot }]}>
                      <ThemedText style={[styles.distortionTagText, { color: theme.textSecondary }]}>
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

      <Animated.View entering={FadeInUp.duration(350).delay(250)} style={styles.noteContainer}>
        <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
          Patterns are observations, not verdicts.
        </ThemedText>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  intro: {
    marginBottom: spacing.lg,
  },
  introText: {
    fontSize: typeScale.body,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    padding: container.cardPad,
    borderRadius: radii.sm,
  },
  summaryText: {
    fontSize: typeScale.body,
    lineHeight: 20,
  },
  assumptionsList: {
    gap: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  assumptionCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Layout.hitTargets.minCardHeight,
    padding: container.cardPad,
    borderRadius: radii.sm,
    gap: spacing.sm,
    width: "100%",
  },
  assumptionText: {
    flex: 1,
    fontSize: typeScale.body,
    lineHeight: 18,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  countText: {
    fontSize: 11,
  },
  noteContainer: {
    paddingVertical: spacing.lg,
  },
  note: {
    textAlign: "center",
    fontStyle: "italic",
    fontSize: typeScale.small,
  },
  lockedContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: typeScale.title,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  lockedDescription: {
    textAlign: "center",
    marginTop: spacing.md,
    fontSize: typeScale.body,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: typeScale.body,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: typeScale.title,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  emptyDescription: {
    textAlign: "center",
    marginTop: spacing.md,
    fontSize: typeScale.body,
    lineHeight: 20,
  },
  reflectionsList: {
    gap: spacing.sm,
  },
  reflectionCard: {
    minHeight: Layout.hitTargets.minCardHeight,
    padding: container.cardPad,
    borderRadius: radii.sm,
  },
  reflectionDate: {
    fontSize: typeScale.small,
    marginBottom: 2,
  },
  reflectionThought: {
    fontSize: typeScale.body,
    lineHeight: 18,
  },
  distortionTags: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: "wrap",
  },
  distortionTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  distortionTagText: {
    fontSize: 10,
  },
});
