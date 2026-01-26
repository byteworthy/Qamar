import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const CONTEXTUAL_MESSAGES = [
  "Reflecting...",
  "Illuminating...",
  "Preparing your space...",
  "Gathering insights...",
  "Opening your journal...",
  "Finding clarity...",
];

interface LoadingStateProps {
  /**
   * Type of loading indicator
   * - skeleton: Content placeholder with shimmer effect
   * - spinner: Traditional loading spinner with text
   * - progress: For multi-step operations (future enhancement)
   */
  type?: "skeleton" | "spinner" | "progress";
  /**
   * Loading message to display
   */
  text?: string;
  /**
   * Number of skeleton lines (only for skeleton type)
   */
  lines?: number;
}

/**
 * Unified loading state component
 *
 * Provides consistent loading experience across the app with:
 * - Skeleton loaders for content-heavy screens
 * - Spinners for quick operations
 * - Consistent animation timing
 *
 * Usage:
 * ```tsx
 * <LoadingState type="skeleton" lines={3} />
 * <LoadingState type="spinner" text="Noticing how you're thinking..." />
 * ```
 */
export function LoadingState({
  type = "spinner",
  text,
  lines = 3,
}: LoadingStateProps) {
  const { theme } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through contextual messages if no text provided
  useEffect(() => {
    if (!text) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % CONTEXTUAL_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [text]);

  if (type === "skeleton") {
    return <SkeletonLoader lines={lines} />;
  }

  const displayText = text || CONTEXTUAL_MESSAGES[messageIndex];

  return (
    <View style={styles.spinnerContainer}>
      <BreathingIcon color={theme.primary} />
      <Animated.View>
        <ThemedText
          type="body"
          style={[styles.spinnerText, { color: theme.textSecondary }]}
        >
          {displayText}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

/**
 * Breathing animation icon for loading state
 * Uses gentle scale pulse to create calming effect
 */
function BreathingIcon({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Breathing scale animation (like inhale/exhale)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        withTiming(1, {
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ),
      -1,
      false,
    );

    // Gentle opacity pulse
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 }),
      ),
      -1,
      false,
    );

    // Slow rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.breathingIcon, animatedStyle]}>
      <Feather name="compass" size={48} color={color} />
    </Animated.View>
  );
}

/**
 * Skeleton loader with shimmer effect
 */
function SkeletonLoader({ lines }: { lines: number }) {
  const { theme } = useTheme();
  const shimmerTranslateX = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        }),
        withTiming(-1, {
          duration: 0,
        }),
      ),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value * 100 }],
  }));

  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonLine,
            {
              backgroundColor: theme.backgroundSecondary,
              width: index === lines - 1 ? "70%" : "100%", // Last line shorter
            },
          ]}
        >
          <Animated.View
            style={[
              styles.shimmer,
              {
                backgroundColor: theme.backgroundTertiary,
              },
              shimmerStyle,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing["2xl"], // Increased from lg
  },
  breathingIcon: {
    marginBottom: Spacing.md,
  },
  spinnerText: {
    textAlign: "center",
    paddingHorizontal: Spacing["2xl"],
    fontStyle: "italic",
    opacity: 0.85,
  },
  skeletonContainer: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  skeletonLine: {
    height: 16,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
});
