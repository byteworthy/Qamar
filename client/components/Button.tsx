import React, { ReactNode } from "react";
import {
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { hapticMedium } from "@/lib/haptics";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// More contemplative spring config - slower, more serene
const springConfig: WithSpringConfig = {
  damping: 20, // More damped (less bouncy)
  mass: 0.5, // Heavier (slower movement)
  stiffness: 120, // Less stiff (more gradual)
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
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
      scale.value = withSpring(0.97, springConfig);
      glowOpacity.value = withTiming(0.3, { duration: 200 }); // Slower glow fade-in
      hapticMedium(); // Medium haptic for primary button actions
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
      glowOpacity.value = withTiming(0, { duration: 300 }); // Slower glow fade-out
    }
  };

  const getBackgroundColor = () => {
    if (variant === "secondary") {
      return theme.backgroundSecondary;
    }
    return theme.primary;
  };

  const getTextColor = () => {
    if (variant === "secondary") {
      return theme.text;
    }
    return theme.buttonText;
  };

  // Extract text from children for accessibility label if not provided
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
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      {/* Subtle glow effect on press */}
      {variant === "primary" && !disabled && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glowContainer,
            glowStyle,
            Shadows.glow,
            {
              shadowColor: theme.primary,
            },
          ]}
        />
      )}

      <ThemedText
        type="body"
        style={[styles.buttonText, { color: getTextColor() }]}
      >
        {children}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    overflow: "hidden",
  },
  buttonText: {
    fontWeight: "600",
  },
  glowContainer: {
    borderRadius: BorderRadius.lg,
  },
});
