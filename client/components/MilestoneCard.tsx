/**
 * MilestoneCard Component
 *
 * Modal-style celebration card shown when a new badge is earned.
 * Displays badge details with a gold gradient background and animated entrance.
 * Automatically reads the pending milestone from the gamification store.
 *
 * Usage:
 * <MilestoneCard />
 *
 * Place at the root of the Home screen or a layout wrapper.
 * It renders nothing when there is no pending milestone.
 */

import React from "react";
import { View, StyleSheet, Modal, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { GlassCard } from "@/components/GlassCard";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import {
  useGamification,
  Badge,
  BADGE_DEFINITIONS,
} from "@/stores/gamification-store";
import {
  NoorColors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";

// Gold gradient for the celebration accent bar
const GOLD_GRADIENT_COLORS = [NoorColors.goldLight, NoorColors.gold] as const;

function findBadgeById(badgeId: string): Badge | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

function formatEarnedDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MilestoneCard() {
  const { theme, isDark } = useTheme();
  const pendingMilestone = useGamification((s) => s.pendingMilestone);
  const badges = useGamification((s) => s.badges);
  const clearPendingMilestone = useGamification(
    (s) => s.clearPendingMilestone,
  );

  if (!pendingMilestone) {
    return null;
  }

  // Get the earned badge from the store (has earnedAt populated)
  const earnedBadge = badges.find((b) => b.id === pendingMilestone);
  // Fall back to the static definition for name/description/icon
  const badgeDefinition = findBadgeById(pendingMilestone);
  const badge = earnedBadge ?? badgeDefinition;

  if (!badge) {
    return null;
  }

  const earnedDate = earnedBadge?.earnedAt
    ? formatEarnedDate(earnedBadge.earnedAt)
    : "";

  const backdropColor = isDark
    ? "rgba(0, 0, 0, 0.65)"
    : "rgba(0, 0, 0, 0.5)";

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={clearPendingMilestone}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(250)}
        style={[styles.backdrop, { backgroundColor: backdropColor }]}
      >
        <Pressable
          style={styles.backdropPressable}
          onPress={clearPendingMilestone}
          accessibilityRole="button"
          accessibilityLabel="Dismiss milestone"
          accessibilityHint="Tap to close the celebration card"
        />
      </Animated.View>

      {/* Card content */}
      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          entering={FadeInUp.duration(500).springify().damping(16)}
          style={styles.cardWrapper}
        >
          <GlassCard
            elevated
            style={styles.glassCard}
            accessibilityRole="none"
            accessibilityLabel={`Badge earned: ${badge.name}. ${badge.description}`}
          >
            {/* Gold gradient accent bar */}
            <LinearGradient
              colors={GOLD_GRADIENT_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentBar}
            />

            {/* Badge icon */}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: NoorColors.gold + "20" },
              ]}
            >
              <Feather
                name={badge.icon as keyof typeof Feather.glyphMap}
                size={32}
                color={NoorColors.gold}
              />
            </View>

            {/* Congratulatory message */}
            <ThemedText
              type="caption"
              style={[
                styles.congratsText,
                {
                  color: NoorColors.gold,
                  fontFamily: Fonts?.serifMedium,
                },
              ]}
            >
              Alhamdulillah
            </ThemedText>

            {/* Badge name */}
            <ThemedText
              type="h3"
              style={[
                styles.badgeName,
                { fontFamily: Fonts?.serifBold },
              ]}
            >
              {badge.name}
            </ThemedText>

            {/* Badge description */}
            <ThemedText
              type="body"
              style={[
                styles.description,
                { color: theme.textSecondary },
              ]}
            >
              {badge.description}
            </ThemedText>

            {/* Earned date */}
            {earnedDate !== "" && (
              <ThemedText
                type="caption"
                style={[
                  styles.earnedDate,
                  { color: theme.textSecondary },
                ]}
              >
                Earned {earnedDate}
              </ThemedText>
            )}

            {/* Dismiss button */}
            <Pressable
              onPress={clearPendingMilestone}
              style={[
                styles.dismissButton,
                { backgroundColor: NoorColors.gold },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <ThemedText
                type="body"
                style={[
                  styles.dismissText,
                  { color: NoorColors.background },
                ]}
              >
                Continue
              </ThemedText>
            </Pressable>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 340,
  },
  glassCard: {
    alignItems: "center",
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["2xl"],
    paddingHorizontal: Spacing["2xl"],
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  congratsText: {
    fontSize: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  badgeName: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    maxWidth: 260,
  },
  earnedDate: {
    marginBottom: Spacing.xl,
  },
  dismissButton: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.soft,
  },
  dismissText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
