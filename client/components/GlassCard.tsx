/**
 * GlassCard Component
 *
 * Premium card with glassmorphism effect (blurred background, translucent surface).
 * Adds depth and modern aesthetic to the app.
 *
 * Usage:
 * <GlassCard elevated>
 *   <Text>Your content here</Text>
 * </GlassCard>
 *
 * Interactive cards:
 * <GlassCard onPress={handlePress} elevated>
 *   <Text>Tappable content</Text>
 * </GlassCard>
 */

import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle, Platform, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  WithSpringConfig,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  elevated?: boolean;
  onPress?: () => void;
  breathing?: boolean; // Subtle breathing animation (contemplative)
  accessibilityRole?: "button" | "link" | "none";
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

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({
  children,
  style,
  intensity,
  elevated = false,
  onPress,
  breathing = false,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
}: GlassCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const breathingScale = useSharedValue(1);

  // Platform-specific blur intensity
  const blurIntensity = intensity ?? (isDark ? 40 : 20);
  const tint = isDark ? "dark" : "light";

  // Breathing animation - subtle expansion/contraction like meditation breathing
  useEffect(() => {
    if (breathing) {
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.008, { duration: 3000 }), // Slow inhale (3s)
          withTiming(1, { duration: 3000 }), // Slow exhale (3s)
        ),
        -1, // Infinite
        false,
      );
    }
  }, [breathing, breathingScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: (onPress ? scale.value : breathingScale.value) }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const cardStyle = [
    styles.glassCard,
    {
      backgroundColor: theme.glassSurface,
      borderColor: theme.glassStroke,
      // Inner glow effect (lantern style - light emanating from within)
      shadowColor: theme.subtleGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    elevated && Shadows.medium,
    style,
  ];

  // Web fallback (BlurView not supported)
  if (Platform.OS === "web") {
    if (onPress) {
      return (
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.fallbackCard, cardStyle, animatedStyle]}
          accessibilityRole={accessibilityRole ?? "button"}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          {children}
        </AnimatedPressable>
      );
    }
    return <View style={[styles.fallbackCard, cardStyle]}>{children}</View>;
  }

  // Native implementation with BlurView
  if (onPress) {
    return (
      <AnimatedBlurView
        intensity={blurIntensity}
        tint={tint}
        style={[cardStyle, animatedStyle]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressableContent}
          accessibilityRole={accessibilityRole ?? "button"}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          {children}
        </Pressable>
      </AnimatedBlurView>
    );
  }

  return (
    <BlurView intensity={blurIntensity} tint={tint} style={cardStyle}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: "hidden",
    ...Shadows.soft,
  },
  fallbackCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: "hidden",
    ...Shadows.soft,
    // Inner glow for web fallback
    boxShadow: "inset 0 0 20px rgba(212, 175, 55, 0.12)",
  },
  pressableContent: {
    flex: 1,
  },
});
