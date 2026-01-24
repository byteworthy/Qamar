import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing["4xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.highlightAccentSubtle },
            ]}
          >
            <Feather name="sun" size={48} color={theme.highlightAccent} />
          </View>
          <ThemedText style={styles.title}>Welcome to {Brand.name}</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            {Brand.tagline}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.content}
        >
          <View
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Feather
                name="check-circle"
                size={20}
                color={theme.highlightAccent}
              />
              <ThemedText style={styles.cardTitle}>
                What Makes Noor Different
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Connects your thoughts to Quranic wisdom and Prophetic
                guidance
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Helps you recognize patterns in how you think
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Offers Islamic reframes for limiting beliefs
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Private, structured reflection rooted in your tradition
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not just a journal—a companion for spiritual growth
              </ThemedText>
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Feather
                name="alert-circle"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText style={styles.cardTitle}>
                What This App Is Not
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not therapy
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not medical care
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not diagnosis
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Not religious authority
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.disclaimerBox,
              { backgroundColor: theme.backgroundRoot },
            ]}
          >
            <ThemedText
              style={[styles.disclaimer, { color: theme.textSecondary }]}
            >
              {Brand.betaDisclaimer}
            </ThemedText>
          </View>

          <View
            style={[
              styles.disclaimerBox,
              { backgroundColor: theme.backgroundRoot },
            ]}
          >
            <ThemedText
              style={[styles.disclaimer, { color: theme.textSecondary }]}
            >
              {Brand.disclaimer}
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(400).delay(200)}
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.xl,
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.overlayLight,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.navigate("Onboarding_Privacy")}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <ThemedText
            style={[styles.continueButtonText, { color: theme.onPrimary }]}
          >
            Continue
          </ThemedText>
          <Feather name="arrow-right" size={20} color={theme.onPrimary} />
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
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius["3xl"],
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
  tagline: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  content: {
    gap: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cardContent: {
    gap: Spacing.md,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  disclaimerBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  disclaimer: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
