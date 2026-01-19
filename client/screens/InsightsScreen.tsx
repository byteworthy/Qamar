import React, { useEffect, useState } from "react";
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

export default function InsightsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
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
                { backgroundColor: SiraatColors.indigo + "15" },
              ]}
            >
              <Feather name="lock" size={28} color={SiraatColors.indigo} />
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
                backgroundColor: SiraatColors.indigo,
                marginTop: spacing.xl,
              }}
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
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.statValue}>
              {stats!.totalSessions}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              Total Sessions
            </ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.statValue}>
              {stats!.weeklyCount}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              This Week
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
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
        </View>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[styles.infoLabel, { color: theme.textSecondary }]}
          >
            Most Common Pattern
          </ThemedText>
          <ThemedText style={styles.infoValue}>
            {stats!.topDistortion || "Not enough data yet"}
          </ThemedText>
        </View>
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
              <View
                key={index}
                style={[
                  styles.reflectionCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
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
              </View>
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
    padding: container.cardPad,
    borderRadius: radii.sm,
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
    padding: container.cardPad,
    borderRadius: radii.sm,
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
