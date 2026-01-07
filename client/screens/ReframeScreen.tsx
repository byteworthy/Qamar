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
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { generateReframe } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Reframe">;
type RouteType = RouteProp<RootStackParamList, "Reframe">;

export default function ReframeScreen() {
  const [loading, setLoading] = useState(true);
  const [reframe, setReframe] = useState("");
  const [source, setSource] = useState("");
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
        const result = await generateReframe(thought, distortions, analysis);
        setReframe(result.reframe);
        setSource(result.source);
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
    navigation.navigate("Regulation", { thought, distortions, reframe });
  };

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText type="body" style={[styles.loadingText, { color: theme.textSecondary }]}>
          Finding wisdom for your heart...
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
          A Different Perspective
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          Your feelings are valid. And there may be more truth to hold alongside them.
        </ThemedText>
      </View>

      <View style={[styles.reframeCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="bodyLarge" style={[styles.reframeText, { fontFamily: Fonts?.serif }]}>
          {reframe}
        </ThemedText>
        {source ? (
          <ThemedText type="small" style={[styles.sourceText, { color: theme.accent }]}>
            {source}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.buttonSection}>
        <ThemedText type="caption" style={[styles.nextHint, { color: theme.textSecondary }]}>
          Next: A short practice to help this land
        </ThemedText>
        <Button
          onPress={handleContinue}
          style={{ backgroundColor: theme.primary }}
        >
          Continue to Practice
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
  reframeCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  reframeText: {
    lineHeight: 30,
    marginBottom: Spacing.lg,
  },
  sourceText: {
    fontStyle: "italic",
  },
  buttonSection: {
    marginTop: "auto",
    paddingTop: Spacing.lg,
  },
  nextHint: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
});
