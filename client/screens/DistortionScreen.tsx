import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { hapticMedium } from "@/lib/haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { analyzeThought } from "@/lib/api";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ScreenCopy } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Distortion"
>;
type RouteType = RouteProp<RootStackParamList, "Distortion">;

interface CrisisResource {
  name: string;
  contact: string;
  description: string;
}

interface CrisisData {
  title: string;
  message: string;
  resources: CrisisResource[];
  islamicContext: string;
}

interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
  // Crisis detection fields
  crisis?: boolean;
  level?: "emergency" | "urgent" | "concern";
  resources?: CrisisData;
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
  const { thought, emotionalIntensity, somaticAwareness } = route.params;

  useEffect(() => {
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass emotional intensity for adaptive AI responses
        const data = await analyzeThought(
          thought,
          emotionalIntensity,
          somaticAwareness,
        );
        setResult(data);
      } catch (err) {
        setError(ScreenCopy.distortion.error);
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
      navigation.navigate("Reframe", {
        thought,
        distortions: result.distortions,
        analysis,
      });
    }
  };

  const handleCallResource = (contact: string) => {
    hapticMedium();
    // Extract phone number or handle special cases
    if (contact.includes("911")) {
      Linking.openURL("tel:911");
    } else if (contact.includes("1-800")) {
      const phoneNumber = contact.replace(/[^0-9]/g, "");
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  // CRISIS SCREEN - Shows when crisis language is detected
  if (result?.crisis && result.resources) {
    const isEmergency = result.level === "emergency";
    const crisisData = result.resources;

    return (
      <KeyboardAwareScrollViewCompat
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={[
          styles.crisisContainer,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={styles.crisisHeader}
        >
          <View
            style={[
              styles.crisisIcon,
              {
                backgroundColor: isEmergency
                  ? theme.intensityHeavy
                  : theme.intensityModerate,
              },
            ]}
          >
            <ThemedText type="h2" style={{ color: theme.onPrimary }}>
              {isEmergency ? "🆘" : "💛"}
            </ThemedText>
          </View>

          <ThemedText
            type="h3"
            style={[styles.crisisTitle, { fontFamily: Fonts?.serif }]}
          >
            {crisisData.title}
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.crisisMessage, { color: theme.textSecondary }]}
          >
            {crisisData.message}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={styles.resourcesSection}
        >
          <ThemedText
            type="caption"
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            REACH OUT NOW
          </ThemedText>

          {crisisData.resources.map(
            (resource: CrisisResource, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleCallResource(resource.contact)}
                style={[
                  styles.resourceCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <View style={styles.resourceContent}>
                  <ThemedText
                    type="body"
                    style={{ color: theme.text, fontWeight: "600" }}
                  >
                    {resource.name}
                  </ThemedText>
                  <ThemedText
                    type="body"
                    style={[styles.resourceContact, { color: theme.primary }]}
                  >
                    {resource.contact}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
                    {resource.description}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.resourceArrow,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <ThemedText type="small" style={{ color: theme.onPrimary }}>
                    →
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ),
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(400)}
          style={[
            styles.islamicCard,
            { backgroundColor: theme.bannerBackground },
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.islamicText,
              { fontFamily: Fonts?.serif, color: theme.onPrimary },
            ]}
          >
            {crisisData.islamicContext}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(300).delay(600)}
          style={styles.buttonSection}
        >
          <ThemedText
            type="small"
            style={[styles.continueNote, { color: theme.textSecondary }]}
          >
            {"If you're safe and want to continue:"}
          </ThemedText>
          <Button
            onPress={handleContinue}
            style={{ backgroundColor: theme.border }}
          >
            Continue Reflection
          </Button>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    );
  }

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
          {ScreenCopy.distortion.loading}
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !result) {
    return (
      <ThemedView
        style={[styles.loadingContainer, { paddingTop: headerHeight }]}
      >
        <ThemedText
          type="body"
          style={[styles.errorText, { color: theme.textSecondary }]}
        >
          {error || ScreenCopy.distortion.errorFallback}
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
      <Animated.View
        entering={FadeInUp.duration(400).delay(100)}
        style={styles.section}
      >
        <ThemedText
          type="caption"
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          {ScreenCopy.distortion.sections.happening}
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.sectionText, { lineHeight: 26 }]}
        >
          {result.happening}
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(400).delay(250)}
        style={styles.section}
      >
        <ThemedText
          type="caption"
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          {ScreenCopy.distortion.sections.pattern}
        </ThemedText>
        <View style={styles.distortionsRow}>
          {result.distortions.map((distortion, index) => (
            <View
              key={index}
              style={[
                styles.distortionPill,
                { backgroundColor: theme.pillBackground },
              ]}
            >
              <ThemedText
                type="small"
                style={[styles.distortionText, { color: theme.onPrimary }]}
              >
                {distortion}
              </ThemedText>
            </View>
          ))}
        </View>
        {result.pattern.map((item, index) => (
          <View key={index} style={styles.patternItem}>
            <View
              style={[
                styles.patternBullet,
                { backgroundColor: theme.intensityHeavy },
              ]}
            />
            <ThemedText
              type="body"
              style={[styles.patternText, { color: theme.text }]}
            >
              {item}
            </ThemedText>
          </View>
        ))}
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(400).delay(400)}
        style={[
          styles.mattersCard,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View
          style={[
            styles.mattersAccent,
            { backgroundColor: theme.highlightAccent },
          ]}
        />
        <View style={styles.mattersContent}>
          <ThemedText
            type="caption"
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            {ScreenCopy.distortion.sections.matters}
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.mattersText, { fontFamily: Fonts?.serif }]}
          >
            {result.matters}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(300).delay(600)}
        style={styles.buttonSection}
      >
        <Button
          onPress={handleContinue}
          style={{ backgroundColor: theme.primary }}
        >
          {ScreenCopy.distortion.continue}
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
  // Crisis Screen Styles
  crisisContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  crisisHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  crisisIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius["3xl"],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  crisisTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  crisisMessage: {
    textAlign: "center",
    lineHeight: 26,
  },
  resourcesSection: {
    marginBottom: Spacing["2xl"],
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  resourceContent: {
    flex: 1,
  },
  resourceContact: {
    marginVertical: Spacing.xs,
    fontWeight: "600",
  },
  resourceArrow: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.md,
  },
  islamicCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
  },
  islamicText: {
    textAlign: "center",
    lineHeight: 26,
    fontStyle: "italic",
  },
  continueNote: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  // Standard Screen Styles
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
    fontWeight: "600",
  },
  patternItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  patternBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
  },
  patternText: {
    flex: 1,
    lineHeight: 24,
  },
  mattersCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  mattersAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  mattersContent: {
    flex: 1,
    padding: Spacing.xl,
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
