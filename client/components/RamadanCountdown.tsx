import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Fonts, NoorColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { IslamicPattern } from "@/components/IslamicPattern";
import { getHijriDate } from "@/services/islamicCalendar";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RamadanCountdownProps {
  onPress?: () => void;
  compact?: boolean;
}

interface RamadanStatus {
  isRamadan: boolean;
  currentDay: number;
  daysUntil: number;
  totalDays: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ramadan Colors
// ─────────────────────────────────────────────────────────────────────────────

const RAMADAN_GOLD = NoorColors.gold;
const RAMADAN_EMERALD = NoorColors.emerald;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const RAMADAN_MONTH = 9;
const RAMADAN_DAYS = 30;

function getRamadanStatus(): RamadanStatus {
  const hijri = getHijriDate();

  if (hijri.monthNumber === RAMADAN_MONTH) {
    return {
      isRamadan: true,
      currentDay: hijri.day,
      daysUntil: 0,
      totalDays: RAMADAN_DAYS,
    };
  }

  // Calculate days until Ramadan by scanning forward
  let daysUntil = 0;
  for (let i = 1; i <= 365; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const futureHijri = getHijriDate(futureDate);
    if (futureHijri.monthNumber === RAMADAN_MONTH && futureHijri.day === 1) {
      daysUntil = i;
      break;
    }
  }

  return {
    isRamadan: false,
    currentDay: 0,
    daysUntil,
    totalDays: RAMADAN_DAYS,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RamadanCountdown({
  onPress,
  compact = false,
}: RamadanCountdownProps) {
  const { theme } = useTheme();
  const status = useMemo(() => getRamadanStatus(), []);

  const progress = status.isRamadan ? status.currentDay / status.totalDays : 0;

  if (compact) {
    return (
      <Animated.View entering={FadeInUp.duration(350)}>
        <GlassCard
          style={styles.compactCard}
          elevated
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={
            status.isRamadan
              ? `Day ${status.currentDay} of Ramadan`
              : `${status.daysUntil} days until Ramadan`
          }
        >
          <IslamicPattern variant="moonstar" opacity={0.04} />
          <View style={styles.compactContent}>
            <View style={styles.compactLeft}>
              <ThemedText
                style={[
                  styles.compactLabel,
                  { color: RAMADAN_GOLD, fontFamily: Fonts?.sansMedium },
                ]}
              >
                {status.isRamadan ? "Ramadan Mubarak" : "Ramadan"}
              </ThemedText>
              <ThemedText
                style={[
                  styles.compactTitle,
                  { color: theme.text, fontFamily: Fonts?.serifBold },
                ]}
              >
                {status.isRamadan
                  ? `Day ${status.currentDay} of ${status.totalDays}`
                  : `${status.daysUntil} days away`}
              </ThemedText>
            </View>

            {status.isRamadan && (
              <View style={styles.compactProgressContainer}>
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: theme.backgroundRoot },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.round(progress * 100)}%`,
                        backgroundColor: RAMADAN_EMERALD,
                      },
                    ]}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.progressPercent,
                    { color: theme.textSecondary },
                  ]}
                >
                  {Math.round(progress * 100)}%
                </ThemedText>
              </View>
            )}
          </View>
        </GlassCard>
      </Animated.View>
    );
  }

  // Full-size card
  return (
    <Animated.View entering={FadeInUp.duration(400)}>
      <GlassCard
        style={styles.fullCard}
        elevated
        breathing
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          status.isRamadan
            ? `Day ${status.currentDay} of Ramadan. ${status.totalDays - status.currentDay} days remaining.`
            : `${status.daysUntil} days until Ramadan begins`
        }
      >
        <IslamicPattern variant="moonstar" opacity={0.04} />

        <ThemedText
          style={[
            styles.fullLabel,
            { color: RAMADAN_GOLD, fontFamily: Fonts?.sansMedium },
          ]}
        >
          {status.isRamadan ? "Ramadan Mubarak" : "Upcoming"}
        </ThemedText>

        {status.isRamadan ? (
          <>
            <ThemedText
              style={[
                styles.fullDayText,
                { color: theme.text, fontFamily: Fonts?.serifBold },
              ]}
            >
              Day {status.currentDay}
            </ThemedText>
            <ThemedText
              style={[styles.fullSubText, { color: theme.textSecondary }]}
            >
              of {status.totalDays} days
            </ThemedText>

            <View style={styles.fullProgressContainer}>
              <View
                style={[
                  styles.fullProgressTrack,
                  { backgroundColor: theme.backgroundRoot },
                ]}
              >
                <View
                  style={[
                    styles.fullProgressFill,
                    {
                      width: `${Math.round(progress * 100)}%`,
                      backgroundColor: RAMADAN_EMERALD,
                    },
                  ]}
                />
              </View>
              <View style={styles.fullProgressLabels}>
                <ThemedText
                  style={[
                    styles.fullProgressText,
                    { color: theme.textSecondary },
                  ]}
                >
                  {Math.round(progress * 100)}% complete
                </ThemedText>
                <ThemedText
                  style={[styles.fullProgressText, { color: RAMADAN_GOLD }]}
                >
                  {status.totalDays - status.currentDay} days left
                </ThemedText>
              </View>
            </View>
          </>
        ) : (
          <>
            <ThemedText
              style={[
                styles.fullDayText,
                { color: theme.text, fontFamily: Fonts?.serifBold },
              ]}
            >
              {status.daysUntil}
            </ThemedText>
            <ThemedText
              style={[styles.fullSubText, { color: theme.textSecondary }]}
            >
              days until Ramadan
            </ThemedText>
          </>
        )}
      </GlassCard>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Compact card styles
  compactCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactLeft: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  compactProgressContainer: {
    alignItems: "flex-end",
    marginLeft: Spacing.lg,
    width: 80,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: BorderRadius.full,
    width: "100%",
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  progressPercent: {
    fontSize: 11,
  },

  // Full card styles
  fullCard: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  fullLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  fullDayText: {
    fontSize: 42,
    lineHeight: 50,
  },
  fullSubText: {
    fontSize: 15,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  fullProgressContainer: {
    width: "100%",
    marginTop: Spacing.sm,
  },
  fullProgressTrack: {
    height: 6,
    borderRadius: BorderRadius.full,
    width: "100%",
    overflow: "hidden",
  },
  fullProgressFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  fullProgressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  fullProgressText: {
    fontSize: 12,
  },
});
