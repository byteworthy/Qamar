import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { generatePractice } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenCopy } from "@/constants/brand";

// Dhikr-based grounding options
interface DhikrOption {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  count: number;
}

const DHIKR_OPTIONS: DhikrOption[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    meaning: "Glory be to Allah",
    count: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning: "All praise is due to Allah",
    count: 33,
  },
  {
    id: "allahuakbar",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    meaning: "Allah is the Greatest",
    count: 33,
  },
  {
    id: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    meaning: "I seek forgiveness from Allah",
    count: 10,
  },
];

// Breathing pattern configurations
interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  description: string;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "4-7-8",
    name: "Calming Breath",
    inhale: 4,
    hold: 7,
    exhale: 8,
    description: "Activates the parasympathetic nervous system",
  },
  {
    id: "box",
    name: "Box Breathing",
    inhale: 4,
    hold: 4,
    exhale: 4,
    description: "Used by Navy SEALs for focus",
  },
];

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Regulation"
>;
type RouteType = RouteProp<RootStackParamList, "Regulation">;

interface PracticeResult {
  title: string;
  steps: string[];
  reminder: string;
  duration: string;
}

export default function RegulationScreen() {
  const [loading, setLoading] = useState(true);
  const [practice, setPractice] = useState<PracticeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDhikr, setShowDhikr] = useState(false);
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrOption | null>(null);
  const [dhikrCount, setDhikrCount] = useState(0);
  const [regulationType, setRegulationType] = useState<
    "practice" | "dhikr" | "breathing"
  >("practice");

  // Refs for interval timers
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, reframe, anchor } = route.params;

  useEffect(() => {
    const generate = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await generatePractice(reframe);
        setPractice(result);
      } catch (err) {
        setError("Unable to generate practice. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [reframe]);

  // Enhanced haptic patterns for different actions
  const playGroundingHaptic = useCallback(() => {
    // Gentle pulsing pattern for grounding
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      200,
    );
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      400,
    );
  }, []);

  const playDhikrHaptic = useCallback(() => {
    // Soft pulse for each dhikr count
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const playCompletionHaptic = useCallback(() => {
    // Celebration pattern
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      300,
    );
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      500,
    );
  }, []);

  const handleStartPractice = () => {
    setIsActive(true);
    playGroundingHaptic();
  };

  const handleCompletePractice = () => {
    setIsActive(false);
    setCompleted(true);
    playCompletionHaptic();

    // Clear any running haptic intervals
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
  };

  // Dhikr handling
  const handleSelectDhikr = (dhikr: DhikrOption) => {
    setSelectedDhikr(dhikr);
    setDhikrCount(0);
    setShowDhikr(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDhikrTap = () => {
    if (selectedDhikr && dhikrCount < selectedDhikr.count) {
      const newCount = dhikrCount + 1;
      setDhikrCount(newCount);
      playDhikrHaptic();

      // Complete dhikr
      if (newCount >= selectedDhikr.count) {
        playCompletionHaptic();
        setTimeout(() => {
          setShowDhikr(false);
          setCompleted(true);
        }, 1000);
      }
    }
  };

  const handleContinue = () => {
    navigation.navigate("Intention", {
      thought,
      distortions,
      reframe,
      practice: practice?.title || "",
      anchor: anchor || "",
    });
  };

  if (loading) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { paddingTop: headerHeight }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText
          type="body"
          style={[styles.loadingText, { color: theme.textSecondary }]}
        >
          {ScreenCopy.practice.loading}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !practice) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { paddingTop: headerHeight }]}
      >
        <ThemedText
          type="body"
          style={[styles.errorText, { color: theme.error }]}
        >
          {error || "Something went wrong"}
        </ThemedText>
        <Button
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: theme.primary, marginTop: Spacing.xl }}
        >
          Go Back
        </Button>
      </ThemedView>
    );
  }

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
      <View style={styles.header}>
        <ThemedText
          type="h3"
          style={[styles.title, { fontFamily: Fonts?.serif }]}
        >
          {practice.title}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.duration, { color: theme.accent }]}
        >
          {practice.duration}
        </ThemedText>
      </View>

      <View
        style={[
          styles.practiceCard,
          {
            backgroundColor: isActive
              ? SiraatColors.emeraldDark
              : theme.backgroundDefault,
          },
        ]}
      >
        <ThemedText
          type="caption"
          style={[
            styles.stepsLabel,
            { color: isActive ? SiraatColors.cream : theme.textSecondary },
          ]}
        >
          {ScreenCopy.practice.stepsLabel}
        </ThemedText>
        {practice.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View
              style={[
                styles.stepNumber,
                {
                  backgroundColor: isActive
                    ? SiraatColors.cream
                    : theme.primary,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: isActive ? SiraatColors.emeraldDark : "#FFFFFF",
                  fontWeight: "700",
                }}
              >
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText
              type="body"
              style={[
                styles.stepText,
                { color: isActive ? SiraatColors.cream : theme.text },
              ]}
            >
              {step}
            </ThemedText>
          </View>
        ))}

        <View
          style={[
            styles.reminderBar,
            {
              backgroundColor: isActive ? SiraatColors.cream : theme.border,
              opacity: 0.3,
            },
          ]}
        />
        <ThemedText
          type="small"
          style={[
            styles.reminderText,
            {
              color: isActive ? SiraatColors.cream : theme.textSecondary,
              fontFamily: Fonts?.serif,
            },
          ]}
        >
          {practice.reminder}
        </ThemedText>
      </View>

      {/* Dhikr Grounding Option */}
      {!isActive && !completed && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.dhikrSection}
        >
          <ThemedText
            type="caption"
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            OR GROUND YOURSELF WITH DHIKR
          </ThemedText>
          <View style={styles.dhikrGrid}>
            {DHIKR_OPTIONS.map((dhikr) => (
              <TouchableOpacity
                key={dhikr.id}
                onPress={() => handleSelectDhikr(dhikr)}
                style={[
                  styles.dhikrCard,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ThemedText type="body" style={styles.dhikrArabic}>
                  {dhikr.arabic}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  {dhikr.transliteration} • {dhikr.count}x
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Dhikr Counter - Shows when dhikr is selected */}
      {showDhikr && selectedDhikr && (
        <Animated.View entering={FadeIn.duration(300)}>
          <TouchableOpacity
            onPress={handleDhikrTap}
            style={[
              styles.dhikrCounter,
              { backgroundColor: SiraatColors.emerald },
            ]}
            activeOpacity={0.8}
          >
            <ThemedText type="caption" style={styles.dhikrCounterLabel}>
              TAP TO COUNT
            </ThemedText>
            <ThemedText type="h1" style={styles.dhikrCounterArabic}>
              {selectedDhikr.arabic}
            </ThemedText>
            <ThemedText type="body" style={styles.dhikrCounterTranslit}>
              {selectedDhikr.transliteration}
            </ThemedText>
            <View style={styles.dhikrProgress}>
              <ThemedText type="h2" style={styles.dhikrCountNumber}>
                {dhikrCount}
              </ThemedText>
              <ThemedText type="body" style={styles.dhikrCountTotal}>
                / {selectedDhikr.count}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.dhikrMeaning}>
              {selectedDhikr.meaning}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.buttonSection}>
        {!isActive && !completed ? (
          <Button
            onPress={handleStartPractice}
            style={{ backgroundColor: theme.accent }}
          >
            {ScreenCopy.practice.begin}
          </Button>
        ) : null}

        {isActive ? (
          <Button
            onPress={handleCompletePractice}
            style={{ backgroundColor: theme.accent }}
          >
            {ScreenCopy.practice.complete}
          </Button>
        ) : null}

        {completed ? (
          <>
            <ThemedText
              type="body"
              style={[styles.completedText, { color: theme.success }]}
            >
              {ScreenCopy.practice.completed}
            </ThemedText>
            <Button
              onPress={handleContinue}
              style={{ backgroundColor: theme.primary }}
            >
              {ScreenCopy.practice.continue}
            </Button>
          </>
        ) : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing["3xl"],
    alignItems: "center",
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  duration: {
    fontStyle: "italic",
  },
  practiceCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
  },
  stepsLabel: {
    marginBottom: Spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    flex: 1,
    lineHeight: 24,
  },
  reminderBar: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  reminderText: {
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  completedText: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  // Dhikr Section
  sectionLabel: {
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    textAlign: "center",
  },
  dhikrSection: {
    marginBottom: Spacing.xl,
  },
  dhikrGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  dhikrCard: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  dhikrArabic: {
    fontSize: 20,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  // Dhikr Counter
  dhikrCounter: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  dhikrCounterLabel: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: Spacing.md,
    letterSpacing: 2,
  },
  dhikrCounterArabic: {
    color: "#FFFFFF",
    fontSize: 36,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  dhikrCounterTranslit: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: Spacing.lg,
  },
  dhikrProgress: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.md,
  },
  dhikrCountNumber: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
  },
  dhikrCountTotal: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 20,
    marginLeft: Spacing.xs,
  },
  dhikrMeaning: {
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
    textAlign: "center",
  },
});
