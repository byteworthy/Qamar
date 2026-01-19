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
import { NiyyahColors } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PrivacyScreen() {
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
            <Feather name="shield" size={48} color={NiyyahColors.accent} />
          </View>
          <ThemedText style={styles.title}>Your Privacy Matters</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Noor is designed to respect your privacy while still working
            properly
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
              <Feather name="lock" size={20} color={NiyyahColors.accent} />
              <ThemedText style={styles.cardTitle}>
                What Happens to Your Reflections
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Reflections are stored locally on your device
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Your text is processed by AI to generate responses
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • Processing may occur on secure servers
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • You control your data and can delete it anytime
              </ThemedText>
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <Feather name="shield" size={20} color={NiyyahColors.accent} />
              <ThemedText style={styles.cardTitle}>
                What We Do Not Do
              </ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • We do not require an account
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • We do not collect your contacts or location
              </ThemedText>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • We do not track you across other apps or websites
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
                color={NiyyahColors.accent}
              />
              <ThemedText style={styles.cardTitle}>Important Limits</ThemedText>
            </View>
            <View style={styles.cardContent}>
              <ThemedText style={[styles.cardText, { color: theme.text }]}>
                • This app uses AI and may make mistakes
              </ThemedText>
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
            onPress={() => navigation.navigate("Onboarding_Safety")}
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: NiyyahColors.accent,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
            <Feather
              name="arrow-right"
              size={20}
              color={NiyyahColors.background}
            />
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
  subtitle: {
    fontSize: 16,
    textAlign: "center",
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
  noteBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  noteText: {
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
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  continueButton: {
    flex: 2,
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
