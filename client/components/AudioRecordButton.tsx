/**
 * AudioRecordButton Component
 *
 * Large animated circle button for audio recording. Shows a pulsing gold ring
 * animation when recording is active, with haptic feedback on press.
 * Follows the same animation and theming patterns as TTSButton and LoadingState.
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
import { QamarColors } from "@/constants/theme/colors";
import { hapticMedium } from "@/lib/haptics";

// =============================================================================
// TYPES
// =============================================================================

interface AudioRecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_SIZE = 72;
const ICON_RATIO = 0.39; // Icon size relative to button size
const BORDER_WIDTH = 2.5;
const RECORDING_BORDER_WIDTH = 3;
const PULSE_DURATION = 800;
const RECORDING_BG = "rgba(220, 50, 50, 0.15)";

// =============================================================================
// COMPONENT
// =============================================================================

export function AudioRecordButton({
  isRecording,
  onPress,
  size = DEFAULT_SIZE,
  disabled = false,
  style,
}: AudioRecordButtonProps) {
  const { theme } = useTheme();
  const pulseScale = useSharedValue(1);

  // Animate pulsing ring when recording
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: PULSE_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1.0, {
            duration: PULSE_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1, // infinite
        false,
      );
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  function handlePress(): void {
    if (disabled) return;
    hapticMedium();
    onPress();
  }

  const iconSize = Math.round(size * ICON_RATIO);
  const borderColor = isRecording ? QamarColors.gold : theme.border;
  const borderWidth = isRecording ? RECORDING_BORDER_WIDTH : BORDER_WIDTH;
  const backgroundColor = isRecording ? RECORDING_BG : theme.glassSurface;
  const iconColor = isRecording ? QamarColors.gold : theme.textSecondary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
      accessibilityState={{ disabled }}
      style={style}
    >
      <Animated.View
        style={[
          styles.circle,
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor,
            borderWidth,
            backgroundColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Feather name="mic" size={iconSize} color={iconColor} />
      </Animated.View>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
