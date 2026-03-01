import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
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
import { ProgressDots } from "./WelcomeScreen";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRIVACY_POINTS = [
  {
    icon: "lock" as const,
    title: "Your reflections are encrypted",
    desc: "All personal data is protected with industry-standard encryption",
  },
  {
    icon: "eye-off" as const,
    title: "We never share your data",
    desc: "Your reflections remain private and are never sold or shared",
  },
  {
    icon: "smartphone" as const,
    title: "Biometric lock available",
    desc: "Add Face ID or fingerprint protection for extra security",
  },
  {
    icon: "trash-2" as const,
    title: "Delete your data anytime",
    desc: "Full control to remove all your data whenever you choose",
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const gradients = isDark ? Gradients.dark : Gradients.light;

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
          <ProgressDots current={1} />
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
            <Feather name="shield" size={40} color={theme.highlightAccent} />
          </View>

          <ThemedText
            style={[
              styles.title,
              { fontFamily: Fonts?.serifBold, color: theme.text },
            ]}
          >
            Your Privacy Matters
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your private space is protected
          </ThemedText>
        </Animated.View>

        {/* Privacy point cards */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={styles.content}
        >
          {PRIVACY_POINTS.map((point, i) => (
            <Animated.View
              key={point.title}
              entering={FadeInUp.duration(400).delay(250 + i * 80)}
            >
              <GlassCard style={styles.pointCard}>
                <View style={styles.pointRow}>
                  <View
                    style={[
                      styles.pointIconWrap,
                      { backgroundColor: theme.highlightAccent + "15" },
                    ]}
                  >
                    <Feather
                      name={point.icon}
                      size={20}
                      color={theme.highlightAccent}
                    />
                  </View>
                  <View style={styles.pointText}>
                    <ThemedText
                      style={[
                        styles.pointTitle,
                        { fontFamily: Fonts?.sansMedium },
                      ]}
                    >
                      {point.title}
                    </ThemedText>
                    <ThemedText
                      style={[styles.pointDesc, { color: theme.textSecondary }]}
                    >
                      {point.desc}
                    </ThemedText>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Privacy policy link */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(600)}
          style={styles.policyLink}
        >
          <Pressable
            onPress={() => Linking.openURL("https://noorapp.co/privacy")}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <ThemedText
              style={[styles.policyText, { color: theme.highlightAccent }]}
            >
              Read full privacy policy
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(500)}
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
            onPress={() => navigation.navigate("Onboarding_Safety")}
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
                Continue
              </ThemedText>
              <Feather name="arrow-right" size={20} color={theme.onPrimary} />
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
    marginBottom: Spacing["3xl"],
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
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  content: {
    gap: Spacing.md,
  },
  pointCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  pointIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  pointText: {
    flex: 1,
    gap: 2,
  },
  pointTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  pointDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  policyLink: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  policyText: {
    fontSize: 14,
    textDecorationLine: "underline",
    opacity: 0.8,
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
