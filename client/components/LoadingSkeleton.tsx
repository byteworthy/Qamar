import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * LoadingSkeleton - Shimmer loading placeholder
 *
 * Usage:
 * <LoadingSkeleton width="100%" height={20} />
 * <LoadingSkeleton width={120} height={40} borderRadius={BorderRadius.full} />
 */
export function LoadingSkeleton({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: LoadingSkeletonProps) {
  const { theme } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1, // infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return {
      opacity,
    };
  });

  const containerStyle: ViewStyle = {
    width: width as any,
    height,
    borderRadius,
    backgroundColor: theme.border,
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.backgroundDefault,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

/**
 * SkeletonGroup - Pre-built skeleton patterns for common layouts
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.skeletonGroup}>
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          width={index === lines - 1 ? "75%" : "100%"}
          height={18}
          style={{ marginBottom: Spacing.sm }}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderRadius: BorderRadius.md,
        },
      ]}
    >
      <LoadingSkeleton width="60%" height={24} style={{ marginBottom: Spacing.md }} />
      <SkeletonText lines={2} />
    </View>
  );
}

export function SkeletonReflection() {
  return (
    <View style={styles.skeletonReflection}>
      {/* Belief section */}
      <View style={{ marginBottom: Spacing["2xl"] }}>
        <LoadingSkeleton width={140} height={12} style={{ marginBottom: Spacing.sm }} />
        <LoadingSkeleton width="100%" height={60} />
      </View>

      {/* Perspective section */}
      <View style={{ marginBottom: Spacing["2xl"] }}>
        <LoadingSkeleton width={160} height={12} style={{ marginBottom: Spacing.sm }} />
        <LoadingSkeleton width="100%" height={120} />
      </View>

      {/* Next step section */}
      <View style={{ marginBottom: Spacing["2xl"] }}>
        <LoadingSkeleton width={120} height={12} style={{ marginBottom: Spacing.sm }} />
        <LoadingSkeleton width="100%" height={40} />
      </View>

      {/* Anchors */}
      <View>
        <LoadingSkeleton width={100} height={12} style={{ marginBottom: Spacing.sm }} />
        <View style={styles.anchorRow}>
          <LoadingSkeleton width={80} height={32} borderRadius={BorderRadius.full} />
          <LoadingSkeleton width={100} height={32} borderRadius={BorderRadius.full} />
          <LoadingSkeleton width={90} height={32} borderRadius={BorderRadius.full} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  skeletonGroup: {
    // Container for grouped skeletons
  },
  skeletonCard: {
    padding: Spacing.lg,
  },
  skeletonReflection: {
    paddingHorizontal: Spacing.xl,
  },
  anchorRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
});
