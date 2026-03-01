/**
 * DailyQuotaBadge Component
 *
 * Shows remaining free calls as a subtle pill badge: "2 of 3 free today".
 * Hidden for Plus/Pro users (unlimited). Shown only when quota is relevant.
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { NoorColors } from "@/constants/theme/colors";

// =============================================================================
// TYPES
// =============================================================================

interface DailyQuotaBadgeProps {
  remaining: number;
  limit: number;
  isUnlimited: boolean;
  style?: ViewStyle;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DailyQuotaBadge({
  remaining,
  limit,
  isUnlimited,
  style,
}: DailyQuotaBadgeProps) {
  const { theme } = useTheme();

  if (isUnlimited) return null;

  const isLow = remaining <= 1;
  const isEmpty = remaining === 0;
  const color = isEmpty
    ? theme.error
    : isLow
      ? NoorColors.gold
      : theme.textSecondary;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + "12", borderColor: color + "25" },
        style,
      ]}
      accessibilityLabel={`${remaining} of ${limit} free calls remaining today`}
    >
      <Feather name={isEmpty ? "lock" : "zap"} size={12} color={color} />
      <ThemedText style={[styles.text, { color }]}>
        {isEmpty
          ? "Daily limit reached"
          : `${remaining} of ${limit} free today`}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
