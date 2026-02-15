import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";

interface ProgressCardProps {
  title: string;
  subtitle: string;
  value: number;
  gradient: string[];
  icon: keyof typeof Feather.glyphMap;
  delay: number;
  unit?: string;
}

function ProgressCard({
  title,
  subtitle,
  value,
  gradient,
  icon,
  delay,
  unit = "",
}: ProgressCardProps) {
  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <View
        style={styles.progressCard}
        accessibilityRole="summary"
        accessibilityLabel={`${title}: ${value}${unit} ${subtitle}`}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Feather
              name={icon}
              size={32}
              color="rgba(255,255,255,0.9)"
              style={styles.cardIcon}
            />
          </View>
          <View style={styles.cardContent}>
            <ThemedText style={styles.cardValue}>
              {value}
              {unit}
            </ThemedText>
            <ThemedText style={styles.cardTitle}>{title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  delay: number;
}

function StatCard({ label, value, icon, delay }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <View
        style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
        accessibilityRole="summary"
        accessibilityLabel={`${label}: ${value}`}
      >
        <View
          style={[
            styles.statIconContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name={icon} size={24} color={theme.primary} />
        </View>
        <View style={styles.statContent}>
          <ThemedText style={styles.statValue}>{value}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            {label}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ProgressDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const progressCards = [
    {
      title: "Quran Reading",
      subtitle: "consecutive days",
      value: 0,
      gradient: ["#3a5a4a", "#6a8a7a"],
      icon: "book-open" as const,
      unit: " day",
    },
    {
      title: "Arabic Cards",
      subtitle: "cards mastered",
      value: 0,
      gradient: ["#5a4a3a", "#8a7a6a"],
      icon: "edit-3" as const,
      unit: "",
    },
    {
      title: "Prayers Tracked",
      subtitle: "prayers logged",
      value: 0,
      gradient: ["#3a4a5a", "#6a7a8a"],
      icon: "clock" as const,
      unit: "",
    },
    {
      title: "Adhkar Completed",
      subtitle: "daily remembrance",
      value: 0,
      gradient: ["#4a3a5a", "#7a6a8a"],
      icon: "heart" as const,
      unit: "",
    },
  ];

  const stats = [
    {
      label: "Total Study Time",
      value: "0 min",
      icon: "clock" as const,
    },
    {
      label: "Accuracy Rate",
      value: "0%",
      icon: "trending-up" as const,
    },
    {
      label: "Current Level",
      value: "Beginner",
      icon: "award" as const,
    },
    {
      label: "Weekly Goal",
      value: "0%",
      icon: "target" as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText
            style={styles.headerTitle}
            accessibilityRole="header"
            accessibilityLabel="Your Progress"
          >
            Your Progress
          </ThemedText>
          <ThemedText
            style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            accessibilityLabel="Track your spiritual growth"
          >
            Track your spiritual growth
          </ThemedText>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
            accessibilityRole="header"
          >
            Main Activities
          </ThemedText>
          <View style={styles.progressGrid}>
            {progressCards.map((card, index) => (
              <ProgressCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                value={card.value}
                gradient={card.gradient}
                icon={card.icon}
                delay={100 + index * 80}
                unit={card.unit}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
            accessibilityRole="header"
          >
            Learning Statistics
          </ThemedText>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                delay={500 + index * 60}
              />
            ))}
          </View>
        </View>

        <View
          style={[
            styles.comingSoonCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Feather name="info" size={24} color={theme.textSecondary} />
          <ThemedText
            style={[styles.comingSoonText, { color: theme.textSecondary }]}
          >
            Progress tracking will be available soon. Your learning journey will
            be automatically tracked as you use the app.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  progressGrid: {
    gap: 16,
  },
  progressCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    minHeight: 160,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardContent: {
    gap: 4,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  comingSoonCard: {
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginTop: 8,
  },
  comingSoonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
