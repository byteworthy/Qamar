/**
 * AnimatedProgressBar
 *
 * Replaces static width % fills with a smooth animated bar that counts up
 * from 0 to the target progress on mount. Optionally shows a living glow
 * shimmer on the filled portion for premium feel.
 */

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { NoorColors } from "@/constants/theme/colors";

export interface AnimatedProgressBarProps {
  /** 0–100 */
  progress: number;
  color?: string;
  height?: number;
  borderRadius?: number;
  /** Stagger delay before the fill begins (ms) */
  delay?: number;
  /** Adds a living glow shimmer on the filled bar */
  showGlow?: boolean;
  /** backgroundColor of the track */
  trackColor?: string;
}

export function AnimatedProgressBar({
  progress,
  color = NoorColors.gold,
  height = 5,
  borderRadius = 3,
  delay = 0,
  showGlow = false,
  trackColor,
}: AnimatedProgressBarProps) {
  const containerWidth = useSharedValue(0);
  const fillProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    const target = Math.min(Math.max(progress / 100, 0), 1);
    fillProgress.value = withDelay(
      delay,
      withTiming(target, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    if (!showGlow) return;
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 700 }),
        withTiming(0.3, { duration: 700 }),
      ),
      -1,
      false,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGlow]);

  const fillStyle = useAnimatedStyle(() => ({
    width: fillProgress.value * containerWidth.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius, backgroundColor: trackColor ?? "rgba(255,255,255,0.12)" },
      ]}
      onLayout={(e) => {
        containerWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <Animated.View
        style={[
          styles.fill,
          { height, borderRadius, backgroundColor: color },
          fillStyle,
        ]}
      >
        {showGlow && (
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.glowOverlay, glowStyle]}
            pointerEvents="none"
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  glowOverlay: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 3,
  },
});
