/**
 * StreakBadge Component
 *
 * Compact visual streak counter for the Home screen.
 * Shows the current streak number with contextual icon and color
 * based on streak status (active, endangered, paused, broken).
 *
 * Usage:
 * <StreakBadge />
 * <StreakBadge style={{ marginRight: 8 }} />
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useGamification, StreakStatus } from "@/stores/gamification-store";
import { NoorColors, Fonts, Spacing, BorderRadius } from "@/constants/theme";

interface StreakBadgeProps {
  style?: ViewStyle;
}

// Amber warning color for endangered streaks
const ENDANGERED_COLOR = "#E5A100";

// Gray for paused state
const PAUSED_COLOR = "#8E99A4";

function getStreakIcon(status: StreakStatus): keyof typeof Feather.glyphMap {
  switch (status) {
    case "active":
      return "zap";
    case "endangered":
      return "alert-triangle";
    case "paused":
      return "pause-circle";
    case "broken":
      return "zap-off";
    default:
      return "zap";
  }
}

function getStreakColor(status: StreakStatus): string {
  switch (status) {
    case "active":
      return NoorColors.gold;
    case "endangered":
      return ENDANGERED_COLOR;
    case "paused":
      return PAUSED_COLOR;
    case "broken":
      return PAUSED_COLOR;
    default:
      return NoorColors.gold;
  }
}

function getAccessibilityText(streak: number, status: StreakStatus): string {
  if (status === "paused") {
    return `Streak paused at ${streak} days`;
  }
  if (status === "endangered") {
    return `${streak} day streak, at risk of breaking`;
  }
  if (status === "broken") {
    return "Streak broken, start a new one today";
  }
  return `${streak} day streak, active`;
}

export function StreakBadge({ style }: StreakBadgeProps) {
  const { theme } = useTheme();
  const currentStreak = useGamification((s) => s.currentStreak);
  const streakStatus = useGamification((s) => s.streakStatus);

  const streakColor = getStreakColor(streakStatus);
  const iconName = getStreakIcon(streakStatus);
  const a11yText = getAccessibilityText(currentStreak, streakStatus);

  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify().damping(18)}
      accessibilityRole="text"
      accessibilityLabel={a11yText}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: streakColor + "30",
        },
        style,
      ]}
    >
      <Feather name={iconName} size={18} color={streakColor} />

      <ThemedText
        type="body"
        style={[
          styles.streakNumber,
          {
            color: streakColor,
            fontFamily: Fonts?.sansBold,
          },
        ]}
      >
        {currentStreak}
      </ThemedText>

      {streakStatus === "endangered" && (
        <View
          style={[styles.statusDot, { backgroundColor: ENDANGERED_COLOR }]}
          accessibilityLabel="Streak endangered"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  streakNumber: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
});
