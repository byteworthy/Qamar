import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Gradients } from "@/constants/theme";

interface GradientBackgroundProps {
  children?: React.ReactNode;
  type?: "atmospheric" | "radialGlow" | "mesh" | "vignette";
  style?: ViewStyle;
  applyGrain?: boolean;
}

/**
 * GradientBackground component for atmospheric depth
 * Provides subtle gradient overlays to create warmth and visual interest
 *
 * @param type - Type of gradient (atmospheric, radialGlow, mesh, vignette)
 * @param applyGrain - Whether to apply a subtle grain texture overlay
 * @param children - Content to render inside the gradient
 * @param style - Additional styles to apply
 */
export function GradientBackground({
  children,
  type = "atmospheric",
  style,
  applyGrain = true,
}: GradientBackgroundProps) {
  const colorScheme = useColorScheme();

  const scheme = colorScheme === "dark" ? "dark" : "light";
  const gradientConfig = Gradients[scheme][type];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientConfig.colors as unknown as [string, string, ...string[]]}
        locations={gradientConfig.locations as unknown as [number, number, ...number[]]}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle grain texture overlay for warmth */}
      {applyGrain && (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.grainOverlay,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.01)"
                  : "rgba(0, 0, 0, 0.01)",
            },
          ]}
        />
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grainOverlay: {
    opacity: 0.5,
    // Simulates a subtle grain texture
    // In production, this would use an actual grain texture image
  },
});
