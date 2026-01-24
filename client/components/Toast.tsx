import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

/**
 * Toast - Non-blocking notification component
 *
 * Usage:
 * const [showToast, setShowToast] = useState(false);
 *
 * <Toast
 *   message="Reflection saved"
 *   type="success"
 *   visible={showToast}
 *   onHide={() => setShowToast(false)}
 * />
 */
export function Toast({
  message,
  type = "info",
  duration = 3000,
  visible,
  onHide,
}: ToastProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });

      // Auto hide after duration
      translateY.value = withDelay(
        duration,
        withSpring(
          -100,
          {
            damping: 20,
            stiffness: 200,
          },
          () => {
            runOnJS(onHide)();
          },
        ),
      );
    } else {
      translateY.value = withSpring(-100);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return theme.success;
      case "error":
        return theme.error;
      default:
        return theme.backgroundDefault;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + Spacing.md,
          backgroundColor: getBackgroundColor(),
          borderColor: theme.border,
          ...Shadows.medium,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.icon,
          {
            color: type === "info" ? theme.text : theme.onPrimary,
          },
        ]}
      >
        {getIcon()}
      </ThemedText>
      <ThemedText
        type="body"
        style={[
          styles.message,
          {
            color: type === "info" ? theme.text : theme.onPrimary,
          },
        ]}
      >
        {message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    zIndex: 1000,
    ...Platform.select({
      web: {
        maxWidth: 400,
        alignSelf: "center",
      },
    }),
  },
  icon: {
    marginRight: Spacing.sm,
    fontWeight: "600",
  },
  message: {
    flex: 1,
    fontWeight: "500",
  },
});
