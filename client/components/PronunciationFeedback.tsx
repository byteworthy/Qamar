/**
 * PronunciationFeedback Component
 *
 * Displays pronunciation scoring results with a circular score indicator,
 * word-by-word colored results, and AI tips in a GlassCard.
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { NoorColors } from "@/constants/theme/colors";
import type { PronunciationFeedback as PronunciationFeedbackType } from "@/hooks/usePronunciation";

// ====================================================================
// Types
// ====================================================================

interface Props {
  feedback: PronunciationFeedbackType;
  style?: ViewStyle;
}

// ====================================================================
// Helpers
// ====================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return NoorColors.emerald;
  if (score >= 60) return NoorColors.gold;
  return "#EF4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent!";
  if (score >= 60) return "Good!";
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
        <ThemedText style={[styles.scoreUnit, { color: theme.textSecondary }]}>
          / 100
        </ThemedText>
      </View>
    </View>
  );
}

// ====================================================================
// Word Result Item
// ====================================================================

function WordResultItem({
  expected,
  transcribed,
  isCorrect,
}: {
  expected: string;
  transcribed: string;
  isCorrect: boolean;
}) {
  const { theme } = useTheme();

  if (isCorrect) {
    return (
      <View style={styles.wordItem}>
        <ThemedText style={[styles.wordCorrect, { color: NoorColors.emerald }]}>
          {expected}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.wordItem}>
      <ThemedText
        style={[
          styles.wordIncorrect,
          { color: "#EF4444", textDecorationLine: "line-through" },
        ]}
      >
        {expected}
      </ThemedText>
      {transcribed ? (
        <ThemedText
          style={[styles.wordTranscribed, { color: theme.textSecondary }]}
        >
          {transcribed}
        </ThemedText>
      ) : null}
    </View>
  );
}

// ====================================================================
// Main Component
// ====================================================================

export function PronunciationFeedback({ feedback, style }: Props) {
  const { theme } = useTheme();
  const scoreColor = getScoreColor(feedback.score);
  const scoreLabel = getScoreLabel(feedback.score);

  return (
    <Animated.View entering={FadeInUp.duration(500).springify()} style={style}>
      {/* ---- Score Section ---- */}
      <GlassCard style={styles.scoreCard}>
        <ScoreCircle score={feedback.score} color={scoreColor} />

        <ThemedText style={[styles.scoreLabel, { color: scoreColor }]}>
          {scoreLabel}
        </ThemedText>

        <ThemedText
          style={[styles.accuracyText, { color: theme.textSecondary }]}
        >
          Accuracy: {Math.round(feedback.accuracy * 100)}%
        </ThemedText>
      </GlassCard>

      {/* ---- Word Results Section ---- */}
      {feedback.wordResults.length > 0 && (
        <GlassCard style={styles.wordsCard}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Word-by-Word
          </ThemedText>
          <View style={styles.wordsContainer}>
            {feedback.wordResults.map((word, index) => (
              <WordResultItem
                key={`${word.expected}-${index}`}
                expected={word.expected}
                transcribed={word.transcribed}
                isCorrect={word.isCorrect}
              />
            ))}
          </View>
        </GlassCard>
      )}

      {/* ---- AI Tips Section ---- */}
      {feedback.tips ? (
        <GlassCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Feather
              name="zap"
              size={18}
              color={NoorColors.gold}
              style={styles.tipsIcon}
            />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Tips
            </ThemedText>
          </View>
          <ThemedText style={[styles.tipsText, { color: theme.textSecondary }]}>
            {feedback.tips}
          </ThemedText>
        </GlassCard>
      ) : null}
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
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
  },
  scoreUnit: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
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
  wordItem: {
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  wordCorrect: {
    fontSize: 18,
    fontWeight: "600",
  },
  wordIncorrect: {
    fontSize: 18,
    fontWeight: "600",
  },
  wordTranscribed: {
    fontSize: 12,
    fontWeight: "400",
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
});
