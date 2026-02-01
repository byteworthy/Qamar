/**
 * PremiumButton Component
 *
 * Enhanced button with gradient background and glow effects for premium feel.
 * Use for primary CTAs and important actions.
 *
 * Usage:
 * <PremiumButton onPress={handlePress}>
 *   Continue
 * </PremiumButton>
 */

import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Gradients, Shadows } from "@/constants/theme";
import { hapticMedium } from "@/lib/haptics";

interface PremiumButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "accent";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Contemplative spring config - serene, meditative feel
const springConfig: WithSpringConfig = {
  damping: 20, // More damped
  mass: 0.5, // Heavier
  stiffness: 120, // Less stiff
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PremiumButton({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: PremiumButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.96, springConfig);
      glowOpacity.value = withTiming(1, { duration: 200 }); // Slower glow
      hapticMedium();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
      glowOpacity.value = withTiming(0, { duration: 300 }); // Slower glow fade
    }
  };

  const gradientColors =
    variant === "accent"
      ? isDark
        ? Gradients.dark.accentGradient.colors
        : Gradients.light.accentGradient.colors
      : isDark
        ? Gradients.dark.buttonGradient.colors
        : Gradients.light.buttonGradient.colors;

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    if (typeof children === "string") return children;
    return undefined;
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[animatedStyle, style]}
    >
      {/* Glow effect layer */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.glowContainer,
          glowStyle,
          Shadows.glow,
        ]}
      />

      {/* Gradient background */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.text,
            {
              color: theme.buttonText,
            },
          ]}
        >
          {children}
        </ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing["2xl"],
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.soft,
  },
  text: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  glowContainer: {
    borderRadius: BorderRadius.lg,
  },
});
