import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";

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

export default function CalmingPracticeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

  if (selectedPractice) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Pressable
            onPress={() => setSelectedPractice(null)}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
              Back to practices
            </ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(100)}>
          <View style={styles.practiceHeader}>
            <ThemedText type="h2" style={{ fontFamily: Fonts?.serif }}>
              {selectedPractice.title}
            </ThemedText>
            <ThemedText type="caption" style={[styles.duration, { color: theme.textSecondary }]}>
              {selectedPractice.duration}
            </ThemedText>
          </View>
        </Animated.View>

        <View style={styles.stepsContainer}>
          {selectedPractice.steps.map((step, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(400).delay(200 + index * 100)}
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

        <Animated.View 
          entering={FadeInUp.duration(400).delay(500)}
          style={[styles.reminderCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={[styles.reminderAccent, { backgroundColor: SiraatColors.emerald }]} />
          <ThemedText type="body" style={[styles.reminderText, { fontFamily: Fonts?.serif }]}>
            {selectedPractice.reminder}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.doneContainer}>
          <Button
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: theme.primary }}
          >
            Done
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + Spacing["3xl"] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.intro}>
        <ThemedText type="h3" style={{ fontFamily: Fonts?.serif, marginBottom: Spacing.sm }}>
          Take a moment
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Choose a practice that fits your time and need.
        </ThemedText>
      </Animated.View>

      <View style={styles.practicesList}>
        {PRACTICES.map((practice, index) => (
          <Animated.View
            key={practice.id}
            entering={FadeInUp.duration(400).delay(100 + index * 80)}
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
              <View style={[styles.practiceIcon, { backgroundColor: SiraatColors.emerald + "15" }]}>
                <Feather name="wind" size={20} color={SiraatColors.emerald} />
              </View>
              <View style={styles.practiceInfo}>
                <ThemedText type="body" style={{ fontWeight: "500", marginBottom: 2 }}>
                  {practice.title}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {practice.description}
                </ThemedText>
              </View>
              <View style={[styles.durationBadge, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {practice.duration}
                </ThemedText>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  intro: {
    marginBottom: Spacing["2xl"],
  },
  practicesList: {
    gap: Spacing.md,
  },
  practiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
  },
  practiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  practiceInfo: {
    flex: 1,
  },
  durationBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  practiceHeader: {
    marginBottom: Spacing["2xl"],
  },
  duration: {
    marginTop: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
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
    lineHeight: 24,
  },
  reminderCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  reminderAccent: {
    width: 4,
  },
  reminderText: {
    flex: 1,
    padding: Spacing.lg,
    lineHeight: 24,
    fontStyle: "italic",
  },
  doneContainer: {
    marginTop: "auto",
  },
});
