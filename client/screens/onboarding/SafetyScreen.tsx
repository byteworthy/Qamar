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
import { setOnboardingCompleted } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleGetStarted = async () => {
    await setOnboardingCompleted();
    // Navigate to Main which is the TabNavigator containing Home
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

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
            <Feather name="book-open" size={48} color={theme.highlightAccent} />
          </View>
          <ThemedText style={styles.title}>Before You Begin</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Please read this carefully
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
              <Feather name="compass" size={20} color={theme.highlightAccent} />
              <ThemedText style={styles.cardTitle}>
                Faith and Grounding
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Islamic values are used as grounding lenses for reflection
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Concepts include intention, patience, accountability, and
                trust
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • This is not religious authority or instruction
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
              <ThemedText style={styles.cardTitle}>What This Is Not</ThemedText>
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
              styles.readyCard,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Feather
              name="check-circle"
              size={32}
              color={theme.highlightAccent}
            />
            <ThemedText style={[styles.readyTitle, { color: theme.text }]}>
              Ready to Begin?
            </ThemedText>
            <ThemedText
              style={[styles.readyText, { color: theme.textSecondary }]}
            >
              Noor is a structured reflection practice. Use your own discernment
              and seek professional help for urgent needs.
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
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.backgroundDefault,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
            <ThemedText style={styles.backButtonText}>Back</ThemedText>
          </Pressable>

          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.getStartedButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <ThemedText
              style={[styles.getStartedButtonText, { color: theme.onPrimary }]}
            >
              Get Started
            </ThemedText>
            <Feather name="check" size={20} color={theme.onPrimary} />
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
  subtitle: {
    fontSize: 16,
    textAlign: "center",
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
  readyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  readyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  getStartedButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
