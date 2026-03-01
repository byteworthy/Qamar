/**
 * TTSButton Component
 *
 * Reusable speaker icon button that plays Arabic text-to-speech.
 * Shows animated state transitions: idle -> loading -> speaking.
 * Provides haptic feedback on press.
 */

import React, { useEffect } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { useTTS } from "@/hooks/useTTS";
import { NoorColors } from "@/constants/theme/colors";
import { hapticLight } from "@/lib/haptics";

// =============================================================================
// TYPES
// =============================================================================

interface TTSButtonProps {
  text: string;
  language?: string;
  size?: number;
  style?: ViewStyle;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_SIZE = 20;
const HIT_SLOP = 8;
const PULSE_DURATION = 600;

// =============================================================================
// COMPONENT
// =============================================================================

export function TTSButton({
  text,
  language = "ar",
  size = DEFAULT_SIZE,
  style,
}: TTSButtonProps) {
  const { theme } = useTheme();
  const { speak, stop, isSpeaking, isLoading } = useTTS();

  const pulseOpacity = useSharedValue(1);

  // Animate pulse when speaking
  useEffect(() => {
    if (isSpeaking) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, {
            duration: PULSE_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: PULSE_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1, // infinite
        false,
      );
    } else {
      cancelAnimation(pulseOpacity);
      pulseOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isSpeaking, pulseOpacity]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  function handlePress(): void {
    hapticLight();

    if (isSpeaking) {
      stop();
    } else {
      speak(text, { language });
    }
  }

  function getIconName(): "volume-2" | "loader" {
    if (isLoading) return "loader";
    return "volume-2";
  }

  function getIconColor(): string {
    if (isSpeaking || isLoading) return NoorColors.gold;
    return theme.textSecondary;
  }

  function getAccessibilityLabel(): string {
    if (isSpeaking) return "Stop speech";
    if (isLoading) return "Loading speech";
    return "Play text aloud";
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityState={{ busy: isLoading }}
      style={[styles.container, style]}
    >
      <Animated.View style={animatedIconStyle}>
        <Feather name={getIconName()} size={size} color={getIconColor()} />
      </Animated.View>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
