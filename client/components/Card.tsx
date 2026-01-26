import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface CardProps {
  elevation?: "soft" | "medium" | "lifted" | "floating";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.4,
  stiffness: 200,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  elevation = "soft",
  title,
  description,
  children,
  onPress,
  style,
}: CardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const shadowIntensity = useSharedValue(1);

  const elevationShadow = Shadows[elevation];

  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate shadow values based on press state
    const shadowOpacity = interpolate(
      shadowIntensity.value,
      [1, 1.5],
      [elevationShadow.shadowOpacity, elevationShadow.shadowOpacity * 1.5],
      Extrapolation.CLAMP,
    );

    const shadowRadius = interpolate(
      shadowIntensity.value,
      [1, 1.5],
      [elevationShadow.shadowRadius, elevationShadow.shadowRadius * 1.3],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale: scale.value }],
      shadowColor: elevationShadow.shadowColor,
      shadowOffset: elevationShadow.shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation: elevationShadow.elevation,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
    shadowIntensity.value = withSpring(0.7, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
    shadowIntensity.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
        },
        animatedStyle,
        style,
      ]}
    >
      {title ? (
        <ThemedText type="h4" style={styles.cardTitle}>
          {title}
        </ThemedText>
      ) : null}
      {description ? (
        <ThemedText type="small" style={styles.cardDescription}>
          {description}
        </ThemedText>
      ) : null}
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    opacity: 0.75,
  },
});
