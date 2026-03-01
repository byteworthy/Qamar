/**
 * WeeklySummary — Weekly Spiritual Growth Modal
 *
 * Displays a summary of the past week's spiritual activities
 * compared to the previous week, with encouraging Islamic messaging.
 */

import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { NoorColors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { WeeklySummaryData } from "@/stores/gamification-store";

// =============================================================================
// TYPES
// =============================================================================

interface WeeklySummaryProps {
  visible: boolean;
  onDismiss: () => void;
  data: WeeklySummaryData;
}

interface StatRowProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  current: number;
  previous: number;
  unit?: string;
  delay: number;
}

type TrendDirection = "up" | "down" | "same";

// =============================================================================
// CONSTANTS
// =============================================================================

const GOLD = NoorColors.gold;

const ENCOURAGING_MESSAGES: string[] = [
  "Consistency is beloved to Allah, even if it is small. Keep striving.",
  "Whoever treads a path seeking knowledge, Allah makes the path to Jannah easy.",
  "Your effort is seen. Trust the process and keep going.",
  "A small deed done consistently is greater than a large deed done once.",
  "The best deeds are those done regularly, even if they are few.",
];

// =============================================================================
// HELPERS
// =============================================================================

function getTrendDirection(current: number, previous: number): TrendDirection {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "same";
}

function getTrendIcon(
  direction: TrendDirection,
): keyof typeof Feather.glyphMap {
  if (direction === "up") return "trending-up";
  if (direction === "down") return "trending-down";
  return "minus";
}

function getEncouragingMessage(): string {
  const index = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
  return ENCOURAGING_MESSAGES[index];
}

function getDifference(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return "Same as last week";
  const direction = diff > 0 ? "+" : "";
  return `${direction}${diff} from last week`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatRow({
  label,
  icon,
  current,
  previous,
  unit = "",
  delay,
}: StatRowProps) {
  const { theme } = useTheme();
  const direction = getTrendDirection(current, previous);
  const trendIcon = getTrendIcon(direction);

  let trendColor: string;
  if (direction === "up") {
    trendColor = GOLD;
  } else if (direction === "down") {
    trendColor = theme.textSecondary;
  } else {
    trendColor = theme.textSecondary;
  }

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)}>
      <View
        style={styles.statRow}
        accessibilityRole="summary"
        accessibilityLabel={`${label}: ${current}${unit}, ${getDifference(current, previous)}`}
      >
        <View style={styles.statRowLeft}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name={icon} size={18} color={theme.textSecondary} />
          </View>
          <View style={styles.statLabelContainer}>
            <ThemedText style={styles.statLabel}>{label}</ThemedText>
            <ThemedText style={[styles.statDifference, { color: trendColor }]}>
              {getDifference(current, previous)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.statRowRight}>
          <ThemedText style={[styles.statValue, { color: theme.text }]}>
            {current}
            {unit}
          </ThemedText>
          <Feather name={trendIcon} size={16} color={trendColor} />
        </View>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WeeklySummary({
  visible,
  onDismiss,
  data,
}: WeeklySummaryProps) {
  const { theme } = useTheme();

  const message = getEncouragingMessage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        style={styles.overlay}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close weekly summary"
      >
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            {/* Title */}
            <Animated.View entering={FadeInUp.duration(350)}>
              <View style={styles.titleRow}>
                <Feather name="bar-chart-2" size={22} color={GOLD} />
                <ThemedText
                  style={[styles.title, { fontFamily: Fonts?.serifBold }]}
                >
                  Weekly Review
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.subtitle, { color: theme.textSecondary }]}
              >
                Your spiritual growth this week
              </ThemedText>
            </Animated.View>

            {/* Streak Highlight */}
            <Animated.View entering={FadeInUp.duration(350).delay(80)}>
              <GlassCard style={styles.streakHighlight}>
                <View style={styles.streakRow}>
                  <View
                    style={[
                      styles.streakIconContainer,
                      { backgroundColor: GOLD + "18" },
                    ]}
                  >
                    <Feather name="zap" size={22} color={GOLD} />
                  </View>
                  <View style={styles.streakInfo}>
                    <ThemedText style={[styles.streakCount, { color: GOLD }]}>
                      {data.streakLength}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.streakLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      day streak
                    </ThemedText>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <StatRow
                label="Verses Read"
                icon="book-open"
                current={data.versesRead}
                previous={data.previousWeek.versesRead}
                delay={160}
              />

              <View
                style={[styles.divider, { backgroundColor: theme.divider }]}
              />

              <StatRow
                label="Flashcards Reviewed"
                icon="layers"
                current={data.flashcardsReviewed}
                previous={data.previousWeek.flashcardsReviewed}
                delay={220}
              />

              <View
                style={[styles.divider, { backgroundColor: theme.divider }]}
              />

              <StatRow
                label="Reflections"
                icon="heart"
                current={data.reflectionsCompleted}
                previous={data.previousWeek.reflectionsCompleted}
                delay={280}
              />
            </View>

            {/* Encouraging Message */}
            <Animated.View entering={FadeInUp.duration(350).delay(340)}>
              <View
                style={[
                  styles.messageContainer,
                  { backgroundColor: GOLD + "10" },
                ]}
              >
                <Feather
                  name="star"
                  size={14}
                  color={GOLD}
                  style={styles.messageIcon}
                />
                <ThemedText
                  style={[
                    styles.messageText,
                    { color: theme.textSecondary, fontFamily: Fonts?.serif },
                  ]}
                >
                  {message}
                </ThemedText>
              </View>
            </Animated.View>

            {/* Dismiss Button */}
            <Animated.View entering={FadeInUp.duration(350).delay(400)}>
              <Pressable
                onPress={onDismiss}
                style={[styles.dismissButton, { backgroundColor: GOLD }]}
                accessibilityRole="button"
                accessibilityLabel="Dismiss weekly summary"
              >
                <ThemedText
                  style={[styles.dismissText, { color: NoorColors.background }]}
                >
                  Alhamdulillah
                </ThemedText>
              </Pressable>
            </Animated.View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 380,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },

  // Title
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },

  // Streak Highlight
  streakHighlight: {
    marginBottom: Spacing.lg,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: "700",
  },
  streakLabel: {
    fontSize: 15,
    fontWeight: "500",
  },

  // Stats
  statsContainer: {
    marginBottom: Spacing.lg,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  statRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statLabelContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  statDifference: {
    fontSize: 11,
    marginTop: 2,
  },
  statRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },

  // Encouraging Message
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  messageIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: "italic",
  },

  // Dismiss Button
  dismissButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  dismissText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
