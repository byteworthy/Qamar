import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Pressable,
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
import { ExitConfirmationModal } from "@/components/ExitConfirmationModal";
import { ReflectionProgressCompact } from "@/components/ReflectionProgress";
import { SkeletonText, LoadingSkeleton } from "@/components/LoadingSkeleton";
import { withScreenErrorBoundary } from "@/components/ScreenErrorBoundary";

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

function DistortionScreen() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { thought, emotionalIntensity, somaticAwareness } = route.params;

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
          ScreenCopy.distortion.errorTimeout ||
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
    const analyze = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowTimeoutWarning(false);
        // Pass emotional intensity for adaptive AI responses
        const data = await analyzeThought(
          thought,
          emotionalIntensity,
          somaticAwareness,
        );

        // Validate response structure before using
        if (!data || typeof data !== "object") {
          console.error("Invalid response: not an object", data);
          setError(
            ScreenCopy.distortion.errorServer || ScreenCopy.distortion.error,
          );
          return;
        }

        // Check for crisis response (valid response)
        if (data.crisis) {
          setResult(data);
          return;
        }

        // Validate regular analysis response
        if (!data.distortions || !Array.isArray(data.distortions)) {
          console.error(
            "Invalid response: missing or invalid distortions array",
            data,
          );
          setError(
            ScreenCopy.distortion.errorServer || ScreenCopy.distortion.error,
          );
          return;
        }

        setResult(data);
      } catch (err) {
        // Classify error type for better user messaging
        const errorMessage = (err as Error)?.message || "";
        if (errorMessage.includes("NETWORK_ERROR")) {
          setError(
            ScreenCopy.distortion.errorNetwork || ScreenCopy.distortion.error,
          );
        } else if (errorMessage.includes("SERVER_ERROR")) {
          setError(
            ScreenCopy.distortion.errorServer || ScreenCopy.distortion.error,
          );
        } else if (errorMessage.includes("TIMEOUT")) {
          setError(
            ScreenCopy.distortion.errorTimeout || ScreenCopy.distortion.error,
          );
        } else {
          setError(ScreenCopy.distortion.error);
        }
        console.error("Analysis error:", err);
      } finally {
        setLoading(false);
        setShowTimeoutWarning(false);
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
        emotionalIntensity,
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setShowTimeoutWarning(false);
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
                accessibilityRole="button"
                accessibilityLabel={`Call ${resource.name}, ${resource.contact}`}
                accessibilityHint={resource.description}
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
            accessibilityHint="Proceeds with your reflection practice"
          >
            Continue Reflection
          </Button>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    );
  }

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
        <ReflectionProgressCompact currentStep="Distortion" />

        {/* Loading message */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{ marginVertical: Spacing.xl }}
        >
          <ThemedText
            type="body"
            style={[
              styles.loadingText,
              { color: theme.textSecondary, textAlign: "center" },
            ]}
          >
            {ScreenCopy.distortion.loading}
          </ThemedText>
          {showTimeoutWarning && (
            <ThemedText
              type="small"
              style={[
                styles.timeoutWarning,
                {
                  color: theme.intensityHeavy,
                  marginTop: Spacing.md,
                  textAlign: "center",
                },
              ]}
            >
              This is taking longer than expected. Still working...
            </ThemedText>
          )}
        </Animated.View>

        {/* Skeleton content structure */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
          style={styles.section}
        >
          <LoadingSkeleton
            width={140}
            height={12}
            style={{ marginBottom: Spacing.sm }}
          />
          <SkeletonText lines={2} />
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(400).delay(300)}
          style={styles.section}
        >
          <LoadingSkeleton
            width={180}
            height={12}
            style={{ marginBottom: Spacing.sm }}
          />
          <View style={styles.patternRow}>
            <LoadingSkeleton
              width={100}
              height={32}
              borderRadius={BorderRadius.full}
            />
            <LoadingSkeleton
              width={120}
              height={32}
              borderRadius={BorderRadius.full}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(400).delay(400)}
          style={styles.section}
        >
          <LoadingSkeleton
            width={160}
            height={12}
            style={{ marginBottom: Spacing.sm }}
          />
          <SkeletonText lines={3} />
        </Animated.View>
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
        <ReflectionProgressCompact currentStep="Distortion" />

        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.errorContent}
        >
          {/* Error icon */}
          <View
            style={[
              styles.errorIcon,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={{ fontSize: 40 }}>💭</ThemedText>
          </View>

          {/* Error message */}
          <ThemedText
            type="h4"
            style={[styles.errorTitle, { fontFamily: Fonts?.serif }]}
          >
            We hit a snag
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.errorText, { color: theme.textSecondary }]}
          >
            {error || ScreenCopy.distortion.errorFallback}
          </ThemedText>

          {/* Action buttons */}
          <View style={styles.errorActions}>
            <Button
              onPress={handleRetry}
              style={{
                backgroundColor: theme.primary,
                marginBottom: Spacing.md,
              }}
              accessibilityHint="Retries analyzing your thought"
            >
              Try Again
            </Button>
            <Button
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={{ backgroundColor: theme.backgroundDefault }}
              accessibilityHint="Returns to the previous screen"
            >
              Go Back
            </Button>
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    );
  }

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
      <ReflectionProgressCompact currentStep="Distortion" />
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
          accessibilityHint="Proceeds to reframe your thought patterns"
        >
          {ScreenCopy.distortion.continue}
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
  patternRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
});

export default withScreenErrorBoundary(DistortionScreen);
