import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ScreenLayout, ScreenSection } from "@/components/ScreenLayout";
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

export default function CalmingPracticeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

  if (selectedPractice) {
    return (
      <ScreenLayout 
        title={selectedPractice.title}
        showBack
        onBack={() => setSelectedPractice(null)}
      >
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <ThemedText type="caption" style={[styles.duration, { color: theme.textSecondary }]}>
            {selectedPractice.duration}
          </ThemedText>
        </Animated.View>

        <ScreenSection>
          <View style={styles.stepsContainer}>
            {selectedPractice.steps.map((step, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(350).delay(150 + index * 80)}
                style={[styles.stepCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={[styles.stepNumber, { backgroundColor: SiraatColors.emerald }]}>
                  <ThemedText type="body" style={styles.stepNumberText}>
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText type="body" style={styles.stepText}>
                  {step}
                </ThemedText>
              </Animated.View>
            ))}
          </View>
        </ScreenSection>

        <Animated.View 
          entering={FadeInUp.duration(350).delay(400)}
          style={[styles.reminderCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={[styles.reminderAccent, { backgroundColor: SiraatColors.emerald }]} />
          <ThemedText type="body" style={[styles.reminderText, { fontFamily: Fonts?.serif }]}>
            {selectedPractice.reminder}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(350).delay(450)} style={styles.doneContainer}>
          <Button
            onPress={() => {
              setSelectedPractice(null);
              navigation.navigate("Home");
            }}
            style={{ backgroundColor: theme.primary }}
          >
            Done
          </Button>
        </Animated.View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Calming Practice" showBack>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.intro}>
        <ThemedText type="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
          A moment to ground yourself.
        </ThemedText>
      </Animated.View>

      <ScreenSection>
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
              >
                <View style={[styles.practiceAccent, { backgroundColor: SiraatColors.emerald }]} />
                <View style={styles.practiceContent}>
                  <View style={styles.practiceHeader}>
                    <ThemedText type="h4" style={styles.practiceTitle}>
                      {practice.title}
                    </ThemedText>
                    <ThemedText type="caption" style={[styles.practiceDuration, { color: theme.textSecondary }]}>
                      {practice.duration}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 18 }}>
                    {practice.description}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScreenSection>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: Spacing.xl,
  },
  practicesList: {
    gap: Spacing.sm,
  },
  practiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.sm,
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
    marginLeft: Spacing.xs,
  },
  practiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  practiceTitle: {
    fontSize: 16,
  },
  practiceDuration: {
    fontSize: 12,
  },
  duration: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  stepsContainer: {
    gap: Spacing.sm,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    marginTop: Spacing.lg,
  },
  reminderAccent: {
    width: 4,
  },
  reminderText: {
    flex: 1,
    padding: Spacing.lg,
    lineHeight: 22,
    fontStyle: "italic",
  },
  doneContainer: {
    marginTop: Spacing["2xl"],
  },
});
