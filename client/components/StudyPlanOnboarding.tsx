import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ViewStyle,
} from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { NoorColors } from "@/constants/theme/colors";
import { hapticLight } from "@/lib/haptics";
import type {
  StudyGoal,
  TimeCommitment,
  SkillLevel,
  StudyPlanInput,
} from "../../shared/types/study-plan";

interface StudyPlanOnboardingProps {
  onComplete: (input: StudyPlanInput) => void;
}

export function StudyPlanOnboarding({ onComplete }: StudyPlanOnboardingProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<StudyGoal | null>(null);
  const [customGoalText, setCustomGoalText] = useState("");
  const [specificSurah, setSpecificSurah] = useState("");
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment | null>(
    null,
  );
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);

  const handleNext = () => {
    hapticLight();
    if (step === 3) {
      // Final step - generate plan
      const input: StudyPlanInput = {
        goal: goal!,
        timeCommitment: timeCommitment!,
        skillLevel: skillLevel!,
      };

      if (goal === "custom") {
        input.customGoalText = customGoalText;
      } else if (goal === "understand_specific_surah") {
        input.specificSurah = specificSurah;
      }

      onComplete(input);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    hapticLight();
    setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return goal !== null;
    if (step === 2) return timeCommitment !== null;
    if (step === 3) return skillLevel !== null;
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Step 1: Goal */}
      {step === 1 && (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
            What{"'"}s your Quran goal?
          </ThemedText>

          {GOAL_OPTIONS.map((option) => {
            const cardStyle =
              goal === option.value
                ? { ...styles.optionCard, ...styles.selectedCard }
                : styles.optionCard;

            return (
              <Pressable
                key={option.value}
                onPress={() => setGoal(option.value)}
                style={styles.optionContainer}
              >
                <GlassCard style={cardStyle}>
                  <Feather
                    name={option.icon as any}
                    size={24}
                    color={NoorColors.gold}
                  />
                  <View style={styles.optionText}>
                    <ThemedText
                      style={[styles.optionTitle, { color: theme.text }]}
                    >
                      {option.label}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.optionDescription,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {option.description}
                    </ThemedText>
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}

          {goal === "custom" && (
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="Describe your custom goal..."
              placeholderTextColor={theme.textSecondary}
              value={customGoalText}
              onChangeText={setCustomGoalText}
              multiline
            />
          )}

          {goal === "understand_specific_surah" && (
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="Which surah? (e.g., Yusuf)"
              placeholderTextColor={theme.textSecondary}
              value={specificSurah}
              onChangeText={setSpecificSurah}
            />
          )}
        </Animated.View>
      )}

      {/* Step 2: Time Commitment */}
      {step === 2 && (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
            How much time per day?
          </ThemedText>

          {TIME_OPTIONS.map((option) => {
            const cardStyle =
              timeCommitment === option.value
                ? { ...styles.optionCard, ...styles.selectedCard }
                : styles.optionCard;

            return (
              <Pressable
                key={option.value}
                onPress={() => setTimeCommitment(option.value)}
                style={styles.optionContainer}
              >
                <GlassCard style={cardStyle}>
                  <Feather name="clock" size={24} color={NoorColors.gold} />
                  <View style={styles.optionText}>
                    <ThemedText
                      style={[styles.optionTitle, { color: theme.text }]}
                    >
                      {option.label}
                    </ThemedText>
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      {/* Step 3: Skill Level */}
      {step === 3 && (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
          <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
            What{"'"}s your current level?
          </ThemedText>

          {SKILL_OPTIONS.map((option) => {
            const cardStyle =
              skillLevel === option.value
                ? { ...styles.optionCard, ...styles.selectedCard }
                : styles.optionCard;

            return (
              <Pressable
                key={option.value}
                onPress={() => setSkillLevel(option.value)}
                style={styles.optionContainer}
              >
                <GlassCard style={cardStyle}>
                  <Feather
                    name={option.icon as any}
                    size={24}
                    color={NoorColors.gold}
                  />
                  <View style={styles.optionText}>
                    <ThemedText
                      style={[styles.optionTitle, { color: theme.text }]}
                    >
                      {option.label}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.optionDescription,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {option.description}
                    </ThemedText>
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {step > 1 && (
          <Pressable
            onPress={handleBack}
            style={[
              styles.navButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText style={{ color: theme.text }}>Back</ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={handleNext}
          disabled={!canProceed()}
          style={[
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: canProceed() ? NoorColors.gold : theme.border,
              opacity: canProceed() ? 1 : 0.5,
            },
          ]}
        >
          <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>
            {step === 3 ? "Generate Plan" : "Next"}
          </ThemedText>
          {step < 3 && <Feather name="arrow-right" size={20} color="#FFFFFF" />}
        </Pressable>
      </View>
    </View>
  );
}

const GOAL_OPTIONS = [
  {
    value: "memorize_juz_30" as StudyGoal,
    label: "Memorize Juz 30",
    description: "Start with Juz 'Amma",
    icon: "book",
  },
  {
    value: "read_entire_quran" as StudyGoal,
    label: "Read Entire Quran",
    description: "Complete in one year",
    icon: "bookmark",
  },
  {
    value: "understand_specific_surah" as StudyGoal,
    label: "Understand a Surah",
    description: "Deep study with tafsir",
    icon: "search",
  },
  {
    value: "improve_tajweed" as StudyGoal,
    label: "Improve Tajweed",
    description: "Master pronunciation rules",
    icon: "mic",
  },
  {
    value: "custom" as StudyGoal,
    label: "Custom Goal",
    description: "Your own objective",
    icon: "edit",
  },
];

const TIME_OPTIONS = [
  { value: "10min" as TimeCommitment, label: "10 minutes/day" },
  { value: "20min" as TimeCommitment, label: "20 minutes/day" },
  { value: "30min" as TimeCommitment, label: "30 minutes/day" },
  { value: "45min" as TimeCommitment, label: "45+ minutes/day" },
];

const SKILL_OPTIONS = [
  {
    value: "beginner" as SkillLevel,
    label: "Beginner",
    description: "Learning Arabic alphabet",
    icon: "award",
  },
  {
    value: "intermediate" as SkillLevel,
    label: "Intermediate",
    description: "Can read slowly",
    icon: "star",
  },
  {
    value: "advanced" as SkillLevel,
    label: "Advanced",
    description: "Fluent reader",
    icon: "zap",
  },
];

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  selectedCard: {
    borderColor: NoorColors.gold,
    borderWidth: 2,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  navigation: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  nextButton: {
    flex: 2,
  },
});
