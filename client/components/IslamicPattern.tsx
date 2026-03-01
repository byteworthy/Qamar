/**
 * IslamicPattern Component - Qamar Edition
 *
 * Subtle Islamic geometric patterns combining stars and crescent moons.
 * Unique to Qamar app - represents both traditional geometry and lunar calendar.
 *
 * Usage:
 * <IslamicPattern variant="corner" opacity={0.03} />
 * <IslamicPattern variant="moonstar" opacity={0.04} />
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";

interface IslamicPatternProps {
  variant?: "corner" | "full" | "accent" | "moonstar";
  opacity?: number;
}

export function IslamicPattern({
  variant = "corner",
  opacity = 0.02,
}: IslamicPatternProps) {
  const { isDark } = useTheme();
  // Cream/beige tones - Yemeni-inspired (traditional lime plaster), gender-neutral
  const patternColor = isDark ? "#e8dfc4" : "#c4b89a";

  // 8-pointed star pattern (Islamic geometric motif)
  const StarPattern = () => (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      <G opacity={opacity}>
        {/* Outer star points */}
        <Path
          d="M60 10 L65 50 L80 20 L70 55 L100 30 L75 60 L110 50 L80 65 L110 70 L75 60 L100 90 L70 65 L80 100 L65 70 L60 110 L55 70 L40 100 L50 65 L20 90 L45 60 L10 70 L40 65 L10 50 L45 60 L20 30 L50 55 L40 20 L55 50 Z"
          fill={patternColor}
          stroke={patternColor}
          strokeWidth="0.5"
        />
        {/* Inner octagon */}
        <Path
          d="M60 45 L70 50 L75 60 L70 70 L60 75 L50 70 L45 60 L50 50 Z"
          fill="none"
          stroke={patternColor}
          strokeWidth="0.5"
        />
      </G>
    </Svg>
  );

  // Crescent moon with star (unique to Qamar) - Yemeni-inspired minimal style
  const MoonStarPattern = () => (
    <Svg width="120" height="120" viewBox="0 0 120 120">
      <G opacity={opacity}>
        {/* Minimal crescent - thin stroke only (Yemeni geometric style) */}
        <Path
          d="M50 30 Q40 60 50 90"
          fill="none"
          stroke={patternColor}
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        {/* Single 5-pointed star - outline only, cleaner */}
        <Path
          d="M73 42 L75 47 L80 47 L76 50 L78 55 L73 51 L68 55 L70 50 L66 47 L71 47 Z"
          fill="none"
          stroke={patternColor}
          strokeWidth="0.6"
        />
        {/* Single accent dot - minimal decoration */}
        <Circle cx="55" cy="70" r="0.8" fill={patternColor} />
      </G>
    </Svg>
  );

  if (variant === "moonstar") {
    return (
      <View style={styles.cornerContainer} pointerEvents="none">
        <View style={styles.topRight}>
          <MoonStarPattern />
        </View>
      </View>
    );
  }

  if (variant === "corner") {
    return (
      <View style={styles.cornerContainer} pointerEvents="none">
        <View style={styles.topRight}>
          <StarPattern />
        </View>
      </View>
    );
  }

  if (variant === "accent") {
    return (
      <View style={styles.accentContainer} pointerEvents="none">
        <View style={styles.accentPattern}>
          <MoonStarPattern />
        </View>
      </View>
    );
  }

  // Full variant - star top right, moon bottom left
  return (
    <View style={styles.fullContainer} pointerEvents="none">
      <View style={styles.topRight}>
        <StarPattern />
      </View>
      <View style={styles.bottomLeft}>
        <MoonStarPattern />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cornerContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    overflow: "hidden",
  },
  topRight: {
    position: "absolute",
    top: -20,
    right: -20,
  },
  accentContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 80,
    height: 80,
    overflow: "hidden",
  },
  accentPattern: {
    transform: [{ scale: 0.6 }],
  },
  fullContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  bottomLeft: {
    position: "absolute",
    bottom: -20,
    left: -20,
    transform: [{ rotate: "180deg" }],
  },
});
