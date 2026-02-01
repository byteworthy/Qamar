/**
 * LightRayPattern Component
 *
 * Radiating light rays pattern - unique to Noor (light) theme.
 * Represents light emanating from a source, creating visual distinction
 * from other Islamic apps.
 *
 * Usage:
 * <LightRayPattern variant="radial" opacity={0.05} />
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line, G } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";

interface LightRayPatternProps {
  variant?: "radial" | "corner" | "accent";
  opacity?: number;
}

export function LightRayPattern({
  variant = "radial",
  opacity = 0.06,
}: LightRayPatternProps) {
  const { isDark } = useTheme();
  // Gold light rays (Noor theme)
  const rayColor = isDark ? "#f0d473" : "#D4AF37";

  // Radiating light rays from center
  const RadialRays = () => (
    <Svg width="200" height="200" viewBox="0 0 200 200">
      <G opacity={opacity}>
        {/* 12 rays radiating from center */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          const rad = (angle * Math.PI) / 180;
          const x2 = 100 + Math.cos(rad) * 90;
          const y2 = 100 + Math.sin(rad) * 90;

          return (
            <Line
              key={i}
              x1="100"
              y1="100"
              x2={x2}
              y2={y2}
              stroke={rayColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </G>
    </Svg>
  );

  // Corner rays (diagonal rays from corner)
  const CornerRays = () => (
    <Svg width="150" height="150" viewBox="0 0 150 150">
      <G opacity={opacity}>
        {/* 6 rays from top-right corner */}
        {[0, 15, 30, 45, 60, 75].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 150 - Math.cos(rad) * 100;
          const y2 = Math.sin(rad) * 100;

          return (
            <Line
              key={i}
              x1="150"
              y1="0"
              x2={x2}
              y2={y2}
              stroke={rayColor}
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
      </G>
    </Svg>
  );

  // Accent rays (3 parallel rays)
  const AccentRays = () => (
    <Svg width="100" height="60" viewBox="0 0 100 60">
      <G opacity={opacity}>
        <Line x1="0" y1="15" x2="100" y2="15" stroke={rayColor} strokeWidth="1" strokeLinecap="round" />
        <Line x1="0" y1="30" x2="100" y2="30" stroke={rayColor} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="0" y1="45" x2="100" y2="45" stroke={rayColor} strokeWidth="1" strokeLinecap="round" />
      </G>
    </Svg>
  );

  if (variant === "corner") {
    return (
      <View style={styles.cornerContainer} pointerEvents="none">
        <View style={styles.topRight}>
          <CornerRays />
        </View>
      </View>
    );
  }

  if (variant === "accent") {
    return (
      <View style={styles.accentContainer} pointerEvents="none">
        <AccentRays />
      </View>
    );
  }

  // Radial variant - center of card
  return (
    <View style={styles.radialContainer} pointerEvents="none">
      <RadialRays />
    </View>
  );
}

const styles = StyleSheet.create({
  radialContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    overflow: "hidden",
  },
  cornerContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    overflow: "hidden",
  },
  topRight: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  accentContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 100,
    height: 60,
    overflow: "hidden",
  },
});
