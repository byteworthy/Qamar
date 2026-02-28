import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  Fonts,
  Shadows,
  Gradients,
} from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { FeaturePreviewCarousel } from "@/components/FeaturePreviewCarousel";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


function ProgressDots({ current }: { current: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.progressDots}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor:
                i === current ? theme.highlightAccent : theme.overlayMedium,
              width: i === current ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

export { ProgressDots };

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const gradients = isDark ? Gradients.dark : Gradients.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Atmospheric gradient background */}
      <LinearGradient
        colors={gradients.atmospheric.colors as readonly [string, string, ...string[]]}
        locations={gradients.atmospheric.locations as readonly [number, number, ...number[]]}
        start={gradients.atmospheric.start}
        end={gradients.atmospheric.end}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle gold vignette at bottom */}
      <LinearGradient
        colors={[
          "transparent",
          isDark ? "rgba(212, 175, 55, 0.04)" : "rgba(212, 175, 55, 0.06)",
        ]}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["4xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress dots */}
        <Animated.View entering={FadeIn.duration(500)}>
          <ProgressDots current={0} />
        </Animated.View>

        {/* Hero section */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          {/* Decorative geometric accent */}
          <View style={styles.geometricAccent}>
            <View
              style={[
                styles.geometricOuter,
                { borderColor: theme.highlightAccent + "30" },
              ]}
            >
              <View
                style={[
                  styles.geometricInner,
                  { borderColor: theme.highlightAccent + "50" },
                ]}
              >
                <Feather name="moon" size={32} color={theme.highlightAccent} accessible={false} />
              </View>
            </View>
          </View>

          {/* Title */}
          <ThemedText
            style={[
              styles.title,
              {
                fontFamily: Fonts?.serifBold,
                color: theme.text,
                textShadowColor: isDark
                  ? "rgba(212, 175, 55, 0.3)"
                  : "rgba(212, 175, 55, 0.2)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              },
            ]}
          >
            Qamar
          </ThemedText>

          {/* Arabic subtitle */}
          <ThemedText
            style={[
              styles.arabicSubtitle,
              {
                fontFamily: Fonts?.spiritual,
                color: theme.highlightAccent,
              },
            ]}
          >
            {"قمر"}
          </ThemedText>

          {/* Tagline */}
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            Your Islamic Companion
          </ThemedText>
        </Animated.View>

        {/* Feature highlights carousel */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
          <FeaturePreviewCarousel />
        </Animated.View>
      </ScrollView>

      {/* Footer with gradient button */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(600)}
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.navigate("Onboarding_Privacy")}
          testID="get-started-button"
          style={({ pressed }) => [
            styles.continueButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          accessibilityHint="Continues to the next onboarding step"
        >
          <LinearGradient
            colors={gradients.buttonGradient.colors as readonly [string, string, ...string[]]}
            locations={
              gradients.buttonGradient.locations as readonly [number, number, ...number[]]
            }
            start={gradients.buttonGradient.start}
            end={gradients.buttonGradient.end}
            style={styles.buttonGradient}
          >
            <ThemedText
              style={[
                styles.continueButtonText,
                {
                  color: theme.onPrimary,
                  fontFamily: Fonts?.sansBold,
                },
              ]}
            >
              Get Started
            </ThemedText>
            <Feather name="arrow-right" size={20} color={theme.onPrimary} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing["2xl"],
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing["3xl"],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  geometricAccent: {
    marginBottom: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  geometricOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
  },
  geometricInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }],
  },
  title: {
    fontSize: 52,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 2,
  },
  arabicSubtitle: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: Spacing.md,
    opacity: 0.85,
  },
  tagline: {
    fontSize: 17,
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  footer: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
  },
  continueButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.medium,
    shadowColor: "#D4AF37",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
