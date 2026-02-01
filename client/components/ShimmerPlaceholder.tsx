/**
 * ShimmerPlaceholder Component
 *
 * Elegant loading skeleton with shimmer animation.
 * Replaces generic ActivityIndicator for premium feel.
 *
 * Usage:
 * <ShimmerPlaceholder width={200} height={100} borderRadius={12} />
 */

import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

interface ShimmerPlaceholderProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerPlaceholder({
  width,
  height,
  borderRadius = 0,
  style,
}: ShimmerPlaceholderProps) {
  const { theme, isDark } = useTheme();
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedValue.value,
      [0, 1],
      [-width, width],
    );

    return {
      transform: [{ translateX }],
    };
  });

  const shimmerColors = isDark
    ? ([
        "rgba(79, 209, 168, 0)",
        "rgba(79, 209, 168, 0.1)",
        "rgba(79, 209, 168, 0)",
      ] as const)
    : ([
        "rgba(155, 107, 75, 0)",
        "rgba(155, 107, 75, 0.15)",
        "rgba(155, 107, 75, 0)",
      ] as const);

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSecondary,
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
