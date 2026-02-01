/**
 * AtmosphericBackground Component
 *
 * Adds subtle gradient backgrounds to create depth and mood.
 * Uses theme-aware gradients defined in theme.ts
 *
 * Usage:
 * <AtmosphericBackground>
 *   <YourScreenContent />
 * </AtmosphericBackground>
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { Gradients } from "@/constants/theme";

interface AtmosphericBackgroundProps {
  children: React.ReactNode;
  variant?: "atmospheric" | "mesh" | "radialGlow";
}

export function AtmosphericBackground({
  children,
  variant = "atmospheric",
}: AtmosphericBackgroundProps) {
  const { isDark } = useTheme();
  const gradientConfig = isDark
    ? Gradients.dark[variant]
    : Gradients.light[variant];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientConfig.colors}
        locations={gradientConfig.locations}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
