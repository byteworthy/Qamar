import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type EmptyStateVariant = "history" | "insights" | "dua" | "generic";

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Predefined variants with context-specific messaging
   * - history: Encourages first reflection
   * - insights: Explains PRO feature
   * - dua: Suggests emotional awareness
   * - generic: Default fallback
   */
  variant?: EmptyStateVariant;
}

/**
 * Context-specific empty state configurations
 */
const VARIANT_CONFIG: Record<
  EmptyStateVariant,
  {
    icon: string;
    title: string;
    description: string;
  }
> = {
  history: {
    icon: "🌱",
    title: "No Reflections Yet",
    description:
      "Your journey begins with a single thought. Start your first reflection to see patterns emerge.",
  },
  insights: {
    icon: "✨",
    title: "Insights Coming Soon",
    description:
      "Complete a few reflections to unlock personalized insights. Patterns reveal themselves with practice.",
  },
  dua: {
    icon: "🤲",
    title: "Find Your Words",
    description:
      "When you're not sure how to express what you feel, start by naming the emotion.",
  },
  generic: {
    icon: "📭",
    title: "Nothing Here Yet",
    description: "Content will appear once available.",
  },
};

/**
 * EmptyState - Context-aware empty state component
 *
 * Usage with variant:
 * ```tsx
 * <EmptyState variant="history" />
 * <EmptyState
 *   variant="insights"
 *   actionLabel="Upgrade to Noor Plus"
 *   onAction={() => navigation.navigate('Pricing')}
 * />
 * ```
 *
 * Usage with custom content:
 * ```tsx
 * <EmptyState
 *   icon="📖"
 *   title="No Reflections Yet"
 *   description="Completed reflections will appear here."
 *   actionLabel="Start a Reflection"
 *   onAction={() => navigation.navigate('ThoughtCapture')}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "generic",
}: EmptyStateProps) {
  const { theme } = useTheme();

  // Get variant config if specified and props not provided
  const config = VARIANT_CONFIG[variant];
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {displayIcon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.backgroundDefault,
            },
          ]}
        >
          <ThemedText style={styles.icon}>{displayIcon}</ThemedText>
        </View>
      )}

      <ThemedText type="h3" style={styles.title}>
        {displayTitle}
      </ThemedText>

      {displayDescription && (
        <ThemedText
          type="body"
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {displayDescription}
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
