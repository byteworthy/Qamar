import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, ScrollView, Pressable, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "@/hooks/useTheme";
import { Fonts, QamarColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";
import { GlassCard } from "@/components/GlassCard";
import { IslamicPattern } from "@/components/IslamicPattern";
import { getHijriDate } from "@/services/islamicCalendar";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FASTING_LOG_KEY = "@noor_ramadan_fasting_log";
const RAMADAN_YEAR_KEY = "@noor_ramadan_year";
const RAMADAN_MONTH = 9;
const TOTAL_DAYS = 30;

const RAMADAN_GOLD = QamarColors.gold;
const RAMADAN_EMERALD = QamarColors.emerald;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FastingStatus = "fasted" | "missed" | "excused" | "none";
type ExcuseReason = "travel" | "sickness" | "other";

interface DayLog {
  status: FastingStatus;
  excuseReason?: ExcuseReason;
}

type FastingLog = Record<number, DayLog>;

const EXCUSE_OPTIONS: {
  id: ExcuseReason;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { id: "travel", label: "Travel", icon: "navigation" },
  { id: "sickness", label: "Sickness", icon: "thermometer" },
  { id: "other", label: "Other", icon: "more-horizontal" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getCurrentRamadanDay(): number {
  const hijri = getHijriDate();
  if (hijri.monthNumber === RAMADAN_MONTH) {
    return hijri.day;
  }
  return 0;
}

function getCurrentHijriYear(): number {
  return getHijriDate().year;
}

function computeTotals(log: FastingLog): {
  fasted: number;
  missed: number;
  excused: number;
  toMakeUp: number;
} {
  let fasted = 0;
  let missed = 0;
  let excused = 0;

  for (const dayLog of Object.values(log)) {
    if (dayLog.status === "fasted") fasted++;
    else if (dayLog.status === "missed") missed++;
    else if (dayLog.status === "excused") excused++;
  }

  return { fasted, missed, excused, toMakeUp: missed + excused };
}

function getStatusColor(status: FastingStatus): string {
  switch (status) {
    case "fasted":
      return RAMADAN_EMERALD;
    case "missed":
      return "#D4756B";
    case "excused":
      return QamarColors.moonlightMuted;
    default:
      return "transparent";
  }
}

function getStatusIcon(status: FastingStatus): keyof typeof Feather.glyphMap {
  switch (status) {
    case "fasted":
      return "check";
    case "missed":
      return "x";
    case "excused":
      return "minus";
    default:
      return "circle";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Day Cell Component
// ─────────────────────────────────────────────────────────────────────────────

interface DayCellProps {
  day: number;
  log: DayLog | undefined;
  isToday: boolean;
  isFuture: boolean;
  onPress: (day: number) => void;
  theme: ReturnType<typeof useTheme>["theme"];
}

const DayCell = React.memo(function DayCell({
  day,
  log,
  isToday,
  isFuture,
  onPress,
  theme,
}: DayCellProps) {
  const status = log?.status ?? "none";
  const statusColor = getStatusColor(status);
  const hasStatus = status !== "none";

  const handlePress = useCallback(() => {
    if (!isFuture) {
      onPress(day);
    }
  }, [day, isFuture, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isFuture}
      accessibilityRole="button"
      accessibilityLabel={`Day ${day}${isToday ? " (today)" : ""}${hasStatus ? `, ${status}` : ""}${log?.excuseReason ? `, reason: ${log.excuseReason}` : ""}`}
      accessibilityState={{ disabled: isFuture }}
      style={[
        styles.dayCell,
        {
          backgroundColor: hasStatus
            ? statusColor + "20"
            : theme.backgroundRoot,
          borderColor: isToday ? RAMADAN_GOLD : "transparent",
          borderWidth: isToday ? 2 : 0,
          opacity: isFuture ? 0.4 : 1,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.dayNumber,
          {
            color: isToday ? RAMADAN_GOLD : theme.textSecondary,
            fontFamily: Fonts?.sansMedium,
          },
        ]}
      >
        {day}
      </ThemedText>
      {hasStatus && (
        <Feather name={getStatusIcon(status)} size={16} color={statusColor} />
      )}
      {log?.excuseReason && status === "excused" && (
        <ThemedText
          style={[styles.excuseLabel, { color: theme.textSecondary }]}
        >
          {log.excuseReason}
        </ThemedText>
      )}
    </Pressable>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function FastingTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();

  // ── State ─────────────────────────────────────────────────────────────
  const [fastingLog, setFastingLog] = useState<FastingLog>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExcuseModal, setShowExcuseModal] = useState(false);

  const currentDay = useMemo(() => getCurrentRamadanDay(), []);
  const hijriYear = useMemo(() => getCurrentHijriYear(), []);
  const totals = useMemo(() => computeTotals(fastingLog), [fastingLog]);

  // ── Load persisted data ───────────────────────────────────────────────
  useEffect(() => {
    async function loadLog(): Promise<void> {
      const [savedLog, savedYear] = await Promise.all([
        AsyncStorage.getItem(FASTING_LOG_KEY),
        AsyncStorage.getItem(RAMADAN_YEAR_KEY),
      ]);

      // Reset if it is a new Hijri year
      if (savedYear && parseInt(savedYear, 10) !== hijriYear) {
        await AsyncStorage.removeItem(FASTING_LOG_KEY);
        await AsyncStorage.setItem(RAMADAN_YEAR_KEY, String(hijriYear));
        return;
      }

      if (!savedYear) {
        await AsyncStorage.setItem(RAMADAN_YEAR_KEY, String(hijriYear));
      }

      if (savedLog) {
        const parsed = JSON.parse(savedLog) as FastingLog;
        setFastingLog(parsed);
      }
    }
    loadLog().catch(() => {});
  }, [hijriYear]);

  // ── Persist on change ─────────────────────────────────────────────────
  const persistLog = useCallback(async (log: FastingLog) => {
    await AsyncStorage.setItem(FASTING_LOG_KEY, JSON.stringify(log));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleDayPress = useCallback((day: number) => {
    setSelectedDay(day);
  }, []);

  const handleSetStatus = useCallback(
    (status: FastingStatus) => {
      if (selectedDay === null) return;

      if (status === "excused") {
        setShowExcuseModal(true);
        return;
      }

      const updated: FastingLog = { ...fastingLog };
      if (status === "none") {
        delete updated[selectedDay];
      } else {
        updated[selectedDay] = { status };
      }

      setFastingLog(updated);
      persistLog(updated);
      setSelectedDay(null);
    },
    [selectedDay, fastingLog, persistLog],
  );

  const handleSetExcuse = useCallback(
    (reason: ExcuseReason) => {
      if (selectedDay === null) return;

      const updated: FastingLog = {
        ...fastingLog,
        [selectedDay]: { status: "excused", excuseReason: reason },
      };

      setFastingLog(updated);
      persistLog(updated);
      setShowExcuseModal(false);
      setSelectedDay(null);
    },
    [selectedDay, fastingLog, persistLog],
  );

  const handleCloseStatusPicker = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const handleCloseExcuseModal = useCallback(() => {
    setShowExcuseModal(false);
    setSelectedDay(null);
  }, []);

  // ── Build days array ──────────────────────────────────────────────────
  const days = useMemo(() => {
    const result: number[] = [];
    for (let i = 1; i <= TOTAL_DAYS; i++) {
      result.push(i);
    }
    return result;
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <AtmosphericBackground variant="atmospheric">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 16,
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={styles.header}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <Feather name="arrow-left" size={24} color={theme.text} />
            </Pressable>
            <View>
              <ThemedText
                style={[
                  styles.headerTitle,
                  { color: theme.text, fontFamily: Fonts?.serifBold },
                ]}
              >
                Fasting Tracker
              </ThemedText>
              <ThemedText
                style={[styles.headerSubtitle, { color: theme.textSecondary }]}
              >
                Ramadan {hijriYear} AH
              </ThemedText>
            </View>
          </Animated.View>

          {/* Summary Totals */}
          <Animated.View entering={FadeInUp.duration(350).delay(60)}>
            <GlassCard style={styles.summaryCard} elevated>
              <IslamicPattern variant="moonstar" opacity={0.03} />
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText
                    style={[
                      styles.summaryNumber,
                      { color: RAMADAN_EMERALD, fontFamily: Fonts?.sansBold },
                    ]}
                  >
                    {totals.fasted}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Fasted
                  </ThemedText>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <ThemedText
                    style={[
                      styles.summaryNumber,
                      { color: "#D4756B", fontFamily: Fonts?.sansBold },
                    ]}
                  >
                    {totals.missed}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Missed
                  </ThemedText>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <ThemedText
                    style={[
                      styles.summaryNumber,
                      {
                        color: QamarColors.moonlightMuted,
                        fontFamily: Fonts?.sansBold,
                      },
                    ]}
                  >
                    {totals.excused}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.summaryLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Excused
                  </ThemedText>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Days to Make Up */}
          {totals.toMakeUp > 0 && (
            <Animated.View entering={FadeInUp.duration(350).delay(120)}>
              <GlassCard style={styles.makeUpCard} elevated>
                <View style={styles.makeUpContent}>
                  <View
                    style={[
                      styles.makeUpBadge,
                      { backgroundColor: RAMADAN_GOLD + "20" },
                    ]}
                  >
                    <Feather name="calendar" size={18} color={RAMADAN_GOLD} />
                  </View>
                  <View style={styles.makeUpText}>
                    <ThemedText
                      style={[
                        styles.makeUpTitle,
                        { color: theme.text, fontFamily: Fonts?.sansBold },
                      ]}
                    >
                      {totals.toMakeUp} {totals.toMakeUp === 1 ? "day" : "days"}{" "}
                      to make up
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.makeUpSubtitle,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {totals.missed} missed + {totals.excused} excused
                    </ThemedText>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Calendar Grid */}
          <Animated.View entering={FadeInUp.duration(350).delay(180)}>
            <ThemedText
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
              accessibilityRole="header"
            >
              Daily Log
            </ThemedText>
            <View style={styles.calendarGrid}>
              {days.map((day) => (
                <DayCell
                  key={day}
                  day={day}
                  log={fastingLog[day]}
                  isToday={day === currentDay}
                  isFuture={currentDay > 0 && day > currentDay}
                  onPress={handleDayPress}
                  theme={theme}
                />
              ))}
            </View>
          </Animated.View>

          {/* Legend */}
          <Animated.View entering={FadeInUp.duration(300).delay(240)}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: RAMADAN_EMERALD },
                  ]}
                />
                <ThemedText
                  style={[styles.legendText, { color: theme.textSecondary }]}
                >
                  Fasted
                </ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#D4756B" }]}
                />
                <ThemedText
                  style={[styles.legendText, { color: theme.textSecondary }]}
                >
                  Missed
                </ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: QamarColors.moonlightMuted },
                  ]}
                />
                <ThemedText
                  style={[styles.legendText, { color: theme.textSecondary }]}
                >
                  Excused
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </AtmosphericBackground>

      {/* Status Picker Modal */}
      <Modal
        visible={selectedDay !== null && !showExcuseModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStatusPicker}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseStatusPicker}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText
              style={[
                styles.modalTitle,
                { color: theme.text, fontFamily: Fonts?.serifBold },
              ]}
            >
              Day {selectedDay}
            </ThemedText>
            <ThemedText
              style={[styles.modalSubtitle, { color: theme.textSecondary }]}
            >
              How was your fast?
            </ThemedText>

            <View style={styles.statusOptions}>
              <Pressable
                onPress={() => handleSetStatus("fasted")}
                style={[
                  styles.statusButton,
                  { backgroundColor: RAMADAN_EMERALD + "15" },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Mark as fasted"
              >
                <Feather
                  name="check-circle"
                  size={22}
                  color={RAMADAN_EMERALD}
                />
                <ThemedText
                  style={[styles.statusButtonText, { color: RAMADAN_EMERALD }]}
                >
                  Fasted
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleSetStatus("missed")}
                style={[styles.statusButton, { backgroundColor: "#D4756B15" }]}
                accessibilityRole="button"
                accessibilityLabel="Mark as missed"
              >
                <Feather name="x-circle" size={22} color="#D4756B" />
                <ThemedText
                  style={[styles.statusButtonText, { color: "#D4756B" }]}
                >
                  Not Fasted
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleSetStatus("excused")}
                style={[
                  styles.statusButton,
                  { backgroundColor: QamarColors.moonlightMuted + "15" },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Mark as excused"
              >
                <Feather
                  name="minus-circle"
                  size={22}
                  color={QamarColors.moonlightMuted}
                />
                <ThemedText
                  style={[
                    styles.statusButtonText,
                    { color: QamarColors.moonlightMuted },
                  ]}
                >
                  Excused
                </ThemedText>
              </Pressable>

              {fastingLog[selectedDay ?? 0]?.status && (
                <Pressable
                  onPress={() => handleSetStatus("none")}
                  style={[
                    styles.statusButton,
                    { backgroundColor: theme.backgroundRoot },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Clear status"
                >
                  <Feather
                    name="trash-2"
                    size={22}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.statusButtonText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Excuse Reason Modal */}
      <Modal
        visible={showExcuseModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseExcuseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseExcuseModal}>
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText
              style={[
                styles.modalTitle,
                { color: theme.text, fontFamily: Fonts?.serifBold },
              ]}
            >
              Reason for Excuse
            </ThemedText>

            <View style={styles.excuseOptions}>
              {EXCUSE_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => handleSetExcuse(option.id)}
                  style={[
                    styles.excuseButton,
                    { backgroundColor: theme.backgroundRoot },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Excuse reason: ${option.label}`}
                >
                  <Feather name={option.icon} size={20} color={RAMADAN_GOLD} />
                  <ThemedText
                    style={[styles.excuseButtonText, { color: theme.text }]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Summary card
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 28,
    lineHeight: 34,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: QamarColors.moonlightMuted + "30",
  },

  // Make up card
  makeUpCard: {
    marginBottom: Spacing.lg,
  },
  makeUpContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  makeUpBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  makeUpText: {
    flex: 1,
  },
  makeUpTitle: {
    fontSize: 16,
  },
  makeUpSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Section label
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dayCell: {
    width: "13.5%",
    aspectRatio: 0.85,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    flexGrow: 1,
    maxWidth: 52,
  },
  dayNumber: {
    fontSize: 13,
  },
  excuseLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // Legend
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: Spacing["3xl"],
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },

  // Status picker
  statusOptions: {
    gap: Spacing.sm,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Excuse picker
  excuseOptions: {
    gap: Spacing.sm,
  },
  excuseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  excuseButtonText: {
    fontSize: 16,
  },
});
