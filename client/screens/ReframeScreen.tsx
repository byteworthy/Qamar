import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp, FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { generateReframe } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Reframe">;
type RouteType = RouteProp<RootStackParamList, "Reframe">;

// Perspective types for multi-lens reframing
type PerspectiveType = 'empathic' | 'logical' | 'islamic' | 'future';

interface PerspectiveOption {
  id: PerspectiveType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const PERSPECTIVE_OPTIONS: PerspectiveOption[] = [
  { 
    id: 'empathic', 
    label: 'Compassionate', 
    icon: '💛', 
    description: 'What would a loving friend say?',
    color: SiraatColors.sand 
  },
  { 
    id: 'logical', 
    label: 'Balanced', 
    icon: '⚖️', 
    description: 'What does the evidence show?',
    color: SiraatColors.indigo 
  },
  { 
    id: 'islamic', 
    label: 'Rooted', 
    icon: '🌙', 
    description: 'What does our tradition say?',
    color: SiraatColors.emerald 
  },
  { 
    id: 'future', 
    label: 'Zoomed Out', 
    icon: '🔭', 
    description: 'How will this look in a year?',
    color: SiraatColors.clay 
  },
];

interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

// Sample alternative perspectives (in production, these would come from API)
const ALTERNATIVE_PERSPECTIVES: Record<PerspectiveType, string> = {
  empathic: "You're carrying a heavy burden. It's okay to struggle with this. The fact that you're reflecting shows strength, not weakness.",
  logical: "Let's examine the evidence. Has this always been true? What exceptions exist? What would a neutral observer notice?",
  islamic: "Allah does not burden a soul beyond what it can bear. This trial may be shaping you for something greater.",
  future: "In five years, how significant will this feel? What growth might come from navigating this moment?",
};

export default function ReframeScreen() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ReframeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerspective, setSelectedPerspective] = useState<PerspectiveType>('empathic');
  const [showPerspectiveOptions, setShowPerspectiveOptions] = useState(false);
  const [postBeliefStrength, setPostBeliefStrength] = useState<number | null>(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, analysis, emotionalIntensity, beliefStrength } = route.params;

  useEffect(() => {
    const generate = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await generateReframe(thought, distortions, analysis, emotionalIntensity);
        setResult(data);
      } catch (err) {
        setError("Unable to generate reframe. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [thought, distortions, analysis, emotionalIntensity]);

  const handlePerspectiveSelect = (perspective: PerspectiveType) => {
    setSelectedPerspective(perspective);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPerspectiveOptions(false);
  };

  const handleTogglePerspectives = () => {
    setShowPerspectiveOptions(!showPerspectiveOptions);
    Haptics.selectionAsync();
  };

  const handleBeliefStrengthTap = (value: number) => {
    setPostBeliefStrength(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleContinue = () => {
    if (result) {
      const reframeSummary = `${result.beliefTested} ${result.perspective}`;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Regulation", { 
        thought, 
        distortions, 
        reframe: reframeSummary,
        anchor: result.perspective,
        emotionalIntensity,
      });
    }
  };

  // Calculate belief shift if both values present
  const beliefShift = beliefStrength && postBeliefStrength 
    ? beliefStrength - postBeliefStrength 
    : null;

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
          {ScreenCopy.reframe.loading}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !result) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ThemedText type="body" style={[styles.errorText, { color: theme.error }]}>
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

  const selectedOption = PERSPECTIVE_OPTIONS.find(p => p.id === selectedPerspective);

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
      {/* Belief Being Tested */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.block}>
        <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary }]}>
          {ScreenCopy.reframe.blocks.belief}
        </ThemedText>
        <ThemedText type="body" style={[styles.blockText, { fontFamily: Fonts?.serif }]}>
          {result.beliefTested}
        </ThemedText>
      </Animated.View>

      {/* Perspective Selector */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.perspectiveSelectorSection}>
        <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary }]}>
          VIEW THROUGH A DIFFERENT LENS
        </ThemedText>
        
        <TouchableOpacity 
          onPress={handleTogglePerspectives}
          style={[styles.perspectiveSelector, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={[styles.perspectiveIcon, { backgroundColor: selectedOption?.color }]}>
            <ThemedText type="body">{selectedOption?.icon}</ThemedText>
          </View>
          <View style={styles.perspectiveSelectorContent}>
            <ThemedText type="bodyBold" style={{ color: theme.text }}>
              {selectedOption?.label} Perspective
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {selectedOption?.description}
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {showPerspectiveOptions ? '▲' : '▼'}
          </ThemedText>
        </TouchableOpacity>

        {/* Expandable Perspective Options */}
        {showPerspectiveOptions && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.perspectiveOptions}>
            {PERSPECTIVE_OPTIONS.map((option) => {
              const isSelected = selectedPerspective === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handlePerspectiveSelect(option.id)}
                  style={[
                    styles.perspectiveOptionItem,
                    {
                      backgroundColor: isSelected ? option.color : theme.backgroundDefault,
                      borderColor: isSelected ? option.color : theme.border,
                    },
                  ]}
                >
                  <ThemedText type="body">{option.icon}</ThemedText>
                  <View style={styles.perspectiveOptionText}>
                    <ThemedText type="small" style={{ color: isSelected ? '#FFFFFF' : theme.text, fontWeight: '600' }}>
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
        style={[styles.perspectiveCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={[styles.perspectiveAccent, { backgroundColor: selectedOption?.color || SiraatColors.emerald }]} />
        <View style={styles.perspectiveContent}>
          <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary }]}>
            {ScreenCopy.reframe.blocks.perspective}
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.perspectiveText, { fontFamily: Fonts?.serif }]}>
            {result.perspective}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Next Step */}
      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.block}>
        <View style={styles.nextStepHeader}>
          <View style={[styles.nextStepIcon, { backgroundColor: SiraatColors.clay }]}>
            <ThemedText type="small" style={styles.nextStepIconText}>1</ThemedText>
          </View>
          <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary, marginBottom: 0 }]}>
            {ScreenCopy.reframe.blocks.nextStep}
          </ThemedText>
        </View>
        <ThemedText type="body" style={[styles.blockText, { marginLeft: Spacing["3xl"] }]}>
          {result.nextStep}
        </ThemedText>
      </Animated.View>

      {/* Post-Reframe Belief Check */}
      {beliefStrength && (
        <Animated.View entering={FadeInUp.duration(400).delay(500)} style={styles.beliefCheckSection}>
          <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary }]}>
            AFTER THIS REFLECTION, HOW STRONG IS THE BELIEF NOW?
          </ThemedText>
          
          <View style={styles.beliefButtons}>
            {[0, 25, 50, 75, 100].map((value) => {
              const isSelected = postBeliefStrength === value;
              const getColor = () => {
                if (value <= 30) return SiraatColors.emerald;
                if (value <= 60) return SiraatColors.sand;
                return SiraatColors.clay;
              };
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleBeliefStrengthTap(value)}
                  style={[
                    styles.beliefButton,
                    {
                      backgroundColor: isSelected ? getColor() : theme.backgroundDefault,
                      borderColor: isSelected ? getColor() : theme.border,
                    },
                  ]}
                >
                  <ThemedText 
                    type="small" 
                    style={{ color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: '600' }}
                  >
                    {value}%
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Belief Shift Feedback */}
          {beliefShift !== null && beliefShift > 0 && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.beliefShiftFeedback}>
              <ThemedText type="small" style={[styles.beliefShiftText, { color: SiraatColors.emerald }]}>
                ✓ The belief softened by {beliefShift}%. That's progress.
              </ThemedText>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Anchors Section */}
      <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.anchorsSection}>
        <ThemedText type="caption" style={[styles.anchorsLabel, { color: theme.textSecondary }]}>
          {ScreenCopy.reframe.blocks.anchors}
        </ThemedText>
        <View style={styles.anchorsRow}>
          {result.anchors.map((anchor, index) => (
            <View key={index} style={[styles.anchorPill, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="small" style={[styles.anchorText, { color: theme.accent }]}>
                {anchor}
              </ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Continue Button */}
      <Animated.View entering={FadeIn.duration(300).delay(700)} style={styles.buttonSection}>
        <Button
          onPress={handleContinue}
          style={{ backgroundColor: theme.primary }}
        >
          {ScreenCopy.reframe.continue}
        </Button>
      </Animated.View>
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
    borderRadius: 20,
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
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextStepIconText: {
    color: "#FFFFFF",
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
    backgroundColor: 'rgba(107, 142, 35, 0.1)',
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
});
