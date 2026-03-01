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
import { GlassCard } from "@/components/GlassCard";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { setOnboardingCompleted } from "@/lib/storage";
import { ProgressDots } from "./WelcomeScreen";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SAFETY_POINTS = [
  {
    icon: "user-x" as const,
    text: "Qamar is not a therapist, counselor, or Islamic scholar",
  },
  {
    icon: "users" as const,
    text: "Always consult qualified professionals for serious matters",
  },
  {
    icon: "phone-call" as const,
    text: "Crisis resources are available if you need urgent help",
  },
];

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const gradients = isDark ? Gradients.dark : Gradients.light;

  const handleGetStarted = async () => {
    await setOnboardingCompleted();
    navigation.navigate("Main");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Atmospheric gradient background */}
      <LinearGradient
        colors={
          gradients.atmospheric.colors as readonly [string, string, ...string[]]
        }
        locations={
          gradients.atmospheric.locations as readonly [
            number,
            number,
            ...number[],
          ]
        }
        start={gradients.atmospheric.start}
        end={gradients.atmospheric.end}
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
          <ProgressDots current={2} />
        </Animated.View>

        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.highlightAccent + "18",
                borderColor: theme.highlightAccent + "30",
              },
            ]}
          >
            <Feather name="heart" size={40} color={theme.highlightAccent} />
          </View>

          <ThemedText
            style={[
              styles.title,
              { fontFamily: Fonts?.serifBold, color: theme.text },
            ]}
          >
            A Companion, Not a Replacement
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Please read this carefully before continuing
          </ThemedText>
        </Animated.View>

        {/* Main message card */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
          <GlassCard style={styles.messageCard}>
            <ThemedText
              style={[
                styles.messageText,
                { color: theme.text, fontFamily: Fonts?.sansMedium },
              ]}
            >
              Qamar is a companion for spiritual growth and personal reflection.
              It is not a replacement for professional guidance, medical care,
              or scholarly advice.
            </ThemedText>
          </GlassCard>
        </Animated.View>

        {/* Safety points */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          style={styles.points}
        >
          {SAFETY_POINTS.map((point, i) => (
            <Animated.View
              key={point.text}
              entering={FadeInUp.duration(400).delay(350 + i * 80)}
            >
              <View style={styles.pointRow}>
                <View
                  style={[
                    styles.pointIconWrap,
                    { backgroundColor: theme.highlightAccent + "15" },
                  ]}
                >
                  <Feather
                    name={point.icon}
                    size={18}
                    color={theme.highlightAccent}
                  />
                </View>
                <ThemedText
                  style={[styles.pointText, { color: theme.textSecondary }]}
                >
                  {point.text}
                </ThemedText>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Reassuring closing */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(600)}
          style={styles.closingWrap}
        >
          <GlassCard style={styles.closingCard}>
            <Feather
              name="sunrise"
              size={28}
              color={theme.highlightAccent}
              style={{ alignSelf: "center", marginBottom: Spacing.md }}
            />
            <ThemedText
              style={[
                styles.closingText,
                {
                  color: theme.textSecondary,
                  fontFamily: Fonts?.spiritual,
                },
              ]}
            >
              {'"'}Verily, with hardship comes ease.{'"'}
            </ThemedText>
            <ThemedText
              style={[styles.closingRef, { color: theme.textSecondary }]}
            >
              Quran 94:6
            </ThemedText>
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(700)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.glassSurface,
                borderColor: theme.glassStroke,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
          </Pressable>

          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.continueButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <LinearGradient
              colors={
                gradients.buttonGradient.colors as readonly [
                  string,
                  string,
                  ...string[],
                ]
              }
              locations={
                gradients.buttonGradient.locations as readonly [
                  number,
                  number,
                  ...number[],
                ]
              }
              start={gradients.buttonGradient.start}
              end={gradients.buttonGradient.end}
              style={styles.buttonGradient}
            >
              <ThemedText
                style={[
                  styles.continueButtonText,
                  { color: theme.onPrimary, fontFamily: Fonts?.sansBold },
                ]}
              >
                I Understand
              </ThemedText>
              <Feather name="check" size={20} color={theme.onPrimary} />
            </LinearGradient>
          </Pressable>
        </View>
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
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  messageCard: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  points: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  pointIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  closingWrap: {
    marginTop: Spacing.sm,
  },
  closingCard: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  closingText: {
    fontSize: 20,
    textAlign: "center",
    lineHeight: 28,
    fontStyle: "italic",
    marginBottom: Spacing.xs,
  },
  closingRef: {
    fontSize: 13,
    textAlign: "center",
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButton: {
    flex: 1,
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
