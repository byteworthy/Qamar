import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState - Friendly empty state component
 *
 * Usage:
 * <EmptyState
 *   icon="📖"
 *   title="No Reflections Yet"
 *   description="Completed reflections will appear here."
 *   actionLabel="Start a Reflection"
 *   onAction={() => navigation.navigate('ThoughtCapture')}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        >
          <ThemedText style={styles.icon}>{icon}</ThemedText>
        </View>
      )}

      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>

      {description && (
        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {description}
        </ThemedText>
      )}

      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          {actionLabel}
        </Button>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["4xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    maxWidth: 300,
  },
  button: {
    marginTop: Spacing.md,
    minWidth: 200,
  },
});
