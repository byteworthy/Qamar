/**
 * HifzMistakeFeedback Component
 *
 * Displays recitation results with score visualization, word-level colored feedback,
 * and optional AI tips panel for Hifz (Quran memorization) practice.
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { NoorColors } from "@/constants/theme/colors";
import type { RecitationResult } from "../../shared/types/hifz";

// ====================================================================
// Types
// ====================================================================

interface HifzMistakeFeedbackProps {
  result: RecitationResult | null;
  aiTips?: string;
  showAITips?: boolean;
  onRequestTips?: () => void;
}

// ====================================================================
// Helpers
// ====================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981"; // Green
  if (score >= 50) return "#F59E0B"; // Yellow/amber
  return "#EF4444"; // Red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent!";
  if (score >= 50) return "Good effort";
  return "Keep practicing";
}

// ====================================================================
// Score Circle
// ====================================================================

const CIRCLE_SIZE = 120;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreCircle({ score, color }: { score: number; color: string }) {
  const { theme } = useTheme();
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.scoreCircleContainer}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        {/* Background track */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={theme.border}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        {/* Progress arc */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.scoreTextOverlay}>
        <ThemedText style={[styles.scoreValue, { color }]}>
          {Math.round(score)}
        </ThemedText>
      </View>
    </View>
  );
}

// ====================================================================
// Empty State
// ====================================================================

function EmptyState() {
  const { theme } = useTheme();

  return (
    <GlassCard style={styles.emptyStateCard}>
      <Feather
        name="mic"
        size={48}
        color={theme.textSecondary}
        style={styles.emptyIcon}
      />
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Record your recitation to see results
      </ThemedText>
    </GlassCard>
  );
}

// ====================================================================
// Main Component
// ====================================================================

export function HifzMistakeFeedback({
  result,
  aiTips,
  showAITips = true,
  onRequestTips,
}: HifzMistakeFeedbackProps): React.JSX.Element {
  const { theme } = useTheme();

  // Empty state - no result yet
  if (!result) {
    return <EmptyState />;
  }

  const scoreColor = getScoreColor(result.score);
  const scoreLabel = getScoreLabel(result.score);
  const incorrectWords = result.wordResults.filter((w: any) => !w.isCorrect);
  const mistakeCount = incorrectWords.length;

  return (
    <Animated.View entering={FadeInUp.duration(500).springify()}>
      {/* ---- Score Section ---- */}
      <GlassCard style={styles.scoreCard}>
        <ScoreCircle score={result.score} color={scoreColor} />

        <ThemedText style={[styles.scoreLabel, { color: scoreColor }]}>
          {scoreLabel}
        </ThemedText>

        <ThemedText
          style={[styles.accuracyText, { color: theme.textSecondary }]}
        >
          Accuracy: {Math.round(result.accuracy * 100)}%
        </ThemedText>
      </GlassCard>

      {/* ---- Word-level Results ---- */}
      <GlassCard style={styles.wordsCard}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          Your Recitation
        </ThemedText>
        <View style={[styles.wordsContainer, { direction: "rtl" }]}>
          {result.wordResults.map((word: any, index: number) => (
            <ThemedText
              key={`${word.expected}-${index}`}
              style={[
                styles.wordText,
                {
                  color: word.isCorrect ? "#10B981" : "#EF4444",
                },
              ]}
            >
              {word.expected}
            </ThemedText>
          ))}
        </View>
      </GlassCard>

      {/* ---- Mistake Summary ---- */}
      {mistakeCount > 0 && (
        <GlassCard style={styles.mistakesCard}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Mistakes
          </ThemedText>

          <ThemedText
            style={[styles.mistakeCount, { color: theme.textSecondary }]}
          >
            {mistakeCount} mistakes out of {result.wordResults.length} words
          </ThemedText>

          <View style={styles.mistakeList}>
            {incorrectWords.map((word: any, index: number) => (
              <View key={`mistake-${index}`} style={styles.mistakeItem}>
                <ThemedText
                  style={[styles.mistakeLabel, { color: theme.textSecondary }]}
                >
                  Expected:
                </ThemedText>
                <ThemedText
                  style={[styles.mistakeWord, { color: "#10B981" }]}
                >
                  {word.expected}
                </ThemedText>

                <ThemedText
                  style={[styles.mistakeLabel, { color: theme.textSecondary }]}
                >
                  You said:
                </ThemedText>
                <ThemedText
                  style={[styles.mistakeWord, { color: "#EF4444" }]}
                >
                  {word.actual}
                </ThemedText>
              </View>
            ))}
          </View>
        </GlassCard>
      )}

      {/* ---- AI Tips Panel ---- */}
      {showAITips && (
        <GlassCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Feather
              name="alert-circle"
              size={18}
              color={NoorColors.gold}
              style={styles.tipsIcon}
            />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              AI Tips
            </ThemedText>
          </View>

          {aiTips ? (
            <ThemedText
              style={[styles.tipsText, { color: theme.textSecondary }]}
            >
              {aiTips}
            </ThemedText>
          ) : onRequestTips ? (
            <Pressable onPress={onRequestTips} style={styles.tipsButton}>
              <ThemedText
                style={[styles.tipsButtonText, { color: NoorColors.gold }]}
              >
                Get AI Tips
              </ThemedText>
              <Feather name="arrow-right" size={16} color={NoorColors.gold} />
            </Pressable>
          ) : null}
        </GlassCard>
      )}
    </Animated.View>
  );
}

// ====================================================================
// Styles
// ====================================================================

const styles = StyleSheet.create({
  // Score circle
  scoreCircleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  scoreTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 44,
  },

  // Score card
  scoreCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Words card
  wordsCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wordText: {
    fontSize: 18,
    fontWeight: "600",
  },

  // Mistakes card
  mistakesCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  mistakeCount: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  mistakeList: {
    gap: 12,
  },
  mistakeItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  mistakeLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  mistakeWord: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  // Tips card
  tipsCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsIcon: {
    marginRight: 8,
  },
  tipsText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
  },
  tipsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: NoorColors.gold,
    marginTop: 8,
  },
  tipsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },

  // Empty state
  emptyStateCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
