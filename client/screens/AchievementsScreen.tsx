/**
 * AchievementsScreen — Badges, Streaks & Spiritual Milestones
 *
 * Displays all earned and unearned badges in a grid layout,
 * current and longest streaks, and a pause toggle for
 * menstruation or illness.
 */

import React from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { NoorColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import {
  useGamification,
  Badge,
  BADGE_DEFINITIONS,
} from "@/stores/gamification-store";

// =============================================================================
// CONSTANTS
// =============================================================================

const GOLD = NoorColors.gold;
const GOLD_DIM = NoorColors.goldDim;
const BADGE_ICON_SIZE = 32;
const GRID_GAP = 12;

// =============================================================================
// HELPERS
// =============================================================================

function formatEarnedDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStreakLabel(count: number): string {
  if (count === 1) return "1 day";
  return `${count} days`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface BadgeCardProps {
  badge: Badge;
  index: number;
}

function BadgeCard({ badge, index }: BadgeCardProps) {
  const { theme } = useTheme();
  const isEarned = badge.earnedAt !== null;

  const iconColor = isEarned ? GOLD : theme.textSecondary;
  const nameColor = isEarned ? theme.text : theme.textSecondary;
  const descriptionColor = theme.textSecondary;

  const delay = 200 + index * 60;

  return (
    <Animated.View
      entering={FadeInUp.duration(350).delay(delay)}
      style={styles.badgeCardWrapper}
    >
      <GlassCard
        style={{
          ...styles.badgeCard,
          ...(isEarned ? { borderColor: GOLD + "40" } : undefined),
        }}
      >
        <View
          style={[
            styles.badgeIconContainer,
            {
              backgroundColor: isEarned
                ? GOLD + "18"
                : theme.backgroundDefault,
            },
          ]}
        >
          <Feather
            name={badge.icon as keyof typeof Feather.glyphMap}
            size={BADGE_ICON_SIZE}
            color={iconColor}
          />
        </View>

        <ThemedText
          style={[
            styles.badgeName,
            { color: nameColor, fontFamily: Fonts?.serifMedium },
          ]}
          numberOfLines={1}
        >
          {badge.name}
        </ThemedText>

        <ThemedText
          style={[styles.badgeDescription, { color: descriptionColor }]}
          numberOfLines={2}
        >
          {badge.description}
        </ThemedText>

        <ThemedText
          style={[
            styles.badgeDate,
            {
              color: isEarned ? GOLD_DIM : theme.textSecondary,
            },
          ]}
        >
          {isEarned ? formatEarnedDate(badge.earnedAt!) : "Not yet earned"}
        </ThemedText>
      </GlassCard>
    </Animated.View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const currentStreak = useGamification((s) => s.currentStreak);
  const longestStreak = useGamification((s) => s.longestStreak);
  const streakPaused = useGamification((s) => s.streakPaused);
  const badges = useGamification((s) => s.badges);
  const toggleStreakPause = useGamification((s) => s.toggleStreakPause);

  const earnedCount = badges.filter((b) => b.earnedAt !== null).length;
  const totalCount = BADGE_DEFINITIONS.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: 100 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(350)}
          style={styles.header}
        >
          <ThemedText
            style={[styles.headerTitle, { fontFamily: Fonts?.serifBold }]}
            accessibilityRole="header"
          >
            Achievements
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {earnedCount} of {totalCount} badges earned
          </ThemedText>
        </Animated.View>

        {/* Current Streak */}
        <Animated.View entering={FadeInUp.duration(350).delay(60)}>
          <GlassCard style={styles.streakCard} elevated>
            <View style={styles.streakCardInner}>
              <View
                style={[
                  styles.streakIconContainer,
                  { backgroundColor: GOLD + "18" },
                ]}
              >
                <Feather name="zap" size={28} color={GOLD} />
              </View>
              <View style={styles.streakTextContainer}>
                <ThemedText style={[styles.streakLabel, { color: theme.textSecondary }]}>
                  Current Streak
                </ThemedText>
                <ThemedText style={[styles.streakValue, { color: GOLD }]}>
                  {getStreakLabel(currentStreak)}
                </ThemedText>
              </View>
            </View>
            {streakPaused && (
              <View style={[styles.pausedBadge, { backgroundColor: theme.warning + "20" }]}>
                <Feather name="pause-circle" size={14} color={theme.warning} />
                <ThemedText style={[styles.pausedText, { color: theme.warning }]}>
                  Paused
                </ThemedText>
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Longest Streak + Pause Toggle */}
        <Animated.View entering={FadeInUp.duration(350).delay(120)}>
          <GlassCard style={styles.statsRow}>
            <View style={styles.longestStreakRow}>
              <View style={styles.longestStreakInfo}>
                <Feather name="award" size={18} color={GOLD_DIM} />
                <View style={styles.longestStreakText}>
                  <ThemedText style={[styles.longestStreakLabel, { color: theme.textSecondary }]}>
                    Longest Streak
                  </ThemedText>
                  <ThemedText style={styles.longestStreakValue}>
                    {getStreakLabel(longestStreak)}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.divider }]} />

            <View style={styles.pauseRow}>
              <View style={styles.pauseInfo}>
                <Feather name="pause-circle" size={18} color={theme.textSecondary} />
                <View style={styles.pauseText}>
                  <ThemedText style={styles.pauseLabel}>
                    Pause Streak
                  </ThemedText>
                  <ThemedText style={[styles.pauseSubtitle, { color: theme.textSecondary }]}>
                    For menstruation or illness
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={streakPaused}
                onValueChange={toggleStreakPause}
                trackColor={{
                  false: theme.backgroundRoot,
                  true: GOLD + "80",
                }}
                thumbColor={streakPaused ? GOLD : "#ccc"}
                accessibilityLabel="Pause streak tracking"
                accessibilityHint="Pauses your streak for menstruation or illness without losing progress"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section Header: Badges */}
        <Animated.View
          entering={FadeInUp.duration(350).delay(180)}
          style={styles.sectionHeader}
        >
          <ThemedText style={[styles.sectionHeaderText, { color: GOLD }]}>
            Badges
          </ThemedText>
        </Animated.View>

        {/* Badge Grid */}
        <View style={styles.badgeGrid}>
          {badges.map((badge, index) => (
            <BadgeCard key={badge.id} badge={badge} index={index} />
          ))}
        </View>

        {/* Footer encouragement */}
        <Animated.View
          entering={FadeInUp.duration(350).delay(200 + badges.length * 60)}
          style={styles.footerContainer}
        >
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            Every step on the path is recorded. Keep going.
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  // Streak Card
  streakCard: {
    marginBottom: Spacing.sm,
  },
  streakCardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  streakValue: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 2,
  },
  pausedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    gap: 5,
  },
  pausedText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Stats Row
  statsRow: {
    marginBottom: Spacing.sm,
  },
  longestStreakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  longestStreakInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  longestStreakText: {
    gap: 2,
  },
  longestStreakLabel: {
    fontSize: 13,
  },
  longestStreakValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },

  // Pause Row
  pauseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  pauseInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
    gap: 10,
  },
  pauseText: {
    flex: 1,
  },
  pauseLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  pauseSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // Badge Grid
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  badgeCardWrapper: {
    flexBasis: "48%",
    flexGrow: 1,
  },
  badgeCard: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  badgeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 6,
  },
  badgeDate: {
    fontSize: 11,
    fontWeight: "500",
  },

  // Footer
  footerContainer: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
