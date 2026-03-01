import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { useHifzProgress } from "../hooks/useHifzProgress";
import { useTheme } from "../hooks/useTheme";
import type { JuzProgress } from "../../shared/types/hifz";

// =============================================================================
// TYPES
// =============================================================================

interface JuzProgressMapProps {
  onJuzPress?: (juzNumber: number) => void;
  showLegend?: boolean;
}

interface LegendItem {
  color: string;
  label: string;
}

// =============================================================================
// COLOR CONSTANTS
// =============================================================================

const COLORS = {
  notStarted: "#6B7280", // Gray
  inProgress: "#3B82F6", // Blue
  memorized: "#10B981", // Green
  reviewOverdue: "#F59E0B", // Yellow
  reviewCritical: "#EF4444", // Red
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get cell background color based on juz status
 */
function getJuzColor(juz: JuzProgress): string {
  // Check memorization status first
  if (juz.memorizedVerses === 0) {
    return COLORS.notStarted;
  }

  if (juz.memorizedVerses >= juz.totalVerses) {
    // Fully memorized - check review status
    switch (juz.status) {
      case "review_overdue":
        return COLORS.reviewOverdue;
      case "review_critical":
        return COLORS.reviewCritical;
      case "on_schedule":
      default:
        return COLORS.memorized;
    }
  }

  // Partially memorized
  return COLORS.inProgress;
}

/**
 * Get accessibility label for juz cell
 */
function getAccessibilityLabel(juz: JuzProgress): string {
  return `Juz ${juz.juzNumber}, ${juz.memorizedVerses} of ${juz.totalVerses} verses memorized`;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Individual Juz Cell Component
 */
function JuzCell({
  juz,
  onPress,
}: {
  juz: JuzProgress;
  onPress?: (juzNumber: number) => void;
}) {
  const { theme } = useTheme();
  const backgroundColor = getJuzColor(juz);

  return (
    <Pressable
      testID={`juz-cell-${juz.juzNumber}`}
      accessibilityLabel={getAccessibilityLabel(juz)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.cell,
        {
          backgroundColor,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => onPress?.(juz.juzNumber)}
    >
      <ThemedText
        style={[
          styles.juzNumber,
          { color: "#FFFFFF" }, // White text for visibility on all color backgrounds
        ]}
      >
        {juz.juzNumber}
      </ThemedText>
      <ThemedText
        style={[
          styles.verseCount,
          { color: "#FFFFFF", opacity: 0.8 }, // Slightly transparent white
        ]}
      >
        {juz.memorizedVerses}/{juz.totalVerses}
      </ThemedText>
    </Pressable>
  );
}

/**
 * Legend Component
 */
function Legend() {
  const legendItems: LegendItem[] = [
    { color: COLORS.notStarted, label: "Not Started" },
    { color: COLORS.inProgress, label: "In Progress" },
    { color: COLORS.memorized, label: "Memorized" },
  ];

  return (
    <View style={styles.legend}>
      {legendItems.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View
            style={[styles.legendSwatch, { backgroundColor: item.color }]}
          />
          <ThemedText type="small" style={styles.legendLabel}>
            {item.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function JuzProgressMap({
  onJuzPress,
  showLegend = true,
}: JuzProgressMapProps) {
  const { allJuzProgress } = useHifzProgress();

  return (
    <View style={styles.container}>
      {/* 30-cell grid */}
      <View style={styles.grid}>
        {allJuzProgress.map((juz) => (
          <JuzCell key={juz.juzNumber} juz={juz} onPress={onJuzPress} />
        ))}
      </View>

      {/* Legend */}
      {showLegend && <Legend />}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  cell: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  juzNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  verseCount: {
    fontSize: 10,
    marginTop: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
  },
});
