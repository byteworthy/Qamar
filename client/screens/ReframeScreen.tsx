import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp, FadeIn, FadeOut } from "react-native-reanimated";
import {
  hapticLight,
  hapticMedium,
  hapticSelection,
  hapticSuccess,
} from "@/lib/haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { generateReframe } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenCopy } from "@/constants/brand";
import { ExitConfirmationModal } from "@/components/ExitConfirmationModal";
import { ReflectionProgressCompact } from "@/components/ReflectionProgress";
import { SkeletonReflection } from "@/components/LoadingSkeleton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Reframe">;
type RouteType = RouteProp<RootStackParamList, "Reframe">;

// Perspective types for multi-lens reframing
type PerspectiveType = "empathic" | "logical" | "islamic" | "future";

interface PerspectiveOption {
  id: PerspectiveType;
  label: string;
  icon: string;
  description: string;
  colorKey: string; // Theme key for color
}

interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

// Islamic wisdom references for the "Rooted" perspective
interface IslamicReference {
  text: string;
  arabicText?: string;
  source: string;
  concept: string;
}

const ISLAMIC_REFERENCES: IslamicReference[] = [
  {
    text: "Allah does not burden a soul beyond that it can bear.",
    arabicText: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    source: "Quran 2:286",
    concept: "Divine Wisdom in Trials",
  },
  {
    text: "Verily, with hardship comes ease.",
    arabicText: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    source: "Quran 94:6",
    concept: "Hope in Difficulty",
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for them.",
    arabicText: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    source: "Quran 65:3",
    concept: "Trust in Allah",
  },
  {
    text: "How wonderful is the affair of the believer, for all of it is good.",
    source: "Sahih Muslim",
    concept: "Gratitude in All States",
  },
];

export default function ReframeScreen() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ReframeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerspective, setSelectedPerspective] =
    useState<PerspectiveType>("empathic");
  const [showPerspectiveOptions, setShowPerspectiveOptions] = useState(false);
  const [postBeliefStrength, setPostBeliefStrength] = useState<number | null>(
    null,
  );
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [islamicReference] = useState(
    () =>
      ISLAMIC_REFERENCES[Math.floor(Math.random() * ISLAMIC_REFERENCES.length)],
  );

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, analysis, emotionalIntensity, beliefStrength } =
    route.params;

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

  // Perspective options using theme color keys
  const PERSPECTIVE_OPTIONS: PerspectiveOption[] = [
    {
      id: "empathic",
      label: "Compassionate",
      icon: "💛",
      description: "What would a loving friend say?",
      colorKey: "intensityModerate",
    },
    {
      id: "logical",
      label: "Balanced",
      icon: "⚖️",
      description: "What does the evidence show?",
      colorKey: "pillBackground",
    },
    {
      id: "islamic",
      label: "Rooted",
      icon: "🌙",
      description: "What does our tradition say?",
      colorKey: "highlightAccent",
    },
    {
      id: "future",
      label: "Zoomed Out",
      icon: "🔭",
      description: "How will this look in a year?",
      colorKey: "intensityHeavy",
    },
  ];

  const getPerspectiveColor = (colorKey: string) => {
    return theme[colorKey as keyof typeof theme] as string;
  };

  // Timeout effect for loading state
  useEffect(() => {
    let warningTimeout: NodeJS.Timeout;
    let abortTimeout: NodeJS.Timeout;

    if (loading) {
      // Show warning after 15 seconds
      warningTimeout = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 15000);

      // Abort after 30 seconds
      abortTimeout = setTimeout(() => {
        setError(
          ScreenCopy.reframe.errorTimeout ||
            "This is taking longer than expected. Please try again.",
        );
        setLoading(false);
        setShowTimeoutWarning(false);
      }, 30000);
    }

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(abortTimeout);
    };
  }, [loading]);

  useEffect(() => {
    const generate = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowTimeoutWarning(false);
        const data = await generateReframe(
          thought,
          distortions,
          analysis,
          emotionalIntensity,
        );

        // Validate response structure before using
        if (!data || typeof data !== "object") {
          console.error("Invalid response: not an object", data);
          setError(ScreenCopy.reframe.errorServer || ScreenCopy.reframe.error);
          return;
        }

        // Validate required fields
        if (!data.beliefTested || typeof data.beliefTested !== "string") {
          console.error(
            "Invalid response: missing or invalid beliefTested",
            data,
          );
          setError(ScreenCopy.reframe.errorServer || ScreenCopy.reframe.error);
          return;
        }

        if (!data.perspective || typeof data.perspective !== "string") {
          console.error(
            "Invalid response: missing or invalid perspective",
            data,
          );
          setError(ScreenCopy.reframe.errorServer || ScreenCopy.reframe.error);
          return;
        }

        setResult(data);
      } catch (err) {
        // Classify error type for better user messaging
        const errorMessage = (err as Error)?.message || "";
        if (errorMessage.includes("NETWORK_ERROR")) {
          setError(ScreenCopy.reframe.errorNetwork || ScreenCopy.reframe.error);
        } else if (errorMessage.includes("SERVER_ERROR")) {
          setError(ScreenCopy.reframe.errorServer || ScreenCopy.reframe.error);
        } else if (errorMessage.includes("TIMEOUT")) {
          setError(ScreenCopy.reframe.errorTimeout || ScreenCopy.reframe.error);
        } else {
          setError(ScreenCopy.reframe.error);
        }
        console.error("Reframe error:", err);
      } finally {
        setLoading(false);
        setShowTimeoutWarning(false);
      }
    };
    generate();
  }, [thought, distortions, analysis, emotionalIntensity]);

  const handlePerspectiveSelect = (perspective: PerspectiveType) => {
    setSelectedPerspective(perspective);
    hapticLight();
    setShowPerspectiveOptions(false);
  };

  const handleTogglePerspectives = () => {
    setShowPerspectiveOptions(!showPerspectiveOptions);
    hapticSelection();
  };

  const handleBeliefStrengthTap = (value: number) => {
    setPostBeliefStrength(value);
    hapticMedium();
  };

  const handleContinue = () => {
    if (result) {
      const reframeSummary = `${result.beliefTested} ${result.perspective}`;
      hapticSuccess();
      navigation.navigate("Regulation", {
        thought,
        distortions,
        reframe: reframeSummary,
        anchor: result.perspective,
        emotionalIntensity,
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setShowTimeoutWarning(false);
  };

  // Calculate belief shift if both values present
  const beliefShift =
    beliefStrength && postBeliefStrength
      ? beliefStrength - postBeliefStrength
      : null;

  // Get belief button color based on value
  const getBeliefColor = (value: number) => {
    if (value <= 30) return theme.highlightAccent;
    if (value <= 60) return theme.intensityModerate;
    return theme.intensityHeavy;
  };

  if (loading) {
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
        <ReflectionProgressCompact currentStep="Reframe" />

        {/* Loading message */}
        <Animated.View entering={FadeIn.duration(300)} style={{ marginVertical: Spacing.xl }}>
          <ThemedText
            type="body"
            style={[
              styles.loadingText,
              { color: theme.textSecondary, textAlign: "center" },
            ]}
          >
            {ScreenCopy.reframe.loading}
          </ThemedText>
          {showTimeoutWarning && (
            <ThemedText
              type="small"
              style={[
                styles.timeoutWarning,
                { color: theme.intensityHeavy, marginTop: Spacing.md, textAlign: "center" },
              ]}
            >
              This is taking longer than expected. Still working...
            </ThemedText>
          )}
        </Animated.View>

        {/* Skeleton content structure */}
        <SkeletonReflection />
      </KeyboardAwareScrollViewCompat>
    );
  }

  if (error || !result) {
    return (
      <KeyboardAwareScrollViewCompat
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.errorContainer,
          {
            paddingTop: headerHeight + Spacing.sm,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        {/* Progress Indicator */}
        <ReflectionProgressCompact currentStep="Reframe" />

        <Animated.View entering={FadeIn.duration(400)} style={styles.errorContent}>
          {/* Error icon */}
          <View
            style={[
              styles.errorIcon,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={{ fontSize: 40 }}>🤔</ThemedText>
          </View>

          {/* Error message */}
          <ThemedText
            type="h4"
            style={[styles.errorTitle, { fontFamily: Fonts?.serif }]}
          >
            Let's try that again
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.errorText, { color: theme.textSecondary }]}
          >
            {error || ScreenCopy.reframe.errorFallback}
          </ThemedText>

          {/* Action buttons */}
          <View style={styles.errorActions}>
            <Button
              onPress={handleRetry}
              style={{ backgroundColor: theme.primary, marginBottom: Spacing.md }}
              accessibilityHint="Attempts to generate reframe again"
            >
              Try Again
            </Button>
            <Button
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={{ backgroundColor: theme.backgroundDefault }}
              accessibilityHint="Returns to previous screen"
            >
              Go Back
            </Button>
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    );
  }

  const selectedOption = PERSPECTIVE_OPTIONS.find(
    (p) => p.id === selectedPerspective,
  );
  const selectedColor = selectedOption
    ? getPerspectiveColor(selectedOption.colorKey)
    : theme.highlightAccent;

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
      <ReflectionProgressCompact currentStep="Reframe" />

      {/* Belief Being Tested */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(100)}
        style={styles.block}
      >
        <ThemedText
          type="caption"
          style={[styles.blockLabel, { color: theme.textSecondary }]}
        >
          {ScreenCopy.reframe.blocks.belief}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.blockText, { fontFamily: Fonts?.serif }]}
        >
          {result.beliefTested}
        </ThemedText>
      </Animated.View>

      {/* Perspective Selector */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={styles.perspectiveSelectorSection}
      >
        <ThemedText
          type="caption"
          style={[styles.blockLabel, { color: theme.textSecondary }]}
        >
          VIEW THROUGH A DIFFERENT LENS
        </ThemedText>

        <TouchableOpacity
          onPress={handleTogglePerspectives}
          style={[
            styles.perspectiveSelector,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${selectedOption?.label} perspective: ${selectedOption?.description}`}
          accessibilityHint={`${showPerspectiveOptions ? "Collapse" : "Expand"} to ${showPerspectiveOptions ? "hide" : "view"} other perspective options`}
          accessibilityState={{ expanded: showPerspectiveOptions }}
        >
          <View
            style={[styles.perspectiveIcon, { backgroundColor: selectedColor }]}
          >
            <ThemedText type="body">{selectedOption?.icon}</ThemedText>
          </View>
          <View style={styles.perspectiveSelectorContent}>
            <ThemedText
              type="body"
              style={{ color: theme.text, fontWeight: "600" }}
            >
              {selectedOption?.label} Perspective
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {selectedOption?.description}
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {showPerspectiveOptions ? "▲" : "▼"}
          </ThemedText>
        </TouchableOpacity>

        {/* Expandable Perspective Options */}
        {showPerspectiveOptions && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.perspectiveOptions}
          >
            {PERSPECTIVE_OPTIONS.map((option) => {
              const isSelected = selectedPerspective === option.id;
              const optionColor = getPerspectiveColor(option.colorKey);
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handlePerspectiveSelect(option.id)}
                  style={[
                    styles.perspectiveOptionItem,
                    {
                      backgroundColor: isSelected
                        ? optionColor
                        : theme.backgroundDefault,
                      borderColor: isSelected ? optionColor : theme.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.label} perspective: ${option.description}`}
                  accessibilityHint="Changes the perspective lens for viewing your thought"
                  accessibilityState={{ selected: isSelected }}
                >
                  <ThemedText type="body">{option.icon}</ThemedText>
                  <View style={styles.perspectiveOptionText}>
                    <ThemedText
                      type="small"
                      style={{
                        color: isSelected ? theme.onPrimary : theme.text,
                        fontWeight: "600",
                      }}
                    >
                      {option.label}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}
      </Animated.View>

      {/* Main Perspective Card */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(300)}
        style={[
          styles.perspectiveCard,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View
          style={[styles.perspectiveAccent, { backgroundColor: selectedColor }]}
        />
        <View style={styles.perspectiveContent}>
          <ThemedText
            type="caption"
            style={[styles.blockLabel, { color: theme.textSecondary }]}
          >
            {ScreenCopy.reframe.blocks.perspective}
          </ThemedText>
          <ThemedText
            type="bodyLarge"
            style={[styles.perspectiveText, { fontFamily: Fonts?.serif }]}
          >
            {result.perspective}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Islamic Reference Card - Shows when Rooted perspective selected */}
      {selectedPerspective === "islamic" && (
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.islamicReferenceCard,
            {
              backgroundColor: theme.highlightAccentSubtle,
              borderLeftColor: theme.highlightAccent,
            },
          ]}
        >
          <View style={styles.islamicReferenceHeader}>
            <ThemedText
              type="small"
              style={{ color: theme.highlightAccent, fontWeight: "600" }}
            >
              📖 {islamicReference.concept}
            </ThemedText>
          </View>
          {islamicReference.arabicText && (
            <ThemedText
              type="body"
              style={[styles.arabicText, { color: theme.highlightAccent }]}
            >
              {islamicReference.arabicText}
            </ThemedText>
          )}
          <ThemedText
            type="body"
            style={[styles.islamicReferenceText, { fontFamily: Fonts?.serif }]}
          >
            &ldquo;{islamicReference.text}&rdquo;
          </ThemedText>
          <ThemedText
            type="caption"
            style={[styles.islamicSource, { color: theme.highlightAccent }]}
          >
            — {islamicReference.source}
          </ThemedText>
        </Animated.View>
      )}

      {/* Next Step */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(400)}
        style={styles.block}
      >
        <View style={styles.nextStepHeader}>
          <View
            style={[
              styles.nextStepIcon,
              { backgroundColor: theme.intensityHeavy },
            ]}
          >
            <ThemedText
              type="small"
              style={[styles.nextStepIconText, { color: theme.onPrimary }]}
            >
              1
            </ThemedText>
          </View>
          <ThemedText
            type="caption"
            style={[
              styles.blockLabel,
              { color: theme.textSecondary, marginBottom: 0 },
            ]}
          >
            {ScreenCopy.reframe.blocks.nextStep}
          </ThemedText>
        </View>
        <ThemedText
          type="body"
          style={[styles.blockText, { marginLeft: Spacing["3xl"] }]}
        >
          {result.nextStep}
        </ThemedText>
      </Animated.View>

      {/* Post-Reframe Belief Check */}
      {beliefStrength && (
        <Animated.View
          entering={FadeInUp.duration(400).delay(500)}
          style={styles.beliefCheckSection}
        >
          <ThemedText
            type="caption"
            style={[styles.blockLabel, { color: theme.textSecondary }]}
          >
            AFTER THIS REFLECTION, HOW STRONG IS THE BELIEF NOW?
          </ThemedText>

          <View style={styles.beliefButtons}>
            {[0, 25, 50, 75, 100].map((value) => {
              const isSelected = postBeliefStrength === value;
              const buttonColor = getBeliefColor(value);
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleBeliefStrengthTap(value)}
                  style={[
                    styles.beliefButton,
                    {
                      backgroundColor: isSelected
                        ? buttonColor
                        : theme.backgroundDefault,
                      borderColor: isSelected ? buttonColor : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{
                      color: isSelected ? theme.onPrimary : theme.textSecondary,
                      fontWeight: "600",
                    }}
                  >
                    {value}%
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Belief Shift Feedback */}
          {beliefShift !== null && beliefShift > 0 && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[
                styles.beliefShiftFeedback,
                { backgroundColor: theme.highlightAccentSubtle },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.beliefShiftText,
                  { color: theme.highlightAccent },
                ]}
              >
                {`✓ The belief softened by ${beliefShift}%. That's progress.`}
              </ThemedText>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Anchors Section */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(600)}
        style={styles.anchorsSection}
      >
        <ThemedText
          type="caption"
          style={[styles.anchorsLabel, { color: theme.textSecondary }]}
        >
          {ScreenCopy.reframe.blocks.anchors}
        </ThemedText>
        <View style={styles.anchorsRow}>
          {result.anchors.map((anchor, index) => (
            <View
              key={index}
              style={[
                styles.anchorPill,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <ThemedText
                type="small"
                style={[styles.anchorText, { color: theme.accent }]}
              >
                {anchor}
              </ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View
        entering={FadeIn.duration(300).delay(700)}
        style={styles.buttonSection}
      >
        <Button
          onPress={handleContinue}
          style={{ backgroundColor: theme.primary }}
        >
          {ScreenCopy.reframe.continue}
        </Button>
      </Animated.View>

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
  block: {
    marginBottom: Spacing["2xl"],
  },
  blockLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  blockText: {
    lineHeight: 26,
  },
  // Perspective Selector
  perspectiveSelectorSection: {
    marginBottom: Spacing["2xl"],
  },
  perspectiveSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  perspectiveIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  perspectiveSelectorContent: {
    flex: 1,
  },
  perspectiveOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  perspectiveOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  perspectiveOptionText: {
    marginLeft: Spacing.xs,
  },
  // Main Perspective
  perspectiveCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    overflow: "hidden",
  },
  perspectiveAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  perspectiveContent: {
    flex: 1,
    padding: Spacing["2xl"],
  },
  perspectiveText: {
    lineHeight: 32,
    fontStyle: "italic",
  },
  // Next Step
  nextStepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  nextStepIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  nextStepIconText: {
    fontWeight: "600",
    fontSize: 13,
  },
  // Belief Check
  beliefCheckSection: {
    marginBottom: Spacing["2xl"],
  },
  beliefButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  beliefButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  beliefShiftFeedback: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  beliefShiftText: {
    textAlign: "center",
    fontStyle: "italic",
  },
  // Anchors
  anchorsSection: {
    marginBottom: Spacing.xl,
  },
  anchorsLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  anchorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  anchorPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  anchorText: {
    fontStyle: "italic",
    fontSize: 13,
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  // Islamic Reference Card
  islamicReferenceCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
    borderLeftWidth: 4,
  },
  islamicReferenceHeader: {
    marginBottom: Spacing.md,
  },
  arabicText: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 34,
  },
  islamicReferenceText: {
    lineHeight: 28,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  islamicSource: {
    textAlign: "center",
    fontWeight: "500",
  },
  timeoutWarning: {
    textAlign: "center",
    fontStyle: "italic",
  },
  // Error State Styles
  errorContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  errorTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  errorActions: {
    width: "100%",
    marginTop: Spacing["2xl"],
  },
});
