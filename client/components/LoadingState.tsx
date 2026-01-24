import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

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

  if (type === "skeleton") {
    return <SkeletonLoader lines={lines} />;
  }

  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      {text && (
        <ThemedText
          type="body"
          style={[styles.spinnerText, { color: theme.textSecondary }]}
        >
          {text}
        </ThemedText>
      )}
    </View>
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
    gap: Spacing.lg,
  },
  spinnerText: {
    textAlign: "center",
    paddingHorizontal: Spacing["2xl"],
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
