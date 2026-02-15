import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";
import { useScreenProtection } from "@/hooks/useScreenProtection";
import { Layout } from "@/constants/layout";
import { Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { PremiumGate } from "@/components/PremiumGate";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { withScreenErrorBoundary } from "@/components/ScreenErrorBoundary";
import { getBillingStatus, isPaidStatus } from "@/lib/billing";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getSessions, Session } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LocalStats {
  totalSessions: number;
  lastSessionDate: Date | null;
  topDistortion: string | null;
  weeklyCount: number;
}

function computeLocalStats(sessions: Session[]): LocalStats {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      lastSessionDate: null,
      topDistortion: null,
      weeklyCount: 0,
    };
  }

  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  const lastSessionDate = new Date(sorted[0].timestamp);

  // Count distortions
  const distortionCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    s.distortions?.forEach((d) => {
      distortionCounts[d] = (distortionCounts[d] || 0) + 1;
    });
  });

  const topDistortion =
    Object.entries(distortionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    null;

  // Weekly count
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyCount = sessions.filter((s) => s.timestamp > weekAgo).length;

  return {
    totalSessions: sessions.length,
    lastSessionDate,
    topDistortion,
    weeklyCount,
  };
}

const { spacing, radii, container, typeScale } = Layout;

function InsightsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  // Prevent screenshots (displays AI-generated personal insights)
  useScreenProtection({ preventScreenCapture: true });

  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<LocalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: getBillingStatus,
    staleTime: 60000,
  });

  const isPaid = billingStatus ? isPaidStatus(billingStatus.status) : false;

  // Load real sessions from local storage
  useEffect(() => {
    async function loadSessions() {
      try {
        const storedSessions = await getSessions();
        setSessions(storedSessions);
        setStats(computeLocalStats(storedSessions));
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (!isPaid) {
    return (
      <Screen title="Insights" showBack scrollable={false}>
        <View style={styles.centerContent}>
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={styles.lockedContainer}
          >
            <View
              style={[
                styles.lockIcon,
                { backgroundColor: theme.accent + "15" },
              ]}
            >
              <Feather name="lock" size={28} color={theme.accent} />
            </View>
            <ThemedText
              style={[styles.lockedTitle, { fontFamily: Fonts?.serif }]}
            >
              Unlock Your Patterns
            </ThemedText>
            <ThemedText
              style={[styles.lockedDescription, { color: theme.textSecondary }]}
            >
              See what your reflections reveal about your thinking patterns and
              recurring assumptions.
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("Pricing")}
              style={{
                backgroundColor: theme.accent,
                marginTop: spacing.xl,
              }}
              accessibilityHint="Opens pricing options to unlock insights feature"
            >
              Upgrade to Noor Plus
            </Button>
          </Animated.View>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen title="Insights" showBack scrollable={false}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.link} />
          <ThemedText
            style={[styles.loadingText, { color: theme.textSecondary }]}
          >
            Loading your insights...
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const hasData = stats && stats.totalSessions > 0;

  if (!hasData) {
    return (
      <Screen title="Insights" showBack scrollable={false}>
        <View style={styles.centerContent}>
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={styles.emptyContainer}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather
                name="bar-chart-2"
                size={28}
                color={theme.textSecondary}
              />
            </View>
            <ThemedText
              style={[styles.emptyTitle, { fontFamily: Fonts?.serif }]}
            >
              No patterns yet
            </ThemedText>
            <ThemedText
              style={[styles.emptyDescription, { color: theme.textSecondary }]}
            >
              Complete a few reflections to start seeing your thinking patterns.
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("ThoughtCapture")}
              style={{ backgroundColor: theme.primary, marginTop: spacing.xl }}
              accessibilityHint="Begins a new reflection session to build your insights"
            >
              Start a Reflection
            </Button>
          </Animated.View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Insights"
      showBack
      contentStyle={{ paddingBottom: spacing.xxl }}
    >
      <PremiumGate requiredTier="pro" featureName="Advanced Insights">
        <Animated.View entering={FadeInDown.duration(350)} style={styles.intro}>
          <ThemedText style={[styles.introText, { color: theme.textSecondary }]}>
            Based on your stored reflections.
          </ThemedText>
        </Animated.View>

      {/* Stats Section - REAL DATA */}
      <Animated.View
        entering={FadeInUp.duration(350).delay(100)}
        style={styles.section}
      >
        <ThemedText
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          Your Statistics
        </ThemedText>
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard} elevated>
            <ThemedText style={styles.statValue}>
              {stats!.totalSessions}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              Total Sessions
            </ThemedText>
          </GlassCard>
          <GlassCard style={styles.statCard} elevated>
            <ThemedText style={styles.statValue}>
              {stats!.weeklyCount}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              This Week
            </ThemedText>
          </GlassCard>
        </View>
        <GlassCard style={styles.infoCard} elevated>
          <ThemedText
            style={[styles.infoLabel, { color: theme.textSecondary }]}
          >
            Last Session
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {stats!.lastSessionDate
              ? stats!.lastSessionDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Not available"}
          </ThemedText>
        </GlassCard>
        <GlassCard style={styles.infoCard} elevated>
          <ThemedText
            style={[styles.infoLabel, { color: theme.textSecondary }]}
          >
            Most Common Pattern
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {stats!.topDistortion || "Not enough data yet"}
          </ThemedText>
        </GlassCard>
      </Animated.View>

      {/* Recent Reflections - REAL DATA */}
      {sessions.length > 0 && (
        <Animated.View
          entering={FadeInUp.duration(350).delay(200)}
          style={styles.section}
        >
          <ThemedText
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            Recent Reflections
          </ThemedText>
          <View style={styles.reflectionsList}>
            {sessions.slice(0, 4).map((session, index) => (
              <GlassCard
                key={index}
                style={styles.reflectionCard}
                elevated
              >
                <ThemedText
                  style={[
                    styles.reflectionDate,
                    { color: theme.textSecondary },
                  ]}
                >
                  {new Date(session.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </ThemedText>
                <ThemedText style={styles.reflectionThought} numberOfLines={2}>
                  {session.thought}
                </ThemedText>
                {session.distortions && session.distortions.length > 0 && (
                  <View style={styles.distortionTags}>
                    {session.distortions.slice(0, 2).map((d, i) => (
                      <View
                        key={i}
                        style={[
                          styles.distortionTag,
                          { backgroundColor: theme.backgroundRoot },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.distortionTagText,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {d}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInUp.duration(350).delay(250)}
        style={styles.noteContainer}
      >
        <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
          Insights update as you complete sessions.
        </ThemedText>
      </Animated.View>
      </PremiumGate>
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
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  infoCard: {
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: typeScale.body,
    fontWeight: "500",
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

export default withScreenErrorBoundary(InsightsScreen);
