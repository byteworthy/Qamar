import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Brand } from "@/constants/brand";
import { NiyyahColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Feather name="sun" size={48} color={NiyyahColors.accent} />
          </View>
          <ThemedText style={styles.title}>Welcome to {Brand.name}</ThemedText>
          <ThemedText
            style={[styles.tagline, { color: theme.textSecondary }]}
          >
            {Brand.tagline}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={styles.content}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather name="check-circle" size={20} color={NiyyahColors.accent} />
              <ThemedText style={styles.cardTitle}>What This App Does</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Guides you through reflection using CBT principles
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Uses an AI companion, not a human therapist
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Rooted in an Islamic framework of mercy and wisdom
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Helps you examine thought patterns and find clarity
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Free tier available, with optional Noor Plus subscription
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather name="alert-circle" size={20} color={theme.textSecondary} />
              <ThemedText style={styles.cardTitle}>
                Important Boundaries
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • This is not therapy or medical care
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • This is not crisis intervention or emergency support
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • This is not religious counseling or fatwa
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • AI can make mistakes—your discernment matters
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • For serious concerns, seek qualified professional help
              </ThemedText>
            </View>
          </View>

          <View style={[styles.disclaimerBox, { backgroundColor: theme.backgroundRoot }]}>
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
            paddingBottom: insets.bottom + 20,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.navigate("Onboarding_Privacy")}
          style={({ pressed }) => [
            styles.continueButton,
            { backgroundColor: NiyyahColors.accent, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
          <Feather name="arrow-right" size={20} color={NiyyahColors.background} />
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NiyyahColors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  content: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cardContent: {
    gap: 12,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  disclaimerBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: NiyyahColors.background,
  },
});
