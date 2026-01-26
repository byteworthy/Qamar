import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  hapticLightThrottled,
  hapticSelection,
  hapticMedium,
} from "@/lib/haptics";
import Animated, {
  FadeInUp,
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  withDelay,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { ScreenCopy } from "@/constants/brand";
import { ExitConfirmationModal } from "@/components/ExitConfirmationModal";
import { ReflectionProgressCompact } from "@/components/ReflectionProgress";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ThoughtCapture"
>;

// Niyyah (intention) prompts for spiritual grounding
const NIYYAH_PROMPTS = [
  "I begin seeking clarity for Allah's pleasure",
  "I reflect to understand, not to dwell",
  "I bring this thought to light with trust in Allah",
  "I seek clarity through the wisdom He has provided",
];

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
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCharCount, setShowCharCount] = useState(false);
  const [niyyahPrompt] = useState(
    () => NIYYAH_PROMPTS[Math.floor(Math.random() * NIYYAH_PROMPTS.length)],
  );

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Breathing animation for empty text input
  const breathingScale = useSharedValue(1);
  const charCountTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const canContinue = thought.trim().length > 10;

  // Breathing animation effect
  useEffect(() => {
    if (thought.length === 0) {
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.005, { duration: 2000 }),
          withTiming(1, { duration: 2000 }),
        ),
        -1,
        false,
      );
    } else {
      breathingScale.value = withTiming(1, { duration: 300 });
    }
  }, [thought.length]);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  // Auto-hide character count after typing stops
  const handleTextChange = (text: string) => {
    setThought(text);

    // Show character count when typing
    if (text.length > 0) {
      setShowCharCount(true);

      // Clear existing timer
      if (charCountTimer.current) {
        clearTimeout(charCountTimer.current);
      }

      // Hide after 3 seconds of no typing
      charCountTimer.current = setTimeout(() => {
        setShowCharCount(false);
      }, 3000);
    } else {
      setShowCharCount(false);
    }
  };

  useEffect(() => {
    return () => {
      if (charCountTimer.current) {
        clearTimeout(charCountTimer.current);
      }
    };
  }, []);

  // Add cancel button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setShowExitModal(true)}
          style={{ marginRight: Spacing.sm }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Cancel reflection"
          accessibilityHint="Exits the reflection and returns to home screen"
        >
          <ThemedText style={{ color: theme.primary }}>Cancel</ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, theme.primary]);

  const handleExit = () => {
    hapticMedium();
    setShowExitModal(false);
    navigation.navigate("Home");
  };

  // Emotional intensity labels using theme tokens
  const INTENSITY_LABELS: Record<
    number,
    { label: string; colorKey: string; description: string }
  > = {
    1: {
      label: "Mild",
      colorKey: "intensityMild",
      description: "A whisper of discomfort",
    },
    2: {
      label: "Light",
      colorKey: "intensityMild",
      description: "Noticeable but manageable",
    },
    3: {
      label: "Moderate",
      colorKey: "intensityModerate",
      description: "Weighing on you",
    },
    4: {
      label: "Heavy",
      colorKey: "intensityHeavy",
      description: "Hard to carry",
    },
    5: {
      label: "Intense",
      colorKey: "intensityIntense",
      description: "Overwhelming",
    },
  };

  const getIntensityColor = (level: number) => {
    const key = INTENSITY_LABELS[level].colorKey as keyof typeof theme;
    return theme[key] as string;
  };

  const handleIntensityChange = (value: number) => {
    setEmotionalIntensity(value);
    hapticLightThrottled(); // Throttled haptic prevents rapid tapping feedback

    // Show somatic prompt for higher intensity
    if (value >= 4 && !showSomaticPrompt) {
      setShowSomaticPrompt(true);
    }
  };

  const handleSomaticSelect = (somatic: string) => {
    setSelectedSomatic(somatic === selectedSomatic ? null : somatic);
    hapticSelection();
  };

  const handleContinue = () => {
    if (canContinue) {
      hapticMedium();
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
          paddingTop: headerHeight + Spacing.sm,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      {/* Progress Indicator */}
      <ReflectionProgressCompact currentStep="ThoughtCapture" />

      {/* Niyyah Banner - Spiritual grounding at the start */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[
          styles.niyyahBanner,
          { backgroundColor: theme.bannerBackground },
        ]}
      >
        <ThemedText
          type="small"
          style={[styles.bismillah, { color: theme.onPrimary }]}
        >
          بِسْمِ اللَّهِ
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.niyyahText, { color: theme.textOnBanner }]}
        >
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
        <Animated.View style={breathingStyle}>
          <TextInput
            value={thought}
            onChangeText={handleTextChange}
            placeholder={ScreenCopy.thoughtCapture.placeholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={2000}
            style={[
              styles.textInput,
              {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
              },
            ]}
            textAlignVertical="top"
            accessibilityLabel="Thought input"
            accessibilityHint="Enter the thought or feeling you want to reflect on"
          />
        </Animated.View>

        {/* Auto-hiding character count */}
        {showCharCount && thought.length > 0 ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <ThemedText
              type="caption"
              style={[styles.hint, { color: theme.textSecondary }]}
            >
              {thought.length}/2000 characters
            </ThemedText>
          </Animated.View>
        ) : thought.length === 0 ? (
          <ThemedText
            type="caption"
            style={[styles.hint, { color: theme.textSecondary }]}
          >
            {ScreenCopy.thoughtCapture.hint}
          </ThemedText>
        ) : null}

        {/* Validation hint */}
        {thought.length > 0 && thought.trim().length < 10 && (
          <Animated.View entering={FadeIn.duration(200)}>
            <ThemedText
              type="caption"
              style={[styles.validationHint, { color: theme.warning }]}
            >
              Write a bit more to continue (at least 10 characters)
            </ThemedText>
          </Animated.View>
        )}
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
            const levelColor = getIntensityColor(level);
            return (
              <TouchableOpacity
                key={level}
                onPress={() => handleIntensityChange(level)}
                style={[
                  styles.intensityButton,
                  {
                    backgroundColor: isSelected
                      ? levelColor
                      : theme.backgroundDefault,
                    borderColor: isSelected ? levelColor : theme.border,
                    // Glow effect on selected level
                    shadowColor: isSelected ? levelColor : "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: isSelected ? 0.5 : 0,
                    shadowRadius: isSelected ? 12 : 0,
                    elevation: isSelected ? 8 : 0,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Intensity level ${level}: ${INTENSITY_LABELS[level].label}`}
                accessibilityHint={INTENSITY_LABELS[level].description}
                accessibilityState={{ selected: isSelected }}
              >
                <ThemedText
                  type="small"
                  style={[
                    styles.intensityNumber,
                    {
                      color: isSelected ? theme.onPrimary : theme.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
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
            { color: getIntensityColor(emotionalIntensity) },
          ]}
        >
          {INTENSITY_LABELS[emotionalIntensity].label}:{" "}
          {INTENSITY_LABELS[emotionalIntensity].description}
        </ThemedText>
      </Animated.View>

      {/* Somatic Awareness Section - appears for higher intensity */}
      {showSomaticPrompt && (
        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.somaticSection}
        >
          <ThemedText
            type="caption"
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            WHERE DO YOU FEEL THIS IN YOUR BODY?
          </ThemedText>

          <View style={styles.somaticRow}>
            {SOMATIC_PROMPTS.map((somatic, index) => {
              const isSelected = selectedSomatic === somatic;
              return (
                <Animated.View
                  key={somatic}
                  entering={FadeInUp.duration(300).delay(index * 50)}
                >
                  <TouchableOpacity
                    onPress={() => handleSomaticSelect(somatic)}
                    style={[
                      styles.somaticPill,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.backgroundDefault,
                        borderColor: isSelected ? theme.primary : theme.border,
                        // Subtle shadow/ripple effect on selected pill
                        shadowColor: isSelected ? theme.primary : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.25 : 0,
                        shadowRadius: isSelected ? 8 : 0,
                        elevation: isSelected ? 4 : 0,
                        transform: [{ scale: isSelected ? 1.02 : 1 }],
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${somatic}`}
                    accessibilityHint={`Select if you feel ${somatic}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: isSelected
                          ? theme.onPrimary
                          : theme.textSecondary,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {somatic}
                    </ThemedText>
                  </TouchableOpacity>
                </Animated.View>
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
          accessibilityHint="Proceeds to analyze your thought patterns"
        >
          {ScreenCopy.thoughtCapture.continue}
        </Button>
      </View>

      <ExitConfirmationModal
        visible={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />
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
  validationHint: {
    marginTop: Spacing.xs,
    textAlign: "right",
    fontStyle: "italic",
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  niyyahText: {
    fontStyle: "italic",
    textAlign: "center",
  },
});
