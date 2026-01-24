import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

type ReflectionStep =
  | "ThoughtCapture"
  | "Distortion"
  | "Reframe"
  | "Regulation"
  | "Intention"
  | "SessionComplete";

interface ReflectionProgressProps {
  currentStep: ReflectionStep;
  style?: any;
}

const STEPS: ReflectionStep[] = [
  "ThoughtCapture",
  "Distortion",
  "Reframe",
  "Regulation",
  "Intention",
  "SessionComplete",
];

const STEP_LABELS: Record<ReflectionStep, string> = {
  ThoughtCapture: "Capture",
  Distortion: "Notice",
  Reframe: "Reframe",
  Regulation: "Settle",
  Intention: "Intend",
  SessionComplete: "Complete",
};

/**
 * ReflectionProgress - Shows user's position in the reflection journey
 *
 * Usage:
 * <ReflectionProgress currentStep="Reframe" />
 *
 * Displays as: ● — ● — ◉ — ○ — ○ — ○
 *              Capture → Notice → Reframe → ...
 */
export function ReflectionProgress({
  currentStep,
  style,
}: ReflectionProgressProps) {
  const { theme } = useTheme();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, style]}
    >
      <View style={styles.progressRow}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <React.Fragment key={step}>
              {/* Step dot */}
              <View style={styles.stepContainer}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        isCompleted || isCurrent ? theme.primary : theme.border,
                      borderColor: isCurrent ? theme.primary : "transparent",
                      transform: [{ scale: isCurrent ? 1.2 : 1 }],
                    },
                    isCurrent && styles.stepDotCurrent,
                  ]}
                />
                {/* Optional: Show label for current step only */}
                {isCurrent && (
                  <ThemedText
                    type="caption"
                    style={[styles.stepLabel, { color: theme.textSecondary }]}
                  >
                    {STEP_LABELS[step]}
                  </ThemedText>
                )}
              </View>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </Animated.View>
  );
}

/**
 * Compact version - just dots, no labels
 */
export function ReflectionProgressCompact({
  currentStep,
  style,
}: ReflectionProgressProps) {
  const { theme } = useTheme();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.compactContainer, style]}
    >
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View
            key={step}
            style={[
              styles.compactDot,
              {
                backgroundColor:
                  isCompleted || isCurrent ? theme.primary : theme.border,
                width: isCurrent ? 24 : 6,
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    alignItems: "center",
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  stepDotCurrent: {
    borderWidth: 2,
  },
  stepLabel: {
    marginTop: Spacing.xs,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  connector: {
    width: 20,
    height: 2,
    marginHorizontal: Spacing.xs,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  compactDot: {
    height: 6,
    borderRadius: BorderRadius.full,
  },
});
