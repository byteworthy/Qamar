/**
 * AnimatedModal Component
 *
 * Reusable modal wrapper with custom reanimated entrance animations.
 * Provides scale+fade entrance and backdrop fade matching the app's
 * contemplative animation philosophy.
 *
 * Usage:
 * <AnimatedModal visible={showModal} onRequestClose={closeModal}>
 *   <View>Modal content here</View>
 * </AnimatedModal>
 */

import React, { useEffect } from "react";
import { View, StyleSheet, Modal, Pressable, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  WithSpringConfig,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface AnimatedModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  /** Whether tapping backdrop closes modal (default: true) */
  dismissOnBackdropPress?: boolean;
}

// Contemplative spring config - matches Button.tsx and GlassCard.tsx
const springConfig: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 120,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedModal({
  visible,
  onRequestClose,
  children,
  contentStyle,
  dismissOnBackdropPress = true,
}: AnimatedModalProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(0.5);
  const contentOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  // Theme-aware backdrop color - darker for dark theme
  const backdropColor = isDark
    ? "rgba(0, 0, 0, 0.6)" // Darker for dark theme
    : "rgba(0, 0, 0, 0.5)"; // Standard for light theme

  useEffect(() => {
    if (visible) {
      // Animate in
      scale.value = withSpring(1, springConfig);
      contentOpacity.value = withTiming(1, { duration: 200 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      // Animate out
      scale.value = withSpring(0.5, springConfig);
      contentOpacity.value = withTiming(0, { duration: 150 });
      backdropOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, scale, contentOpacity, backdropOpacity]);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: contentOpacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleBackdropPress = () => {
    if (dismissOnBackdropPress) {
      onRequestClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // We handle animation ourselves
      onRequestClose={onRequestClose}
    >
      {/* Animated backdrop */}
      <AnimatedPressable
        style={[
          styles.backdrop,
          { backgroundColor: backdropColor },
          backdropAnimatedStyle,
        ]}
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        accessibilityHint="Tap outside content to dismiss"
      />

      {/* Centered content container */}
      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: theme.backgroundDefault },
            Shadows.lifted,
            contentStyle,
            contentAnimatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor set dynamically based on theme
    // Future enhancement: Could use BlurView for backdrop
    // Similar to GlassCard's blur approach for premium effect
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
});
