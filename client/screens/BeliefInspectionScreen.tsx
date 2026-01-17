import React, { useState } from "react";
import { View, StyleSheet, TextInput, Platform, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "BeliefInspection">;
type RouteType = RouteProp<RootStackParamList, "BeliefInspection">;

// Pattern interruption questions for different belief types
const INTERRUPTION_QUESTIONS = [
  "What if this thought is only 60% true?",
  "What would you tell a friend who had this thought?",
  "How might you see this differently in a week?",
  "Is this thought helping you or hurting you?",
];

// Belief types with Islamic concept mapping
const BELIEF_TYPES = [
  { 
    id: "worth", 
    label: "My worth", 
    icon: "🪞", 
    description: "Thoughts about my value as a person",
    islamicConcept: "tawbah",
    islamicInsight: "Your worth is not defined by your mistakes. Allah's mercy is greater than any shortcoming."
  },
  { 
    id: "control", 
    label: "My control", 
    icon: "🎛️", 
    description: "Thoughts about what I can/can't control",
    islamicConcept: "tawakkul",
    islamicInsight: "You are responsible for effort, not outcomes. What happens is Allah's territory."
  },
  { 
    id: "safety", 
    label: "My safety", 
    icon: "🛡️", 
    description: "Thoughts about danger or threat",
    islamicConcept: "tawakkul",
    islamicInsight: "Whoever relies upon Allah, He is sufficient for them. You are not alone in this."
  },
  { 
    id: "others", 
    label: "Others' views", 
    icon: "👥", 
    description: "Thoughts about how others see me",
    islamicConcept: "ikhlas",
    islamicInsight: "When your intention is for Allah, the opinions of others lose their power over you."
  },
  { 
    id: "allah", 
    label: "Allah's view", 
    icon: "🌙", 
    description: "Thoughts about how Allah sees me",
    islamicConcept: "muraqaba",
    islamicInsight: "Allah knows your struggles and sees your sincere efforts, even when you cannot."
  },
  { 
    id: "future", 
    label: "The future", 
    icon: "🔮", 
    description: "Thoughts about what will happen",
    islamicConcept: "sabr",
    islamicInsight: "The future is written, but your response to it is your choice. That is where your power lies."
  },
];

export default function BeliefInspectionScreen() {
  const [beliefStrength, setBeliefStrength] = useState(75);
  const [underlyingBelief, setUnderlyingBelief] = useState("");
  const [selectedBeliefType, setSelectedBeliefType] = useState<string | null>(null);
  const [interruptionAnswer, setInterruptionAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(
    INTERRUPTION_QUESTIONS[Math.floor(Math.random() * INTERRUPTION_QUESTIONS.length)]
  );

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, analysis, emotionalIntensity } = route.params;

  const canContinue = underlyingBelief.trim().length > 5;

  const handleStrengthChange = (value: number) => {
    setBeliefStrength(value);
    Haptics.selectionAsync();
  };

  const handleBeliefTypeSelect = (typeId: string) => {
    setSelectedBeliefType(typeId === selectedBeliefType ? null : typeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = () => {
    if (canContinue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Reframe", {
        thought,
        distortions,
        analysis,
        emotionalIntensity,
        beliefStrength,
      });
    }
  };

  // Get color based on belief strength
  const getStrengthColor = () => {
    if (beliefStrength <= 30) return SiraatColors.emerald;
    if (beliefStrength <= 60) return SiraatColors.sand;
    if (beliefStrength <= 80) return SiraatColors.clay;
    return SiraatColors.clayDark;
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
      {/* Header Section */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.section}>
        <ThemedText type="h3" style={[styles.heading, { fontFamily: Fonts?.serif }]}>
          What does this thought say about what you believe?
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          Every distorted thought rests on a deeper belief. Let's find it.
        </ThemedText>
      </Animated.View>

      {/* Belief Type Selection */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          THIS THOUGHT IS ABOUT...
        </ThemedText>
        
        <View style={styles.beliefTypesGrid}>
          {BELIEF_TYPES.map((type) => {
            const isSelected = selectedBeliefType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => handleBeliefTypeSelect(type.id)}
                style={[
                  styles.beliefTypeCard,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundDefault,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
              >
                <ThemedText type="h3" style={styles.beliefTypeIcon}>
                  {type.icon}
                </ThemedText>
                <ThemedText 
                  type="small" 
                  style={[
                    styles.beliefTypeLabel,
                    { color: isSelected ? '#FFFFFF' : theme.text }
                  ]}
                >
                  {type.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Islamic Insight - appears when belief type is selected */}
      {selectedBeliefType && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          style={[styles.islamicInsightCard, { backgroundColor: SiraatColors.emerald + '20' }]}
        >
          <ThemedText type="small" style={[styles.islamicInsightLabel, { color: SiraatColors.emerald }]}>
            💡 ISLAMIC PERSPECTIVE
          </ThemedText>
          <ThemedText type="body" style={[styles.islamicInsightText, { color: theme.text, fontFamily: Fonts?.serif }]}>
            {BELIEF_TYPES.find(t => t.id === selectedBeliefType)?.islamicInsight}
          </ThemedText>
        </Animated.View>
      )}

      {/* Underlying Belief Input */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          THE BELIEF UNDERNEATH THIS THOUGHT IS...
        </ThemedText>
        <TextInput
          value={underlyingBelief}
          onChangeText={setUnderlyingBelief}
          placeholder="I believe that..."
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
      </Animated.View>

      {/* Belief Strength Slider */}
      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          HOW STRONGLY DO YOU BELIEVE THIS? ({beliefStrength}%)
        </ThemedText>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Not at all
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Completely
            </ThemedText>
          </View>
          
          <View style={[styles.sliderTrack, { backgroundColor: theme.border }]}>
            <Animated.View 
              style={[
                styles.sliderFill,
                { 
                  width: `${beliefStrength}%`,
                  backgroundColor: getStrengthColor(),
                }
              ]} 
            />
            {[0, 25, 50, 75, 100].map((mark) => (
              <TouchableOpacity
                key={mark}
                onPress={() => handleStrengthChange(mark)}
                style={[
                  styles.sliderMark,
                  { 
                    left: `${mark}%`,
                    backgroundColor: beliefStrength >= mark ? getStrengthColor() : theme.border,
                  }
                ]}
              />
            ))}
          </View>
          
          <ThemedText type="small" style={[styles.strengthLabel, { color: getStrengthColor() }]}>
            {beliefStrength <= 30 && "This belief has cracks. Good."}
            {beliefStrength > 30 && beliefStrength <= 60 && "Some doubt is present. Work with that."}
            {beliefStrength > 60 && beliefStrength <= 80 && "This belief feels solid but may not be."}
            {beliefStrength > 80 && "This belief feels like truth. Let's examine it."}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Pattern Interruption Question */}
      <Animated.View 
        entering={FadeIn.duration(400).delay(400)} 
        style={[styles.interruptionCard, { backgroundColor: SiraatColors.indigoLight }]}
      >
        <ThemedText type="caption" style={[styles.interruptionLabel, { color: 'rgba(255,255,255,0.7)' }]}>
          PAUSE AND CONSIDER
        </ThemedText>
        <ThemedText type="body" style={[styles.interruptionQuestion, { fontFamily: Fonts?.serif }]}>
          {currentQuestion}
        </ThemedText>
        <TextInput
          value={interruptionAnswer}
          onChangeText={setInterruptionAnswer}
          placeholder="Your honest response..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          multiline
          style={styles.interruptionInput}
          textAlignVertical="top"
        />
      </Animated.View>

      {/* Continue Button */}
      <Animated.View entering={FadeIn.duration(300).delay(500)} style={styles.buttonSection}>
        <Button
          onPress={handleContinue}
          disabled={!canContinue}
          style={{ backgroundColor: canContinue ? theme.primary : theme.border }}
        >
          Continue to Reframe
        </Button>
        
        <ThemedText type="small" style={[styles.hint, { color: theme.textSecondary }]}>
          The clearer you see the belief, the easier it is to reframe.
        </ThemedText>
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  heading: {
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 26,
  },
  sectionLabel: {
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  // Belief Types Grid
  beliefTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  beliefTypeCard: {
    width: "31%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  beliefTypeIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  beliefTypeLabel: {
    textAlign: "center",
    fontWeight: "500",
  },
  // Text Input
  textInput: {
    minHeight: 80,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    fontSize: 16,
    lineHeight: 24,
  },
  // Slider
  sliderContainer: {
    marginTop: Spacing.sm,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    position: "relative",
    marginBottom: Spacing.md,
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 4,
  },
  sliderMark: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
  },
  strengthLabel: {
    textAlign: "center",
    fontStyle: "italic",
  },
  // Interruption Card
  interruptionCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
  },
  interruptionLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  interruptionQuestion: {
    color: "#FFFFFF",
    lineHeight: 26,
    marginBottom: Spacing.md,
  },
  interruptionInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#FFFFFF",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    minHeight: 60,
    fontSize: 15,
    lineHeight: 22,
  },
  // Button Section
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  hint: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  // Islamic Insight Card
  islamicInsightCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: SiraatColors.emerald,
  },
  islamicInsightLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  islamicInsightText: {
    lineHeight: 24,
    fontStyle: "italic",
  },
});
