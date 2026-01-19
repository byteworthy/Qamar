import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInUp,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  Typography,
  Fonts,
  SiraatColors,
} from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ThoughtCapture"
>;

// Niyyah (intention) prompts for spiritual grounding
const NIYYAH_PROMPTS = [
  "I begin seeking clarity for Allah's pleasure",
  "I reflect to understand, not to dwell",
  "I bring this thought to light with trust in Allah",
  "I seek healing through the wisdom He has provided",
];

// Emotional intensity labels for human-readable display
const INTENSITY_LABELS: Record<
  number,
  { label: string; color: string; description: string }
> = {
  1: {
    label: "Mild",
    color: SiraatColors.emerald,
    description: "A whisper of discomfort",
  },
  2: {
    label: "Light",
    color: SiraatColors.emerald,
    description: "Noticeable but manageable",
  },
  3: {
    label: "Moderate",
    color: SiraatColors.sand,
    description: "Weighing on you",
  },
  4: { label: "Heavy", color: SiraatColors.clay, description: "Hard to carry" },
  5: {
    label: "Intense",
    color: SiraatColors.clayDark,
    description: "Overwhelming",
  },
};

// Somatic awareness prompts
const SOMATIC_PROMPTS = [
  "chest tightness",
  "stomach knot",
  "shoulders tensed",
  "throat constriction",
  "heavy head",
  "racing heart",
  "restless hands",
  "jaw clenched",
];

export default function ThoughtCaptureScreen() {
  const [thought, setThought] = useState("");
  const [emotionalIntensity, setEmotionalIntensity] = useState(3);
  const [showSomaticPrompt, setShowSomaticPrompt] = useState(false);
  const [selectedSomatic, setSelectedSomatic] = useState<string | null>(null);
  const [niyyahPrompt] = useState(
    () => NIYYAH_PROMPTS[Math.floor(Math.random() * NIYYAH_PROMPTS.length)],
  );

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const canContinue = thought.trim().length > 10;

  const handleIntensityChange = (value: number) => {
    setEmotionalIntensity(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Show somatic prompt for higher intensity
    if (value >= 4 && !showSomaticPrompt) {
      setShowSomaticPrompt(true);
    }
  };

  const handleSomaticSelect = (somatic: string) => {
    setSelectedSomatic(somatic === selectedSomatic ? null : somatic);
    Haptics.selectionAsync();
  };

  const handleContinue = () => {
    if (canContinue) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate("Distortion", {
        thought: thought.trim(),
        emotionalIntensity,
        somaticAwareness: selectedSomatic || undefined,
      });
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      {/* Niyyah Banner - Spiritual grounding at the start */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[
          styles.niyyahBanner,
          { backgroundColor: SiraatColors.indigoLight },
        ]}
      >
        <ThemedText type="small" style={styles.bismillah}>
          بِسْمِ اللَّهِ
        </ThemedText>
        <ThemedText type="small" style={styles.niyyahText}>
          {niyyahPrompt}
        </ThemedText>
      </Animated.View>

      <View style={styles.introSection}>
        <ThemedText
          type="h3"
          style={[styles.heading, { fontFamily: Fonts?.serif }]}
        >
          {ScreenCopy.thoughtCapture.title}
        </ThemedText>
        <ThemedText
          type="body"
          style={[
            styles.description,
            { color: theme.textSecondary, lineHeight: 26 },
          ]}
        >
          {ScreenCopy.thoughtCapture.subtitle}
        </ThemedText>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          value={thought}
          onChangeText={setThought}
          placeholder={ScreenCopy.thoughtCapture.placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.textInput,
            {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
            },
          ]}
          textAlignVertical="top"
        />
        <ThemedText
          type="caption"
          style={[styles.hint, { color: theme.textSecondary }]}
        >
          {thought.length > 0
            ? `${thought.length} characters`
            : ScreenCopy.thoughtCapture.hint}
        </ThemedText>
      </View>

      {/* Emotional Intensity Section */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(100)}
        style={styles.intensitySection}
      >
        <ThemedText
          type="caption"
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          HOW HEAVY DOES THIS FEEL?
        </ThemedText>

        <View style={styles.intensityRow}>
          {[1, 2, 3, 4, 5].map((level) => {
            const isSelected = emotionalIntensity === level;
            const labelInfo = INTENSITY_LABELS[level];
            return (
              <TouchableOpacity
                key={level}
                onPress={() => handleIntensityChange(level)}
                style={[
                  styles.intensityButton,
                  {
                    backgroundColor: isSelected
                      ? labelInfo.color
                      : theme.backgroundDefault,
                    borderColor: isSelected ? labelInfo.color : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={[
                    styles.intensityNumber,
                    { color: isSelected ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  {level}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedText
          type="small"
          style={[
            styles.intensityDescription,
            { color: INTENSITY_LABELS[emotionalIntensity].color },
          ]}
        >
          {INTENSITY_LABELS[emotionalIntensity].label}:{" "}
          {INTENSITY_LABELS[emotionalIntensity].description}
        </ThemedText>
      </Animated.View>

      {/* Somatic Awareness Section - appears for higher intensity */}
      {showSomaticPrompt && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.somaticSection}
        >
          <ThemedText
            type="caption"
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            WHERE DO YOU FEEL THIS IN YOUR BODY?
          </ThemedText>

          <View style={styles.somaticRow}>
            {SOMATIC_PROMPTS.map((somatic) => {
              const isSelected = selectedSomatic === somatic;
              return (
                <TouchableOpacity
                  key={somatic}
                  onPress={() => handleSomaticSelect(somatic)}
                  style={[
                    styles.somaticPill,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.backgroundDefault,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{
                      color: isSelected ? "#FFFFFF" : theme.textSecondary,
                    }}
                  >
                    {somatic}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      )}

      <View style={styles.buttonSection}>
        <Button
          onPress={handleContinue}
          disabled={!canContinue}
          style={{
            backgroundColor: canContinue ? theme.primary : theme.border,
          }}
        >
          {ScreenCopy.thoughtCapture.continue}
        </Button>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  introSection: {
    marginBottom: Spacing["2xl"],
  },
  heading: {
    marginBottom: Spacing.lg,
  },
  description: {
    lineHeight: 26,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  textInput: {
    minHeight: 140,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: 28,
  },
  hint: {
    marginTop: Spacing.sm,
    textAlign: "right",
  },
  // Emotional Intensity Styles
  intensitySection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  intensityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  intensityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  intensityNumber: {
    fontWeight: "700",
    fontSize: 16,
  },
  intensityDescription: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: Spacing.sm,
  },
  // Somatic Awareness Styles
  somaticSection: {
    marginBottom: Spacing.xl,
  },
  somaticRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  somaticPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  buttonSection: {
    paddingTop: Spacing.lg,
    marginTop: "auto",
  },
  // Niyyah Banner Styles
  niyyahBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  bismillah: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  niyyahText: {
    color: "rgba(255,255,255,0.85)",
    fontStyle: "italic",
    textAlign: "center",
  },
});
