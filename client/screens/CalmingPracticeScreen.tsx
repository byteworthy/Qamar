import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Layout } from "@/constants/layout";
import { Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface Practice {
  id: string;
  title: string;
  duration: string;
  description: string;
  steps: string[];
  reminder: string;
}

const PRACTICES: Practice[] = [
  {
    id: "breath-dhikr",
    title: "Breath & Dhikr",
    duration: "2 min",
    description: "Slow breath paired with remembrance",
    steps: [
      "Breathe in slowly for 4 counts, silently saying 'SubhanAllah'",
      "Hold gently for 2 counts, letting go of tension",
      "Breathe out for 6 counts, silently saying 'Alhamdulillah'",
    ],
    reminder: "Breath steadies the body. Remembrance steadies the heart.",
  },
  {
    id: "grounding-presence",
    title: "Grounding Presence",
    duration: "2 min",
    description: "Body awareness with gratitude",
    steps: [
      "Feel your feet on the ground. Notice their weight.",
      "Place your hand on your chest. Feel it rise and fall.",
      "Name three things you can see. Let yourself notice.",
    ],
    reminder: "Presence returns when you stop reaching for elsewhere.",
  },
  {
    id: "release-tension",
    title: "Release Tension",
    duration: "3 min",
    description: "Physical release with trust",
    steps: [
      "Clench your fists tight for 5 seconds. Feel the tension.",
      "Release completely. Let your hands rest open, palms up.",
      "Repeat with shoulders: lift, hold, release.",
    ],
    reminder: "Holding tightly does not keep things safe.",
  },
  {
    id: "heart-centering",
    title: "Heart Centering",
    duration: "2 min",
    description: "Returning attention to the heart",
    steps: [
      "Close your eyes. Place attention on your heart space.",
      "Breathe gently into that space. No forcing.",
      "Silently repeat: 'La hawla wa la quwwata illa billah' three times.",
    ],
    reminder: "The heart finds rest in remembrance.",
  },
  {
    id: "morning-reset",
    title: "Morning Reset",
    duration: "1 min",
    description: "Quick intention setting",
    steps: [
      "Sit upright. Take one deep breath.",
      "Ask yourself: What is one thing I want to carry well today?",
      "Say 'Bismillah' and begin.",
    ],
    reminder: "Start with intention. Let outcomes rest with Allah.",
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { spacing, radii, container } = Layout;

export default function CalmingPracticeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(
    null,
  );

  if (selectedPractice) {
    return (
      <Screen
        title={selectedPractice.title}
        showBack
        onBack={() => setSelectedPractice(null)}
      >
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
            {selectedPractice.duration}
          </ThemedText>
        </Animated.View>

        <View style={styles.stepsContainer}>
          {selectedPractice.steps.map((step, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(350).delay(150 + index * 80)}
              style={[
                styles.stepCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <View
                style={[
                  styles.stepNumber,
                  { backgroundColor: theme.highlightAccent },
                ]}
              >
                <ThemedText style={styles.stepNumberText}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInUp.duration(350).delay(400)}
          style={[
            styles.reminderCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View
            style={[
              styles.reminderAccent,
              { backgroundColor: theme.highlightAccent },
            ]}
          />
          <ThemedText
            style={[styles.reminderText, { fontFamily: Fonts?.serif }]}
          >
            {selectedPractice.reminder}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(350).delay(450)}
          style={styles.doneContainer}
        >
          <Button
            onPress={() => {
              setSelectedPractice(null);
              navigation.navigate("Home");
            }}
            style={{ backgroundColor: theme.primary }}
            accessibilityHint="Completes the practice and returns to home screen"
          >
            Done
          </Button>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen title="Calming Practice" showBack>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.intro}>
        <ThemedText style={[styles.introText, { color: theme.textSecondary }]}>
          A moment to ground yourself.
        </ThemedText>
      </Animated.View>

      <View style={styles.practicesList}>
        {PRACTICES.map((practice, index) => (
          <Animated.View
            key={practice.id}
            entering={FadeInUp.duration(350).delay(100 + index * 60)}
          >
            <Pressable
              onPress={() => setSelectedPractice(practice)}
              style={({ pressed }) => [
                styles.practiceCard,
                {
                  backgroundColor: theme.cardBackground,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${practice.title}, ${practice.duration}, ${practice.description}`}
              accessibilityHint="Opens guided steps for this calming practice"
            >
              <View
                style={[
                  styles.practiceAccent,
                  { backgroundColor: theme.highlightAccent },
                ]}
              />
              <View style={styles.practiceContent}>
                <View style={styles.practiceHeader}>
                  <ThemedText style={styles.practiceTitle}>
                    {practice.title}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.practiceDuration,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {practice.duration}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.practiceDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  {practice.description}
                </ThemedText>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={theme.textSecondary}
              />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    paddingBottom: spacing.md,
  },
  introText: {
    fontSize: Layout.typeScale.body,
    lineHeight: 20,
  },
  practicesList: {
    gap: spacing.sm,
  },
  practiceCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: Layout.hitTargets.minCardHeight,
    paddingHorizontal: container.cardPad,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  practiceAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  practiceContent: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  practiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  practiceDuration: {
    fontSize: Layout.typeScale.small,
  },
  practiceDescription: {
    fontSize: Layout.typeScale.small,
    lineHeight: 16,
  },
  duration: {
    textAlign: "center",
    fontSize: Layout.typeScale.small,
    marginBottom: spacing.lg,
  },
  stepsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: container.cardPad,
    borderRadius: radii.sm,
    gap: spacing.sm,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: Layout.typeScale.body,
  },
  stepText: {
    flex: 1,
    fontSize: Layout.typeScale.body,
    lineHeight: 20,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  reminderAccent: {
    width: 4,
  },
  reminderText: {
    flex: 1,
    padding: container.cardPad,
    fontSize: Layout.typeScale.body,
    lineHeight: 20,
    fontStyle: "italic",
  },
  doneContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});
