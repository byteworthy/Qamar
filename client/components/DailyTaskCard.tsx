import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme/colors";
import { hapticLight } from "@/lib/haptics";
import type { DailyTask } from "../../shared/types/study-plan";

interface DailyTaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
}

export function DailyTaskCard({ task, onToggleComplete }: DailyTaskCardProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    hapticLight();

    // Parse deep link: "VerseReader?surahId=2&startVerse=1&endVerse=20"
    const [screenName, paramsString] = task.screenDeepLink.split("?");
    const params: Record<string, any> = {};

    if (paramsString) {
      paramsString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        params[key] = isNaN(Number(value)) ? value : Number(value);
      });
    }

    // @ts-ignore - Dynamic navigation based on deep link
    navigation.navigate(screenName, params);
  };

  const handleToggle = () => {
    hapticLight();
    onToggleComplete();
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {/* Checkbox */}
        <Pressable onPress={handleToggle} style={styles.checkbox}>
          {task.completed ? (
            <View
              style={[
                styles.checkboxFilled,
                { backgroundColor: NoorColors.gold },
              ]}
            >
              <Feather name="check" size={16} color="#FFFFFF" />
            </View>
          ) : (
            <View
              style={[styles.checkboxEmpty, { borderColor: theme.border }]}
            />
          )}
        </Pressable>

        {/* Task info */}
        <Pressable onPress={handlePress} style={styles.content}>
          <ThemedText
            style={[
              styles.title,
              { color: theme.text },
              task.completed && styles.completedText,
            ]}
          >
            {task.title}
          </ThemedText>
          <ThemedText
            style={[styles.description, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {task.description}
          </ThemedText>
          <View style={styles.meta}>
            <Feather name="clock" size={12} color={NoorColors.gold} />
            <ThemedText
              style={[styles.metaText, { color: theme.textSecondary }]}
            >
              {task.estimatedMinutes} min
            </ThemedText>
          </View>
        </Pressable>

        {/* Arrow */}
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  checkboxEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  checkboxFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
