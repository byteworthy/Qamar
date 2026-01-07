import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { analyzeThought } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Distortion">;
type RouteType = RouteProp<RootStackParamList, "Distortion">;

export default function DistortionScreen() {
  const [loading, setLoading] = useState(true);
  const [distortions, setDistortions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
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
        const result = await analyzeThought(thought);
        setDistortions(result.distortions);
        setAnalysis(result.analysis);
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
    navigation.navigate("Reframe", { thought, distortions, analysis });
  };

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
          Reflecting on your words...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ThemedText type="body" style={[styles.errorText, { color: theme.error }]}>
          {error}
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
        <ThemedText type="h3" style={[styles.heading, { fontFamily: Fonts?.serif }]}>
          What we noticed
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          Your thought may contain patterns that can distort perception. This is human, not shameful.
        </ThemedText>
      </View>

      <View style={styles.distortionsSection}>
        {distortions.map((distortion, index) => (
          <Card key={index} elevation={1} style={styles.distortionCard}>
            <ThemedText type="h4" style={[styles.distortionTitle, { color: theme.primary, fontFamily: Fonts?.serif }]}>
              {distortion}
            </ThemedText>
          </Card>
        ))}
      </View>

      <View style={[styles.analysisCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="body" style={[styles.analysisText, { fontFamily: Fonts?.serif }]}>
          {analysis}
        </ThemedText>
      </View>

      <View style={styles.buttonSection}>
        <Button
          onPress={handleContinue}
          style={{ backgroundColor: theme.primary }}
        >
          See the Reframe
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
  heading: {
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 24,
  },
  distortionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  distortionCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  distortionTitle: {
    textAlign: "center",
  },
  analysisCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  analysisText: {
    lineHeight: 26,
    fontStyle: "italic",
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
});
