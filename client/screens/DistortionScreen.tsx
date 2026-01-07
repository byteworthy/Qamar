import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, SiraatColors } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { analyzeThought } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Distortion">;
type RouteType = RouteProp<RootStackParamList, "Distortion">;

interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
}

export default function DistortionScreen() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought } = route.params;

  useEffect(() => {
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analyzeThought(thought);
        setResult(data);
      } catch (err) {
        setError("Unable to analyze your thought. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    analyze();
  }, [thought]);

  const handleContinue = () => {
    if (result) {
      const analysis = `${result.happening} ${result.pattern.join(" ")} ${result.matters}`;
      navigation.navigate("Reframe", { thought, distortions: result.distortions, analysis });
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
          {ScreenCopy.distortion.loading}
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
      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {ScreenCopy.distortion.sections.happening}
        </ThemedText>
        <ThemedText type="body" style={[styles.sectionText, { lineHeight: 26 }]}>
          {result.happening}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {ScreenCopy.distortion.sections.pattern}
        </ThemedText>
        <View style={styles.distortionsRow}>
          {result.distortions.map((distortion, index) => (
            <View key={index} style={[styles.distortionPill, { backgroundColor: SiraatColors.indigo }]}>
              <ThemedText type="small" style={styles.distortionText}>
                {distortion}
              </ThemedText>
            </View>
          ))}
        </View>
        {result.pattern.map((item, index) => (
          <View key={index} style={styles.patternItem}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>•</ThemedText>
            <ThemedText type="body" style={[styles.patternText, { color: theme.text }]}>
              {item}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.mattersCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {ScreenCopy.distortion.sections.matters}
        </ThemedText>
        <ThemedText type="body" style={[styles.mattersText, { fontFamily: Fonts?.serif }]}>
          {result.matters}
        </ThemedText>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleContinue}
          style={{ backgroundColor: theme.primary }}
        >
          {ScreenCopy.distortion.continue}
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionText: {
    lineHeight: 26,
  },
  distortionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  distortionPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  distortionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  patternItem: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  patternText: {
    flex: 1,
    lineHeight: 24,
  },
  mattersCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  mattersText: {
    lineHeight: 26,
    fontStyle: "italic",
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
});
