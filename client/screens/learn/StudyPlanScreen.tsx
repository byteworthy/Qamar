import React, { useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { StudyPlanOnboarding } from "@/components/StudyPlanOnboarding";
import { DailyTaskCard } from "@/components/DailyTaskCard";
import { useTheme } from "@/hooks/useTheme";
import { useStudyPlan } from "@/hooks/useStudyPlan";
import { NoorColors } from "@/constants/theme/colors";
import type { StudyPlanInput } from "../../../shared/types/study-plan";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function StudyPlanScreen() {
  const { theme } = useTheme();
  const {
    currentPlan,
    generatePlan,
    completeTask,
    uncompleteTask,
    isGenerating,
    error,
  } = useStudyPlan();
  const [showOnboarding, setShowOnboarding] = useState(!currentPlan);

  const handleGeneratePlan = async (input: StudyPlanInput) => {
    await generatePlan(input);
    setShowOnboarding(false);
  };

  const getTasksForDay = (dayOfWeek: number) => {
    if (!currentPlan) return [];
    return currentPlan.tasks.filter((task) => task.dayOfWeek === dayOfWeek);
  };

  if (showOnboarding) {
    return (
      <Screen title="Create Study Plan" showBack scrollable>
        <StudyPlanOnboarding onComplete={handleGeneratePlan} />

        {isGenerating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={NoorColors.gold} />
            <ThemedText style={[styles.loadingText, { color: theme.text }]}>
              Generating your personalized plan...
            </ThemedText>
          </View>
        )}

        {error && (
          <GlassCard style={styles.errorCard}>
            <Feather name="alert-circle" size={20} color="#EF4444" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </GlassCard>
        )}
      </Screen>
    );
  }

  if (!currentPlan) {
    return null; // Should never happen
  }

  return (
    <Screen title="My Study Plan" showBack scrollable={false}>
      <View style={styles.container}>
        {/* Header Stats */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statItem}>
            <Feather name="target" size={24} color={NoorColors.gold} />
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              Completion
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {currentPlan.completionRate}%
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <Feather name="calendar" size={24} color={NoorColors.gold} />
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              Week of
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {new Date(currentPlan.weekStartDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </ThemedText>
          </View>

          <View style={styles.statItem}>
            <Feather name="zap" size={24} color={NoorColors.gold} />
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              Streak
            </ThemedText>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {currentPlan.streak} days
            </ThemedText>
          </View>
        </GlassCard>

        {/* Daily Tasks */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {DAY_NAMES.map((dayName, dayOfWeek) => {
            const tasks = getTasksForDay(dayOfWeek);
            if (tasks.length === 0) return null;

            return (
              <Animated.View
                key={dayOfWeek}
                entering={FadeInUp.duration(300).delay(dayOfWeek * 50)}
                style={styles.daySection}
              >
                <ThemedText style={[styles.dayHeader, { color: theme.text }]}>
                  {dayName}
                </ThemedText>

                {tasks.map((task) => (
                  <DailyTaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={() =>
                      task.completed
                        ? uncompleteTask(task.id)
                        : completeTask(task.id)
                    }
                  />
                ))}
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
    marginTop: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    margin: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    flex: 1,
  },
});
