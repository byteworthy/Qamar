import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";

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

interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

export default function ReframeScreen() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ReframeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, distortions, analysis } = route.params;

  useEffect(() => {
    const generate = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await generateReframe(thought, distortions, analysis);
        setResult(data);
      } catch (err) {
        setError("Unable to generate reframe. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [thought, distortions, analysis]);

  const handleContinue = () => {
    if (result) {
      const reframeSummary = `${result.beliefTested} ${result.perspective}`;
      navigation.navigate("Regulation", { 
        thought, 
        distortions, 
        reframe: reframeSummary,
        anchor: result.perspective,
      });
    }
  };

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
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.block}>
        <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary }]}>
          {ScreenCopy.reframe.blocks.belief}
        </ThemedText>
        <ThemedText type="body" style={[styles.blockText, { fontFamily: Fonts?.serif }]}>
          {result.beliefTested}
        </ThemedText>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.duration(400).delay(250)} 
        style={[styles.perspectiveCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View style={[styles.perspectiveAccent, { backgroundColor: SiraatColors.emerald }]} />
        <View style={styles.perspectiveContent}>
          <ThemedText type="caption" style={[styles.blockLabel, { color: theme.textSecondary }]}>
            {ScreenCopy.reframe.blocks.perspective}
          </ThemedText>
          <ThemedText type="bodyLarge" style={[styles.perspectiveText, { fontFamily: Fonts?.serif }]}>
            {result.perspective}
          </ThemedText>
        </View>
      </Animated.View>

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

      <Animated.View entering={FadeInUp.duration(400).delay(500)} style={styles.anchorsSection}>
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

      <Animated.View entering={FadeIn.duration(300).delay(600)} style={styles.buttonSection}>
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
  },
  blockText: {
    lineHeight: 26,
  },
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
  anchorsSection: {
    marginBottom: Spacing.xl,
  },
  anchorsLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
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
