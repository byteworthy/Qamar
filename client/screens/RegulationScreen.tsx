import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { generatePractice } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Regulation">;
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

  const handleStartPractice = () => {
    setIsActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCompletePractice = () => {
    setIsActive(false);
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
          Preparing your practice...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !practice) {
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
        <ThemedText type="h3" style={[styles.title, { fontFamily: Fonts?.serif }]}>
          {practice.title}
        </ThemedText>
        <ThemedText type="small" style={[styles.duration, { color: theme.accent }]}>
          {practice.duration}
        </ThemedText>
      </View>

      <View style={[styles.practiceCard, { backgroundColor: isActive ? SiraatColors.emeraldDark : theme.backgroundDefault }]}>
        <ThemedText type="caption" style={[styles.stepsLabel, { color: isActive ? SiraatColors.cream : theme.textSecondary }]}>
          {ScreenCopy.practice.stepsLabel}
        </ThemedText>
        {practice.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: isActive ? SiraatColors.cream : theme.primary }]}>
              <ThemedText type="small" style={{ color: isActive ? SiraatColors.emeraldDark : "#FFFFFF", fontWeight: "700" }}>
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText 
              type="body" 
              style={[styles.stepText, { color: isActive ? SiraatColors.cream : theme.text }]}
            >
              {step}
            </ThemedText>
          </View>
        ))}
        
        <View style={[styles.reminderBar, { backgroundColor: isActive ? SiraatColors.cream : theme.border, opacity: 0.3 }]} />
        <ThemedText 
          type="small" 
          style={[styles.reminderText, { color: isActive ? SiraatColors.cream : theme.textSecondary, fontFamily: Fonts?.serif }]}
        >
          {practice.reminder}
        </ThemedText>
      </View>

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
            <ThemedText type="body" style={[styles.completedText, { color: theme.success }]}>
              Practice completed
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
    marginBottom: Spacing["2xl"],
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
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
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
});
