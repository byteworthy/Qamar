/**
 * GlassCard — web shim (no Reanimated)
 *
 * Reanimated 4 useAnimatedStyle creates new style objects every render on web,
 * causing React Error #185 (infinite update loop) when multiple cards mount.
 * This web-specific version uses plain React + Pressable with no animations.
 */
import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  elevated?: boolean;
  onPress?: () => void;
  breathing?: boolean;
  accessibilityRole?: "button" | "link" | "none";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function GlassCard({
  children,
  style,
  elevated = false,
  onPress,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
}: GlassCardProps) {
  const { theme } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.glassSurface,
      borderColor: theme.glassStroke,
      shadowColor: theme.subtleGlow,
    },
    elevated && Shadows.medium,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        accessibilityRole={accessibilityRole ?? "button"}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: "hidden",
    ...Shadows.soft,
    // @ts-ignore web-only
    boxShadow: "inset 0 0 20px rgba(212, 175, 55, 0.12)",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
