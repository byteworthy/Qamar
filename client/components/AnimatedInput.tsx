/**
 * AnimatedInput Component
 *
 * Premium input field with smooth focus glow, character count animation, and error shake.
 * Matches the polish level of Button.tsx and GlassCard.tsx.
 *
 * Features:
 * - Focus glow animation (smooth fade-in/out)
 * - Character count with spring physics (fades in when typing begins)
 * - Error state with gentle shake animation
 * - Contemplative spring configuration for serene feel
 *
 * Usage:
 * <AnimatedInput
 *   value={text}
 *   onChangeText={setText}
 *   placeholder="Enter your thoughts..."
 *   maxLength={500}
 * />
 *
 * With error state:
 * <AnimatedInput
 *   value={text}
 *   onChangeText={setText}
 *   error="This field is required"
 *   shake={true}
 * />
 */

import React, { useEffect } from "react";
import { StyleSheet, TextInput, View, ViewStyle, StyleProp, TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Typography, Shadows } from "@/constants/theme";

interface AnimatedInputProps extends Omit<TextInputProps, "style"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  shake?: boolean;
  showCharacterCount?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Contemplative spring config - matches Button.tsx and GlassCard.tsx
const springConfig: WithSpringConfig = {
  damping: 20, // More damped (less bouncy)
  mass: 0.5, // Heavier (slower movement)
  stiffness: 120, // Less stiff (more gradual)
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function AnimatedInput({
  value,
  onChangeText,
  placeholder,
  style,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  error,
  shake = false,
  showCharacterCount = true,
  accessibilityLabel,
  accessibilityHint,
  ...textInputProps
}: AnimatedInputProps) {
  const { theme } = useTheme();
  const glowOpacity = useSharedValue(0);
  const charCountOpacity = useSharedValue(0);
  const charCountScale = useSharedValue(0.8);
  const shakeTranslateX = useSharedValue(0);

  // Track if user has started typing
  const hasStartedTyping = value.length > 0;

  // Focus glow animation
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Character count animation with spring physics
  const charCountStyle = useAnimatedStyle(() => ({
    opacity: charCountOpacity.value,
    transform: [{ scale: charCountScale.value }],
  }));

  // Error shake animation
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeTranslateX.value }],
  }));

  // Animate character count when typing begins
  useEffect(() => {
    if (hasStartedTyping && showCharacterCount) {
      charCountOpacity.value = withTiming(1, { duration: 300 });
      charCountScale.value = withSpring(1, springConfig);
    } else if (!hasStartedTyping) {
      charCountOpacity.value = withTiming(0, { duration: 300 });
      charCountScale.value = withSpring(0.8, springConfig);
    }
  }, [hasStartedTyping, showCharacterCount, charCountOpacity, charCountScale]);

  // Trigger shake animation when error state changes
  useEffect(() => {
    if (shake && error) {
      // Gentle shake: left -> right -> center
      shakeTranslateX.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 100 }),
      );
    }
  }, [shake, error, shakeTranslateX]);

  const handleFocus = () => {
    glowOpacity.value = withTiming(0.3, { duration: 200 }); // Slower glow fade-in
  };

  const handleBlur = () => {
    glowOpacity.value = withTiming(0, { duration: 300 }); // Slower glow fade-out
  };

  const characterCount = maxLength ? `${value.length}/${maxLength}` : `${value.length}`;

  const inputHeight = multiline
    ? Spacing.inputHeight * (numberOfLines || 3)
    : Spacing.inputHeight;

  return (
    <View style={[styles.container, style]}>
      <AnimatedView
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.inputBackground,
            borderColor: error ? theme.error : theme.border,
            height: inputHeight,
          },
          error && styles.errorBorder,
          shakeStyle,
        ]}
      >
        {/* Focus glow effect */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glowContainer,
            glowStyle,
            Shadows.glow,
            {
              shadowColor: error ? theme.error : theme.primary,
              borderRadius: BorderRadius.md,
            },
          ]}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: Typography.body.fontSize,
              lineHeight: Typography.body.lineHeight,
              height: multiline ? "100%" : Spacing.inputHeight,
            },
          ]}
          {...textInputProps}
        />
      </AnimatedView>

      {/* Character count - fades in with spring when typing begins */}
      {showCharacterCount && maxLength && (
        <AnimatedView style={[styles.charCountContainer, charCountStyle]}>
          <ThemedText
            type="caption"
            style={[
              styles.charCount,
              {
                color:
                  value.length >= maxLength * 0.9
                    ? theme.warning
                    : theme.textSecondary,
              },
            ]}
          >
            {characterCount}
          </ThemedText>
        </AnimatedView>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText type="caption" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputWrapper: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    overflow: "hidden",
    justifyContent: "center",
  },
  glowContainer: {
    borderRadius: BorderRadius.md,
  },
  input: {
    flex: 1,
    padding: 0,
    textAlignVertical: "top",
  },
  errorBorder: {
    borderWidth: 2,
  },
  charCountContainer: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  charCount: {
    fontWeight: "500",
  },
  errorContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
});
